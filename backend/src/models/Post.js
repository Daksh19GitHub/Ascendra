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

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: [2000, 'Post cannot exceed 2000 characters'],
      default: '',
    },
    repostOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
      index: true,
    },
    mentions: {
      type: [mentionSchema],
      default: [],
    },
    postType: {
      type: String,
      enum: ['standard', 'job'],
      default: 'standard',
      index: true,
    },
    embedding: {
      type: [Number],
      select: false,
    },
    jobStatus: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
      index: true,
    },
    jobStartsAt: {
      type: Date,
      default: null,
      index: true,
    },
    jobClosesAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

postSchema.index(
  { author: 1, repostOf: 1 },
  {
    unique: true,
    partialFilterExpression: { repostOf: { $type: 'objectId' } },
  }
)

postSchema.pre('validate', function validateContent(next) {
  if (!this.repostOf && !this.content?.trim()) {
    this.invalidate('content', 'Post content is required')
  }
  next()
})

function mapAuthorJSON(author) {
  return author?.toFeedAuthorJSON
    ? author.toFeedAuthorJSON()
    : {
        id: author?._id || author?.id,
        username: author?.username,
        fullName: author?.profile?.fullName || author?.username,
        headline: author?.profile?.headline || '',
        profilePhoto: author?.profile?.profilePhoto || { url: '', publicId: '' },
      }
}

postSchema.methods.toPublicJSON = function toPublicJSON(authorDoc) {
  const author = authorDoc || this.author
  const isRepost = Boolean(this.repostOf)

  const payload = {
    id: this._id,
    content: this.content,
    postType: this.postType || 'standard',
    createdAt: this.createdAt,
    isRepost,
    ...(this.postType === 'job'
      ? {
          jobStatus: this.jobStatus || 'open',
          jobStartsAt: this.jobStartsAt || null,
          jobClosesAt: this.jobClosesAt || null,
        }
      : {}),
    mentions: (this.mentions || []).map((mention) => ({
      userId: mention.user?.toString?.() || mention.user,
      username: mention.username,
    })),
    author: mapAuthorJSON(author),
  }

  if (isRepost && this.repostOf && typeof this.repostOf === 'object' && this.repostOf._id) {
    const original = this.repostOf
    payload.originalPost = {
      id: original._id,
      content: original.content,
      postType: original.postType || 'standard',
      createdAt: original.createdAt,
      ...(original.postType === 'job'
        ? {
            jobStatus: original.jobStatus || 'open',
            jobStartsAt: original.jobStartsAt || null,
            jobClosesAt: original.jobClosesAt || null,
          }
        : {}),
      mentions: (original.mentions || []).map((mention) => ({
        userId: mention.user?.toString?.() || mention.user,
        username: mention.username,
      })),
      author: mapAuthorJSON(original.author),
    }
  }

  return payload
}

const Post = mongoose.model('Post', postSchema)

export default Post
