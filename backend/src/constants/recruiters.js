export const RECRUITER_START_NUM = 101
export const RECRUITER_END_NUM = 200

export function isRecruiterUsername(username) {
  if (!username?.trim()) return false

  const match = /^ad(\d+)$/.exec(username.trim())
  if (!match) return false

  const num = Number.parseInt(match[1], 10)
  return num >= RECRUITER_START_NUM && num <= RECRUITER_END_NUM
}

export function buildRecruiterUsernamePattern() {
  return /^ad(10[1-9]|1[1-9]\d|200)$/
}
