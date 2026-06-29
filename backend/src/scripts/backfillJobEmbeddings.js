import mongoose from 'mongoose'
import '../config/env.js'
import { connectDB } from '../config/db.js'
import Post from '../models/Post.js'
import User from '../models/User.js'
import { buildRecruiterUsernamePattern } from '../constants/recruiters.js'
import {
  formatJobDateInput,
  getDefaultJobClosesAt,
  parseJobDateInput,
} from '../utils/jobListing.js'
import { buildJobPostFields } from '../utils/jobPostEmbedding.js'

async function backfillJobEmbeddings() {
  await connectDB()

  const recruiterUsers = await User.find({
    username: { $regex: buildRecruiterUsernamePattern() },
  }).select('_id')

  const recruiterIds = recruiterUsers.map((user) => user._id)

  const [typedJobPosts, legacyRecruiterPosts] = await Promise.all([
    Post.find({ postType: 'job', repostOf: null }).select(
      '+embedding content postType jobStatus jobStartsAt jobClosesAt createdAt'
    ),
    Post.find({
      author: { $in: recruiterIds },
      repostOf: null,
      postType: { $ne: 'job' },
    }).select('+embedding content postType jobStatus jobStartsAt jobClosesAt createdAt'),
  ])

  const jobPosts = [...typedJobPosts]

  for (const post of legacyRecruiterPosts) {
    if (!jobPosts.some((entry) => entry._id.equals(post._id))) {
      jobPosts.push(post)
    }
  }

  let updated = 0

  for (const post of jobPosts) {
    const createdAt = post.createdAt ? new Date(post.createdAt) : new Date()
    const defaultStartsAt = parseJobDateInput(formatJobDateInput(createdAt), 'start')
    const defaultClosesAt = parseJobDateInput(
      formatJobDateInput(getDefaultJobClosesAt(createdAt)),
      'end'
    )

    const jobFields = await buildJobPostFields({
      content: post.content,
      postType: 'job',
      jobStatus: 'open',
      jobStartsAt: formatJobDateInput(post.jobStartsAt || defaultStartsAt),
      jobClosesAt: formatJobDateInput(post.jobClosesAt || defaultClosesAt),
      existingPost: post,
    })

    const updates = {
      postType: 'job',
      jobStatus: 'open',
      jobStartsAt: jobFields.jobStartsAt,
      jobClosesAt: jobFields.jobClosesAt,
    }

    if (!post.embedding?.length) {
      updates.embedding = jobFields.embedding
    }

    const needsUpdate =
      post.postType !== 'job' ||
      post.jobStatus !== 'open' ||
      !post.jobStartsAt ||
      !post.jobClosesAt ||
      !post.embedding?.length

    if (needsUpdate) {
      await Post.updateOne({ _id: post._id }, updates)
      updated += 1
    }
  }

  console.log(`Updated ${updated}/${jobPosts.length} job posts with dates, status, and embeddings.`)
}

backfillJobEmbeddings()
  .catch((error) => {
    console.error('Job embedding backfill failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
