import { buildUserAnalytics } from '../services/analyticsService.js'

export async function getAnalytics(req, res, next) {
  try {
    const analytics = await buildUserAnalytics(req.user._id)

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    res.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    next(error)
  }
}
