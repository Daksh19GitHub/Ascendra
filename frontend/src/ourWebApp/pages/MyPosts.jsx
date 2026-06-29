import { useEffect, useState } from 'react'
import { createPost, fetchMyPosts } from '../api/webAppApi'
import JobListingDateFields from '../components/JobListingDateFields'
import MentionTextarea from '../components/MentionTextarea'
import MyPostCard from '../components/MyPostCard'
import { getDefaultJobListingDates } from '../utils/jobListingDates'

function MyPosts() {
  const defaultJobDates = getDefaultJobListingDates()
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState('standard')
  const [jobStartsAt, setJobStartsAt] = useState(defaultJobDates.jobStartsAt)
  const [jobClosesAt, setJobClosesAt] = useState(defaultJobDates.jobClosesAt)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAllPosts, setShowAllPosts] = useState(false)

  async function loadPosts() {
    setError('')
    try {
      const response = await fetchMyPosts()
      setPosts(response.data.posts || [])
    } catch {
      setError('Unable to load your posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  function handleEngagementChange(postId, engagement) {
    setPosts((prev) =>
      prev.map((post) => {
        const targetId =
          post.isRepost && post.originalPost?.id ? post.originalPost.id : post.id
        return targetId === postId ? { ...post, engagement } : post
      })
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!content.trim()) {
      setError('Write something before publishing.')
      return
    }

    if (postType === 'job' && (!jobStartsAt || !jobClosesAt)) {
      setError('Choose a start date and end date for this job opening.')
      return
    }

    if (postType === 'job' && jobClosesAt < jobStartsAt) {
      setError('Job end date must be on or after the start date.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await createPost(content.trim(), postType, {
        jobStartsAt,
        jobClosesAt,
      })
      setPosts((prev) => [response.data.post, ...prev])
      setContent('')
      setPostType('standard')
      const nextDefaults = getDefaultJobListingDates()
      setJobStartsAt(nextDefaults.jobStartsAt)
      setJobClosesAt(nextDefaults.jobClosesAt)
      setSuccess('Post published successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container webapp-page-content text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading posts...</span>
        </div>
      </div>
    )
  }

  const visiblePosts = showAllPosts ? posts : posts.slice(0, 1)
  const hasHiddenPosts = posts.length > 1 && !showAllPosts

  return (
    <div className="container webapp-page-content feed-page">
      <div className="feed-page-header">
        <p className="webapp-muted mb-0">
          Share updates with your network — your posts and reposts appear here and in Home
        </p>
      </div>

      {error && <div className="profile-alert profile-alert-error">{error}</div>}
      {success && <div className="profile-alert profile-alert-success">{success}</div>}

      <section className="compose-post-card">
        <h2>Write a post</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="compose-post-type-toggle" role="group" aria-label="Post type">
            <button
              type="button"
              className={`compose-post-type-btn${postType === 'standard' ? ' active' : ''}`}
              onClick={() => setPostType('standard')}
              disabled={submitting}
            >
              <i className="bi bi-chat-left-text me-1"></i>
              Normal post
            </button>
            <button
              type="button"
              className={`compose-post-type-btn${postType === 'job' ? ' active' : ''}`}
              onClick={() => setPostType('job')}
              disabled={submitting}
            >
              <i className="bi bi-briefcase me-1"></i>
              Job opening
            </button>
          </div>
          {postType === 'job' && (
            <JobListingDateFields
              idPrefix="compose-job"
              jobStartsAt={jobStartsAt}
              jobClosesAt={jobClosesAt}
              onJobStartsAtChange={setJobStartsAt}
              onJobClosesAtChange={setJobClosesAt}
              disabled={submitting}
            />
          )}
          <MentionTextarea
            className="form-control compose-post-input"
            rows={4}
            placeholder={
              postType === 'job'
                ? 'Share the role, company, required skills, eligibility, and apply link...'
                : 'Share an update... Use @ to mention someone'
            }
            value={content}
            onChange={(event) => {
              setContent(event.target.value)
              setError('')
              setSuccess('')
            }}
            disabled={submitting}
            maxLength={2000}
          />
          <div className="compose-post-footer">
            <span className="webapp-muted">{content.length}/2000</span>
            <button
              type="submit"
              className="btn btn-sm btn-profile-save"
              disabled={submitting || !content.trim()}
            >
              {submitting
                ? postType === 'job'
                  ? 'Publishing job...'
                  : 'Publishing...'
                : postType === 'job'
                  ? 'Publish job opening'
                  : 'Publish post'}
            </button>
          </div>
        </form>
      </section>

      <section className="my-posts-list-section">
        <h2>Your posts & reposts ({posts.length})</h2>

        {posts.length === 0 ? (
          <div className="webapp-empty-state">
            <i className="bi bi-journal-text"></i>
            <p>You haven&apos;t posted anything yet.</p>
            <span className="webapp-muted">Write your first post above to get started.</span>
          </div>
        ) : (
          <>
            <div className="feed-post-list">
              {visiblePosts.map((post) => (
                <MyPostCard
                  key={post.id}
                  post={post}
                  onUpdated={(updatedPost) => {
                    setPosts((prev) =>
                      prev.map((item) => (item.id === updatedPost.id ? updatedPost : item))
                    )
                    setSuccess('Post updated successfully.')
                    setError('')
                  }}
                  onDeleted={(postId) => {
                    setPosts((prev) => prev.filter((item) => item.id !== postId))
                    setSuccess('Post deleted successfully.')
                    setError('')
                  }}
                  onError={setError}
                  onSuccess={setSuccess}
                  onEngagementChange={handleEngagementChange}
                />
              ))}
            </div>

            {hasHiddenPosts && (
              <button
                type="button"
                className="public-profile-activity-show-all"
                onClick={() => setShowAllPosts(true)}
              >
                Show all ({posts.length} posts)
              </button>
            )}

            {showAllPosts && posts.length > 1 && (
              <button
                type="button"
                className="public-profile-activity-show-all"
                onClick={() => setShowAllPosts(false)}
              >
                Show less
              </button>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default MyPosts
