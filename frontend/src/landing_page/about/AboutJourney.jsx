import { motion, useReducedMotion } from 'framer-motion'
import { aboutMilestones } from './aboutData'
import {
  fadeInUp,
  staggerContainer,
  viewportOnce,
} from '../home/motionVariants'

function AboutJourney() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer(0.12)}
    >
      <h2 className="section-title mb-4">Our journey</h2>
      <ul className="about-timeline">
        {aboutMilestones.map((item) => (
          <motion.li key={item.year} variants={fadeInUp}>
            <span className="year">{item.year}</span>
            <div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}

export default AboutJourney
