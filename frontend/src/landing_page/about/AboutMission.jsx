import { motion, useReducedMotion } from 'framer-motion'
import { fadeInUp, viewportOnce } from '../home/motionVariants'

function AboutMission() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeInUp}
    >
      <h2 className="section-title mb-3">Our mission</h2>
      <p className="text-muted mb-4">
        Traditional social platforms optimize for engagement at any cost.
        Ascendra optimizes for growth — helping students, developers,
        creators, and professionals find the right people, share the right
        content, and track real progress.
      </p>
      <p className="text-muted mb-0">
        Whether you post manually or use AI to draft your next update,
        Ascendra is built to make your professional journey clearer,
        more connected, and more intentional.
      </p>
    </motion.div>
  )
}

export default AboutMission
