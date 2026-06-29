export const POST_REACTIONS = [
  { type: 'like', label: 'Like', emoji: '👍' },
  { type: 'love', label: 'Love', emoji: '❤️' },
  { type: 'clap', label: 'Clap', emoji: '👏' },
  { type: 'support', label: 'Support', emoji: '💪' },
]

export function getReactionMeta(type) {
  return POST_REACTIONS.find((reaction) => reaction.type === type) || POST_REACTIONS[0]
}

export function formatEngagementSummary(engagement) {
  if (!engagement) return ''

  const parts = []
  const totalReactions = engagement.reactionCounts?.total || 0

  if (totalReactions > 0) {
    parts.push(`${totalReactions} reaction${totalReactions === 1 ? '' : 's'}`)
  }
  if (engagement.commentCount > 0) {
    parts.push(`${engagement.commentCount} comment${engagement.commentCount === 1 ? '' : 's'}`)
  }
  if (engagement.repostCount > 0) {
    parts.push(`${engagement.repostCount} repost${engagement.repostCount === 1 ? '' : 's'}`)
  }

  return parts.join(' · ')
}
