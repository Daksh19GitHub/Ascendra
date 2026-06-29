import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchFeed, fetchPost } from '../api/webAppApi'
import FeedPostCard from '../components/FeedPostCard'

const FEED_PAGE_SIZE = 25

function getPostMatchIds(post) {
  const ids = [String(post.id)]
  if (post.isRepost && post.originalPost?.id) {
    ids.push(String(post.originalPost.id))
  }
  return ids
}

function mergePinnedPost(posts, pinnedPost) {
  const pinnedIds = new Set(getPostMatchIds(pinnedPost))

  const filtered = posts.filter((post) => {
    const postIds = getPostMatchIds(post)
    return !postIds.some((id) => pinnedIds.has(id))
  })

  return [pinnedPost, ...filtered]
}

function WebAppHome() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const highlightPostId = searchParams.get('post')
  const highlightCommentId = searchParams.get('comment')
  const autoOpenComments = searchParams.get('comments') === '1'
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const applyFeedResponse = useCallback(async (response, postIdToPin, append = false) => {
    let nextPosts = response.data.posts || []

    if (postIdToPin && !append) {
      try {
        const pinnedResponse = await fetchPost(postIdToPin)
        if (pinnedResponse.data.post) {
          nextPosts = mergePinnedPost(nextPosts, pinnedResponse.data.post)
        }
      } catch {
        // pinned post may have been deleted
      }
    }

    setPosts((prev) => (append ? [...prev, ...nextPosts] : nextPosts))
    setHasMore(Boolean(response.data.pagination?.hasMore))
    setPage(response.data.pagination?.page || 1)
  }, [])

  const loadFeed = useCallback(
    async (isRefresh = false, postIdToPin = null) => {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      setError('')

      try {
        const response = await fetchFeed({ page: 1, limit: FEED_PAGE_SIZE })
        await applyFeedResponse(response, postIdToPin, false)
      } catch {
        setError('Unable to load your feed. Please try again.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [applyFeedResponse]
  )

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    setError('')

    try {
      const response = await fetchFeed({ page: page + 1, limit: FEED_PAGE_SIZE })
      await applyFeedResponse(response, null, true)
    } catch {
      setError('Unable to load more posts. Please try again.')
    } finally {
      setLoadingMore(false)
    }
  }, [applyFeedResponse, hasMore, loadingMore, page])

  useEffect(() => {
    loadFeed(false, highlightPostId)
  }, [highlightPostId, loadFeed])

  function handleEngagementChange(postId, engagement) {
    setPosts((prev) =>
      prev.map((post) => {
        const targetId =
          post.isRepost && post.originalPost?.id ? post.originalPost.id : post.id
        return targetId === postId ? { ...post, engagement } : post
      })
    )
  }

  if (loading) {
    return (
      <div className="container webapp-page-content text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading feed...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container webapp-page-content feed-page">
      <div className="feed-page-header">
        <p className="webapp-muted mb-0">
          Posts matched to your interests from across Ascendra
        </p>
        <button
          type="button"
          className="btn btn-sm btn-profile-add"
          onClick={() => loadFeed(true, highlightPostId)}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Refreshing...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh feed
            </>
          )}
        </button>
      </div>

      {error && <div className="profile-alert profile-alert-error">{error}</div>}

      {!error && posts.length === 0 && (
        <div className="webapp-empty-state">
          <i className="bi bi-newspaper"></i>
          <p>No posts in your feed yet.</p>
          <span className="webapp-muted">
            Like posts on topics you care about to discover similar new posts you have not seen yet.
          </span>
        </div>
      )}

      <div className="feed-post-list">
        {posts.map((post) => (
          <FeedPostCard
            key={post.id}
            post={post}
            isOwnPost={String(post.author?.id) === String(user?.id)}
            onEngagementChange={handleEngagementChange}
            highlightPostId={highlightPostId}
            highlightCommentId={highlightCommentId}
            autoOpenComments={autoOpenComments}
          />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          className="public-profile-activity-show-all feed-load-more-btn"
          onClick={loadMore}
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading...' : 'Load more posts'}
        </button>
      )}
    </div>
  )
}

export default WebAppHome
