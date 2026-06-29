import Notification from '../models/Notification.js'
import { getFriendIds } from '../utils/friendship.js'
import { getIo } from '../utils/socket.js'

const REACTION_EMOJI = {
  like: '👍',
  love: '❤️',
  clap: '👏',
  support: '💪',
}

function buildPreview(content, maxLength = 120) {
  const trimmed = content.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength - 1)}…`
}

async function emitNotification(notification) {
  await notification.populate('actor')
  const payload = notification.toPublicJSON(notification.actor)
  const io = getIo()
  io?.to(`user:${notification.recipient.toString()}`).emit('notification_received', payload)
  return payload
}

function emitNotificationRemoved(notification) {
  const io = getIo()
  io?.to(`user:${notification.recipient.toString()}`).emit('notification_removed', {
    id: notification._id.toString(),
    wasUnread: !notification.readAt,
  })
}

async function deleteNotificationsAndEmit(notifications) {
  if (!notifications.length) return

  const ids = notifications.map((notification) => notification._id)
  await Notification.deleteMany({ _id: { $in: ids } })

  for (const notification of notifications) {
    emitNotificationRemoved(notification)
  }
}

export async function deleteActivityNotifications({ actorId, type, postId }) {
  const notifications = await Notification.find({
    actor: actorId,
    type,
    post: postId,
  })

  await deleteNotificationsAndEmit(notifications)
}

export async function notifyFriendsOfActivity({
  actorId,
  type,
  postId,
  commentId = null,
  preview = '',
  excludeUserIds = [],
}) {
  const friendIds = await getFriendIds(actorId)
  const excludeSet = new Set([actorId.toString(), ...excludeUserIds.map(String)])
  const recipients = friendIds.filter((friendId) => !excludeSet.has(friendId.toString()))

  if (!recipients.length) return []

  const created = []

  for (const recipientId of recipients) {
    const notification = await Notification.create({
      recipient: recipientId,
      actor: actorId,
      type,
      post: postId,
      comment: commentId,
      preview,
    })

    created.push(await emitNotification(notification))
  }

  return created
}

export async function createMentionNotifications({
  actorId,
  mentions,
  postId,
  commentId = null,
  content,
}) {
  if (!mentions?.length) return []

  const preview = buildPreview(content)
  const created = []

  for (const mention of mentions) {
    const notification = await Notification.create({
      recipient: mention.user,
      actor: actorId,
      type: 'mention',
      post: postId,
      comment: commentId,
      preview,
    })

    created.push(await emitNotification(notification))
  }

  return created
}

export async function notifyFriendPost({ actorId, postId, content, excludeUserIds = [] }) {
  return notifyFriendsOfActivity({
    actorId,
    type: 'friend_post',
    postId,
    preview: buildPreview(content),
    excludeUserIds,
  })
}

export async function notifyFriendReaction({ actorId, postId, reactionType }) {
  const emoji = REACTION_EMOJI[reactionType] || '👍'

  await deleteActivityNotifications({
    actorId,
    type: 'friend_reaction',
    postId,
  })

  return notifyFriendsOfActivity({
    actorId,
    type: 'friend_reaction',
    postId,
    preview: `Reacted ${emoji} to a post`,
  })
}

export async function notifyFriendComment({
  actorId,
  postId,
  commentId,
  content,
  excludeUserIds = [],
}) {
  return notifyFriendsOfActivity({
    actorId,
    type: 'friend_comment',
    postId,
    commentId,
    preview: buildPreview(content),
    excludeUserIds,
  })
}

export async function notifyFriendRepost({ actorId, postId }) {
  return notifyFriendsOfActivity({
    actorId,
    type: 'friend_repost',
    postId,
    preview: 'Shared a post with their network',
  })
}

export async function deleteNotificationsForComments(commentIds) {
  if (!commentIds.length) return

  const notifications = await Notification.find({ comment: { $in: commentIds } })
  await deleteNotificationsAndEmit(notifications)
}

export async function deleteNotificationsForPosts(postIds) {
  if (!postIds.length) return

  const notifications = await Notification.find({ post: { $in: postIds } })
  await deleteNotificationsAndEmit(notifications)
}

export { buildPreview }
