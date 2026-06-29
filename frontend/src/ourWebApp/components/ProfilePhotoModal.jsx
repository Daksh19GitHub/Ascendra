import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

function ProfilePhotoModal({ open, imageUrl, onClose, username, showEditLink = false }) {
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

  if (!open) return null

  return createPortal(
    <div
      className="profile-photo-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={imageUrl ? 'Profile photo preview' : 'Profile photo placeholder'}
    >
      <div
        className="profile-photo-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="profile-photo-modal-close"
          onClick={onClose}
          aria-label="Close preview"
        >
          <i className="bi bi-x-lg"></i>
        </button>

        {imageUrl ? (
          <img src={imageUrl} alt={username ? `${username}'s profile` : 'Profile'} />
        ) : (
          <div className="profile-photo-modal-placeholder">
            <i className="bi bi-person-fill" aria-hidden="true"></i>
            <p>No profile photo yet</p>
            <span>Upload a photo to personalize your profile</span>
          </div>
        )}

        {showEditLink && (
          <Link
            to="/app/profile"
            className="profile-photo-modal-edit"
            onClick={onClose}
          >
            Edit profile
          </Link>
        )}
      </div>
    </div>,
    document.body
  )
}

export default ProfilePhotoModal
