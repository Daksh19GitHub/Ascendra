import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSocket } from '../../context/SocketContext'
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/webAppApi'
import {
  getNotificationActionText,
  shouldOpenCommentsForNotification,
} from '../constants/notifications'

function formatNotificationTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function NotificationPanel() {
  const navigate = useNavigate()
  const { socket } = useSocket()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)

  async function loadUnreadCount() {
    try {
      const response = await fetchUnreadNotificationCount()
      setUnreadCount(response.data.count || 0)
    } catch {
      // keep previous count
    }
  }

  async function loadNotifications() {
    setLoading(true)

    try {
      const response = await fetchNotifications()
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.notifications?.filter((entry) => !entry.readAt).length || 0)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUnreadCount()
  }, [])

  useEffect(() => {
    if (!socket) return undefined

    function handleNotificationReceived(notification) {
      setNotifications((prev) => [notification, ...prev.filter((entry) => entry.id !== notification.id)])
      setUnreadCount((count) => count + 1)
    }

    function handleNotificationRemoved({ id, wasUnread }) {
      setNotifications((prev) => prev.filter((entry) => entry.id !== id))
      if (wasUnread) {
        setUnreadCount((count) => Math.max(0, count - 1))
      }
    }

    socket.on('notification_received', handleNotificationReceived)
    socket.on('notification_removed', handleNotificationRemoved)

    return () => {
      socket.off('notification_received', handleNotificationReceived)
      socket.off('notification_removed', handleNotificationRemoved)
    }
  }, [socket])

  useEffect(() => {
    if (!open) return undefined

    loadNotifications()

    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleToggle() {
    setOpen((current) => !current)
  }

  async function handleNotificationClick(notification) {
    if (!notification.readAt) {
      try {
        await markNotificationRead(notification.id)
        setNotifications((prev) =>
          prev.map((entry) =>
            entry.id === notification.id
              ? { ...entry, readAt: new Date().toISOString() }
              : entry
          )
        )
        setUnreadCount((count) => Math.max(0, count - 1))
      } catch {
        // continue navigation
      }
    }

    setOpen(false)

    const params = new URLSearchParams({ post: notification.postId })

    if (notification.commentId) {
      params.set('comment', notification.commentId)
      params.set('comments', '1')
    } else if (shouldOpenCommentsForNotification(notification)) {
      params.set('comments', '1')
    }

    navigate(`/app?${params.toString()}`)
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) =>
        prev.map((entry) => ({
          ...entry,
          readAt: entry.readAt || new Date().toISOString(),
        }))
      )
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  return (
    <li className="nav-item notification-nav-item" ref={panelRef}>
      <button
        type="button"
        className={`nav-link webapp-nav-link notification-nav-btn${open ? ' active' : ''}`}
        onClick={handleToggle}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
      >
        <i className="bi bi-bell-fill me-lg-1"></i>
        <span className="d-none d-sm-inline">Notifications</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-panel" role="menu" aria-label="Notifications">
          <div className="notification-panel-header">
            <h2>Notifications</h2>
            {unreadCount > 0 && (
              <button type="button" className="notification-mark-all" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div className="notification-panel-loading text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading notifications...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <p className="notification-panel-empty webapp-muted">No notifications yet.</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((notification) => {
                const photoUrl = notification.actor?.profilePhoto?.url
                const profilePath = notification.actor?.username
                  ? `/app/profile/${notification.actor.username}`
                  : '/app/profile'

                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      className={`notification-item${notification.readAt ? '' : ' unread'}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <Link
                        to={profilePath}
                        className="notification-avatar-link"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span className="notification-avatar">
                          {photoUrl ? (
                            <img src={photoUrl} alt="" />
                          ) : (
                            <i className="bi bi-person-fill" aria-hidden="true"></i>
                          )}
                        </span>
                      </Link>
                      <span className="notification-body">
                        <span className="notification-text">
                          <strong>{notification.actor?.fullName || notification.actor?.username}</strong>
                          {` ${getNotificationActionText(notification.type)}`}
                        </span>
                        {notification.preview && (
                          <span className="notification-preview">
                            {notification.type === 'mention' ||
                            notification.type === 'friend_post' ||
                            notification.type === 'friend_comment'
                              ? `\u201c${notification.preview}\u201d`
                              : notification.preview}
                          </span>
                        )}
                        <span className="notification-time">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

export default NotificationPanel
