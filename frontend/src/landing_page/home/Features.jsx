import { motion, useReducedMotion } from 'framer-motion'
import {
  fadeInUp,
  staggerContainer,
  viewportOnce,
} from './motionVariants'

const features = [
  {
    icon: 'bi-people-fill',
    variant: 'indigo',
    title: 'Meaningful Connections',
    description:
      'Send connection requests and build a trusted professional network — only connect with people who matter to you.',
  },
  {
    icon: 'bi-newspaper',
    variant: 'teal',
    title: 'Share Your Story',
    description:
      'Create, edit, and share posts. Like, comment, and engage with content from your network in real time.',
  },
  {
    icon: 'bi-robot',
    variant: 'indigo',
    title: 'AI-Powered Posts',
    description:
      'Stuck on what to write? Let Gemini AI draft professional posts for you — edit and publish in seconds.',
  },
  {
    icon: 'bi-graph-up',
    variant: 'teal',
    title: 'Personalized Feed',
    description:
      'Your feed adapts to your connections, trending topics, and skills — so you always see what\'s relevant.',
  },
  {
    icon: 'bi-search',
    variant: 'indigo',
    title: 'Discover & Search',
    description:
      'Find professionals and posts by skills, interests, or keywords. Grow your network with purpose.',
  },
  {
    icon: 'bi-bar-chart-line-fill',
    variant: 'teal',
    title: 'Analytics Dashboard',
    description:
      'Track profile views, post impressions, engagement, and follower growth — all in one place.',
  },
]

function Features() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="features-section" id="features">
      <div className="container text-center">
        <motion.div
          initial={prefersReducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.1)}
        >
          <motion.p className="section-label mb-0" variants={fadeInUp}>
            Features
          </motion.p>
          <motion.h2 className="section-title" variants={fadeInUp}>
            Everything you need to ascend
          </motion.h2>
          <motion.p className="section-subtitle" variants={fadeInUp}>
            Ascendra brings together networking, content, and AI in one
            professional platform built for growth.
          </motion.p>
        </motion.div>

        <motion.div
          className="row g-4 text-start"
          initial={prefersReducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.1, 0.15)}
        >
          {features.map((feature) => (
            <motion.div
              className="col-md-6 col-lg-4"
              key={feature.title}
              variants={fadeInUp}
            >
              <motion.div
                className="feature-card"
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : { y: -6, transition: { duration: 0.25 } }
                }
              >
                <div className={`feature-icon ${feature.variant}`}>
                  <i className={`bi ${feature.icon}`}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Features
