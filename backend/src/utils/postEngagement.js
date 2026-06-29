import mongoose from 'mongoose'
import Post from '../models/Post.js'
import PostComment from '../models/PostComment.js'
import PostReaction from '../models/PostReaction.js'
import User from '../models/User.js'

export const EMPTY_REACTION_COUNTS = {
  like: 0,
  love: 0,
  clap: 0,
  support: 0,
  total: 0,
}

export function createEmptyEngagement() {
  return {
    reactionCounts: { ...EMPTY_REACTION_COUNTS },
    userReaction: null,
    commentCount: 0,
    repostCount: 0,
    userReposted: false,
  }
}

function getEngagementPostId(post) {
  if (post.isRepost && post.originalPost?.id) {
    return post.originalPost.id.toString()
  }
  return (post.id || post._id).toString()
}

export async function getEngagementMapForPosts(postIds, viewerId) {
  if (!postIds.length) return {}

  const objectIds = postIds.map((id) => new mongoose.Types.ObjectId(id))
  const viewerObjectId = new mongoose.Types.ObjectId(viewerId)

  const [reactionAgg, commentAgg, repostAgg, userReactions, userRepostPosts] =
    await Promise.all([
      PostReaction.aggregate([
        { $match: { post: { $in: objectIds } } },
        {
          $group: {
            _id: { post: '$post', type: '$type' },
            count: { $sum: 1 },
          },
        },
      ]),
      PostComment.aggregate([
        { $match: { post: { $in: objectIds } } },
        { $group: { _id: '$post', count: { $sum: 1 } } },
      ]),
      Post.aggregate([
        { $match: { repostOf: { $in: objectIds } } },
        { $group: { _id: '$repostOf', count: { $sum: 1 } } },
      ]),
      PostReaction.find({ post: { $in: objectIds }, user: viewerObjectId }).select(
        'post type'
      ),
      Post.find({ repostOf: { $in: objectIds }, author: viewerObjectId }).select('repostOf'),
    ])

  const map = {}
  for (const id of postIds) {
    map[id.toString()] = createEmptyEngagement()
  }

  for (const row of reactionAgg) {
    const postId = row._id.post.toString()
    const type = row._id.type
    if (map[postId] && map[postId].reactionCounts[type] !== undefined) {
      map[postId].reactionCounts[type] = row.count
      map[postId].reactionCounts.total += row.count
    }
  }

  for (const row of commentAgg) {
    const postId = row._id.toString()
    if (map[postId]) map[postId].commentCount = row.count
  }

  for (const row of repostAgg) {
    const postId = row._id.toString()
    if (map[postId]) map[postId].repostCount = row.count
  }

  for (const reaction of userReactions) {
    const postId = reaction.post.toString()
    if (map[postId]) map[postId].userReaction = reaction.type
  }

  for (const repost of userRepostPosts) {
    const postId = repost.repostOf.toString()
    if (map[postId]) map[postId].userReposted = true
  }

  return map
}

export function attachEngagementToPost(post, engagementMap) {
  const key = getEngagementPostId(post)
  return {
    ...post,
    engagement: engagementMap[key] || createEmptyEngagement(),
  }
}

export async function enrichPostsWithEngagement(posts, viewerId) {
  const engagementIds = [
    ...new Set(posts.map((post) => getEngagementPostId(post))),
  ]
  const engagementMap = await getEngagementMapForPosts(engagementIds, viewerId)
  return posts.map((post) => attachEngagementToPost(post, engagementMap))
}

export async function getEngagementForPost(postId, viewerId) {
  const resolvedId = await resolveEngagementTargetPostId(postId)
  if (!resolvedId) return createEmptyEngagement()

  const engagementMap = await getEngagementMapForPosts([resolvedId], viewerId)
  return engagementMap[resolvedId.toString()] || createEmptyEngagement()
}

export async function resolveEngagementTargetPostId(postId) {
  const post = await Post.findById(postId).select('repostOf')
  if (!post) return null
  if (post.repostOf) return post.repostOf
  return post._id
}

export async function resolveEngagementTargetPost(post) {
  if (!post) return null
  if (post.repostOf) {
    return Post.findById(post.repostOf)
  }
  return post
}

export { getEngagementPostId }
