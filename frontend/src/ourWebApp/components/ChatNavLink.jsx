import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSocket } from '../../context/SocketContext'
import { fetchChatUnreadCount } from '../api/webAppApi'

function ChatNavLink() {
  const location = useLocation()
  const { socket } = useSocket()
  const [unreadCount, setUnreadCount] = useState(0)

  const active = location.pathname.startsWith('/app/chat')

  async function loadUnreadCount() {
    try {
      const response = await fetchChatUnreadCount()
      setUnreadCount(response.data.count || 0)
    } catch {
      // keep previous count
    }
  }

  useEffect(() => {
    loadUnreadCount()
  }, [location.pathname])

  useEffect(() => {
    if (!socket) return undefined

    function handleUnreadUpdated({ count }) {
      setUnreadCount(count || 0)
    }

    socket.on('chat_unread_updated', handleUnreadUpdated)

    return () => {
      socket.off('chat_unread_updated', handleUnreadUpdated)
    }
  }, [socket])

  return (
    <li className="nav-item">
      <Link
        className={`nav-link webapp-nav-link chat-nav-link${active ? ' active' : ''}`}
        to="/app/chat"
        aria-label={`Chat${unreadCount ? `, ${unreadCount} unread messages` : ''}`}
      >
        <i className="bi bi-chat-dots-fill me-lg-1"></i>
        <span className="d-none d-sm-inline">Chat</span>
        {unreadCount > 0 && (
          <span className="chat-unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </Link>
    </li>
  )
}

export default ChatNavLink
