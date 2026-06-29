import { getChatConversations, getChatMessages, getUnreadMessageCount } from '../services/chatService.js'

export async function listConversations(req, res, next) {
  try {
    const conversations = await getChatConversations(req.user._id)

    res.json({
      success: true,
      data: { conversations },
    })
  } catch (error) {
    next(error)
  }
}

export async function getChatUnreadCount(req, res, next) {
  try {
    const count = await getUnreadMessageCount(req.user._id)

    res.json({
      success: true,
      data: { count },
    })
  } catch (error) {
    next(error)
  }
}

export async function listMessagesWithFriend(req, res, next) {
  try {
    const result = await getChatMessages(req.user._id, req.params.username)

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      })
    }

    res.json({
      success: true,
      data: {
        friend: result.friend,
        conversationId: result.conversationId,
        messages: result.messages,
      },
    })
  } catch (error) {
    next(error)
  }
}
