import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import JobListingStatusBadge from './JobListingStatusBadge'
import UserHeadline from './UserHeadline'
import PostActions from './PostActions'
import PostComments from './PostComments'
import PostContentWithReadMore from './PostContentWithReadMore'
import PostEngagementStats from './PostEngagementStats'
import PostReactionsModal from './PostReactionsModal'
import PostRepostsModal from './PostRepostsModal'

function formatPostDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function OriginalPostEmbed({ originalPost }) {
  const author = originalPost.author
  const photoUrl = author?.profilePhoto?.url
  const profilePath = author?.username ? `/app/profile/${author.username}` : '/app/profile'

  return (
    <div className="post-repost-original">
      <header className="feed-post-header post-repost-original-header">
        <Link to={profilePath} className="feed-post-avatar-link" aria-label={`View ${author?.username}'s profile`}>
          <div className="feed-post-avatar feed-post-avatar-sm">
            {photoUrl ? (
              <img src={photoUrl} alt="" />
            ) : (
              <i className="bi bi-person-fill" aria-hidden="true"></i>
            )}
          </div>
        </Link>
        <div>
          <h3>
            <Link to={profilePath} className="feed-post-author-link">
              {author?.fullName || author?.username}
            </Link>
          </h3>
          <UserHeadline headline={author?.headline} />
          <p className="feed-post-meta mb-0">
            <Link to={profilePath} className="feed-post-author-link">
              @{author?.username}
            </Link>
            {' · '}
            {formatPostDate(originalPost.createdAt)}
          </p>
        </div>
      </header>
      <PostContentWithReadMore
        content={originalPost.content}
        mentions={originalPost.mentions}
        className="feed-post-content mb-0"
      />
    </div>
  )
}

function FeedPostCard({
  post,
  isOwnPost = false,
  hideAuthor = false,
  onEngagementChange,
  highlightPostId = null,
  highlightCommentId = null,
  autoOpenComments = false,
}) {
  const isHighlightedEarly = highlightPostId && highlightPostId === post.id
  const [commentsOpen, setCommentsOpen] = useState(
    autoOpenComments && isHighlightedEarly
  )
  const [reactionsOpen, setReactionsOpen] = useState(false)
  const [repostsOpen, setRepostsOpen] = useState(false)
  const [engagement, setEngagement] = useState(post.engagement)
  const { author } = post
  const isRepost = Boolean(post.isRepost && post.originalPost)
  const displayPostType = isRepost ? post.originalPost?.postType : post.postType
  const isJobPost = displayPostType === 'job'
  const jobListingPost = isRepost ? post.originalPost : post
  const actionPostId = isRepost ? post.originalPost.id : post.id
  const isHighlighted = highlightPostId && highlightPostId === post.id

  useEffect(() => {
    setEngagement(post.engagement)
  }, [post.id, post.engagement])

  useEffect(() => {
    if (autoOpenComments && isHighlighted) {
      setCommentsOpen(true)
    }
  }, [autoOpenComments, isHighlighted])

  useEffect(() => {
    if (!isHighlighted) return undefined

    const timer = setTimeout(() => {
      if (highlightCommentId) {
        return
      }

      if (!isRepost) {
        const contentTarget = document.getElementById(`post-content-${post.id}`)
        if (contentTarget) {
          contentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return
        }
      }

      document.getElementById(`post-${post.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 180)

    return () => clearTimeout(timer)
  }, [isHighlighted, post.id, isRepost, highlightCommentId])

  const photoUrl = author?.profilePhoto?.url
  const profilePath = author?.username ? `/app/profile/${author.username}` : '/app/profile'

  function handleEngagementChange(postId, nextEngagement) {
    setEngagement(nextEngagement)
    onEngagementChange?.(postId, nextEngagement)
  }

  const actionPost = {
    id: actionPostId,
    engagement,
    ...(isRepost ? post.originalPost : post),
  }

  return (
    <article
      id={`post-${post.id}`}
      className={`feed-post-card${isOwnPost ? ' feed-post-card-own' : ''}${hideAuthor ? ' feed-post-card-compact' : ''}${isRepost ? ' feed-post-card-repost' : ''}${isHighlighted ? ' feed-post-card-highlight' : ''}`}
    >
      {hideAuthor && !isRepost ? (
        <header className="feed-post-header feed-post-header-compact">
          <p className="feed-post-meta mb-0">
            {formatPostDate(post.createdAt)}
            {isOwnPost && <span className="feed-post-you-badge ms-2">You</span>}
          </p>
        </header>
      ) : (
        <header className="feed-post-header">
          <Link to={profilePath} className="feed-post-avatar-link" aria-label={`View ${author?.username}'s profile`}>
            <div className="feed-post-avatar">
              {photoUrl ? (
                <img src={photoUrl} alt="" />
              ) : (
                <i className="bi bi-person-fill" aria-hidden="true"></i>
              )}
            </div>
          </Link>
          <div>
            <h2>
              <Link to={profilePath} className="feed-post-author-link">
                {author?.fullName || author?.username}
              </Link>
              {isOwnPost && <span className="feed-post-you-badge">You</span>}
            </h2>
            <UserHeadline headline={author?.headline} />
            <p className="feed-post-meta">
              <Link to={profilePath} className="feed-post-author-link">
                @{author?.username}
              </Link>
              {' · '}
              {formatPostDate(post.createdAt)}
            </p>
          </div>
        </header>
      )}

      {(isRepost || engagement?.userReposted) && (
        <p className="post-reposted-note">
          <i className="bi bi-repeat me-1"></i>
          {isRepost
            ? isOwnPost
              ? 'You reposted'
              : `${author?.fullName || author?.username} reposted`
            : 'You reposted this'}
        </p>
      )}

      {isJobPost && <JobListingStatusBadge post={jobListingPost} className="feed-job-listing-status" />}

      {isRepost ? (
        <OriginalPostEmbed originalPost={post.originalPost} />
      ) : (
        <PostContentWithReadMore
          content={post.content}
          mentions={post.mentions}
          id={`post-content-${post.id}`}
          className={`feed-post-content${isHighlighted && !highlightCommentId ? ' feed-post-content-highlight' : ''}`}
        />
      )}

      <PostEngagementStats
        engagement={engagement}
        onReactionsClick={() => setReactionsOpen(true)}
        onCommentsClick={() => setCommentsOpen(true)}
        onRepostsClick={() => setRepostsOpen(true)}
      />

      <PostReactionsModal
        open={reactionsOpen}
        postId={actionPostId}
        onClose={() => setReactionsOpen(false)}
      />

      <PostRepostsModal
        open={repostsOpen}
        postId={actionPostId}
        onClose={() => setRepostsOpen(false)}
      />

      <PostActions
        post={actionPost}
        commentsOpen={commentsOpen}
        onCommentClick={() => setCommentsOpen((open) => !open)}
        onEngagementChange={(_, nextEngagement) =>
          handleEngagementChange(actionPostId, nextEngagement)
        }
      />

      <PostComments
        postId={actionPostId}
        open={commentsOpen}
        autoOpen={autoOpenComments && isHighlighted}
        highlightCommentId={isHighlighted ? highlightCommentId : null}
        onEngagementChange={(_, nextEngagement) =>
          handleEngagementChange(actionPostId, nextEngagement)
        }
      />
    </article>
  )
}

export default FeedPostCard
