import mongoose from 'mongoose'
import Post from '../models/Post.js'
import PostComment from '../models/PostComment.js'
import PostReaction from '../models/PostReaction.js'
import User from '../models/User.js'
import { getFriendIds } from '../utils/friendship.js'
import {
  addTextToInterestProfile,
  buildInterestProfileFromSkills,
  getPostMatchingText,
  REACTION_WEIGHTS,
  scoreContentMatch,
} from '../utils/interestProfile.js'
import {
  enrichPostsWithEngagement,
  getEngagementMapForPosts,
  getEngagementPostId,
} from '../utils/postEngagement.js'
import { buildPaginationMeta } from '../utils/pagination.js'

const FEED_RANKED_LIMIT = 15
const FEED_RANDOM_LIMIT = 10
const CANDIDATE_LIMIT = 350

const SCORE = {
  FRIEND: 50,
  SELF: 15,
  CONTENT_MAX: 45,
  RECENCY_MAX: 25,
  ENGAGEMENT_MAX: 15,
}

const postPopulate = [
  { path: 'author' },
  { path: 'repostOf', populate: { path: 'author' } },
]

const reactionPostPopulate = {
  path: 'post',
  select: 'content repostOf postType',
  populate: { path: 'repostOf', select: 'content postType' },
}

function resolveContentId(postDoc) {
  if (!postDoc) return null

  if (postDoc.repostOf) {
    const originalId = postDoc.repostOf._id || postDoc.repostOf
    return originalId?.toString?.() || null
  }

  return postDoc._id?.toString?.() || postDoc.toString()
}

function isJobFeedPost(postDoc) {
  if (!postDoc) return false
  if (postDoc.postType === 'job') return true
  if (postDoc.repostOf?.postType === 'job') return true
  return false
}

function isStandardFeedPost(postDoc) {
  return !isJobFeedPost(postDoc)
}

function isEngagedPost(postDoc, engagedContentIds) {
  const contentId = resolveContentId(postDoc)
  return Boolean(contentId && engagedContentIds.has(contentId))
}

/**
 * Build interest profile from profile skills + engagement on normal posts only.
 * Job opening posts are ignored for likes, comments, reposts, and engaged-post hiding.
 */
async function loadUserFeedSignals(userId) {
  const interestProfile = {}
  const engagedContentIds = new Set()

  const [user, reactions, comments, reposts] = await Promise.all([
    User.findById(userId).select('profile.skills'),
    PostReaction.find({ user: userId }).populate(reactionPostPopulate),
    PostComment.find({ author: userId })
      .select('content post')
      .populate({
        path: 'post',
        select: 'content repostOf postType',
        populate: { path: 'repostOf', select: 'content postType' },
      }),
    Post.find({ author: userId, repostOf: { $ne: null }, postType: { $ne: 'job' } }).populate({
      path: 'repostOf',
      select: 'content postType',
    }),
  ])

  buildInterestProfileFromSkills(interestProfile, user?.profile?.skills || [])

  for (const reaction of reactions) {
    if (!reaction.post || isJobFeedPost(reaction.post)) continue

    const contentId = resolveContentId(reaction.post)
    if (contentId) engagedContentIds.add(contentId)

    const weight = REACTION_WEIGHTS[reaction.type] || 2
    addTextToInterestProfile(interestProfile, getPostMatchingText(reaction.post), weight)
  }

  for (const comment of comments) {
    if (isJobFeedPost(comment.post)) continue

    addTextToInterestProfile(interestProfile, comment.content, 1.5)

    if (comment.post) {
      const contentId = resolveContentId(comment.post)
      if (contentId) engagedContentIds.add(contentId)
      addTextToInterestProfile(interestProfile, getPostMatchingText(comment.post), 1.2)
    }
  }

  for (const repost of reposts) {
    if (isJobFeedPost(repost)) continue

    const contentId = resolveContentId(repost)
    if (contentId) engagedContentIds.add(contentId)
    addTextToInterestProfile(interestProfile, getPostMatchingText(repost), 2.5)
  }

  return { interestProfile, engagedContentIds }
}

function getRecencyScore(createdAt) {
  const hoursAgo = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)

  if (hoursAgo <= 1) return SCORE.RECENCY_MAX
  if (hoursAgo <= 6) return 20
  if (hoursAgo <= 24) return 15
  if (hoursAgo <= 72) return 10
  if (hoursAgo <= 168) return 5
  return 0
}

function getPopularityScore(engagement) {
  if (!engagement) return 0

  const total =
    engagement.reactionCounts.total +
    engagement.commentCount * 1.5 +
    engagement.repostCount * 2

  return Math.min(SCORE.ENGAGEMENT_MAX, Math.floor(total * 0.5))
}

function getRelationshipBoost(authorId, context) {
  if (authorId === context.userId) {
    return SCORE.SELF
  }

  if (context.friendIds.has(authorId)) {
    return SCORE.FRIEND
  }

  return 0
}

function pickRandomItems(items, count) {
  if (!items.length || count <= 0) return []

  const pool = [...items]

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool.slice(0, Math.min(count, pool.length))
}

function scoreStandardPost(postDoc, context, engagementMap, interestProfile) {
  const publicPost = postDoc.toPublicJSON(postDoc.author)
  const authorId = postDoc.author._id.toString()
  const matchingText = getPostMatchingText(postDoc)

  let score = scoreContentMatch(matchingText, interestProfile, SCORE.CONTENT_MAX)
  score += getRelationshipBoost(authorId, context)
  score += getRecencyScore(postDoc.createdAt)
  score += getPopularityScore(engagementMap[getEngagementPostId(publicPost)])

  return {
    publicPost,
    score,
    createdAt: postDoc.createdAt,
  }
}

export async function buildPersonalizedFeed(userId, { page = 1, limit = 25 } = {}) {
  const userIdString = userId.toString()

  const [{ interestProfile, engagedContentIds }, friendIds, candidatePosts] = await Promise.all([
    loadUserFeedSignals(userId),
    getFriendIds(userId),
    Post.find({
      postType: { $ne: 'job' },
      author: { $ne: userId },
    })
      .sort({ createdAt: -1 })
      .limit(CANDIDATE_LIMIT)
      .populate(postPopulate),
  ])

  const unseenStandardPosts = candidatePosts.filter(
    (postDoc) =>
      isStandardFeedPost(postDoc) &&
      postDoc.author._id.toString() !== userIdString &&
      !isEngagedPost(postDoc, engagedContentIds)
  )

  if (!unseenStandardPosts.length) {
    return {
      posts: [],
      message:
        'No new posts to show right now. Like posts on topics you enjoy to discover similar content.',
      pagination: buildPaginationMeta({ page, limit, total: 0 }),
    }
  }

  const friendIdSet = new Set(friendIds.map((id) => id.toString()))

  const context = {
    userId: userIdString,
    friendIds: friendIdSet,
  }

  const publicPosts = unseenStandardPosts.map((post) => post.toPublicJSON(post.author))
  const engagementIds = [...new Set(publicPosts.map((post) => getEngagementPostId(post)))]
  const engagementMap = await getEngagementMapForPosts(engagementIds, userId)

  const scoredPosts = unseenStandardPosts
    .map((postDoc) => scoreStandardPost(postDoc, context, engagementMap, interestProfile))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  const rankedEntries = scoredPosts.slice(0, FEED_RANKED_LIMIT)
  const rankedIds = new Set(rankedEntries.map((entry) => entry.publicPost.id))

  const remainingEntries = scoredPosts.filter((entry) => !rankedIds.has(entry.publicPost.id))
  const randomEntries = pickRandomItems(remainingEntries, FEED_RANDOM_LIMIT)

  const pageOneFeed = [...rankedEntries, ...randomEntries]
  const pageOneIds = new Set(pageOneFeed.map((entry) => entry.publicPost.id))
  const restByScore = scoredPosts.filter((entry) => !pageOneIds.has(entry.publicPost.id))

  const virtualFeed = [...pageOneFeed, ...restByScore]
  const total = virtualFeed.length
  const start = (page - 1) * limit
  const pageEntries = virtualFeed.slice(start, start + limit)

  const feedPosts = pageEntries.map((entry) => entry.publicPost)
  const posts = await enrichPostsWithEngagement(feedPosts, userId)

  return {
    posts,
    pagination: buildPaginationMeta({ page, limit, total }),
  }
}

export async function getFeedAuthorIds(userId) {
  const friendIds = await getFriendIds(userId)
  const ids = new Set(friendIds.map((id) => id.toString()))
  ids.add(userId.toString())
  return [...ids].map((id) => new mongoose.Types.ObjectId(id))
}
