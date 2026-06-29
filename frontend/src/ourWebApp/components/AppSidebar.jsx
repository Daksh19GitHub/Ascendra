import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const sidebarLinks = [
  { label: 'Jobs for You', to: '/app/jobs', icon: 'bi-briefcase-fill' },
  { label: 'My Posts', to: '/app/posts', icon: 'bi-newspaper' },
]

function isSidebarLinkActive(link, currentPath) {
  if (link.exact) {
    return currentPath === link.to
  }
  return currentPath.startsWith(link.to)
}

function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const photoUrl = user?.profile?.profilePhoto?.url || null
  const profileActive = location.pathname.startsWith('/app/profile')

  return (
    <aside className="webapp-sidebar" aria-label="Feed navigation">
      <Link
        to="/app/profile"
        className={`webapp-sidebar-profile${profileActive ? ' active' : ''}`}
        title="My profile"
      >
        <span className="webapp-sidebar-avatar">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="webapp-profile-avatar" />
          ) : (
            <i className="bi bi-person-circle" aria-hidden="true"></i>
          )}
        </span>
        {user?.username && (
          <span className="webapp-sidebar-username">@{user.username}</span>
        )}
      </Link>

      <nav className="webapp-sidebar-nav">
        {sidebarLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`webapp-sidebar-link${
              isSidebarLinkActive(link, location.pathname) ? ' active' : ''
            }`}
          >
            <i className={`bi ${link.icon}`} aria-hidden="true"></i>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default AppSidebar
