import mongoose from 'mongoose'

const profileSearchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    visitedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

profileSearchHistorySchema.index({ user: 1, targetUser: 1 }, { unique: true })

profileSearchHistorySchema.methods.toPublicJSON = function toPublicJSON(targetDoc) {
  const target = targetDoc || this.targetUser

  return {
    id: target?._id?.toString?.() || target?.id,
    username: target?.username,
    fullName: target?.profile?.fullName || target?.username,
    headline: target?.profile?.headline || '',
    profilePhoto: target?.profile?.profilePhoto || { url: '', publicId: '' },
    visitedAt: this.visitedAt,
  }
}

const ProfileSearchHistory = mongoose.model('ProfileSearchHistory', profileSearchHistorySchema)

export default ProfileSearchHistory
