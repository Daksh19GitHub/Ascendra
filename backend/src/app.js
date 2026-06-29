import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import './config/cloudinary.js'
import appRoutes from './routes/appRoutes.js'
import authRoutes from './routes/authRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json({ limit: '10kb' }))

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
  },
})

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Ascendra API is running' })
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/app', appRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

app.use(errorHandler)

export default app
