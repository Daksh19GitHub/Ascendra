import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { fetchPostReposts } from '../api/webAppApi'

function PostRepostsModal({ open, postId, onClose }) {
  const [reposts, setReposts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || !postId) return

    setLoading(true)
    setError('')

    fetchPostReposts(postId)
      .then((response) => {
        setReposts(response.data.reposts || [])
      })
      .catch(() => {
        setError('Unable to load reposts.')
        setReposts([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [open, postId])

  if (!open) return null

  return createPortal(
    <div
      className="post-reactions-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="People who reposted"
    >
      <div className="post-reactions-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="post-reactions-modal-header">
          <h2>Reposts</h2>
          <button
            type="button"
            className="post-reactions-modal-close"
            onClick={onClose}
            aria-label="Close reposts"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </header>

        {loading && (
          <div className="post-reactions-modal-loading text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading reposts...</span>
            </div>
          </div>
        )}

        {error && <div className="profile-alert profile-alert-error m-3">{error}</div>}

        {!loading && !error && reposts.length === 0 && (
          <p className="post-reactions-modal-empty webapp-muted">No reposts yet.</p>
        )}

        {!loading && reposts.length > 0 && (
          <ul className="post-reactions-list">
            {reposts.map((repost) => {
              const photoUrl = repost.user?.profilePhoto?.url
              const profilePath = repost.user?.username
                ? `/app/profile/${repost.user.username}`
                : '/app/profile'

              return (
                <li key={repost.id} className="post-reactions-item">
                  <Link to={profilePath} className="post-reactions-user" onClick={onClose}>
                    <span className="post-reactions-avatar">
                      {photoUrl ? (
                        <img src={photoUrl} alt="" />
                      ) : (
                        <i className="bi bi-person-fill" aria-hidden="true"></i>
                      )}
                    </span>
                    <span className="post-reactions-user-meta">
                      <span className="post-reactions-name">
                        {repost.user?.fullName || repost.user?.username}
                      </span>
                      <span className="post-reactions-username">@{repost.user?.username}</span>
                    </span>
                  </Link>
                  <span className="post-reposts-icon" aria-hidden="true">
                    <i className="bi bi-repeat"></i>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>,
    document.body
  )
}

export default PostRepostsModal
