import { motion, useReducedMotion } from 'framer-motion'
import { supportFaqs } from './supportData'
import {
  fadeInUp,
  staggerContainer,
  viewportOnce,
} from '../home/motionVariants'

function SupportFaq() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="col-lg-7"
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer(0.08)}
    >
      <h2 className="section-title mb-4">Frequently asked questions</h2>
      {supportFaqs.map((faq) => (
        <motion.div className="faq-item" key={faq.question} variants={fadeInUp}>
          <h4>{faq.question}</h4>
          <p>{faq.answer}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default SupportFaq
