import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username'
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
      })
    }

    const user = await User.create({ username, email, password })
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: user.toPublicJSON(),
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: user.toPublicJSON(),
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getMe(req, res) {
  res.json({
    success: true,
    data: {
      user: req.user.toPublicJSON(),
    },
  })
}
