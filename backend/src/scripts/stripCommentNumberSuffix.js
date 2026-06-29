import mongoose from 'mongoose'
import '../config/env.js'
import { connectDB } from '../config/db.js'
import PostComment from '../models/PostComment.js'

const COMMENT_SUFFIX_PATTERN = / \(comment \d+\)$/

async function stripCommentNumberSuffix() {
  await connectDB()

  const comments = await PostComment.find({ content: COMMENT_SUFFIX_PATTERN })
  let updated = 0

  for (const comment of comments) {
    comment.content = comment.content.replace(COMMENT_SUFFIX_PATTERN, '')
    await comment.save()
    updated += 1
  }

  console.log(`Removed comment number suffix from ${updated} comment(s).`)
}

stripCommentNumberSuffix()
  .catch((error) => {
    console.error('Failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
