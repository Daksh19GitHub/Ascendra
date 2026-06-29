import PostComment from '../models/PostComment.js'
import { deleteNotificationsForComments } from '../services/notificationService.js'

export async function collectDescendantCommentIds(commentId) {
  const ids = [commentId]
  const queue = [commentId]

  while (queue.length) {
    const currentId = queue.shift()
    const children = await PostComment.find({ parentComment: currentId }).select('_id')

    for (const child of children) {
      ids.push(child._id)
      queue.push(child._id)
    }
  }

  return ids
}

export async function deleteCommentTree(commentId) {
  const commentIds = await collectDescendantCommentIds(commentId)

  await deleteNotificationsForComments(commentIds)
  await PostComment.deleteMany({ _id: { $in: commentIds } })

  return commentIds.length
}
