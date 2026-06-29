import ProfileSearchHistory from '../models/ProfileSearchHistory.js'
import User from '../models/User.js'

const MAX_HISTORY = 10

function mapHistoryEntries(entries) {
  return entries.map((entry) => entry.toPublicJSON(entry.targetUser))
}

export async function getProfileSearchHistory(userId) {
  const entries = await ProfileSearchHistory.find({ user: userId })
    .sort({ visitedAt: -1 })
    .limit(MAX_HISTORY)
    .populate('targetUser')

  return mapHistoryEntries(entries)
}

async function trimHistory(userId) {
  const entries = await ProfileSearchHistory.find({ user: userId })
    .sort({ visitedAt: -1 })
    .select('_id')

  if (entries.length <= MAX_HISTORY) return

  const excessIds = entries.slice(MAX_HISTORY).map((entry) => entry._id)
  await ProfileSearchHistory.deleteMany({ _id: { $in: excessIds } })
}

export async function addProfileSearchHistory(userId, username) {
  const targetUser = await User.findOne({ username: username.toLowerCase() })

  if (!targetUser) {
    return { error: { status: 404, message: 'User not found' } }
  }

  if (targetUser._id.toString() === userId.toString()) {
    return { error: { status: 400, message: 'You cannot add your own profile to search history' } }
  }

  await ProfileSearchHistory.findOneAndUpdate(
    { user: userId, targetUser: targetUser._id },
    { $set: { visitedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  await trimHistory(userId)

  return { history: await getProfileSearchHistory(userId) }
}

export async function removeProfileSearchHistoryEntry(userId, username) {
  const targetUser = await User.findOne({ username: username.toLowerCase() })

  if (!targetUser) {
    return { error: { status: 404, message: 'User not found' } }
  }

  await ProfileSearchHistory.deleteOne({
    user: userId,
    targetUser: targetUser._id,
  })

  return { history: await getProfileSearchHistory(userId) }
}

export async function clearProfileSearchHistory(userId) {
  await ProfileSearchHistory.deleteMany({ user: userId })
  return { history: [] }
}
