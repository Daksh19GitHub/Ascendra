import { createServer } from 'http'
import { Server } from 'socket.io'
import './config/env.js'
import app from './app.js'
import { connectDB } from './config/db.js'
import { initSocket } from './socket/socket.js'
import { setIo } from './utils/socket.js'

const PORT = process.env.PORT || 5000
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

async function start() {
  try {
    await connectDB()

    const httpServer = createServer(app)
    const io = new Server(httpServer, {
      cors: {
        origin: clientUrl,
        credentials: true,
      },
    })

    initSocket(io)
    setIo(io)

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

start()
