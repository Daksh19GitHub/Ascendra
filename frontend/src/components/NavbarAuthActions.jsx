import { Link } from 'react-router-dom'
import './navbar-auth.css'

function NavbarAuthActions({
  user,
  onLogout,
  profilePath = '/app/profile',
  profileActive = false,
}) {
  if (!user) return null

  const photoUrl = user.profile?.profilePhoto?.url

  return (
    <div className="navbar-auth-actions">
      <Link
        to={profilePath}
        className={`navbar-auth-user${profileActive ? ' active' : ''}`}
        aria-label={`View @${user.username}'s profile`}
      >
        <span className="navbar-auth-avatar">
          {photoUrl ? (
            <img src={photoUrl} alt="" />
          ) : (
            <i className="bi bi-person-fill" aria-hidden="true"></i>
          )}
        </span>
        <span className="navbar-auth-username">@{user.username}</span>
      </Link>

      <span className="navbar-auth-divider" aria-hidden="true"></span>

      <button type="button" className="navbar-auth-logout" onClick={onLogout}>
        <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
        <span>Log out</span>
      </button>
    </div>
  )
}

export default NavbarAuthActions
