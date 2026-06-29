import { useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { removeProfilePhoto, uploadProfilePhoto } from '../api/webAppApi'
import ProfilePhotoModal from './ProfilePhotoModal'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024

function ProfilePhotoUpload({ photoUrl, onPhotoUpdated }) {
  const { updateUser, user } = useAuth()
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const busy = uploading || removing
  const displayUrl = preview || photoUrl
  const hasSavedPhoto = Boolean(photoUrl) && !preview

  function handleChooseClick() {
    inputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    setError('')

    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please choose a JPG, PNG, or WebP image.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_SIZE) {
      setError('Image must be 2 MB or smaller.')
      e.target.value = ''
      return
    }

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError('Please choose an image first.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const response = await uploadProfilePhoto(selectedFile)
      updateUser(response.data.user)
      onPhotoUpdated?.(response.data.user, 'Profile photo updated successfully.')
      setSelectedFile(null)
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    if (!hasSavedPhoto) return

    const confirmed = window.confirm('Remove your profile photo?')
    if (!confirmed) return

    setRemoving(true)
    setError('')

    try {
      const response = await removeProfilePhoto()
      updateUser(response.data.user)
      onPhotoUpdated?.(response.data.user, 'Profile photo removed successfully.')
      setSelectedFile(null)
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove photo. Please try again.')
    } finally {
      setRemoving(false)
    }
  }

  function handleCancelPreview() {
    setSelectedFile(null)
    setPreview(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section className="profile-photo-section">
      <h2>Profile photo</h2>
      <p className="profile-section-hint">
        Upload a square photo. JPG, PNG, or WebP up to 2 MB.
      </p>

      <div className="profile-photo-row">
        <button
          type="button"
          className="profile-photo-preview profile-photo-preview-btn"
          onClick={() => setModalOpen(true)}
          aria-label={displayUrl ? 'View profile photo' : 'View profile photo placeholder'}
          title="Click to enlarge"
        >
          {displayUrl ? (
            <img src={displayUrl} alt="Profile" />
          ) : (
            <i className="bi bi-person-fill" aria-hidden="true"></i>
          )}
        </button>

        <div className="profile-photo-actions">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="visually-hidden"
            onChange={handleFileChange}
            disabled={busy}
          />
          <button
            type="button"
            className="btn btn-sm btn-profile-add"
            onClick={handleChooseClick}
            disabled={busy}
          >
            <i className="bi bi-camera me-1"></i>
            {displayUrl && !preview ? 'Change photo' : 'Choose photo'}
          </button>

          {hasSavedPhoto && (
            <button
              type="button"
              className="btn btn-sm btn-profile-remove"
              onClick={handleRemove}
              disabled={busy}
            >
              <i className="bi bi-trash me-1"></i>
              {removing ? 'Removing...' : 'Remove photo'}
            </button>
          )}

          {selectedFile && (
            <div className="profile-photo-upload-actions">
              <button
                type="button"
                className="btn btn-sm btn-profile-save"
                onClick={handleUpload}
                disabled={busy}
              >
                {uploading ? 'Uploading...' : 'Upload photo'}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-profile-remove"
                onClick={handleCancelPreview}
                disabled={busy}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="profile-photo-error">{error}</p>}

      <ProfilePhotoModal
        open={modalOpen}
        imageUrl={displayUrl || null}
        username={user?.username}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}

export default ProfilePhotoUpload
