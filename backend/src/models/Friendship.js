import mongoose from 'mongoose'

export const FRIENDSHIP_STATUSES = ['pending', 'accepted']

const friendshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: FRIENDSHIP_STATUSES,
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true })

const Friendship = mongoose.model('Friendship', friendshipSchema)

export default Friendship
