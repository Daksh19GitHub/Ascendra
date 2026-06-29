import mongoose from 'mongoose'
import '../config/env.js'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'

async function updateDemoCredentials() {
  await connectDB()

  const demoUsers = await User.find({ isDemo: true }).sort({ username: 1 })
  let updated = 0

  for (const user of demoUsers) {
    if (!/^ad\d+$/.test(user.username)) {
      continue
    }

    user.email = `${user.username}@gmail.com`
    user.password = `${user.username}@ascendra`
    await user.save()
    updated += 1
  }

  console.log(`Updated credentials for ${updated} demo users.`)
  console.log('Example login: email ad1@gmail.com, password ad1@ascendra')
}

updateDemoCredentials()
  .catch((error) => {
    console.error('Update failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
