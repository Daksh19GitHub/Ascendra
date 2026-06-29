import User from '../models/User.js'

export async function searchUsers(req, res, next) {
  try {
    const query = (req.query.q || '').trim().toLowerCase()
    const limit = Math.min(Number(req.query.limit) || 8, 20)

    if (query.length < 1) {
      return res.json({
        success: true,
        data: { users: [] },
      })
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const filter = {
      $or: [
        { username: { $regex: `^${escaped}`, $options: 'i' } },
        { 'profile.fullName': { $regex: escaped, $options: 'i' } },
        { 'profile.headline': { $regex: escaped, $options: 'i' } },
      ],
    }

    if (req.user?._id) {
      filter._id = { $ne: req.user._id }
    }

    const users = await User.find(filter)
      .select('username profile.fullName profile.headline profile.profilePhoto')
      .limit(limit)

    res.json({
      success: true,
      data: {
        users: users.map((user) => ({
          id: user._id,
          username: user.username,
          fullName: user.profile?.fullName || user.username,
          headline: user.profile?.headline || '',
          profilePhoto: user.profile?.profilePhoto || { url: '', publicId: '' },
        })),
      },
    })
  } catch (error) {
    next(error)
  }
}
