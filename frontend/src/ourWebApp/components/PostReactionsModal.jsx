import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { fetchPostReactions } from '../api/webAppApi'
import { getReactionMeta } from '../constants/postReactions'

function PostReactionsModal({ open, postId, onClose }) {
  const [reactions, setReactions] = useState([])
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

    fetchPostReactions(postId)
      .then((response) => {
        setReactions(response.data.reactions || [])
      })
      .catch(() => {
        setError('Unable to load reactions.')
        setReactions([])
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
      aria-label="People who reacted"
    >
      <div className="post-reactions-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="post-reactions-modal-header">
          <h2>Reactions</h2>
          <button
            type="button"
            className="post-reactions-modal-close"
            onClick={onClose}
            aria-label="Close reactions"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </header>

        {loading && (
          <div className="post-reactions-modal-loading text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading reactions...</span>
            </div>
          </div>
        )}

        {error && <div className="profile-alert profile-alert-error m-3">{error}</div>}

        {!loading && !error && reactions.length === 0 && (
          <p className="post-reactions-modal-empty webapp-muted">No reactions yet.</p>
        )}

        {!loading && reactions.length > 0 && (
          <ul className="post-reactions-list">
            {reactions.map((reaction) => {
              const photoUrl = reaction.user?.profilePhoto?.url
              const profilePath = reaction.user?.username
                ? `/app/profile/${reaction.user.username}`
                : '/app/profile'
              const reactionMeta = getReactionMeta(reaction.type)

              return (
                <li key={reaction.id} className="post-reactions-item">
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
                        {reaction.user?.fullName || reaction.user?.username}
                      </span>
                      <span className="post-reactions-username">@{reaction.user?.username}</span>
                    </span>
                  </Link>
                  <span className="post-reactions-type" title={reactionMeta.label}>
                    <span aria-hidden="true">{reactionMeta.emoji}</span>
                    <span className="visually-hidden">{reactionMeta.label}</span>
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

export default PostReactionsModal
