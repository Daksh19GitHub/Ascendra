import { useEffect, useState } from 'react'
import {
  acceptFriendRequest,
  cancelFriendRequest,
  fetchPendingFriendRequests,
  fetchSentFriendRequests,
  rejectFriendRequest,
} from '../api/webAppApi'
import FriendCard from '../components/FriendCard'
import FriendsTabs from '../components/FriendsTabs'

function formatRequestDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function FriendRequests() {
  const [incoming, setIncoming] = useState([])
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function loadRequests() {
    setError('')
    try {
      const [incomingResponse, sentResponse] = await Promise.all([
        fetchPendingFriendRequests(),
        fetchSentFriendRequests(),
      ])
      setIncoming(incomingResponse.data.requests || [])
      setSent(sentResponse.data.requests || [])
    } catch {
      setError('Unable to load friend requests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function handleAccept(requestId) {
    setBusyId(requestId)
    setError('')
    setSuccess('')

    try {
      await acceptFriendRequest(requestId)
      setSuccess('Friend request accepted.')
      await loadRequests()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(requestId) {
    setBusyId(requestId)
    setError('')
    setSuccess('')

    try {
      await rejectFriendRequest(requestId)
      setSuccess('Friend request rejected.')
      await loadRequests()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleCancel(requestId) {
    setBusyId(requestId)
    setError('')
    setSuccess('')

    try {
      await cancelFriendRequest(requestId)
      setSuccess('Friend request cancelled.')
      await loadRequests()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel request.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="container webapp-page-content friends-page">
      <div className="friends-page-header">
        <p className="webapp-muted mb-0">Manage your connections and pending requests</p>
      </div>

      <FriendsTabs pendingTotal={incoming.length + sent.length} />

      {error && <div className="profile-alert profile-alert-error">{error}</div>}
      {success && <div className="profile-alert profile-alert-success">{success}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading requests...</span>
          </div>
        </div>
      ) : (
        <>
          <section className="friends-requests-section">
            <h2>Incoming requests ({incoming.length})</h2>
            {incoming.length === 0 ? (
              <p className="webapp-muted">No incoming friend requests right now.</p>
            ) : (
              <div className="friends-requests-scroll">
                <div className="friend-list">
                  {incoming.map((request) => (
                  <FriendCard
                    key={request.id}
                    user={request.user}
                    meta={`Requested ${formatRequestDate(request.requestedAt)}`}
                    actions={
                      <div className="friend-request-actions">
                        <button
                          type="button"
                          className="friend-request-btn friend-request-btn-accept"
                          disabled={busyId === request.id}
                          onClick={() => handleAccept(request.id)}
                        >
                          <i className="bi bi-check-lg" aria-hidden="true"></i>
                          {busyId === request.id ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          type="button"
                          className="friend-request-btn friend-request-btn-reject"
                          disabled={busyId === request.id}
                          onClick={() => handleReject(request.id)}
                        >
                          <i className="bi bi-x-lg" aria-hidden="true"></i>
                          Reject
                        </button>
                      </div>
                    }
                  />
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="friends-requests-section">
            <h2>Sent requests ({sent.length})</h2>
            {sent.length === 0 ? (
              <p className="webapp-muted">You haven&apos;t sent any pending requests.</p>
            ) : (
              <div className="friends-requests-scroll">
                <div className="friend-list">
                  {sent.map((request) => (
                  <FriendCard
                    key={request.id}
                    user={request.user}
                    meta={`Sent ${formatRequestDate(request.requestedAt)}`}
                    actions={
                      <button
                        type="button"
                        className="friend-request-btn friend-request-btn-reject"
                        disabled={busyId === request.id}
                        onClick={() => handleCancel(request.id)}
                      >
                        <i className="bi bi-x-lg" aria-hidden="true"></i>
                        {busyId === request.id ? 'Cancelling...' : 'Cancel request'}
                      </button>
                    }
                  />
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default FriendRequests
