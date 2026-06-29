import { body } from 'express-validator'

const postTypeValidation = body('postType')
  .optional()
  .isIn(['standard', 'job'])
  .withMessage('Post type must be standard or job')

const jobStatusValidation = body('jobStatus')
  .optional()
  .isIn(['open', 'closed'])
  .withMessage('Job status must be open or closed')

const jobDateValidation = body(['jobStartsAt', 'jobClosesAt'])
  .optional()
  .matches(/^\d{4}-\d{2}-\d{2}$/)
  .withMessage('Job dates must use YYYY-MM-DD format')

export const createPostValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ max: 2000 })
    .withMessage('Post cannot exceed 2000 characters'),
  postTypeValidation,
  jobDateValidation,
]

export const updatePostValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ max: 2000 })
    .withMessage('Post cannot exceed 2000 characters'),
  postTypeValidation,
  jobStatusValidation,
  jobDateValidation,
]
