import mongoose from 'mongoose'
import '../config/env.js'
import { connectDB } from '../config/db.js'
import Post from '../models/Post.js'

const MARKER_PATTERN = /^\[analytics-seed\]\s*/

async function stripAnalyticsSeedMarker() {
  await connectDB()

  const posts = await Post.find({ content: MARKER_PATTERN })
  let updated = 0

  for (const post of posts) {
    post.content = post.content.replace(MARKER_PATTERN, '')
    await post.save()
    updated += 1
  }

  console.log(`Removed [analytics-seed] prefix from ${updated} post(s).`)
}

stripAnalyticsSeedMarker()
  .catch((error) => {
    console.error('Strip failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
