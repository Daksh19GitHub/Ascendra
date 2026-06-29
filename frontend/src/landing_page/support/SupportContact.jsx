import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { newToAscendraSteps } from './supportData'
import { fadeInUp, viewportOnce } from '../home/motionVariants'

function SupportContact() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="col-lg-5 support-contact-col"
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeInUp}
    >
      <div className="contact-box">
        <h3>Still need help?</h3>
        <p>
          Our support team typically responds within 24–48 hours.
          We&apos;d love to hear from you.
        </p>
        <a href="mailto:support@ascendra.com">
          <i className="bi bi-envelope-fill me-2"></i>
          support@ascendra.com
        </a>
      </div>

      <div className="page-card support-new-card mt-4">
        <h3>New to Ascendra?</h3>
        <p className="support-new-intro">
          Visit our About page to learn what Ascendra is, or follow these steps
          to get started on your ascent.
        </p>

        <ul className="support-new-steps">
          {newToAscendraSteps.map((step) => (
            <li key={step.title}>
              <span className="support-step-icon" aria-hidden="true">
                <i className={`bi ${step.icon}`}></i>
              </span>
              <div>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="support-new-actions">
          <Link to="/about" className="btn btn-ascendra-outline">
            Learn about Ascendra
          </Link>
          <Link to="/signup" className="btn btn-ascendra-primary">
            Get started free
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default SupportContact
