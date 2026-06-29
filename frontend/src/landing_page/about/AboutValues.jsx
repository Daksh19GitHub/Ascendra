import { motion, useReducedMotion } from 'framer-motion'
import { aboutValues } from './aboutData'
import {
  fadeInUp,
  staggerContainer,
  viewportOnce,
} from '../home/motionVariants'

function AboutValues() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="row g-4 mb-5"
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer(0.1)}
    >
      {aboutValues.map((item) => (
        <motion.div className="col-md-6 col-lg-3" key={item.title} variants={fadeInUp}>
          <div className="page-card">
            <div className={`card-icon ${item.variant}`}>
              <i className={`bi ${item.icon}`}></i>
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default AboutValues
