import mongoose from 'mongoose'
import '../config/env.js'
import { connectDB } from '../config/db.js'
import Post from '../models/Post.js'
import PostComment from '../models/PostComment.js'
import PostReaction, { REACTION_TYPES } from '../models/PostReaction.js'
import User from '../models/User.js'

const POST_MARKER = '[analytics-seed]'
const POST_COUNT = 10

const POST_ENGAGEMENT_PLAN = [
  { reactions: 1, comments: 0, reposts: 0 },
  { reactions: 2, comments: 1, reposts: 0 },
  { reactions: 3, comments: 2, reposts: 1 },
  { reactions: 4, comments: 2, reposts: 1 },
  { reactions: 5, comments: 3, reposts: 2 },
  { reactions: 6, comments: 4, reposts: 2 },
  { reactions: 7, comments: 5, reposts: 3 },
  { reactions: 8, comments: 6, reposts: 3 },
  { reactions: 9, comments: 7, reposts: 4 },
  { reactions: 10, comments: 8, reposts: 5 },
]

const POST_TOPICS = [
  'Exploring system design patterns and how they apply to real-world backend services.',
  'Sharing notes from a campus hackathon — teamwork and debugging under pressure matter most.',
  'Learning React and Node together has been the best way to understand full-stack development.',
  'Open to connecting with peers interested in DSA, internships, and open-source contributions.',
  'Reflecting on my first technical interview prep cycle — consistency beats cramming.',
  'Built a small MERN side project this month. Deployment taught me more than the code itself.',
  'Grateful for mentors who review my resume and give honest feedback on projects.',
  'Trying to balance coursework with upskilling in cloud and databases this semester.',
  'Attended a virtual tech talk on AI in hiring — fascinating to see how matching models work.',
  'Looking forward to collaborating on Ascendra with students and recruiters in the network.',
]

function pickReactionType(index) {
  return REACTION_TYPES[index % REACTION_TYPES.length]
}

function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(12, 0, 0, 0)
  return date
}

async function clearPreviousSeedPosts(authorId) {
  const legacyMarker = POST_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const seededPosts = await Post.find({
    author: authorId,
    $or: [{ content: { $in: POST_TOPICS } }, { content: { $regex: legacyMarker } }],
  }).select('_id')

  if (!seededPosts.length) return 0

  const postIds = seededPosts.map((post) => post._id)

  await Promise.all([
    PostReaction.deleteMany({ post: { $in: postIds } }),
    PostComment.deleteMany({ post: { $in: postIds } }),
    Post.deleteMany({ repostOf: { $in: postIds } }),
    Post.deleteMany({ _id: { $in: postIds } }),
  ])

  return seededPosts.length
}

async function seedUserPostsEngagement(usernameArg) {
  const username = (usernameArg || 'at1').toLowerCase()

  await connectDB()

  const author = await User.findOne({ username })
  if (!author) {
    throw new Error(`User "${username}" not found. Sign up first or check the username.`)
  }

  const engagers = await User.find({ username: { $ne: username } })
    .sort({ username: 1 })
    .select('_id username')

  const maxNeeded = POST_ENGAGEMENT_PLAN.reduce(
    (max, plan) => Math.max(max, plan.reactions + plan.comments + plan.reposts),
    0
  )

  if (engagers.length < maxNeeded) {
    throw new Error(
      `Need at least ${maxNeeded} other users for engagement. Run npm run seed and npm run seed:recruiters first.`
    )
  }

  const removed = await clearPreviousSeedPosts(author._id)
  if (removed > 0) {
    console.log(`Removed ${removed} previous analytics-seed posts for ${username}.`)
  }

  let engagerIndex = 0

  function nextEngager() {
    const user = engagers[engagerIndex % engagers.length]
    engagerIndex += 1
    return user
  }

  let totalReactions = 0
  let totalComments = 0
  let totalReposts = 0

  for (let i = 0; i < POST_COUNT; i += 1) {
    const plan = POST_ENGAGEMENT_PLAN[i]
    const createdAt = daysAgo(POST_COUNT - i)

    const post = await Post.create({
      author: author._id,
      content: POST_TOPICS[i],
      postType: 'standard',
      createdAt,
    })

    for (let r = 0; r < plan.reactions; r += 1) {
      const user = nextEngager()
      await PostReaction.create({
        post: post._id,
        user: user._id,
        type: pickReactionType(r),
        createdAt: new Date(createdAt.getTime() + (r + 1) * 3600000),
      })
      totalReactions += 1
    }

    for (let c = 0; c < plan.comments; c += 1) {
      const user = nextEngager()
      await PostComment.create({
        post: post._id,
        author: user._id,
        content: `Great insight — thanks for sharing post ${i + 1}!`,
        createdAt: new Date(createdAt.getTime() + (c + 1) * 7200000),
      })
      totalComments += 1
    }

    for (let rp = 0; rp < plan.reposts; rp += 1) {
      const user = nextEngager()
      await Post.create({
        author: user._id,
        content: '',
        repostOf: post._id,
        postType: 'standard',
        createdAt: new Date(createdAt.getTime() + (rp + 1) * 10800000),
      })
      totalReposts += 1
    }

    console.log(
      `Post ${i + 1}: ${plan.reactions} reactions, ${plan.comments} comments, ${plan.reposts} reposts`
    )
  }

  console.log(
    `Done! Created ${POST_COUNT} posts for ${username} with ${totalReactions} reactions, ${totalComments} comments, and ${totalReposts} reposts.`
  )
}

const usernameArg = process.argv[2]

seedUserPostsEngagement(usernameArg)
  .catch((error) => {
    console.error('Seed failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
