import {
  isValidNormalizedToken,
  normalizeToken,
  splitRawTokens,
} from './tokenNormalization.js'

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'if',
  'then',
  'else',
  'when',
  'at',
  'by',
  'for',
  'with',
  'about',
  'against',
  'between',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'to',
  'from',
  'up',
  'down',
  'in',
  'out',
  'on',
  'off',
  'over',
  'under',
  'again',
  'further',
  'once',
  'here',
  'there',
  'all',
  'any',
  'both',
  'each',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  'can',
  'will',
  'just',
  'don',
  'should',
  'now',
  'are',
  'was',
  'were',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'having',
  'this',
  'that',
  'these',
  'those',
  'am',
  'is',
  'be',
  'it',
  'its',
  'i',
  'me',
  'my',
  'we',
  'our',
  'you',
  'your',
  'he',
  'him',
  'his',
  'she',
  'her',
  'they',
  'them',
  'their',
  'what',
  'which',
  'who',
  'whom',
  'how',
  'why',
  'where',
  'get',
  'got',
  'like',
  'just',
  'also',
  'still',
  'would',
  'could',
  'been',
  'being',
  'via',
  'yet',
  'say',
  'said',
  'hey',
  'hi',
  'hello',
  'thanks',
  'thank',
  'please',
  'yes',
  'no',
  'okay',
  'ok',
])

const REACTION_WEIGHTS = {
  like: 2,
  love: 2.5,
  clap: 2.2,
  support: 2.2,
}

export function tokenize(text) {
  if (!text?.trim()) return []

  const tokens = []

  for (const rawToken of splitRawTokens(text)) {
    const token = normalizeToken(rawToken)

    if (!isValidNormalizedToken(token)) continue
    if (STOP_WORDS.has(token)) continue

    tokens.push(token)
  }

  return tokens
}

export function addTextToInterestProfile(profile, text, weight = 1) {
  if (!text?.trim() || weight <= 0) return profile

  for (const token of tokenize(text)) {
    profile[token] = (profile[token] || 0) + weight
  }

  return profile
}

export function buildInterestProfileFromSkills(profile, skills = [], weight = 3) {
  for (const skill of skills) {
    addTextToInterestProfile(profile, skill, weight)
  }

  return profile
}

export function scoreContentMatch(text, interestProfile, maxScore = 45) {
  if (!text?.trim() || !interestProfile || !Object.keys(interestProfile).length) {
    return 0
  }

  const tokens = tokenize(text)
  if (!tokens.length) return 0

  let score = 0
  const matched = new Set()

  for (const token of tokens) {
    const weight = interestProfile[token]
    if (weight) {
      score += weight
      matched.add(token)
    }
  }

  if (matched.size >= 3) {
    score += 4
  } else if (matched.size >= 2) {
    score += 2
  }

  return Math.min(maxScore, Math.round(score))
}

export function getPostMatchingText(postDoc) {
  const parts = []

  if (postDoc.content?.trim()) {
    parts.push(postDoc.content)
  }

  if (postDoc.repostOf?.content?.trim()) {
    parts.push(postDoc.repostOf.content)
  }

  return parts.join(' ')
}

export { REACTION_WEIGHTS }
