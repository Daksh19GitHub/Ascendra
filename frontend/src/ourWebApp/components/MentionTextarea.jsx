import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { searchUsers } from '../api/webAppApi'
import { getTextareaCaretCoordinates } from '../utils/textareaCaret'

const DROPDOWN_ESTIMATED_HEIGHT = 320
const DROPDOWN_MIN_WIDTH = 300
const DROPDOWN_MAX_WIDTH = 380
const VIEWPORT_PADDING = 12

function getActiveMentionQuery(value, cursorPosition) {
  const textBeforeCursor = value.slice(0, cursorPosition)
  const match = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/)

  if (!match) return null

  return {
    query: match[1],
    startIndex: cursorPosition - match[1].length - 1,
  }
}

function MentionTextarea({
  value,
  onChange,
  onKeyDown,
  className = '',
  placeholder = '',
  rows = 2,
  disabled = false,
  maxLength = 1000,
}) {
  const textareaRef = useRef(null)
  const [suggestions, setSuggestions] = useState([])
  const [mentionStart, setMentionStart] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState(null)

  const showSuggestions =
    mentionStart !== null && (suggestions.length > 0 || loadingSuggestions)

  useEffect(() => {
    if (mentionStart === null) {
      setSuggestions([])
      return undefined
    }

    const query = value.slice(mentionStart + 1, textareaRef.current?.selectionStart || value.length)

    if (query.length < 1) {
      setSuggestions([])
      return undefined
    }

    const timer = setTimeout(() => {
      setLoadingSuggestions(true)
      searchUsers(query, 10)
        .then((response) => {
          setSuggestions(response.data.users || [])
          setActiveIndex(0)
        })
        .catch(() => {
          setSuggestions([])
        })
        .finally(() => {
          setLoadingSuggestions(false)
        })
    }, 180)

    return () => clearTimeout(timer)
  }, [value, mentionStart])

  useLayoutEffect(() => {
    if (!showSuggestions) {
      setDropdownPosition(null)
      return undefined
    }

    function updatePosition() {
      const textarea = textareaRef.current
      if (!textarea) return

      const caret = getTextareaCaretCoordinates(textarea, textarea.selectionStart)
      const rect = textarea.getBoundingClientRect()
      const dropdownWidth = Math.min(
        DROPDOWN_MAX_WIDTH,
        Math.max(DROPDOWN_MIN_WIDTH, rect.width)
      )

      const caretTop = rect.top + caret.top
      const caretLeft = rect.left + caret.left
      const placeAbove = caretTop - DROPDOWN_ESTIMATED_HEIGHT >= VIEWPORT_PADDING

      let left = caretLeft
      left = Math.max(VIEWPORT_PADDING, left)
      left = Math.min(left, window.innerWidth - dropdownWidth - VIEWPORT_PADDING)

      setDropdownPosition({
        top: placeAbove ? caretTop - 8 : caretTop + caret.height + 8,
        left,
        width: dropdownWidth,
        placement: placeAbove ? 'above' : 'below',
      })
    }

    updatePosition()

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    const textarea = textareaRef.current
    textarea?.addEventListener('scroll', updatePosition)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      textarea?.removeEventListener('scroll', updatePosition)
    }
  }, [showSuggestions, value, suggestions.length, loadingSuggestions, activeIndex])

  function updateMentionState(nextValue, cursorPosition) {
    const activeMention = getActiveMentionQuery(nextValue, cursorPosition)

    if (activeMention) {
      setMentionStart(activeMention.startIndex)
    } else {
      setMentionStart(null)
      setSuggestions([])
    }
  }

  function handleChange(event) {
    onChange(event)
    updateMentionState(event.target.value, event.target.selectionStart)
  }

  function handleSelect(event) {
    updateMentionState(event.target.value, event.target.selectionStart)
  }

  function insertMention(username) {
    const textarea = textareaRef.current
    if (!textarea || mentionStart === null) return

    const cursorPosition = textarea.selectionStart
    const before = value.slice(0, mentionStart)
    const after = value.slice(cursorPosition)
    const nextValue = `${before}@${username} ${after}`

    onChange({ target: { value: nextValue } })
    setMentionStart(null)
    setSuggestions([])

    requestAnimationFrame(() => {
      const nextCursor = before.length + username.length + 2
      textarea.focus()
      textarea.setSelectionRange(nextCursor, nextCursor)
    })
  }

  function handleKeyDownInternal(event) {
    if (suggestions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((index) => (index + 1) % suggestions.length)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length)
        return
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault()
        insertMention(suggestions[activeIndex].username)
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        setMentionStart(null)
        setSuggestions([])
        return
      }
    }

    onKeyDown?.(event)
  }

  const suggestionsDropdown =
    showSuggestions && dropdownPosition
      ? createPortal(
          <div
            className={`mention-suggestions mention-suggestions-floating mention-suggestions-${dropdownPosition.placement}`}
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
            role="listbox"
            aria-label="Mention suggestions"
          >
            <div className="mention-suggestions-header">
              <i className="bi bi-at" aria-hidden="true"></i>
              <span>Mention someone</span>
            </div>

            <div className="mention-suggestions-list">
              {loadingSuggestions && suggestions.length === 0 ? (
                <div className="mention-suggestion mention-suggestion-loading">
                  <span className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Searching...</span>
                  </span>
                  Searching people...
                </div>
              ) : (
                suggestions.map((user, index) => {
                  const photoUrl = user.profilePhoto?.url

                  return (
                    <button
                      key={user.id}
                      type="button"
                      className={`mention-suggestion${index === activeIndex ? ' active' : ''}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => insertMention(user.username)}
                    >
                      <span className="mention-suggestion-avatar">
                        {photoUrl ? (
                          <img src={photoUrl} alt="" />
                        ) : (
                          <i className="bi bi-person-fill" aria-hidden="true"></i>
                        )}
                      </span>
                      <span className="mention-suggestion-meta">
                        <strong>{user.fullName || user.username}</strong>
                        {user.headline ? (
                          <span className="mention-suggestion-headline">{user.headline}</span>
                        ) : null}
                        <span className="mention-suggestion-username">@{user.username}</span>
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <div className="mention-textarea-wrap">
      <textarea
        ref={textareaRef}
        className={className}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onSelect={handleSelect}
        onClick={handleSelect}
        onKeyDown={handleKeyDownInternal}
        disabled={disabled}
        maxLength={maxLength}
      />

      {suggestionsDropdown}
    </div>
  )
}

export default MentionTextarea
