import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  fadeInUp,
  staggerContainer,
  viewportOnce,
} from './motionVariants'

function Cta() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      className="cta-section text-center"
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer(0.12)}
    >
      <div className="container">
        <motion.h2 variants={fadeInUp}>Ready to start your ascent?</motion.h2>
        <motion.p className="mb-0" variants={fadeInUp}>
          Join Ascendra today and connect with professionals who share your
          ambitions.
        </motion.p>
        <motion.div
          className="d-flex flex-wrap gap-3 justify-content-center mt-2"
          variants={fadeInUp}
        >
          <motion.div whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}>
            <Link to="/signup" className="btn btn-ascendra-light btn-lg">
              Create Free Account
            </Link>
          </motion.div>
          <motion.div whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}>
            <Link
              to="/login"
              className="btn btn-outline-light btn-lg"
              style={{ borderRadius: '10px', fontWeight: 600 }}
            >
              Log in
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default Cta
