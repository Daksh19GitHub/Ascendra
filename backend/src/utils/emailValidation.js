const STANDARD_EMAIL_PATTERN = /^\S+@\S+\.\S+$/
const ASCENDRA_EMAIL_PATTERN = /^\S+@ascendra$/i

export function isAcceptedEmail(value) {
  if (typeof value !== 'string') return false
  const email = value.trim().toLowerCase()
  return STANDARD_EMAIL_PATTERN.test(email) || ASCENDRA_EMAIL_PATTERN.test(email)
}

export function normalizeAcceptedEmail(value) {
  return value.trim().toLowerCase()
}
