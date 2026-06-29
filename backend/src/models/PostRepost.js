import mongoose from 'mongoose'

const postRepostSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
)

postRepostSchema.index({ post: 1, user: 1 }, { unique: true })

const PostRepost = mongoose.model('PostRepost', postRepostSchema)

export default PostRepost
