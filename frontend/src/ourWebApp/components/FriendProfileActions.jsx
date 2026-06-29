import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  acceptFriendRequest,
  cancelFriendRequest,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from '../api/webAppApi'

function FriendProfileActions({ username, friendship, onFriendshipChange }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!friendship || friendship.status === 'self') {
    return null
  }

  async function runAction(action) {
    setBusy(true)
    setError('')

    try {
      await action()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSendRequest() {
    await runAction(async () => {
      const response = await sendFriendRequest(username)
      onFriendshipChange?.(response.data.friendship)
    })
  }

  async function handleCancelRequest() {
    await runAction(async () => {
      await cancelFriendRequest(friendship.requestId)
      onFriendshipChange?.({ status: 'none', requestId: null })
    })
  }

  async function handleAcceptRequest() {
    await runAction(async () => {
      await acceptFriendRequest(friendship.requestId)
      onFriendshipChange?.({ status: 'friends', requestId: friendship.requestId })
    })
  }

  async function handleRejectRequest() {
    await runAction(async () => {
      await rejectFriendRequest(friendship.requestId)
      onFriendshipChange?.({ status: 'none', requestId: null })
    })
  }

  async function handleRemoveFriend() {
    const confirmed = window.confirm(`Remove ${username} from your friends?`)
    if (!confirmed) return

    await runAction(async () => {
      await removeFriend(username)
      onFriendshipChange?.({ status: 'none', requestId: null })
    })
  }

  return (
    <div className="friend-profile-actions">
      {error && <div className="profile-alert profile-alert-error">{error}</div>}

      {friendship.status === 'none' && (
        <button
          type="button"
          className="btn btn-sm btn-profile-save"
          disabled={busy}
          onClick={handleSendRequest}
        >
          <i className="bi bi-person-plus me-1"></i>
          {busy ? 'Sending...' : 'Add friend'}
        </button>
      )}

      {friendship.status === 'pending_sent' && (
        <button
          type="button"
          className="btn btn-sm btn-profile-remove"
          disabled={busy}
          onClick={handleCancelRequest}
        >
          <i className="bi bi-x-circle me-1"></i>
          {busy ? 'Cancelling...' : 'Cancel request'}
        </button>
      )}

      {friendship.status === 'friends' && (
        <>
          <span className="friend-status-badge">
            <i className="bi bi-people-fill me-1"></i>
            Friends
          </span>
          <button
            type="button"
            className="btn btn-sm btn-profile-remove"
            disabled={busy}
            onClick={handleRemoveFriend}
          >
            <i className="bi bi-person-dash me-1"></i>
            {busy ? 'Removing...' : 'Remove friend'}
          </button>
        </>
      )}

      {friendship.status === 'pending_received' && (
        <div className="friend-profile-request-actions">
          <div className="friend-request-actions">
            <button
              type="button"
              className="friend-request-btn friend-request-btn-accept"
              disabled={busy}
              onClick={handleAcceptRequest}
            >
              <i className="bi bi-check-lg" aria-hidden="true"></i>
              {busy ? 'Accepting...' : 'Accept'}
            </button>
            <button
              type="button"
              className="friend-request-btn friend-request-btn-reject"
              disabled={busy}
              onClick={handleRejectRequest}
            >
              <i className="bi bi-x-lg" aria-hidden="true"></i>
              Reject
            </button>
          </div>
          <Link to="/app/friends/requests" className="friend-profile-requests-link">
            View all requests
          </Link>
        </div>
      )}
    </div>
  )
}

export default FriendProfileActions
