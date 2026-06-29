import { Router } from 'express'
import { body } from 'express-validator'
import { getMe, login, register } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validate.js'
import { isAcceptedEmail, normalizeAcceptedEmail } from '../utils/emailValidation.js'

const router = Router()

const emailValidation = body('email')
  .trim()
  .custom((value) => {
    if (!isAcceptedEmail(value)) {
      throw new Error('Please provide a valid email')
    }
    return true
  })
  .customSanitizer(normalizeAcceptedEmail)

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  emailValidation,
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
]

const loginValidation = [emailValidation, body('password').notEmpty().withMessage('Password is required')]

router.post('/register', registerValidation, validate, register)
router.post('/login', loginValidation, validate, login)
router.get('/me', protect, getMe)

export default router
