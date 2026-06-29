import { motion, useReducedMotion } from 'framer-motion'
import {
  fadeInLeft,
  fadeInRight,
  fadeInUp,
  staggerContainer,
  viewportOnce,
} from './motionVariants'

const aboutPoints = [
  'Two-way connection requests — no noise, only meaningful relationships',
  'Post manually or use AI to craft professional content instantly',
  'Analytics to track your reach, engagement, and network growth',
  'Built for students, developers, creators, and professionals at every stage',
]

function About() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="about-section" id="about">
      <div className="container">
        <div className="row align-items-center g-5">
          <motion.div
            className="col-lg-5"
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeInLeft}
          >
            <p className="section-label mb-2">About Ascendra</p>
            <h2 className="section-title">
              Where professionals rise together
            </h2>
            <p className="text-muted">
              Ascendra is a modern professional network designed for people who
              want to grow — not just scroll. Build real connections, share
              meaningful content, and leverage AI to express your ideas with
              confidence.
            </p>
          </motion.div>

          <motion.div
            className="col-lg-7"
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeInRight}
          >
            <motion.div
              className="about-content"
              variants={staggerContainer(0.1, 0.2)}
              initial={prefersReducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={viewportOnce}
            >
              <motion.h3 className="h5 fw-bold mb-3" variants={fadeInUp}>
                Why Ascendra?
              </motion.h3>
              <motion.p className="text-muted mb-0" variants={fadeInUp}>
                Unlike traditional social platforms, Ascendra focuses on quality
                connections and skill-based discovery. Your feed is shaped by
                who you know, what&apos;s trending in your field, and the skills
                you care about.
              </motion.p>
              <motion.ul
                className="about-list"
                variants={staggerContainer(0.08)}
              >
                {aboutPoints.map((point) => (
                  <motion.li key={point} variants={fadeInUp}>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{point}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
