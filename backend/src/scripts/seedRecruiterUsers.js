import mongoose from 'mongoose'
import '../config/env.js'
import { connectDB } from '../config/db.js'
import Post from '../models/Post.js'
import User from '../models/User.js'
import { buildJobOpeningPost, buildRecruiterUser } from './recruiterSeedData.js'
import { getDefaultJobClosesAt, parseJobDateInput, formatJobDateInput } from '../utils/jobListing.js'

const START_NUM = 101
const END_NUM = 200

function buildUsernames() {
  return Array.from({ length: END_NUM - START_NUM + 1 }, (_, i) => `ad${START_NUM + i}`)
}

async function clearRecruiterDemoData() {
  const usernames = buildUsernames()
  const users = await User.find({ username: { $in: usernames } }).select('_id')

  if (!users.length) {
    return 0
  }

  const userIds = users.map((user) => user._id)
  await Post.deleteMany({ author: { $in: userIds } })
  await User.deleteMany({ _id: { $in: userIds } })

  return users.length
}

async function seedRecruiterUsers() {
  await connectDB()

  const removed = await clearRecruiterDemoData()
  if (removed > 0) {
    console.log(`Removed ${removed} existing ad${START_NUM}-ad${END_NUM} users and their posts.`)
  }

  let createdUsers = 0

  for (let num = START_NUM; num <= END_NUM; num += 1) {
    const userData = buildRecruiterUser(num)
    const { company, role, skills, eligibility, ...userFields } = userData

    const user = await User.create(userFields)
    const post = buildJobOpeningPost({ company, role, skills, eligibility }, num)

    const createdAt = new Date(Date.now() - (num - START_NUM + 1) * 43200000 - Math.random() * 86400000)
    const jobStartsAt = parseJobDateInput(formatJobDateInput(createdAt), 'start')
    const jobClosesAt = parseJobDateInput(formatJobDateInput(getDefaultJobClosesAt(createdAt)), 'end')

    await Post.create({
      author: user._id,
      content: post.content,
      postType: 'job',
      jobStatus: 'open',
      jobStartsAt,
      jobClosesAt,
      createdAt,
    })

    createdUsers += 1

    if (createdUsers % 20 === 0) {
      console.log(`Seeded ${createdUsers}/${END_NUM - START_NUM + 1} recruiter users...`)
    }
  }

  console.log(`Done! Created ${createdUsers} recruiter users (ad${START_NUM}-ad${END_NUM}) with job opening posts.`)
  console.log('Example login: ad101@gmail.com / ad101@ascendra')
}

seedRecruiterUsers()
  .catch((error) => {
    console.error('Recruiter seed failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
