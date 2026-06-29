import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchRecommendedJobs } from '../api/webAppApi'
import JobRecommendationCard from '../components/JobRecommendationCard'

const JOBS_PAGE_SIZE = 25

function JobsForYou() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [needsProfile, setNeedsProfile] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const applyJobsResponse = useCallback((response, append = false) => {
    const nextJobs = response.data.jobs || []

    setJobs((prev) => (append ? [...prev, ...nextJobs] : nextJobs))
    setMessage(response.data.message || '')
    setNeedsProfile(Boolean(response.data.needsProfile))
    setHasMore(Boolean(response.data.pagination?.hasMore))
    setPage(response.data.pagination?.page || 1)
  }, [])

  const loadJobs = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      setError('')
      setMessage('')
      setNeedsProfile(false)

      try {
        const response = await fetchRecommendedJobs({ page: 1, limit: JOBS_PAGE_SIZE })
        applyJobsResponse(response, false)
      } catch {
        setError('Unable to load job recommendations. Please try again.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [applyJobsResponse]
  )

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    setError('')

    try {
      const response = await fetchRecommendedJobs({ page: page + 1, limit: JOBS_PAGE_SIZE })
      applyJobsResponse(response, true)
    } catch {
      setError('Unable to load more jobs. Please try again.')
    } finally {
      setLoadingMore(false)
    }
  }, [applyJobsResponse, hasMore, loadingMore, page])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  function handleEngagementChange(postId, engagement) {
    setJobs((prev) =>
      prev.map((job) =>
        job.post.id === postId ? { ...job, post: { ...job.post, engagement } } : job
      )
    )
  }

  if (loading) {
    return (
      <div className="container webapp-page-content text-center jobs-page">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading job recommendations...</span>
        </div>
        <p className="webapp-muted mt-3 mb-0 jobs-loading-note">
          Matching jobs to your profile. The first load may take a moment while the embedding model
          initializes.
        </p>
      </div>
    )
  }

  return (
    <div className="container webapp-page-content jobs-page">
      <div className="feed-page-header">
        <p className="webapp-muted mb-0">
          Open and upcoming job listings matched to your profile
        </p>
        <button
          type="button"
          className="btn btn-sm btn-profile-add"
          onClick={() => loadJobs(true)}
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
              Refresh
            </>
          )}
        </button>
      </div>

      {error && <div className="profile-alert profile-alert-error">{error}</div>}

      {!error && needsProfile && (
        <div className="webapp-empty-state">
          <i className="bi bi-briefcase"></i>
          <p>Complete your profile to unlock job recommendations.</p>
          <span className="webapp-muted">
            Add skills, education, or work experience so we can match you with relevant openings.
          </span>
          <Link to="/app/profile/edit" className="btn btn-sm btn-profile-add mt-3">
            Edit profile
          </Link>
        </div>
      )}

      {!error && !needsProfile && jobs.length === 0 && (
        <div className="webapp-empty-state">
          <i className="bi bi-briefcase"></i>
          <p>{message || 'No job recommendations right now.'}</p>
        </div>
      )}

      <div className="feed-post-list">
        {jobs.map((job) => (
          <JobRecommendationCard
            key={job.post.id}
            job={job}
            onEngagementChange={handleEngagementChange}
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
          {loadingMore ? 'Loading...' : 'Load more jobs'}
        </button>
      )}
    </div>
  )
}

export default JobsForYou
