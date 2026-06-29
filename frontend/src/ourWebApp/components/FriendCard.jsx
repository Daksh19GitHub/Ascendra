import { Link } from 'react-router-dom'
import UserHeadline from './UserHeadline'

function FriendCard({ user, meta, actions }) {
  const photoUrl = user?.profilePhoto?.url
  const profilePath = user?.username ? `/app/profile/${user.username}` : '/app/profile'

  return (
    <article className="friend-card">
      <Link to={profilePath} className="friend-card-main">
        <div className="friend-card-avatar">
          {photoUrl ? (
            <img src={photoUrl} alt="" />
          ) : (
            <i className="bi bi-person-fill" aria-hidden="true"></i>
          )}
        </div>
        <div>
          <h3>{user?.fullName || user?.username}</h3>
          <UserHeadline headline={user?.headline} className="friend-card-headline" />
          <p className="friend-card-meta">@{user?.username}</p>
          {meta && <p className="friend-card-date webapp-muted">{meta}</p>}
        </div>
      </Link>
      {actions && <div className="friend-card-actions">{actions}</div>}
    </article>
  )
}

export default FriendCard
