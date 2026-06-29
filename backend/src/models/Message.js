import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    readAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

messageSchema.methods.toPublicJSON = function toPublicJSON(senderDoc) {
  const sender = senderDoc || this.sender

  return {
    id: this._id,
    content: this.content,
    createdAt: this.createdAt,
    readAt: this.readAt || null,
    deliveryStatus: this.readAt ? 'seen' : 'sent',
    sender: sender?.toFeedAuthorJSON
      ? sender.toFeedAuthorJSON()
      : {
          id: sender?._id || sender?.id,
          username: sender?.username,
          fullName: sender?.profile?.fullName || sender?.username,
          headline: sender?.profile?.headline || '',
          profilePhoto: sender?.profile?.profilePhoto || { url: '', publicId: '' },
        },
    isOwn: false,
  }
}

const Message = mongoose.model('Message', messageSchema)

export default Message
