import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MentionContent } from '../utils/mentionContent'
import { CONTENT_PREVIEW_LENGTH, truncatePostContent } from '../utils/truncatePostContent'
import { formatJobDateRange } from '../utils/jobListingDates'
import PostActions from './PostActions'
import PostComments from './PostComments'
import PostEngagementStats from './PostEngagementStats'
import PostReactionsModal from './PostReactionsModal'
import PostRepostsModal from './PostRepostsModal'
import UserHeadline from './UserHeadline'

function formatPostDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getMatchBadgeClass(matchPercent) {
  if (matchPercent >= 75) return 'job-match-badge-high'
  if (matchPercent >= 50) return 'job-match-badge-medium'
  return 'job-match-badge-low'
}

function JobRecommendationCard({ job, onEngagementChange }) {
  const { post, matchPercent, matchReason, listingPhase } = job
  const [expanded, setExpanded] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [reactionsOpen, setReactionsOpen] = useState(false)
  const [repostsOpen, setRepostsOpen] = useState(false)
  const [engagement, setEngagement] = useState(post.engagement)
  const author = post.author
  const photoUrl = author?.profilePhoto?.url
  const profilePath = author?.username ? `/app/profile/${author.username}` : '/app/profile'
  const { preview, isTruncated } = truncatePostContent(post.content, CONTENT_PREVIEW_LENGTH)
  const showFullContent = expanded || !isTruncated

  useEffect(() => {
    setEngagement(post.engagement)
  }, [post.id, post.engagement])

  function handleEngagementChange(postId, nextEngagement) {
    setEngagement(nextEngagement)
    onEngagementChange?.(postId, nextEngagement)
  }

  const actionPost = { ...post, engagement }

  return (
    <article className="feed-post-card job-recommendation-card">
      <div className="job-match-header">
        <span className={`job-match-badge ${getMatchBadgeClass(matchPercent)}`}>
          {matchPercent}% match
        </span>
        <p className="job-match-reason mb-0">{matchReason}</p>
      </div>

      {post.jobStartsAt && post.jobClosesAt && (
        <span
          className={`job-listing-status-badge ${
            listingPhase === 'scheduled'
              ? 'job-listing-status-scheduled'
              : 'job-listing-status-open'
          }`}
        >
          <i
            className={`bi ${
              listingPhase === 'scheduled' ? 'bi-calendar-event' : 'bi-check-circle-fill'
            } me-1`}
          ></i>
          {listingPhase === 'scheduled' ? 'Scheduled' : 'Open'} ·{' '}
          {formatJobDateRange(post.jobStartsAt, post.jobClosesAt)}
        </span>
      )}

      <header className="feed-post-header">
        <Link to={profilePath} className="feed-post-avatar-link" aria-label={`View ${author?.username}'s profile`}>
          <div className="feed-post-avatar">
            {photoUrl ? (
              <img src={photoUrl} alt="" />
            ) : (
              <i className="bi bi-person-fill"></i>
            )}
          </div>
        </Link>
        <div>
          <h2>
            <Link to={profilePath} className="feed-post-author-link">
              {author?.fullName || author?.username}
            </Link>
          </h2>
          <UserHeadline headline={author?.headline} />
          <p className="feed-post-meta">
            @{author?.username} · {formatPostDate(post.createdAt)}
          </p>
        </div>
      </header>

      <div className="feed-post-content job-post-content">
        <MentionContent
          content={showFullContent ? post.content : preview}
          mentions={post.mentions}
        />
        {isTruncated && (
          <button
            type="button"
            className="feed-post-read-more"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>

      <PostEngagementStats
        engagement={engagement}
        onReactionsClick={() => setReactionsOpen(true)}
        onCommentsClick={() => setCommentsOpen(true)}
        onRepostsClick={() => setRepostsOpen(true)}
      />

      <PostReactionsModal
        open={reactionsOpen}
        postId={post.id}
        onClose={() => setReactionsOpen(false)}
      />

      <PostRepostsModal
        open={repostsOpen}
        postId={post.id}
        onClose={() => setRepostsOpen(false)}
      />

      <PostActions
        post={actionPost}
        commentsOpen={commentsOpen}
        onCommentClick={() => setCommentsOpen((open) => !open)}
        onEngagementChange={handleEngagementChange}
      />

      <PostComments
        postId={post.id}
        open={commentsOpen}
        onEngagementChange={handleEngagementChange}
      />
    </article>
  )
}

export default JobRecommendationCard
