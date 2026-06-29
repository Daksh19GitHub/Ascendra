import Post from '../models/Post.js'
import PostComment from '../models/PostComment.js'
import PostReaction from '../models/PostReaction.js'
import User from '../models/User.js'
import {
  createMentionNotifications,
  deleteActivityNotifications,
  deleteNotificationsForPosts,
  notifyFriendPost,
} from '../services/notificationService.js'
import { resolveMentions } from '../utils/mentions.js'
import { buildJobPostFields } from '../utils/jobPostEmbedding.js'
import { enrichPostsWithEngagement } from '../utils/postEngagement.js'

const postPopulate = [
  { path: 'author' },
  { path: 'repostOf', populate: { path: 'author' } },
]

function mapPostsWithAuthors(entries) {
  return entries.map((entry) => {
    const post = Post.hydrate({
      _id: entry._id,
      author: entry.author,
      content: entry.content,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      repostOf: entry.repostOf || null,
      mentions: entry.mentions || [],
      postType: entry.postType || 'standard',
    })
    const author = User.hydrate(entry.authorDoc)

    if (entry.repostOfDoc) {
      const originalPost = Post.hydrate({
        _id: entry.repostOfDoc._id,
        author: entry.repostOfDoc.author,
        content: entry.repostOfDoc.content,
        createdAt: entry.repostOfDoc.createdAt,
        mentions: entry.repostOfDoc.mentions || [],
      })
      if (entry.repostOfAuthorDoc) {
        originalPost.author = User.hydrate(entry.repostOfAuthorDoc)
      }
      post.repostOf = originalPost
    }

    return post.toPublicJSON(author)
  })
}

export async function createPost(req, res, next) {
  try {
    const content = req.body.content.trim()
    const mentionResult = await resolveMentions(content, req.user._id)

    if (mentionResult.error) {
      return res.status(mentionResult.error.status).json({
        success: false,
        message: mentionResult.error.message,
      })
    }

    const jobFields = await buildJobPostFields({
      content,
      postType: req.body.postType,
      jobStatus: req.body.jobStatus,
      jobStartsAt: req.body.jobStartsAt,
      jobClosesAt: req.body.jobClosesAt,
    })

    if (jobFields.error) {
      return res.status(jobFields.error.status).json({
        success: false,
        message: jobFields.error.message,
      })
    }

    const createdPost = await Post.create({
      author: req.user._id,
      content,
      mentions: mentionResult.mentions,
      ...jobFields,
    })

    await createMentionNotifications({
      actorId: req.user._id,
      mentions: mentionResult.mentions,
      postId: createdPost._id,
      content,
    })

    await notifyFriendPost({
      actorId: req.user._id,
      postId: createdPost._id,
      content,
      excludeUserIds: mentionResult.mentions.map((mention) => mention.user),
    })

    const [post] = await enrichPostsWithEngagement(
      [createdPost.toPublicJSON(req.user)],
      req.user._id
    )

    res.status(201).json({
      success: true,
      message: 'Post published successfully',
      data: {
        post,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getMyPosts(req, res, next) {
  try {
    const postsRaw = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .populate(postPopulate)

    const posts = await enrichPostsWithEngagement(
      postsRaw.map((entry) => entry.toPublicJSON(entry.author)),
      req.user._id
    )

    res.json({
      success: true,
      data: {
        posts,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getPostById(req, res, next) {
  try {
    const post = await Post.findById(req.params.id).populate(postPopulate)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const author = post.author || (await User.findById(post.author))
    const [publicPost] = await enrichPostsWithEngagement(
      [post.toPublicJSON(author)],
      req.user._id
    )

    res.json({
      success: true,
      data: { post: publicPost },
    })
  } catch (error) {
    next(error)
  }
}

export async function getUserPosts(req, res, next) {
  try {
    const user = await User.findOne({
      username: req.params.username.toLowerCase(),
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const postsRaw = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate(postPopulate)

    const posts = await enrichPostsWithEngagement(
      postsRaw.map((entry) => entry.toPublicJSON(entry.author)),
      req.user._id
    )

    res.json({
      success: true,
      data: {
        posts,
      },
    })
  } catch (error) {
    next(error)
  }
}

async function findOwnedPost(postId, userId) {
  const post = await Post.findById(postId)

  if (!post) {
    return { error: { status: 404, message: 'Post not found' } }
  }

  if (post.author.toString() !== userId.toString()) {
    return { error: { status: 403, message: 'You can only modify your own posts' } }
  }

  return { post }
}

export async function updatePost(req, res, next) {
  try {
    const { post, error } = await findOwnedPost(req.params.id, req.user._id)

    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      })
    }

    if (post.repostOf) {
      return res.status(400).json({
        success: false,
        message: 'Reposts cannot be edited. Remove the repost instead.',
      })
    }

    post.content = req.body.content.trim()

    const previousMentionIds = new Set(
      (post.mentions || []).map((mention) => mention.user.toString())
    )

    const mentionResult = await resolveMentions(post.content, req.user._id)

    if (mentionResult.error) {
      return res.status(mentionResult.error.status).json({
        success: false,
        message: mentionResult.error.message,
      })
    }

    post.mentions = mentionResult.mentions

    const nextPostType = req.body.postType !== undefined ? req.body.postType : post.postType
    const nextJobStatus = req.body.jobStatus !== undefined ? req.body.jobStatus : post.jobStatus
    const jobFields = await buildJobPostFields({
      content: post.content,
      postType: nextPostType,
      jobStatus: nextJobStatus,
      jobStartsAt: req.body.jobStartsAt,
      jobClosesAt: req.body.jobClosesAt,
      existingPost: post,
    })

    if (jobFields.error) {
      return res.status(jobFields.error.status).json({
        success: false,
        message: jobFields.error.message,
      })
    }

    post.postType = jobFields.postType
    post.embedding = jobFields.embedding
    post.jobStatus = jobFields.jobStatus
    post.jobStartsAt = jobFields.jobStartsAt
    post.jobClosesAt = jobFields.jobClosesAt

    await post.save()

    const newlyMentioned = mentionResult.mentions.filter(
      (mention) => !previousMentionIds.has(mention.user.toString())
    )

    await createMentionNotifications({
      actorId: req.user._id,
      mentions: newlyMentioned,
      postId: post._id,
      content: post.content,
    })

    await post.populate(postPopulate)

    const [updatedPost] = await enrichPostsWithEngagement(
      [post.toPublicJSON(post.author)],
      req.user._id
    )

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: {
        post: updatedPost,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function deletePost(req, res, next) {
  try {
    const { post, error } = await findOwnedPost(req.params.id, req.user._id)

    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      })
    }

    if (post.repostOf) {
      await deleteActivityNotifications({
        actorId: req.user._id,
        type: 'friend_repost',
        postId: post._id,
      })
      await post.deleteOne()

      return res.json({
        success: true,
        message: 'Repost removed successfully',
      })
    }

    const repostWrappers = await Post.find({ repostOf: post._id }).select('_id')
    const relatedPostIds = [post._id, ...repostWrappers.map((entry) => entry._id)]

    await Promise.all([
      PostReaction.deleteMany({ post: { $in: relatedPostIds } }),
      PostComment.deleteMany({ post: { $in: relatedPostIds } }),
      deleteNotificationsForPosts(relatedPostIds),
      Post.deleteMany({ repostOf: post._id }),
    ])
    await post.deleteOne()

    res.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

export { mapPostsWithAuthors, postPopulate }
