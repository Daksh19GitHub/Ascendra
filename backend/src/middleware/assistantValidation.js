import { body } from 'express-validator'

export const assistantChatValidation = [
  body('messages')
    .isArray({ min: 1, max: 30 })
    .withMessage('Messages must be an array with 1 to 30 entries'),
  body('messages.*.role')
    .isIn(['user', 'assistant'])
    .withMessage('Each message role must be user or assistant'),
  body('messages.*.content')
    .isString()
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('Each message must be between 1 and 4000 characters'),
]
