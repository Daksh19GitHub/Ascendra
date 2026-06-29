import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NavbarAuthActions from '../../components/NavbarAuthActions'
import { usePendingFriendRequestsCount } from '../hooks/usePendingFriendRequestsCount'
import ChatNavLink from './ChatNavLink'
import NotificationPanel from './NotificationPanel'
import ProfileSearch from './ProfileSearch'

const appNavLinks = [
  { label: 'Home', to: '/app', icon: 'bi-house-fill', exact: true },
  { label: 'My Friends', to: '/app/friends', icon: 'bi-people-fill' },
  { label: 'Analytics', to: '/app/analytics', icon: 'bi-bar-chart-line-fill' },
]

function isLinkActive(link, currentPath) {
  if (link.exact) {
    return currentPath === link.to
  }
  if (link.to === '/app/friends') {
    return currentPath.startsWith('/app/friends')
  }
  return currentPath.startsWith(link.to)
}

function AppNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const pendingRequestsCount = usePendingFriendRequestsCount(location.pathname)

  const profileActive = location.pathname.startsWith('/app/profile')

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg webapp-navbar sticky-top">
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex align-items-center gap-2 gap-lg-3 webapp-nav-start">
          <Link className="webapp-brand-icon-link" to="/" aria-label="Ascendra home">
            <span className="brand-icon" aria-hidden="true">
              <i className="bi bi-graph-up-arrow"></i>
            </span>
          </Link>

          <ul className="navbar-nav flex-row gap-1 gap-lg-2">
            {appNavLinks.map((link) => (
              <li className="nav-item" key={link.to}>
                <Link
                  className={`nav-link webapp-nav-link${isLinkActive(link, location.pathname) ? ' active' : ''}`}
                  to={link.to}
                  aria-label={
                    link.to === '/app/friends' && pendingRequestsCount > 0
                      ? `${link.label}, ${pendingRequestsCount} pending requests`
                      : link.label
                  }
                >
                  <i className={`bi ${link.icon} me-lg-1`}></i>
                  <span className="d-none d-sm-inline">{link.label}</span>
                  {link.to === '/app/friends' && pendingRequestsCount > 0 && (
                    <span className="notification-badge">
                      {pendingRequestsCount > 99 ? '99+' : pendingRequestsCount}
                    </span>
                  )}
                </Link>
              </li>
            ))}
            <ChatNavLink />
            <NotificationPanel />
            <li className="nav-item webapp-nav-search-item">
              <ProfileSearch />
            </li>
          </ul>
        </div>

        <button
          className="navbar-toggler border-0 order-lg-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#webappNav"
          aria-controls="webappNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse order-lg-3 flex-grow-0" id="webappNav">
          <div className="webapp-navbar-tools ms-lg-auto d-flex flex-column flex-lg-row align-items-lg-center gap-lg-3 w-100 w-lg-auto mt-3 mt-lg-0">
            <ul className="navbar-nav align-items-lg-center gap-lg-2">
            {user && (
              <li className="nav-item">
                <NavbarAuthActions
                  user={user}
                  onLogout={handleLogout}
                  profilePath="/app/profile"
                  profileActive={profileActive}
                />
              </li>
            )}
          </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AppNavbar
