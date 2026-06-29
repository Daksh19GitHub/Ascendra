import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchFriends } from '../api/webAppApi'
import FriendCard from '../components/FriendCard'
import FriendsTabs from '../components/FriendsTabs'

function formatFriendDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function MyFriends() {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')

    fetchFriends()
      .then((response) => {
        setFriends(response.data.friends || [])
      })
      .catch(() => {
        setError('Unable to load your friends. Please try again.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div className="container webapp-page-content friends-page">
      <div className="friends-page-header">
        <p className="webapp-muted mb-0">People you&apos;re connected with on Ascendra</p>
      </div>

      <FriendsTabs />

      {error && <div className="profile-alert profile-alert-error">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading friends...</span>
          </div>
        </div>
      ) : friends.length === 0 ? (
        <div className="webapp-empty-state">
          <i className="bi bi-people"></i>
          <p>No friends yet.</p>
          <span className="webapp-muted">
            Visit profiles from Home and send friend requests to connect.
          </span>
          <Link to="/app" className="btn btn-sm btn-profile-add mt-3">
            Browse Home feed
          </Link>
        </div>
      ) : (
        <section className="friends-requests-section friends-list-section">
          <div className="friends-requests-scroll">
            <div className="friend-list">
              {friends.map((entry) => (
                <FriendCard
                  key={entry.id}
                  user={entry.user}
                  meta={`Friends since ${formatFriendDate(entry.friendsSince)}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default MyFriends
