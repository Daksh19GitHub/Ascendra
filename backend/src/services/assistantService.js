import { GoogleGenerativeAI } from '@google/generative-ai'

const DEFAULT_MODEL = 'gemini-2.5-flash'

const FALLBACK_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
]

function isRetryableGeminiError(error) {
  const message = error?.message || ''
  const status = error?.status

  return (
    status === 404 ||
    status === 429 ||
    status === 503 ||
    message.includes('404') ||
    message.includes('429') ||
    message.includes('503') ||
    message.includes('not found') ||
    message.includes('quota') ||
    message.includes('Quota exceeded') ||
    message.includes('high demand') ||
    message.includes('overloaded') ||
    message.includes('UNAVAILABLE')
  )
}

function getModelCandidates() {
  const preferred = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL
  return [...new Set([preferred, ...FALLBACK_MODELS])]
}

function buildProfileContext(user) {
  const profile = user.profile || {}
  const location = [profile.address?.city, profile.address?.state, profile.address?.country]
    .filter(Boolean)
    .join(', ')

  const education = (profile.education || [])
    .map((entry) => {
      const parts = [entry.degree, entry.field, entry.institution].filter(Boolean)
      const years = [entry.startYear, entry.endYear].filter(Boolean).join('–')
      const base = parts.join(' · ')
      if (!base) return ''
      return years ? `${base} (${years})` : base
    })
    .filter(Boolean)

  const work = (profile.workExperience || [])
    .map((entry) => {
      const dates = entry.current
        ? `${entry.startDate || ''} – Present`.trim()
        : [entry.startDate, entry.endDate].filter(Boolean).join(' – ')
      const base = `${entry.title || 'Role'} at ${entry.company || 'Company'}`
      return dates ? `${base} (${dates})` : base
    })
    .filter(Boolean)

  return {
    username: user.username,
    fullName: profile.fullName || user.username,
    headline: profile.headline || '',
    location,
    skills: profile.skills || [],
    education,
    workExperience: work,
    achievements: (profile.achievements || []).map((a) => a.title).filter(Boolean),
  }
}

function buildSystemPrompt(user) {
  const context = buildProfileContext(user)

  return `You are Ascendra AI, a professional networking assistant inside the Ascendra app.

Your main jobs:
1. Help the user draft engaging, authentic feed posts (normal posts, not job listings unless they ask).
2. Answer questions about their skills, suggest skills to add, and explain how skills fit their goals.
3. Give concise, actionable career and profile advice based on their profile context.

Rules:
- Be friendly, professional, and concise (usually under 180 words unless drafting a longer post).
- When drafting a post, write ready-to-publish text the user can copy. Do not wrap it in quotes unless needed.
- When discussing skills, reference their current skills when relevant and suggest specific additions with brief reasons.
- Do not invent employers, degrees, or skills they do not have unless clearly labeled as a suggestion to add.
- If asked about topics outside networking, profiles, skills, jobs, or posts, politely redirect to how you can help on Ascendra.
- Use plain text; avoid markdown headers unless listing skills or steps.

User profile context:
- Username: @${context.username}
- Name: ${context.fullName}
- Headline: ${context.headline || 'Not set'}
- Location: ${context.location || 'Not set'}
- Skills: ${context.skills.length ? context.skills.join(', ') : 'None listed yet'}
- Education: ${context.education.length ? context.education.join('; ') : 'None listed'}
- Work experience: ${context.workExperience.length ? context.workExperience.join('; ') : 'None listed'}
- Achievements: ${context.achievements.length ? context.achievements.join(', ') : 'None listed'}`
}

function toGeminiHistory(messages) {
  return messages.slice(0, -1).map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))
}

function getGenerativeModel(user, modelName) {
  const apiKey = process.env.GEMINI_API_KEY?.trim()

  if (!apiKey) {
    const error = new Error('Gemini API is not configured on the server.')
    error.code = 'GEMINI_NOT_CONFIGURED'
    throw error
  }

  const genAI = new GoogleGenerativeAI(apiKey)

  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: buildSystemPrompt(user),
  })
}

async function sendWithModel(user, messages, modelName) {
  const model = getGenerativeModel(user, modelName)
  const chat = model.startChat({
    history: toGeminiHistory(messages),
  })

  const lastMessage = messages[messages.length - 1]
  const result = await chat.sendMessage(lastMessage.content.trim())
  return result.response.text()
}

export async function generateAssistantReply(user, messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    const error = new Error('At least one message is required.')
    error.code = 'INVALID_MESSAGES'
    throw error
  }

  const lastMessage = messages[messages.length - 1]

  if (lastMessage.role !== 'user' || !lastMessage.content?.trim()) {
    const error = new Error('The last message must be from the user with non-empty content.')
    error.code = 'INVALID_MESSAGES'
    throw error
  }

  const candidates = getModelCandidates()
  let lastError

  for (const modelName of candidates) {
    try {
      return await sendWithModel(user, messages, modelName)
    } catch (error) {
      lastError = error
      if (!isRetryableGeminiError(error)) {
        throw error
      }
    }
  }

  throw lastError
}
