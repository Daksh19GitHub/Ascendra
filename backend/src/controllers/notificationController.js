import Notification from '../models/Notification.js'

export async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('actor')

    res.json({
      success: true,
      data: {
        notifications: notifications.map((entry) => entry.toPublicJSON(entry.actor)),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getUnreadNotificationCount(req, res, next) {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      readAt: null,
    })

    res.json({
      success: true,
      data: { count },
    })
  } catch (error) {
    next(error)
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      })
    }

    if (!notification.readAt) {
      notification.readAt = new Date()
      await notification.save()
    }

    res.json({
      success: true,
      data: {
        id: notification._id,
        readAt: notification.readAt,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    const readAt = new Date()

    await Notification.updateMany(
      { recipient: req.user._id, readAt: null },
      { $set: { readAt } }
    )

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { readAt },
    })
  } catch (error) {
    next(error)
  }
}
