import mongoose from 'mongoose'
import '../config/env.js'
import { connectDB } from '../config/db.js'
import Post from '../models/Post.js'
import User from '../models/User.js'
import { buildDemoPosts, buildDemoUser } from './demoSeedData.js'

const DEMO_COUNT = 100

async function clearDemoData() {
  const demoUsers = await User.find({ isDemo: true }).select('_id')
  const demoIds = demoUsers.map((user) => user._id)

  if (demoIds.length > 0) {
    await Post.deleteMany({ author: { $in: demoIds } })
    await User.deleteMany({ _id: { $in: demoIds } })
  }

  return demoIds.length
}

async function seedDemoUsers() {
  await connectDB()

  const removed = await clearDemoData()
  if (removed > 0) {
    console.log(`Removed ${removed} existing demo users and their posts.`)
  }

  let totalPosts = 0

  for (let i = 0; i < DEMO_COUNT; i += 1) {
    const userData = buildDemoUser(i)
    const { persona, field, company, role, ...userFields } = userData

    const user = await User.create(userFields)
    const posts = buildDemoPosts({ persona, field, company, role }, i)

    await Post.insertMany(
      posts.map((post) => ({
        author: user._id,
        content: post.content,
        createdAt: new Date(Date.now() - (i + 1) * 86400000 - Math.random() * 86400000),
      }))
    )

    totalPosts += posts.length

    if ((i + 1) % 20 === 0) {
      console.log(`Seeded ${i + 1}/${DEMO_COUNT} demo users...`)
    }
  }

  console.log(`Done! Created ${DEMO_COUNT} demo users and ${totalPosts} posts.`)
  console.log('Demo login example: ad1@gmail.com / ad1@ascendra')
}

seedDemoUsers()
  .catch((error) => {
    console.error('Seed failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
