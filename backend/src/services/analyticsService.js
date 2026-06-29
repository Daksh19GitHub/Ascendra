import mongoose from 'mongoose'
import Friendship from '../models/Friendship.js'
import Post from '../models/Post.js'
import PostComment from '../models/PostComment.js'
import PostReaction from '../models/PostReaction.js'
import User from '../models/User.js'
import { calculateProfileCompletion } from '../utils/profileCompletion.js'

const RANGE_DAYS = 30
const TOP_POSTS_LIMIT = 5

function startOfDay(date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function formatDateKey(date) {
  return startOfDay(date).toISOString().slice(0, 10)
}

function buildDateSeries(days, endDate = new Date()) {
  const series = []
  const end = startOfDay(endDate)

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(end)
    date.setDate(end.getDate() - offset)
    series.push(formatDateKey(date))
  }

  return series
}

function initDailyCounts(dateKeys) {
  return dateKeys.reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})
}

function fillDailyCounts(rows, dateKeys, valueKey = 'count') {
  const counts = initDailyCounts(dateKeys)

  for (const row of rows) {
    const key = row._id
    if (counts[key] !== undefined) {
      counts[key] = row[valueKey] ?? row.count ?? 0
    }
  }

  return dateKeys.map((date) => ({
    date,
    count: counts[date],
  }))
}

function truncatePreview(content, maxLength = 72) {
  const text = content?.trim() || 'Untitled post'
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
}

export async function buildUserAnalytics(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId)
  const dateKeys = buildDateSeries(RANGE_DAYS)
  const rangeStart = startOfDay(new Date())
  rangeStart.setDate(rangeStart.getDate() - (RANGE_DAYS - 1))

  const user = await User.findById(userObjectId)
  if (!user) {
    return null
  }

  const userPosts = await Post.find({
    author: userObjectId,
    repostOf: null,
  }).select('_id content postType createdAt')

  const postIds = userPosts.map((post) => post._id)
  const standardPosts = userPosts.filter((post) => post.postType !== 'job')
  const jobPosts = userPosts.filter((post) => post.postType === 'job')

  const [
    friendsCount,
    reactionRows,
    commentRows,
    repostRows,
    reactionBreakdownRows,
    perPostReactionRows,
    perPostCommentRows,
    perPostRepostRows,
    acceptedFriendships,
  ] = await Promise.all([
    Friendship.countDocuments({
      status: 'accepted',
      $or: [{ requester: userObjectId }, { recipient: userObjectId }],
    }),
    PostReaction.aggregate([
      { $match: { post: { $in: postIds }, createdAt: { $gte: rangeStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    PostComment.aggregate([
      { $match: { post: { $in: postIds }, createdAt: { $gte: rangeStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    Post.aggregate([
      { $match: { repostOf: { $in: postIds }, createdAt: { $gte: rangeStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    PostReaction.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
    PostReaction.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]),
    PostComment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]),
    Post.aggregate([
      { $match: { repostOf: { $in: postIds } } },
      { $group: { _id: '$repostOf', count: { $sum: 1 } } },
    ]),
    Friendship.find({
      status: 'accepted',
      $or: [{ requester: userObjectId }, { recipient: userObjectId }],
    })
      .sort({ updatedAt: 1 })
      .select('updatedAt createdAt'),
  ])

  const reactionsByDay = fillDailyCounts(reactionRows, dateKeys)
  const commentsByDay = fillDailyCounts(commentRows, dateKeys)
  const repostsByDay = fillDailyCounts(repostRows, dateKeys)

  const engagementOverTime = dateKeys.map((date) => {
    const reactions = reactionsByDay.find((entry) => entry.date === date)?.count || 0
    const comments = commentsByDay.find((entry) => entry.date === date)?.count || 0
    const reposts = repostsByDay.find((entry) => entry.date === date)?.count || 0

    return {
      date,
      reactions,
      comments,
      reposts,
      total: reactions + comments + reposts,
    }
  })

  const reactionBreakdown = {
    like: 0,
    love: 0,
    clap: 0,
    support: 0,
  }

  for (const row of reactionBreakdownRows) {
    if (reactionBreakdown[row._id] !== undefined) {
      reactionBreakdown[row._id] = row.count
    }
  }

  const reactionMap = new Map(
    perPostReactionRows.map((row) => [row._id.toString(), row.count])
  )
  const commentMap = new Map(
    perPostCommentRows.map((row) => [row._id.toString(), row.count])
  )
  const repostMap = new Map(
    perPostRepostRows.map((row) => [row._id.toString(), row.count])
  )

  const topPosts = userPosts
    .map((post) => {
      const id = post._id.toString()
      const reactions = reactionMap.get(id) || 0
      const comments = commentMap.get(id) || 0
      const reposts = repostMap.get(id) || 0

      return {
        id,
        preview: truncatePreview(post.content),
        postType: post.postType || 'standard',
        reactions,
        comments,
        reposts,
        totalEngagement: reactions + comments + reposts,
        createdAt: post.createdAt,
      }
    })
    .sort((a, b) => {
      if (b.totalEngagement !== a.totalEngagement) {
        return b.totalEngagement - a.totalEngagement
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    .slice(0, TOP_POSTS_LIMIT)

  let cumulativeFriends = 0
  const friendGrowth = acceptedFriendships.map((friendship) => {
    cumulativeFriends += 1
    return {
      date: formatDateKey(friendship.updatedAt || friendship.createdAt),
      friends: cumulativeFriends,
    }
  })

  const totalReactionsReceived = Object.values(reactionBreakdown).reduce(
    (sum, count) => sum + count,
    0
  )
  const totalCommentsReceived = perPostCommentRows.reduce(
    (sum, row) => sum + row.count,
    0
  )
  const totalRepostsReceived = perPostRepostRows.reduce((sum, row) => sum + row.count, 0)

  return {
    rangeDays: RANGE_DAYS,
    summary: {
      friends: friendsCount,
      posts: userPosts.length,
      standardPosts: standardPosts.length,
      jobPosts: jobPosts.length,
      reactionsReceived: totalReactionsReceived,
      commentsReceived: totalCommentsReceived,
      repostsReceived: totalRepostsReceived,
      profileCompletion: calculateProfileCompletion(user),
    },
    engagementOverTime,
    reactionBreakdown,
    topPosts,
    friendGrowth,
  }
}
