import { param } from 'express-validator'

export const usernameParamValidation = [
  param('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Invalid username'),
]

export const requestIdParamValidation = [
  param('id').isMongoId().withMessage('Invalid request id'),
]
