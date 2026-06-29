export function getNotificationActionText(type) {
  switch (type) {
    case 'mention':
      return 'mentioned you'
    case 'friend_post':
      return 'published a new post'
    case 'friend_reaction':
      return 'reacted to a post'
    case 'friend_comment':
      return 'commented on a post'
    case 'friend_repost':
      return 'reposted a post'
    default:
      return 'sent you an update'
  }
}

export function shouldOpenCommentsForNotification(notification) {
  if (notification.type === 'friend_comment') return true
  if (notification.type === 'mention' && notification.commentId) return true
  return false
}

export function shouldShowPreviewForNotification(type) {
  return type !== 'friend_reaction' && type !== 'friend_repost'
}
