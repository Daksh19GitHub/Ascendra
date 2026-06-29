import { body, param } from 'express-validator'
import { REACTION_TYPES } from '../models/PostReaction.js'

export const postIdParamValidation = [
  param('id').isMongoId().withMessage('Invalid post id'),
]

export const commentIdParamValidation = [
  param('commentId').isMongoId().withMessage('Invalid comment id'),
]

export const reactionValidation = [
  ...postIdParamValidation,
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Reaction type is required')
    .isIn(REACTION_TYPES)
    .withMessage(`Reaction must be one of: ${REACTION_TYPES.join(', ')}`),
]

export const commentValidation = [
  ...postIdParamValidation,
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  body('parentCommentId')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Invalid parent comment id'),
]

export const deleteCommentValidation = [...postIdParamValidation, ...commentIdParamValidation]
