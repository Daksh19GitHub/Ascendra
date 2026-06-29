import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length === 2
        },
        message: 'Conversation must have exactly two participants',
      },
    },
    participantsKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lastMessageText: {
      type: String,
      trim: true,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

const Conversation = mongoose.model('Conversation', conversationSchema)

export default Conversation
