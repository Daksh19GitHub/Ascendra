import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

function getSocketUrl() {
  return import.meta.env.VITE_SOCKET_URL || window.location.origin
}

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setSocket((current) => {
        current?.disconnect()
        return null
      })
      setConnected(false)
      return undefined
    }

    const token = localStorage.getItem('ascendra_token')
    const nextSocket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    nextSocket.on('connect', () => setConnected(true))
    nextSocket.on('disconnect', () => setConnected(false))

    setSocket(nextSocket)

    return () => {
      nextSocket.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [isAuthenticated])

  const value = useMemo(
    () => ({
      socket,
      connected,
    }),
    [socket, connected]
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const context = useContext(SocketContext)

  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }

  return context
}
