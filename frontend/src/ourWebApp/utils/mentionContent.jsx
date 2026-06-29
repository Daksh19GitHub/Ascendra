import { Link } from 'react-router-dom'

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildMentionParts(content, mentions = []) {
  if (!content) return []

  if (!mentions.length) {
    return [{ type: 'text', value: content }]
  }

  const usernames = [...new Set(mentions.map((mention) => mention.username))]
    .sort((a, b) => b.length - a.length)

  const pattern = new RegExp(`@(${usernames.map(escapeRegExp).join('|')})`, 'gi')
  const parts = []
  let lastIndex = 0

  for (const match of content.matchAll(pattern)) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) })
    }

    parts.push({
      type: 'mention',
      value: match[1],
      username: match[1].toLowerCase(),
    })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) })
  }

  return parts.length ? parts : [{ type: 'text', value: content }]
}

export function MentionContent({ content, mentions = [], className = '' }) {
  const parts = buildMentionParts(content, mentions)

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.type === 'mention' ? (
          <Link
            key={`${part.username}-${index}`}
            to={`/app/profile/${part.username}`}
            className="mention-link"
          >
            @{part.value}
          </Link>
        ) : (
          <span key={`text-${index}`}>{part.value}</span>
        )
      )}
    </span>
  )
}
