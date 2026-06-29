import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { markMessagesAsSeen, sendChatMessage, getUnreadMessageCount } from '../services/chatService.js'

const onlineUsers = new Map()

export function initSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token

      if (!token) {
        return next(new Error('Authentication required'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)

      if (!user) {
        return next(new Error('User not found'))
      }

      socket.user = user
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString()
    socket.join(`user:${userId}`)

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set())
    }
    onlineUsers.get(userId).add(socket.id)

    io.emit('user_online', { userId })

    socket.on('send_message', async ({ username, content }, callback) => {
      try {
        if (!username || !content?.trim()) {
          callback?.({ success: false, message: 'Message content is required' })
          return
        }

        const result = await sendChatMessage({
          senderId: socket.user._id,
          recipientUsername: username,
          content,
        })

        if (result.error) {
          callback?.({ success: false, message: result.error.message })
          return
        }

        const outgoing = {
          ...result.message,
          isOwn: true,
          deliveryStatus: 'sent',
          readAt: null,
        }

        const incoming = {
          ...result.message,
          isOwn: false,
        }

        socket.emit('message_received', outgoing)
        io.to(`user:${result.recipient._id.toString()}`).emit('message_received', incoming)
        io.to(`user:${userId}`).emit('conversation_updated', {
          conversationId: result.conversation._id.toString(),
          friend: {
            id: result.recipient._id,
            username: result.recipient.username,
            fullName: result.recipient.profile?.fullName || result.recipient.username,
            headline: result.recipient.profile?.headline || '',
            profilePhoto: result.recipient.profile?.profilePhoto || { url: '', publicId: '' },
          },
          lastMessageText: result.conversation.lastMessageText,
          lastMessageAt: result.conversation.lastMessageAt,
        })
        io.to(`user:${result.recipient._id.toString()}`).emit('conversation_updated', {
          conversationId: result.conversation._id.toString(),
          friend: {
            id: socket.user._id,
            username: socket.user.username,
            fullName: socket.user.profile?.fullName || socket.user.username,
            headline: socket.user.profile?.headline || '',
            profilePhoto: socket.user.profile?.profilePhoto || { url: '', publicId: '' },
          },
          lastMessageText: result.conversation.lastMessageText,
          lastMessageAt: result.conversation.lastMessageAt,
        })

        const recipientUnreadCount = await getUnreadMessageCount(result.recipient._id)
        io.to(`user:${result.recipient._id.toString()}`).emit('chat_unread_updated', {
          count: recipientUnreadCount,
        })

        callback?.({ success: true, data: { message: outgoing } })
      } catch (error) {
        callback?.({ success: false, message: error.message || 'Failed to send message' })
      }
    })

    socket.on('mark_messages_seen', async ({ username }, callback) => {
      try {
        if (!username) {
          callback?.({ success: false, message: 'Username is required' })
          return
        }

        const result = await markMessagesAsSeen({
          viewerId: socket.user._id,
          friendUsername: username,
        })

        if (result.error) {
          callback?.({ success: false, message: result.error.message })
          return
        }

        if (result.messageIds.length) {
          io.to(`user:${result.notifyUserId}`).emit('messages_seen', {
            messageIds: result.messageIds,
            readAt: result.readAt,
          })
        }

        const viewerUnreadCount = await getUnreadMessageCount(socket.user._id)
        io.to(`user:${userId}`).emit('chat_unread_updated', {
          count: viewerUnreadCount,
        })

        callback?.({ success: true, data: { messageIds: result.messageIds } })
      } catch (error) {
        callback?.({ success: false, message: error.message || 'Failed to mark messages seen' })
      }
    })

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId)

      if (sockets) {
        sockets.delete(socket.id)

        if (sockets.size === 0) {
          onlineUsers.delete(userId)
          io.emit('user_offline', { userId })
        }
      }
    })
  })
}

export function getOnlineUserIds() {
  return [...onlineUsers.keys()]
}
