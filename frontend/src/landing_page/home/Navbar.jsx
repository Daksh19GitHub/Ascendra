import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import NavbarAuthActions from '../../components/NavbarAuthActions'
import { fadeInDown, staggerContainer } from './motionVariants'

const publicNavLinks = [
  { label: 'Home', to: '/', className: 'nav-link' },
  { label: 'Log in', to: '/login', className: 'nav-link' },
  { label: 'Sign up', to: '/signup', className: 'nav-link nav-link-signup' },
  { label: 'Support', to: '/support', className: 'nav-link' },
  { label: 'About', to: '/about', className: 'nav-link' },
]

const authedNavLinks = [
  { label: 'Home', to: '/', className: 'nav-link' },
  { label: 'Support', to: '/support', className: 'nav-link' },
  { label: 'About', to: '/about', className: 'nav-link' },
]

function isLinkActive(path, currentPath) {
  if (path === '/') {
    return currentPath === '/'
  }
  return currentPath === path
}

function Navbar() {
  const prefersReducedMotion = useReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout, loading } = useAuth()

  const navLinks = isAuthenticated ? authedNavLinks : publicNavLinks

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <motion.nav
      className="navbar navbar-expand-lg ascendra-navbar sticky-top"
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
      variants={fadeInDown}
    >
      <div className="container">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link className="navbar-brand" to="/">
            <span className="brand-icon" aria-hidden="true">
              <i className="bi bi-graph-up-arrow"></i>
            </span>
            Ascendra
          </Link>
        </motion.div>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#ascendraNav"
          aria-controls="ascendraNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="ascendraNav">
          <motion.ul
            className="navbar-nav align-items-lg-center gap-lg-1"
            variants={staggerContainer(0.08, 0.2)}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
          >
            {navLinks.map((link) => (
              <motion.li className="nav-item" key={link.label} variants={fadeInDown}>
                <Link
                  className={`${link.className}${isLinkActive(link.to, location.pathname) ? ' active' : ''}`}
                  to={link.to}
                >
                  {link.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          {!loading && isAuthenticated && user && (
            <motion.div
              className="ms-lg-auto mt-3 mt-lg-0"
              initial={prefersReducedMotion ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.25 }}
            >
              <NavbarAuthActions
                user={user}
                onLogout={handleLogout}
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
