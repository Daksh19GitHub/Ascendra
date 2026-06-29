import mongoose from 'mongoose'
import '../config/env.js'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'
import { buildDemoUser } from './demoSeedData.js'
import { buildRecruiterUser } from './recruiterSeedData.js'
import {
  buildRecruiterHeadline,
  buildStudentHeadline,
  parseDemoUserNumber,
} from '../utils/profileHeadline.js'

function buildHeadlineForUser(user) {
  const num = parseDemoUserNumber(user.username)
  if (!num || num < 1 || num > 200) {
    return null
  }

  if (num <= 100) {
    const userData = buildDemoUser(num - 1)
    return buildStudentHeadline(num - 1, {
      university: user.profile?.education?.[0]?.institution,
      persona: userData.persona,
      role: userData.role,
      company: userData.company,
    })
  }

  const userData = buildRecruiterUser(num)
  const company =
    user.profile?.workExperience?.[0]?.company ||
    userData.company

  return buildRecruiterHeadline(company)
}

async function backfillProfileHeadlines() {
  await connectDB()

  const users = await User.find({
    username: { $regex: /^ad([1-9]|[1-9]\d|1\d\d|200)$/i },
  }).select('username profile')

  let updated = 0

  for (const user of users) {
    const headline = buildHeadlineForUser(user)
    if (!headline) continue

    user.profile = {
      ...(user.profile?.toObject?.() ?? user.profile ?? {}),
      headline,
    }

    await user.save()
    updated += 1
  }

  console.log(`Updated headlines for ${updated} ad users (ad1-ad200).`)
}

backfillProfileHeadlines()
  .catch((error) => {
    console.error('Headline backfill failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
