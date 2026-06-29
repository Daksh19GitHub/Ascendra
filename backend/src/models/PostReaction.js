import mongoose from 'mongoose'

export const REACTION_TYPES = ['like', 'love', 'clap', 'support']

const postReactionSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: REACTION_TYPES,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

postReactionSchema.index({ post: 1, user: 1 }, { unique: true })

const PostReaction = mongoose.model('PostReaction', postReactionSchema)

export default PostReaction
