import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import '../styles/auth.css'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const redirectTo = location.state?.from?.pathname || '/'
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await login(form)
      navigate(redirectTo)
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="auth-brand">
          <span className="brand-icon" aria-hidden="true">
            <i className="bi bi-graph-up-arrow"></i>
          </span>
          Ascendra
        </Link>

        <h1>Welcome back</h1>
        <p className="auth-subtitle">Log in to continue to Ascendra</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              disabled={submitting}
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={submitting}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit d-flex align-items-center justify-content-center"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Logging in...
              </>
            ) : (
              'Log in'
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Login
