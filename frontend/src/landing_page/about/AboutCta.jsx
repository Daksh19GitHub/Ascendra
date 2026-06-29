import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { fadeInUp, viewportOnce } from '../home/motionVariants'

function AboutCta() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="text-center mt-5 pt-3"
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeInUp}
    >
      <p className="text-muted mb-3">Ready to be part of the ascent?</p>
      <Link to="/signup" className="btn btn-ascendra-primary btn-lg">
        Join Ascendra
      </Link>
    </motion.div>
  )
}

export default AboutCta
