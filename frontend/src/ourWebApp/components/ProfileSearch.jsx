import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addSearchHistory,
  clearSearchHistory,
  fetchSearchHistory,
  removeSearchHistoryEntry,
  searchUsers,
} from '../api/webAppApi'

function ProfileSearch() {
  const navigate = useNavigate()
  const wrapRef = useRef(null)
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [history, setHistory] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const trimmedQuery = query.trim()
  const showingHistory = open && trimmedQuery.length === 0 && history.length > 0
  const showingResults = open && trimmedQuery.length > 0
  const visibleItems = showingHistory ? history : results

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)

    try {
      const response = await fetchSearchHistory()
      setHistory(response.data.history || [])
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    if (trimmedQuery.length < 1) {
      setResults([])
      return undefined
    }

    const timer = setTimeout(() => {
      setLoading(true)

      searchUsers(trimmedQuery, 8)
        .then((response) => {
          const users = response.data.users || []
          setResults(users)
          setOpen(true)
          setActiveIndex(0)
        })
        .catch(() => {
          setResults([])
        })
        .finally(() => {
          setLoading(false)
        })
    }, 200)

    return () => clearTimeout(timer)
  }, [trimmedQuery])

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function goToProfile(user) {
    setQuery('')
    setResults([])
    setOpen(false)
    navigate(`/app/profile/${user.username}`)

    try {
      const response = await addSearchHistory(user.username)
      setHistory(response.data.history || [])
    } catch {
      loadHistory()
    }
  }

  async function handleRemoveHistory(username, event) {
    event.preventDefault()
    event.stopPropagation()

    try {
      const response = await removeSearchHistoryEntry(username)
      setHistory(response.data.history || [])
    } catch {
      loadHistory()
    }
  }

  async function handleClearHistory(event) {
    event.preventDefault()
    event.stopPropagation()

    try {
      const response = await clearSearchHistory()
      setHistory(response.data.history || [])
    } catch {
      loadHistory()
    }
  }

  function handleKeyDown(event) {
    if (!open || visibleItems.length === 0) {
      if (event.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % visibleItems.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + visibleItems.length) % visibleItems.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const selected = visibleItems[activeIndex]
      if (selected) {
        goToProfile(selected)
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  async function handleFocus() {
    if (trimmedQuery.length > 0 && results.length) {
      setOpen(true)
      return
    }

    setHistoryLoading(true)

    try {
      const response = await fetchSearchHistory()
      const nextHistory = response.data.history || []
      setHistory(nextHistory)

      if (nextHistory.length > 0) {
        setOpen(true)
        setActiveIndex(0)
      }
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <div className="profile-search" ref={wrapRef}>
      <label className="visually-hidden" htmlFor="profile-search-input">
        Search profiles
      </label>
      <div className="profile-search-field">
        <i className="bi bi-search profile-search-icon" aria-hidden="true"></i>
        <input
          id="profile-search-input"
          ref={inputRef}
          type="search"
          className="form-control profile-search-input"
          placeholder="Search by name or username"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            className="profile-search-clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery('')
              setResults([])
              if (history.length) {
                setOpen(true)
                setActiveIndex(0)
              } else {
                setOpen(false)
              }
              inputRef.current?.focus()
            }}
          >
            <i className="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        )}
      </div>

      {open && trimmedQuery.length === 0 && historyLoading && (
        <div className="profile-search-dropdown">
          <div className="profile-search-status">Loading recent searches...</div>
        </div>
      )}

      {showingHistory && (
        <div className="profile-search-dropdown" role="listbox">
          <div className="profile-search-history-header">
            <span>Recent searches</span>
            <button type="button" className="profile-search-clear-all" onClick={handleClearHistory}>
              Clear all
            </button>
          </div>
          {history.map((entry, index) => {
            const photoUrl = entry.profilePhoto?.url

            return (
              <div
                key={entry.username}
                className={`profile-search-result-wrap${index === activeIndex ? ' active' : ''}`}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className="profile-search-result"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => goToProfile(entry)}
                >
                  <span className="profile-search-avatar">
                    {photoUrl ? (
                      <img src={photoUrl} alt="" />
                    ) : (
                      <i className="bi bi-person-fill" aria-hidden="true"></i>
                    )}
                  </span>
                  <span className="profile-search-meta">
                    <strong>{entry.fullName}</strong>
                    {entry.headline ? <span>{entry.headline}</span> : null}
                    <span>@{entry.username}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="profile-search-remove"
                  aria-label={`Remove ${entry.fullName} from search history`}
                  onClick={(event) => handleRemoveHistory(entry.username, event)}
                >
                  <i className="bi bi-x-lg" aria-hidden="true"></i>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {showingResults && (
        <div className="profile-search-dropdown" role="listbox">
          {loading ? (
            <div className="profile-search-status">Searching...</div>
          ) : results.length === 0 ? (
            <div className="profile-search-status">No profiles found</div>
          ) : (
            results.map((entry, index) => {
              const photoUrl = entry.profilePhoto?.url

              return (
                <button
                  key={entry.id}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`profile-search-result${index === activeIndex ? ' active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => goToProfile(entry)}
                >
                  <span className="profile-search-avatar">
                    {photoUrl ? (
                      <img src={photoUrl} alt="" />
                    ) : (
                      <i className="bi bi-person-fill" aria-hidden="true"></i>
                    )}
                  </span>
                  <span className="profile-search-meta">
                    <strong>{entry.fullName}</strong>
                    {entry.headline ? <span>{entry.headline}</span> : null}
                    <span>@{entry.username}</span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default ProfileSearch
