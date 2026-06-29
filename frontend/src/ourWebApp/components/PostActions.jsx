import { useEffect, useRef, useState } from 'react'
import { setPostReaction, togglePostRepost } from '../api/webAppApi'
import { getReactionMeta, POST_REACTIONS } from '../constants/postReactions'

function PostActions({ post, onEngagementChange, onCommentClick, commentsOpen }) {
  const [busy, setBusy] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef(null)
  const closeTimerRef = useRef(null)
  const engagement = post.engagement || {}
  const userReaction = engagement.userReaction
  const activeReaction = userReaction ? getReactionMeta(userReaction) : null

  function openPicker() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setPickerOpen(true)
  }

  function scheduleClosePicker() {
    closeTimerRef.current = setTimeout(() => {
      setPickerOpen(false)
      closeTimerRef.current = null
    }, 180)
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!pickerOpen) return undefined

    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setPickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [pickerOpen])

  async function handleReaction(type) {
    if (busy) return

    setBusy(true)
    setPickerOpen(false)

    try {
      const response = await setPostReaction(post.id, type)
      onEngagementChange?.(post.id, response.data.engagement)
    } catch {
      // keep UI unchanged on failure
    } finally {
      setBusy(false)
    }
  }

  async function handleRepost() {
    if (busy) return

    setBusy(true)

    try {
      const response = await togglePostRepost(post.id)
      onEngagementChange?.(post.id, response.data.engagement)
    } catch {
      // keep UI unchanged on failure
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="post-actions">
      <div
        className="post-action-react-wrap"
        ref={pickerRef}
        onMouseEnter={openPicker}
        onMouseLeave={scheduleClosePicker}
      >
        {pickerOpen && (
          <div className="post-reaction-picker-shell" onMouseEnter={openPicker} onMouseLeave={scheduleClosePicker}>
            <div className="post-reaction-picker" role="menu" aria-label="Choose a reaction">
              {POST_REACTIONS.map((reaction) => (
                <button
                  key={reaction.type}
                  type="button"
                  className={`post-reaction-option${userReaction === reaction.type ? ' active' : ''}`}
                  title={reaction.label}
                  aria-label={reaction.label}
                  disabled={busy}
                  onClick={() => handleReaction(reaction.type)}
                >
                  <span aria-hidden="true">{reaction.emoji}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className={`post-action-btn${userReaction ? ' post-action-btn-active' : ''}`}
          disabled={busy}
          onClick={() => handleReaction(userReaction || 'like')}
          onFocus={openPicker}
          aria-pressed={Boolean(userReaction)}
          aria-haspopup="menu"
          aria-expanded={pickerOpen}
        >
          {activeReaction ? (
            <>
              <span className="post-action-emoji" aria-hidden="true">
                {activeReaction.emoji}
              </span>
              {activeReaction.label}
            </>
          ) : (
            <>
              <i className="bi bi-hand-thumbs-up"></i>
              React
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        className={`post-action-btn${commentsOpen ? ' post-action-btn-active' : ''}`}
        disabled={busy}
        onClick={onCommentClick}
        aria-expanded={commentsOpen}
      >
        <i className="bi bi-chat-left-text"></i>
        Comment
        {engagement.commentCount > 0 && (
          <span className="post-action-count">{engagement.commentCount}</span>
        )}
      </button>

      <button
        type="button"
        className={`post-action-btn${engagement.userReposted ? ' post-action-btn-active' : ''}`}
        disabled={busy}
        onClick={handleRepost}
        aria-pressed={Boolean(engagement.userReposted)}
      >
        <i className="bi bi-repeat"></i>
        {engagement.userReposted ? 'Reposted' : 'Repost'}
        {engagement.repostCount > 0 && (
          <span className="post-action-count">{engagement.repostCount}</span>
        )}
      </button>
    </div>
  )
}

export default PostActions
