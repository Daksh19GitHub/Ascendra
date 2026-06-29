import Post from '../models/Post.js'
import PostComment from '../models/PostComment.js'
import PostReaction from '../models/PostReaction.js'
import {
  createMentionNotifications,
  deleteActivityNotifications,
  notifyFriendComment,
  notifyFriendReaction,
  notifyFriendRepost,
} from '../services/notificationService.js'
import { deleteCommentTree } from '../utils/commentTree.js'
import { resolveMentions } from '../utils/mentions.js'
import {
  getEngagementForPost,
  resolveEngagementTargetPost,
} from '../utils/postEngagement.js'

async function findPostOr404(postId, res) {
  const post = await Post.findById(postId)
  if (!post) {
    res.status(404).json({
      success: false,
      message: 'Post not found',
    })
    return null
  }
  return post
}

async function getEngagementContext(postId, res) {
  const post = await findPostOr404(postId, res)
  if (!post) return null

  const engagementPost = await resolveEngagementTargetPost(post)
  if (!engagementPost) {
    res.status(404).json({
      success: false,
      message: 'Post not found',
    })
    return null
  }

  return { post, engagementPost }
}

export async function setPostReaction(req, res, next) {
  try {
    const context = await getEngagementContext(req.params.id, res)
    if (!context) return

    const { engagementPost } = context
    const { type } = req.body
    const existing = await PostReaction.findOne({
      post: engagementPost._id,
      user: req.user._id,
    })

    let addedOrChangedReaction = false

    if (existing && existing.type === type) {
      await existing.deleteOne()
      await deleteActivityNotifications({
        actorId: req.user._id,
        type: 'friend_reaction',
        postId: engagementPost._id,
      })
    } else if (existing) {
      existing.type = type
      await existing.save()
      addedOrChangedReaction = true
    } else {
      await PostReaction.create({
        post: engagementPost._id,
        user: req.user._id,
        type,
      })
      addedOrChangedReaction = true
    }

    if (addedOrChangedReaction) {
      await notifyFriendReaction({
        actorId: req.user._id,
        postId: engagementPost._id,
        reactionType: type,
      })
    }

    const engagement = await getEngagementForPost(engagementPost._id, req.user._id)

    res.json({
      success: true,
      data: { engagement },
    })
  } catch (error) {
    next(error)
  }
}

export async function togglePostRepost(req, res, next) {
  try {
    const post = await findPostOr404(req.params.id, res)
    if (!post) return

    if (post.repostOf) {
      return res.status(400).json({
        success: false,
        message: 'You can only repost original posts',
      })
    }

    const existingRepost = await Post.findOne({
      repostOf: post._id,
      author: req.user._id,
    })

    let message
    if (existingRepost) {
      await deleteActivityNotifications({
        actorId: req.user._id,
        type: 'friend_repost',
        postId: existingRepost._id,
      })
      await existingRepost.deleteOne()
      message = 'Repost removed'
    } else {
      const repostWrapper = await Post.create({
        author: req.user._id,
        repostOf: post._id,
        content: '',
      })
      message = 'Post reposted'

      await notifyFriendRepost({
        actorId: req.user._id,
        postId: repostWrapper._id,
      })
    }

    const engagement = await getEngagementForPost(post._id, req.user._id)

    res.json({
      success: true,
      message,
      data: { engagement },
    })
  } catch (error) {
    next(error)
  }
}

export async function getPostReactions(req, res, next) {
  try {
    const context = await getEngagementContext(req.params.id, res)
    if (!context) return

    const { engagementPost } = context

    const reactions = await PostReaction.find({ post: engagementPost._id })
      .sort({ createdAt: -1 })
      .populate('user')

    res.json({
      success: true,
      data: {
        reactions: reactions.map((reaction) => ({
          id: reaction._id,
          type: reaction.type,
          createdAt: reaction.createdAt,
          user: reaction.user?.toFeedAuthorJSON
            ? reaction.user.toFeedAuthorJSON()
            : {
                id: reaction.user?._id,
                username: reaction.user?.username,
                fullName: reaction.user?.profile?.fullName || reaction.user?.username,
                headline: reaction.user?.profile?.headline || '',
                profilePhoto: reaction.user?.profile?.profilePhoto || {
                  url: '',
                  publicId: '',
                },
              },
        })),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getPostReposts(req, res, next) {
  try {
    const context = await getEngagementContext(req.params.id, res)
    if (!context) return

    const { engagementPost } = context

    const repostPosts = await Post.find({ repostOf: engagementPost._id })
      .sort({ createdAt: -1 })
      .populate('author')

    res.json({
      success: true,
      data: {
        reposts: repostPosts.map((repostPost) => ({
          id: repostPost._id,
          createdAt: repostPost.createdAt,
          user: repostPost.author?.toFeedAuthorJSON
            ? repostPost.author.toFeedAuthorJSON()
            : {
                id: repostPost.author?._id,
                username: repostPost.author?.username,
                fullName: repostPost.author?.profile?.fullName || repostPost.author?.username,
                headline: repostPost.author?.profile?.headline || '',
                profilePhoto: repostPost.author?.profile?.profilePhoto || {
                  url: '',
                  publicId: '',
                },
              },
        })),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getPostComments(req, res, next) {
  try {
    const context = await getEngagementContext(req.params.id, res)
    if (!context) return

    const { engagementPost } = context

    const comments = await PostComment.find({ post: engagementPost._id })
      .sort({ createdAt: 1 })
      .populate('author')

    res.json({
      success: true,
      data: {
        comments: comments.map((comment) => comment.toPublicJSON(comment.author)),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function addPostComment(req, res, next) {
  try {
    const context = await getEngagementContext(req.params.id, res)
    if (!context) return

    const { engagementPost } = context
    const content = req.body.content.trim()
    const { parentCommentId } = req.body

    if (parentCommentId) {
      const parentComment = await PostComment.findById(parentCommentId)

      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found',
        })
      }

      if (parentComment.post.toString() !== engagementPost._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Parent comment does not belong to this post',
        })
      }
    }

    const mentionResult = await resolveMentions(content, req.user._id)

    if (mentionResult.error) {
      return res.status(mentionResult.error.status).json({
        success: false,
        message: mentionResult.error.message,
      })
    }

    const comment = await PostComment.create({
      post: engagementPost._id,
      author: req.user._id,
      parentComment: parentCommentId || null,
      content,
      mentions: mentionResult.mentions,
    })

    await comment.populate('author')

    await createMentionNotifications({
      actorId: req.user._id,
      mentions: mentionResult.mentions,
      postId: engagementPost._id,
      commentId: comment._id,
      content,
    })

    await notifyFriendComment({
      actorId: req.user._id,
      postId: engagementPost._id,
      commentId: comment._id,
      content,
      excludeUserIds: mentionResult.mentions.map((mention) => mention.user),
    })

    const engagement = await getEngagementForPost(engagementPost._id, req.user._id)

    res.status(201).json({
      success: true,
      message: 'Comment added',
      data: {
        comment: comment.toPublicJSON(comment.author),
        engagement,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function deletePostComment(req, res, next) {
  try {
    const context = await getEngagementContext(req.params.id, res)
    if (!context) return

    const { engagementPost } = context
    const comment = await PostComment.findById(req.params.commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    if (comment.post.toString() !== engagementPost._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Comment does not belong to this post',
      })
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments',
      })
    }

    await deleteCommentTree(comment._id)

    const engagement = await getEngagementForPost(engagementPost._id, req.user._id)

    res.json({
      success: true,
      message: 'Comment deleted',
      data: { engagement },
    })
  } catch (error) {
    next(error)
  }
}
