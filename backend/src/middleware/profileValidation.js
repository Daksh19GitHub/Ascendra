import { body } from 'express-validator'

export const updateProfileValidation = [
  body('fullName')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),
  body('headline')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 220 })
    .withMessage('Headline cannot exceed 220 characters'),
  body('address').optional().isObject().withMessage('Address must be an object'),
  body('address.street').optional().isString().trim().isLength({ max: 200 }),
  body('address.city').optional().isString().trim().isLength({ max: 100 }),
  body('address.state').optional().isString().trim().isLength({ max: 100 }),
  body('address.country').optional().isString().trim().isLength({ max: 100 }),
  body('address.postalCode').optional().isString().trim().isLength({ max: 20 }),
  body('education').optional().isArray({ max: 20 }),
  body('education.*.institution').optional().isString().trim().isLength({ max: 150 }),
  body('education.*.degree').optional().isString().trim().isLength({ max: 100 }),
  body('education.*.field').optional().isString().trim().isLength({ max: 100 }),
  body('skills').optional().isArray({ max: 50 }),
  body('skills.*').optional().isString().trim().isLength({ max: 50 }),
  body('achievements').optional().isArray({ max: 30 }),
  body('achievements.*.title').optional().isString().trim().isLength({ max: 150 }),
  body('workExperience').optional().isArray({ max: 30 }),
  body('workExperience.*.company').optional().isString().trim().isLength({ max: 150 }),
]
