import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import { getOrCreateConversation, assertCanChat } from '../utils/conversation.js'
import { mapUserToFriendJSON } from '../utils/friendship.js'

export async function sendChatMessage({ senderId, recipientUsername, content }) {
  const recipient = await User.findOne({
    username: recipientUsername.toLowerCase(),
  })

  if (!recipient) {
    return { error: { status: 404, message: 'User not found' } }
  }

  const access = await assertCanChat(senderId, recipient._id)

  if (access.error) {
    return access
  }

  const conversation = await getOrCreateConversation(senderId, recipient._id)
  const trimmedContent = content.trim()

  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    content: trimmedContent,
  })

  conversation.lastMessageText = trimmedContent
  conversation.lastMessageAt = message.createdAt
  await conversation.save()

  await message.populate('sender')

  const payload = {
    ...message.toPublicJSON(message.sender),
    isOwn: true,
    conversationId: conversation._id.toString(),
    recipientId: recipient._id.toString(),
  }

  return {
    message: payload,
    recipient,
    conversation,
  }
}

export async function getChatConversations(userId) {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .populate('participants')

  return conversations.map((conversation) => {
    const friend = conversation.participants.find(
      (participant) => participant._id.toString() !== userId.toString()
    )

    return {
      id: conversation._id,
      friend: friend ? mapUserToFriendJSON(friend) : null,
      lastMessageText: conversation.lastMessageText,
      lastMessageAt: conversation.lastMessageAt,
    }
  })
}

export async function getUnreadMessageCount(userId) {
  const conversations = await Conversation.find({ participants: userId }).select('_id')

  if (!conversations.length) {
    return 0
  }

  return Message.countDocuments({
    conversation: { $in: conversations.map((entry) => entry._id) },
    sender: { $ne: userId },
    readAt: null,
  })
}

export async function markMessagesAsSeen({ viewerId, friendUsername }) {
  const friend = await User.findOne({ username: friendUsername.toLowerCase() })

  if (!friend) {
    return { error: { status: 404, message: 'User not found' } }
  }

  const access = await assertCanChat(viewerId, friend._id)

  if (access.error) {
    return access
  }

  const conversation = await getOrCreateConversation(viewerId, friend._id)
  const unreadMessages = await Message.find({
    conversation: conversation._id,
    sender: friend._id,
    readAt: null,
  }).select('_id')

  if (!unreadMessages.length) {
    return {
      messageIds: [],
      readAt: null,
      notifyUserId: friend._id.toString(),
    }
  }

  const readAt = new Date()

  await Message.updateMany(
    { _id: { $in: unreadMessages.map((message) => message._id) } },
    { $set: { readAt } }
  )

  return {
    messageIds: unreadMessages.map((message) => message._id.toString()),
    readAt,
    notifyUserId: friend._id.toString(),
  }
}

export async function getChatMessages(userId, username) {
  const friend = await User.findOne({ username: username.toLowerCase() })

  if (!friend) {
    return { error: { status: 404, message: 'User not found' } }
  }

  const access = await assertCanChat(userId, friend._id)

  if (access.error) {
    return access
  }

  const conversation = await getOrCreateConversation(userId, friend._id)

  const messages = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .populate('sender')

  return {
    friend: mapUserToFriendJSON(friend),
    conversationId: conversation._id,
    messages: messages.map((message) => ({
      ...message.toPublicJSON(message.sender),
      isOwn: message.sender._id.toString() === userId.toString(),
    })),
  }
}
