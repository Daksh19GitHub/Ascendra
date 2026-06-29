import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import HeroVisual3D from './HeroVisual3D'
import {
  fadeInUp,
  scaleIn,
  staggerContainer,
} from './motionVariants'

const stats = [
  { value: '10K+', label: 'Professionals' },
  { value: '50K+', label: 'Connections' },
  { value: 'AI', label: 'Powered Posts' },
]

function Hero() {
  const prefersReducedMotion = useReducedMotion()
  const { isAuthenticated } = useAuth()
  const primaryCtaTo = isAuthenticated ? '/app' : '/signup'
  const primaryCtaLabel = isAuthenticated ? 'Open Ascendra' : 'Join Ascendra'

  return (
    <section className="hero-section" id="home">
      <div className="container">
        <div className="row align-items-center g-5">
          <motion.div
            className="col-lg-6"
            variants={staggerContainer(0.12, 0.15)}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
          >
            <motion.span className="hero-badge" variants={fadeInUp}>
              <i className="bi bi-stars"></i>
              Grow your professional network
            </motion.span>
            <motion.h1 variants={fadeInUp}>
              Rise together on{' '}
              <span className="highlight">Ascendra</span>
            </motion.h1>
            <motion.p className="hero-subtitle" variants={fadeInUp}>
              Connect with professionals, share your ideas, and discover a
              personalized feed powered by your skills and community. Post on
              your own or let AI help you shine.
            </motion.p>
            <motion.div
              className="d-flex flex-wrap gap-3 justify-content-lg-start justify-content-center"
              variants={fadeInUp}
            >
              <motion.div whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}>
                <Link
                  to={primaryCtaTo}
                  className="btn btn-ascendra-primary btn-lg"
                >
                  {primaryCtaLabel}
                </Link>
              </motion.div>
              <motion.div whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}>
                <Link to="/about" className="btn btn-ascendra-outline btn-lg">
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              className="row g-0 mt-5 pt-2"
              variants={staggerContainer(0.1, 0)}
            >
              {stats.map((stat) => (
                <motion.div
                  className="col-4 hero-stat"
                  key={stat.label}
                  variants={fadeInUp}
                >
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="col-lg-6"
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
            variants={scaleIn}
          >
            <div className="hero-visual">
              <HeroVisual3D />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
