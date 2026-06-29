import mongoose from 'mongoose'
import Conversation from '../models/Conversation.js'
import { areFriends } from './friendship.js'

export function buildParticipantsKey(userAId, userBId) {
  return [userAId.toString(), userBId.toString()].sort().join(':')
}

export async function getOrCreateConversation(userAId, userBId) {
  const participantsKey = buildParticipantsKey(userAId, userBId)
  const participants = participantsKey
    .split(':')
    .map((id) => new mongoose.Types.ObjectId(id))

  let conversation = await Conversation.findOne({ participantsKey })

  if (!conversation) {
    conversation = await Conversation.create({
      participants,
      participantsKey,
    })
  }

  return conversation
}

export async function assertCanChat(userAId, userBId) {
  if (userAId.toString() === userBId.toString()) {
    return { error: { status: 400, message: 'You cannot chat with yourself' } }
  }

  const friends = await areFriends(userAId, userBId)

  if (!friends) {
    return { error: { status: 403, message: 'You can only chat with accepted friends' } }
  }

  return { ok: true }
}

export function getOtherParticipantId(conversation, currentUserId) {
  const currentId = currentUserId.toString()
  const other = conversation.participants.find((id) => id.toString() !== currentId)
  return other?.toString() || null
}
