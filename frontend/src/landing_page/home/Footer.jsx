import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  fadeInUp,
  staggerContainer,
  viewportOnce,
} from './motionVariants'

const footerColumns = [
  {
    title: 'Platform',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Features', to: '/#features' },
      { label: 'About', to: '/about' },
      { label: 'Sign up', to: '/signup' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Log in', to: '/login' },
      { label: 'Register', to: '/signup' },
      { label: 'Support', to: '/support' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'support@ascendra.com', href: 'mailto:support@ascendra.com' },
      { label: 'Help Center', href: '#' },
      { label: 'Report an Issue', href: '#' },
    ],
  },
]

function Footer() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.footer
      className="ascendra-footer"
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer(0.08)}
    >
      <div className="container">
        <div className="row g-4">
          <motion.div className="col-lg-4" variants={fadeInUp}>
            <div className="footer-brand">
              <span className="brand-icon" aria-hidden="true">
                <i className="bi bi-graph-up-arrow"></i>
              </span>
              Ascendra
            </div>
            <p className="footer-desc">
              A professional network for meaningful connections, smart content,
              and career growth — powered by community and AI.
            </p>
            <div className="social-links mt-3">
              {['twitter-x', 'linkedin', 'github', 'instagram'].map((icon) => (
                <motion.a
                  key={icon}
                  href="#"
                  aria-label={icon}
                  whileHover={
                    prefersReducedMotion ? undefined : { y: -3, scale: 1.08 }
                  }
                >
                  <i className={`bi bi-${icon}`}></i>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {footerColumns.map((col) => (
            <motion.div
              className="col-6 col-lg-2"
              key={col.title}
              variants={fadeInUp}
            >
              <h6>{col.title}</h6>
              {col.links.map((link) =>
                link.to ? (
                  <Link key={link.label} to={link.to}>
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                )
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-2"
          variants={fadeInUp}
        >
          <span>&copy; {new Date().getFullYear()} Ascendra. All rights reserved.</span>
          <span>Built with passion for professionals everywhere.</span>
        </motion.div>
      </div>
    </motion.footer>
  )
}

export default Footer
