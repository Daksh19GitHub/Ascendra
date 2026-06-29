export const CONTENT_PREVIEW_LENGTH = 260

export function truncatePostContent(content, maxLength = CONTENT_PREVIEW_LENGTH) {
  if (!content || content.length <= maxLength) {
    return { preview: content, isTruncated: false }
  }

  const slice = content.slice(0, maxLength)
  const lastSpace = slice.lastIndexOf(' ')

  return {
    preview: `${(lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice).trim()}…`,
    isTruncated: true,
  }
}
