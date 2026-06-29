import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchUserPosts, fetchUserProfile } from '../api/webAppApi'
import FriendProfileActions from '../components/FriendProfileActions'
import FeedPostCard from '../components/FeedPostCard'
import ProfileCompletionRing from '../components/ProfileCompletionRing'
import ProfilePhotoModal from '../components/ProfilePhotoModal'
import UserHeadline from '../components/UserHeadline'

function formatLocation(address) {
  if (!address) return ''
  return [address.city, address.state, address.country].filter(Boolean).join(', ')
}

function PublicProfile() {
  const { username } = useParams()
  const { user: authUser } = useAuth()
  const [profileUser, setProfileUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [error, setError] = useState('')
  const [postsError, setPostsError] = useState('')
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [showAllActivity, setShowAllActivity] = useState(false)

  const targetUsername = username || authUser?.username

  useEffect(() => {
    setShowAllActivity(false)
  }, [targetUsername])

  useEffect(() => {
    if (!targetUsername) {
      setLoading(false)
      setPostsLoading(false)
      setError('Unable to load profile.')
      return
    }

    setLoading(true)
    setPostsLoading(true)
    setError('')
    setPostsError('')

    fetchUserProfile(targetUsername)
      .then((response) => {
        setProfileUser(response.data.user)
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Profile not found.')
      })
      .finally(() => {
        setLoading(false)
      })

    fetchUserPosts(targetUsername)
      .then((response) => {
        setPosts(response.data.posts || [])
      })
      .catch(() => {
        setPostsError('Unable to load activity.')
      })
      .finally(() => {
        setPostsLoading(false)
      })
  }, [targetUsername])

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
          <span className="visually-hidden">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error || !profileUser) {
    return (
      <div className="container webapp-page-content">
        <div className="profile-alert profile-alert-error">{error || 'Profile not found.'}</div>
        <Link to="/app" className="btn btn-sm btn-profile-add">
          Back to Home
        </Link>
      </div>
    )
  }

  const profile = profileUser.profile || {}
  const photoUrl = profile.profilePhoto?.url
  const location = formatLocation(profile.address)
  const isOwner = profileUser.isOwner
  const visiblePosts =
    isOwner || showAllActivity ? posts : posts.slice(0, 1)
  const hasHiddenPosts = !isOwner && posts.length > 1 && !showAllActivity

  return (
    <div className="container webapp-page-content public-profile-page">
      <section className="public-profile-hero">
        <div className="public-profile-hero-main">
          <button
            type="button"
            className="public-profile-avatar-btn"
            onClick={() => setPhotoModalOpen(true)}
            aria-label="View profile photo"
          >
            {photoUrl ? (
              <img src={photoUrl} alt="" className="public-profile-avatar" />
            ) : (
              <span className="public-profile-avatar-placeholder">
                <i className="bi bi-person-fill"></i>
              </span>
            )}
          </button>

          <div className="public-profile-identity">
            <h1>{profile.fullName || profileUser.username}</h1>
            <UserHeadline headline={profile.headline} className="public-profile-headline" />
            <p className="public-profile-handle">@{profileUser.username}</p>
            {location && (
              <p className="public-profile-location">
                <i className="bi bi-geo-alt me-1"></i>
                {location}
              </p>
            )}
            {isOwner && profileUser.email && (
              <p className="public-profile-email">
                <i className="bi bi-envelope me-1"></i>
                {profileUser.email}
              </p>
            )}
            {isOwner && (
              <div className="public-profile-owner-actions">
                <Link to="/app/profile/edit" className="btn btn-sm btn-profile-save">
                  <i className="bi bi-pencil me-1"></i>
                  Edit my profile
                </Link>
                <Link to="/app/friends" className="btn btn-sm btn-profile-add">
                  <i className="bi bi-people me-1"></i>
                  My friends
                  {profileUser.friendship?.friendsCount > 0 && (
                    <span className="profile-link-badge">{profileUser.friendship.friendsCount}</span>
                  )}
                </Link>
                <Link to="/app/friends/requests" className="btn btn-sm btn-profile-add">
                  <i className="bi bi-person-plus me-1"></i>
                  Pending requests
                  {profileUser.friendship?.pendingIncomingCount > 0 && (
                    <span className="profile-link-badge profile-link-badge-alert">
                      {profileUser.friendship.pendingIncomingCount}
                    </span>
                  )}
                </Link>
              </div>
            )}
            {!isOwner && (
              <FriendProfileActions
                username={profileUser.username}
                friendship={profileUser.friendship}
                onFriendshipChange={(nextFriendship) =>
                  setProfileUser((prev) => ({
                    ...prev,
                    friendship: { ...prev.friendship, ...nextFriendship },
                  }))
                }
              />
            )}
          </div>
        </div>

        <aside className="public-profile-strength">
          <ProfileCompletionRing percentage={profileUser.profileCompletion ?? 0} />
          <p className="webapp-muted mb-0">Profile strength</p>
        </aside>
      </section>

      {profile.skills?.length > 0 && (
        <section className="public-profile-section">
          <h2>Skills</h2>
          <div className="public-profile-skills">
            {profile.skills.map((skill) => (
              <span key={skill} className="public-profile-skill">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {profile.workExperience?.length > 0 && (
        <section className="public-profile-section">
          <h2>Work experience</h2>
          <div className="public-profile-timeline">
            {profile.workExperience.map((entry, index) => (
              <article key={`${entry.company}-${index}`} className="public-profile-timeline-item">
                <h3>{entry.title || 'Role'}</h3>
                <p className="public-profile-timeline-org">{entry.company}</p>
                <p className="public-profile-timeline-date">
                  {entry.startDate}
                  {entry.current ? ' — Present' : entry.endDate ? ` — ${entry.endDate}` : ''}
                </p>
                {entry.description && <p className="public-profile-timeline-desc">{entry.description}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {profile.education?.length > 0 && (
        <section className="public-profile-section">
          <h2>Education</h2>
          <div className="public-profile-timeline">
            {profile.education.map((entry, index) => (
              <article key={`${entry.institution}-${index}`} className="public-profile-timeline-item">
                <h3>{entry.institution}</h3>
                <p className="public-profile-timeline-org">
                  {[entry.degree, entry.field].filter(Boolean).join(' · ')}
                </p>
                <p className="public-profile-timeline-date">
                  {entry.startYear}
                  {entry.endYear ? ` — ${entry.endYear}` : ''}
                </p>
                {entry.description && <p className="public-profile-timeline-desc">{entry.description}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {profile.achievements?.length > 0 && (
        <section className="public-profile-section">
          <h2>Achievements</h2>
          <div className="public-profile-timeline">
            {profile.achievements.map((entry, index) => (
              <article key={`${entry.title}-${index}`} className="public-profile-timeline-item">
                <h3>{entry.title}</h3>
                {entry.year && <p className="public-profile-timeline-date">{entry.year}</p>}
                {entry.description && <p className="public-profile-timeline-desc">{entry.description}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {profile.address &&
        (profile.address.street || profile.address.postalCode) && (
          <section className="public-profile-section">
            <h2>Contact & location</h2>
            <div className="public-profile-info-grid">
              {profile.address.street && (
                <div>
                  <span className="public-profile-label">Address</span>
                  <p>{profile.address.street}</p>
                </div>
              )}
              {profile.address.postalCode && (
                <div>
                  <span className="public-profile-label">Postal code</span>
                  <p>{profile.address.postalCode}</p>
                </div>
              )}
            </div>
          </section>
        )}

      <section className="public-profile-section public-profile-activity">
        <div className="public-profile-activity-header">
          <div>
            <h2>Activity</h2>
            <p className="webapp-muted mb-0">
              {posts.length > 0
                ? `${posts.length} post${posts.length === 1 ? '' : 's'}`
                : 'Posts shared on Ascendra'}
            </p>
          </div>
        </div>

        {postsError && <div className="profile-alert profile-alert-error">{postsError}</div>}

        {postsLoading && (
          <div className="public-profile-activity-loading text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading activity...</span>
            </div>
          </div>
        )}

        {!postsLoading && !postsError && posts.length === 0 && (
          <div className="webapp-empty-state public-profile-activity-empty">
            <i className="bi bi-chat-square-text"></i>
            <p>No posts yet.</p>
            {isOwner && (
              <Link to="/app/posts" className="btn btn-sm btn-profile-add">
                Write your first post
              </Link>
            )}
          </div>
        )}

        {!postsLoading && !postsError && posts.length > 0 && (
          <>
            <div className="feed-post-list public-profile-activity-list">
              {visiblePosts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  hideAuthor
                  isOwnPost={isOwner}
                  onEngagementChange={handleEngagementChange}
                />
              ))}
            </div>

            {hasHiddenPosts && (
              <button
                type="button"
                className="public-profile-activity-show-all"
                onClick={() => setShowAllActivity(true)}
              >
                Show all ({posts.length} posts)
              </button>
            )}

            {!isOwner && showAllActivity && posts.length > 1 && (
              <button
                type="button"
                className="public-profile-activity-show-all"
                onClick={() => setShowAllActivity(false)}
              >
                Show less
              </button>
            )}
          </>
        )}
      </section>

      <ProfilePhotoModal
        open={photoModalOpen}
        imageUrl={photoUrl || null}
        username={profileUser.username}
        onClose={() => setPhotoModalOpen(false)}
      />
    </div>
  )
}

export default PublicProfile
