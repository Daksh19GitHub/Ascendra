import { POST_REACTIONS } from '../constants/postReactions'

function PostEngagementStats({
  engagement,
  onReactionsClick,
  onCommentsClick,
  onRepostsClick,
}) {
  if (!engagement) return null

  const totalReactions = engagement.reactionCounts?.total || 0
  const commentCount = engagement.commentCount || 0
  const repostCount = engagement.repostCount || 0
  const topReactions = POST_REACTIONS.filter(
    (reaction) => engagement.reactionCounts?.[reaction.type] > 0
  )

  if (totalReactions === 0 && commentCount === 0 && repostCount === 0) return null

  const items = []

  if (totalReactions > 0) {
    items.push(
      <button
        key="reactions"
        type="button"
        className="post-engagement-reactions-btn"
        onClick={onReactionsClick}
        aria-label={`View ${totalReactions} reaction${totalReactions === 1 ? '' : 's'}`}
      >
        {topReactions.length > 0 && (
          <span className="post-engagement-reactions" aria-hidden="true">
            {topReactions.map((reaction) => (
              <span key={reaction.type} className="post-engagement-reaction-icon">
                {reaction.emoji}
              </span>
            ))}
          </span>
        )}
        <span className="post-engagement-link">
          {totalReactions} reaction{totalReactions === 1 ? '' : 's'}
        </span>
      </button>
    )
  }

  if (commentCount > 0) {
    items.push(
      <button
        key="comments"
        type="button"
        className="post-engagement-link-btn"
        onClick={onCommentsClick}
        aria-label={`View ${commentCount} comment${commentCount === 1 ? '' : 's'}`}
      >
        <span className="post-engagement-link">
          {commentCount} comment{commentCount === 1 ? '' : 's'}
        </span>
      </button>
    )
  }

  if (repostCount > 0) {
    items.push(
      <button
        key="reposts"
        type="button"
        className="post-engagement-link-btn"
        onClick={onRepostsClick}
        aria-label={`View ${repostCount} repost${repostCount === 1 ? '' : 's'}`}
      >
        <span className="post-engagement-link">
          {repostCount} repost{repostCount === 1 ? '' : 's'}
        </span>
      </button>
    )
  }

  return (
    <div className="post-engagement-stats">
      {items.map((item, index) => (
        <span key={item.key} className="post-engagement-stat-item">
          {index > 0 && <span className="post-engagement-separator" aria-hidden="true"> · </span>}
          {item}
        </span>
      ))}
    </div>
  )
}

export default PostEngagementStats
