import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['mention', 'friend_post', 'friend_reaction', 'friend_comment', 'friend_repost'],
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PostComment',
      default: null,
    },
    preview: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
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

notificationSchema.index({ recipient: 1, createdAt: -1 })

function mapActorJSON(actor) {
  return actor?.toFeedAuthorJSON
    ? actor.toFeedAuthorJSON()
    : {
        id: actor?._id || actor?.id,
        username: actor?.username,
        fullName: actor?.profile?.fullName || actor?.username,
        headline: actor?.profile?.headline || '',
        profilePhoto: actor?.profile?.profilePhoto || { url: '', publicId: '' },
      }
}

notificationSchema.methods.toPublicJSON = function toPublicJSON(actorDoc) {
  const actor = actorDoc || this.actor

  return {
    id: this._id,
    type: this.type,
    preview: this.preview,
    postId: this.post?.toString?.() || this.post,
    commentId: this.comment?.toString?.() || this.comment || null,
    readAt: this.readAt || null,
    createdAt: this.createdAt,
    actor: mapActorJSON(actor),
  }
}

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
