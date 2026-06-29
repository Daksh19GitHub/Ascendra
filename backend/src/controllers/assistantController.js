import { generateAssistantReply } from '../services/assistantService.js'

export async function chatWithAssistant(req, res, next) {
  try {
    const { messages } = req.body
    const reply = await generateAssistantReply(req.user, messages)

    res.json({
      success: true,
      data: { reply },
    })
  } catch (error) {
    if (error.code === 'GEMINI_NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        message: 'AI assistant is not configured. Add GEMINI_API_KEY to the server environment.',
      })
    }

    if (error.code === 'INVALID_MESSAGES') {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    const apiMessage = error?.message || ''

    if (apiMessage.includes('API key') || apiMessage.includes('API_KEY')) {
      return res.status(503).json({
        success: false,
        message: 'Invalid Gemini API key. Check GEMINI_API_KEY in backend/.env.',
      })
    }

    if (apiMessage.includes('429') || apiMessage.includes('quota') || apiMessage.includes('Quota exceeded')) {
      return res.status(429).json({
        success: false,
        message:
          'AI quota exceeded. Wait a few minutes, try again later, or switch GEMINI_MODEL in backend/.env.',
      })
    }

    if (
      apiMessage.includes('404') ||
      apiMessage.includes('not found') ||
      apiMessage.includes('503') ||
      apiMessage.includes('high demand') ||
      apiMessage.includes('overloaded') ||
      apiMessage.includes('UNAVAILABLE')
    ) {
      return res.status(503).json({
        success: false,
        message: 'AI is busy or temporarily unavailable. Please wait a moment and try again.',
      })
    }

    next(error)
  }
}
