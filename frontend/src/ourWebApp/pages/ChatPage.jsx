import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSocket } from '../../context/SocketContext'
import { useAuth } from '../../context/AuthContext'
import {
  fetchChatConversations,
  fetchChatMessages,
  fetchFriends,
} from '../api/webAppApi'
import UserHeadline from '../components/UserHeadline'

function formatMessageTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatSidebarTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function MessageStatus({ message }) {
  if (!message.isOwn) return null

  const isSeen = message.deliveryStatus === 'seen' || Boolean(message.readAt)

  return (
    <span className={`chat-message-status${isSeen ? ' chat-message-status-seen' : ''}`}>
      {isSeen ? (
        <>
          <i className="bi bi-check2-all" aria-hidden="true"></i>
          Seen
        </>
      ) : (
        <>
          <i className="bi bi-check2" aria-hidden="true"></i>
          Sent
        </>
      )}
    </span>
  )
}

function ChatPage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket, connected } = useSocket()
  const [friends, setFriends] = useState([])
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeFriend, setActiveFriend] = useState(null)
  const [draft, setDraft] = useState('')
  const [loadingSidebar, setLoadingSidebar] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  const markMessagesSeen = useCallback(
    (friendUsername) => {
      if (!socket || !friendUsername) return
      socket.emit('mark_messages_seen', { username: friendUsername })
    },
    [socket]
  )

  useEffect(() => {
    setLoadingSidebar(true)
    setError('')

    Promise.all([fetchFriends(), fetchChatConversations()])
      .then(([friendsResponse, conversationsResponse]) => {
        setFriends(friendsResponse.data.friends || [])
        setConversations(conversationsResponse.data.conversations || [])
      })
      .catch(() => {
        setError('Unable to load chat. Please try again.')
      })
      .finally(() => {
        setLoadingSidebar(false)
      })
  }, [])

  useEffect(() => {
    if (!username) {
      setActiveFriend(null)
      setMessages([])
      return
    }

    setLoadingMessages(true)
    setError('')

    fetchChatMessages(username)
      .then((response) => {
        setActiveFriend(response.data.friend)
        setMessages(response.data.messages || [])
        markMessagesSeen(username)
      })
      .catch((err) => {
        setActiveFriend(null)
        setMessages([])
        setError(err.response?.data?.message || 'Unable to open this chat.')
      })
      .finally(() => {
        setLoadingMessages(false)
      })
  }, [username, markMessagesSeen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, username])

  useEffect(() => {
    if (!socket) return undefined

    function handleMessageReceived(message) {
      if (!username || !activeFriend) return

      const belongsToCurrentChat =
        message.sender?.username === username ||
        (message.isOwn && message.sender?.id === user?.id)

      if (!belongsToCurrentChat) return

      setMessages((prev) => {
        if (prev.some((entry) => entry.id === message.id)) {
          return prev
        }

        return [
          ...prev,
          {
            ...message,
            isOwn: message.sender?.id === user?.id,
            deliveryStatus: message.sender?.id === user?.id ? 'sent' : message.deliveryStatus,
            readAt: message.readAt || null,
          },
        ]
      })

      if (!message.isOwn && message.sender?.username === username) {
        markMessagesSeen(username)
      }
    }

    function handleMessagesSeen({ messageIds, readAt }) {
      if (!messageIds?.length) return

      setMessages((prev) =>
        prev.map((message) =>
          messageIds.includes(message.id)
            ? {
                ...message,
                readAt: readAt || message.readAt,
                deliveryStatus: 'seen',
              }
            : message
        )
      )
    }

    function handleConversationUpdated(update) {
      setConversations((prev) => {
        const existingIndex = prev.findIndex(
          (entry) => entry.friend?.username === update.friend?.username
        )

        const nextEntry = {
          id: update.conversationId,
          friend: update.friend,
          lastMessageText: update.lastMessageText,
          lastMessageAt: update.lastMessageAt,
        }

        if (existingIndex === -1) {
          return [nextEntry, ...prev]
        }

        const next = [...prev]
        next.splice(existingIndex, 1)
        return [nextEntry, ...next]
      })
    }

    socket.on('message_received', handleMessageReceived)
    socket.on('messages_seen', handleMessagesSeen)
    socket.on('conversation_updated', handleConversationUpdated)

    return () => {
      socket.off('message_received', handleMessageReceived)
      socket.off('messages_seen', handleMessagesSeen)
      socket.off('conversation_updated', handleConversationUpdated)
    }
  }, [socket, username, activeFriend, user?.id, markMessagesSeen])

  const sidebarItems = useMemo(() => {
    const conversationMap = new Map(
      conversations
        .filter((entry) => entry.friend?.username)
        .map((entry) => [entry.friend.username, entry])
    )

    return friends
      .map((entry) => {
        const conversation = conversationMap.get(entry.user.username)
        return {
          user: entry.user,
          lastMessageText: conversation?.lastMessageText || '',
          lastMessageAt: conversation?.lastMessageAt || null,
        }
      })
      .sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
        return bTime - aTime
      })
  }, [friends, conversations])

  function openChat(friendUsername) {
    navigate(`/app/chat/${friendUsername}`)
  }

  function sendMessage() {
    if (!socket || !username || !draft.trim() || sending) return

    setSending(true)
    setError('')

    socket.emit('send_message', { username, content: draft.trim() }, (response) => {
      setSending(false)

      if (!response?.success) {
        setError(response?.message || 'Failed to send message.')
        return
      }

      setDraft('')
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage()
  }

  function handleComposerKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="container webapp-page-content chat-page">
      <div className="chat-page-header">
        <p className="webapp-muted mb-0">Real-time messages with your friends</p>
      </div>

      {!connected && socket && (
        <div className="profile-alert profile-alert-error mb-3">
          Reconnecting to chat...
        </div>
      )}

      {error && <div className="profile-alert profile-alert-error">{error}</div>}

      <div className="chat-layout">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>Friends</h2>
          </div>

          <div className="chat-sidebar-body">
            {loadingSidebar ? (
              <div className="chat-sidebar-loading text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading friends...</span>
                </div>
              </div>
            ) : sidebarItems.length === 0 ? (
              <div className="webapp-empty-state chat-sidebar-empty">
                <i className="bi bi-people"></i>
                <p>No friends to chat with yet.</p>
                <Link to="/app/friends" className="btn btn-sm btn-profile-add">
                  Find friends
                </Link>
              </div>
            ) : (
              <ul className="chat-friend-list">
                {sidebarItems.map((entry) => {
                const photoUrl = entry.user?.profilePhoto?.url
                const isActive = entry.user.username === username

                return (
                  <li key={entry.user.id}>
                    <button
                      type="button"
                      className={`chat-friend-item${isActive ? ' active' : ''}`}
                      onClick={() => openChat(entry.user.username)}
                    >
                      <span className="chat-friend-avatar">
                        {photoUrl ? (
                          <img src={photoUrl} alt="" />
                        ) : (
                          <i className="bi bi-person-fill" aria-hidden="true"></i>
                        )}
                      </span>
                      <span className="chat-friend-meta">
                        <span className="chat-friend-name">
                          {entry.user.fullName || entry.user.username}
                        </span>
                        <span className="chat-friend-preview">
                          {entry.lastMessageText || entry.user.headline || `@${entry.user.username}`}
                        </span>
                      </span>
                      {entry.lastMessageAt && (
                        <span className="chat-friend-time">
                          {formatSidebarTime(entry.lastMessageAt)}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
            )}
          </div>
        </aside>

        <section className="chat-panel">
          {!username ? (
            <div className="chat-panel-empty">
              <i className="bi bi-chat-dots"></i>
              <p>Select a friend to start chatting</p>
            </div>
          ) : loadingMessages ? (
            <div className="chat-panel-loading text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading messages...</span>
              </div>
            </div>
          ) : (
            <>
              <header className="chat-panel-header">
                <div className="chat-panel-user">
                  <div className="chat-panel-avatar">
                    {activeFriend?.profilePhoto?.url ? (
                      <img src={activeFriend.profilePhoto.url} alt="" />
                    ) : (
                      <i className="bi bi-person-fill" aria-hidden="true"></i>
                    )}
                  </div>
                  <div>
                    <h2>{activeFriend?.fullName || activeFriend?.username}</h2>
                    <UserHeadline headline={activeFriend?.headline} />
                    <p className="webapp-muted mb-0">@{activeFriend?.username}</p>
                  </div>
                </div>
                <Link
                  to={`/app/profile/${activeFriend?.username}`}
                  className="btn btn-sm btn-profile-add"
                >
                  View profile
                </Link>
              </header>

              <div className="chat-messages">
                {messages.length === 0 ? (
                  <p className="chat-messages-empty webapp-muted">
                    No messages yet. Say hello!
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`chat-message${message.isOwn ? ' chat-message-own' : ''}`}
                    >
                      <div className="chat-message-bubble">
                        <p>{message.content}</p>
                        <div className="chat-message-meta">
                          <span>{formatMessageTime(message.createdAt)}</span>
                          <MessageStatus message={message} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-composer" onSubmit={handleSubmit}>
                <textarea
                  className="form-control chat-composer-input"
                  rows={2}
                  placeholder="Write a message... (Enter to send, Shift+Enter for new line)"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  disabled={sending || !connected}
                  maxLength={2000}
                />
                <div className="chat-composer-footer">
                  <span className="webapp-muted">{draft.length}/2000</span>
                  <button
                    type="submit"
                    className="btn btn-sm btn-profile-save"
                    disabled={sending || !connected || !draft.trim()}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default ChatPage
