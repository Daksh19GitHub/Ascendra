import { motion, useReducedMotion } from 'framer-motion'
import { helpTopics } from './supportData'
import {
  fadeInUp,
  staggerContainer,
  viewportOnce,
} from '../home/motionVariants'

function SupportTopics() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="row g-4 mb-5"
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer(0.1)}
    >
      {helpTopics.map((topic) => (
        <motion.div className="col-md-6 col-lg-3" key={topic.title} variants={fadeInUp}>
          <div className="page-card">
            <div className={`card-icon ${topic.variant}`}>
              <i className={`bi ${topic.icon}`}></i>
            </div>
            <h3>{topic.title}</h3>
            <p>{topic.description}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default SupportTopics
