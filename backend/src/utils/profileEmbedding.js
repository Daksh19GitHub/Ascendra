import crypto from 'crypto'
import User from '../models/User.js'
import { embedText } from '../services/embeddingService.js'
import { buildProfileMatchingText } from './profileText.js'

export function hashProfileMatchingText(text) {
  return crypto.createHash('sha256').update(text || '').digest('hex')
}

export async function getOrCreateProfileEmbedding(user) {
  const profileText = buildProfileMatchingText(user)
  const profileHash = hashProfileMatchingText(profileText)

  const existingUser = await User.findById(user._id).select('+profileEmbedding +profileEmbeddingHash')

  if (
    existingUser?.profileEmbeddingHash === profileHash &&
    existingUser.profileEmbedding?.length
  ) {
    return existingUser.profileEmbedding
  }

  const embedding = await embedText(profileText)

  await User.updateOne(
    { _id: user._id },
    {
      profileEmbedding: embedding,
      profileEmbeddingHash: profileHash,
    }
  )

  return embedding
}

export function clearProfileEmbedding(user) {
  user.profileEmbedding = []
  user.profileEmbeddingHash = ''
}
