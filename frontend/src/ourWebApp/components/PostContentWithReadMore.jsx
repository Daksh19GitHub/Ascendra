import { useState } from 'react'
import { MentionContent } from '../utils/mentionContent'
import { CONTENT_PREVIEW_LENGTH, truncatePostContent } from '../utils/truncatePostContent'

function PostContentWithReadMore({
  content,
  mentions,
  id,
  className = 'feed-post-content',
}) {
  const [expanded, setExpanded] = useState(false)
  const { preview, isTruncated } = truncatePostContent(content, CONTENT_PREVIEW_LENGTH)
  const showFullContent = expanded || !isTruncated

  return (
    <div id={id} className={className}>
      <MentionContent
        content={showFullContent ? content : preview}
        mentions={mentions}
      />
      {isTruncated && (
        <button
          type="button"
          className="feed-post-read-more"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  )
}

export default PostContentWithReadMore
