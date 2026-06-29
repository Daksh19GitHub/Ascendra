import User from '../models/User.js'

const MENTION_REGEX = /@([a-zA-Z0-9_]{3,30})\b/g

export function extractMentionUsernames(content) {
  const usernames = new Set()
  const matches = content.matchAll(MENTION_REGEX)

  for (const match of matches) {
    usernames.add(match[1].toLowerCase())
  }

  return [...usernames]
}

export async function resolveMentions(content, excludeUserId) {
  const usernames = extractMentionUsernames(content)

  if (!usernames.length) {
    return { mentions: [] }
  }

  const users = await User.find({ username: { $in: usernames } }).select('username')

  const foundUsernames = new Set(users.map((user) => user.username))
  const invalid = usernames.filter((username) => !foundUsernames.has(username))

  if (invalid.length) {
    return {
      error: {
        status: 400,
        message: `Unknown user(s): ${invalid.map((username) => `@${username}`).join(', ')}`,
      },
    }
  }

  const excludeId = excludeUserId?.toString()
  const mentions = []
  const seen = new Set()

  for (const user of users) {
    const userId = user._id.toString()

    if (userId === excludeId || seen.has(userId)) {
      continue
    }

    seen.add(userId)
    mentions.push({
      user: user._id,
      username: user.username,
    })
  }

  return { mentions }
}

export function mapMentionsToPublicJSON(mentions = []) {
  return mentions.map((mention) => ({
    userId: mention.user?.toString?.() || mention.user,
    username: mention.username,
  }))
}
