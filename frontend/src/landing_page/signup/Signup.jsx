import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import '../styles/auth.css'

function Signup() {
  const navigate = useNavigate()
  const { signup, isAuthenticated } = useAuth()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await signup(form)
      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Signup failed. Please try again.'
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

        <h1>Create your account</h1>
        <p className="auth-subtitle">Join Ascendra and start growing your network</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              placeholder="johndoe"
              value={form.username}
              onChange={handleChange}
              required
              disabled={submitting}
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
              autoComplete="username"
            />
          </div>

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
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              disabled={submitting}
              minLength={6}
              autoComplete="new-password"
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
                Signing up...
              </>
            ) : (
              'Sign up'
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Signup
