import mongoose from 'mongoose'

const mentionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
)

const postCommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PostComment',
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    mentions: {
      type: [mentionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

postCommentSchema.methods.toPublicJSON = function toPublicJSON(authorDoc) {
  const author = authorDoc || this.author

  return {
    id: this._id,
    content: this.content,
    createdAt: this.createdAt,
    parentCommentId: this.parentComment?.toString?.() || this.parentComment || null,
    mentions: (this.mentions || []).map((mention) => ({
      userId: mention.user?.toString?.() || mention.user,
      username: mention.username,
    })),
    author: author?.toFeedAuthorJSON
      ? author.toFeedAuthorJSON()
      : {
          id: author?._id || author?.id,
          username: author?.username,
          fullName: author?.profile?.fullName || author?.username,
          headline: author?.profile?.headline || '',
          profilePhoto: author?.profile?.profilePhoto || { url: '', publicId: '' },
        },
  }
}

const PostComment = mongoose.model('PostComment', postCommentSchema)

export default PostComment
