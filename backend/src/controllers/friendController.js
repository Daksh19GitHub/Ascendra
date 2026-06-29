import Friendship from '../models/Friendship.js'
import User from '../models/User.js'
import {
  findFriendshipBetween,
  getFriendUserFromRecord,
  mapUserToFriendJSON,
} from '../utils/friendship.js'

async function findFriendshipById(requestId) {
  return Friendship.findById(requestId).populate('requester recipient')
}

export async function getFriends(req, res, next) {
  try {
    const friendships = await Friendship.find({
      status: 'accepted',
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    })
      .sort({ updatedAt: -1 })
      .populate('requester recipient')

    res.json({
      success: true,
      data: {
        friends: friendships.map((record) => ({
          id: record._id,
          user: getFriendUserFromRecord(record, req.user._id),
          friendsSince: record.updatedAt,
        })),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getPendingFriendRequests(req, res, next) {
  try {
    const requests = await Friendship.find({
      recipient: req.user._id,
      status: 'pending',
    })
      .sort({ createdAt: -1 })
      .populate('requester')

    res.json({
      success: true,
      data: {
        requests: requests.map((record) => ({
          id: record._id,
          user: mapUserToFriendJSON(record.requester),
          requestedAt: record.createdAt,
        })),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getSentFriendRequests(req, res, next) {
  try {
    const requests = await Friendship.find({
      requester: req.user._id,
      status: 'pending',
    })
      .sort({ createdAt: -1 })
      .populate('recipient')

    res.json({
      success: true,
      data: {
        requests: requests.map((record) => ({
          id: record._id,
          user: mapUserToFriendJSON(record.recipient),
          requestedAt: record.createdAt,
        })),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function sendFriendRequest(req, res, next) {
  try {
    const targetUser = await User.findOne({
      username: req.params.username.toLowerCase(),
    })

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a friend request to yourself',
      })
    }

    const existing = await findFriendshipBetween(req.user._id, targetUser._id)

    if (existing?.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'You are already friends',
      })
    }

    if (existing?.status === 'pending') {
      const message =
        existing.requester.toString() === req.user._id.toString()
          ? 'Friend request already sent'
          : 'This user has already sent you a friend request'

      return res.status(400).json({
        success: false,
        message,
      })
    }

    const request = await Friendship.create({
      requester: req.user._id,
      recipient: targetUser._id,
      status: 'pending',
    })

    res.status(201).json({
      success: true,
      message: 'Friend request sent',
      data: {
        requestId: request._id,
        friendship: {
          status: 'pending_sent',
          requestId: request._id,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function acceptFriendRequest(req, res, next) {
  try {
    const record = await findFriendshipById(req.params.id)

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found',
      })
    }

    if (record.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only accept requests sent to you',
      })
    }

    if (record.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This friend request is no longer pending',
      })
    }

    record.status = 'accepted'
    await record.save()

    res.json({
      success: true,
      message: 'Friend request accepted',
      data: {
        friend: mapUserToFriendJSON(record.requester),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function rejectFriendRequest(req, res, next) {
  try {
    const record = await Friendship.findById(req.params.id)

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found',
      })
    }

    if (record.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject requests sent to you',
      })
    }

    if (record.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This friend request is no longer pending',
      })
    }

    await record.deleteOne()

    res.json({
      success: true,
      message: 'Friend request rejected',
    })
  } catch (error) {
    next(error)
  }
}

export async function cancelFriendRequest(req, res, next) {
  try {
    const record = await Friendship.findById(req.params.id)

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found',
      })
    }

    if (record.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel requests you sent',
      })
    }

    if (record.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This friend request is no longer pending',
      })
    }

    await record.deleteOne()

    res.json({
      success: true,
      message: 'Friend request cancelled',
    })
  } catch (error) {
    next(error)
  }
}

export async function removeFriend(req, res, next) {
  try {
    const targetUser = await User.findOne({
      username: req.params.username.toLowerCase(),
    })

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const record = await findFriendshipBetween(req.user._id, targetUser._id)

    if (!record || record.status !== 'accepted') {
      return res.status(404).json({
        success: false,
        message: 'Friendship not found',
      })
    }

    await record.deleteOne()

    res.json({
      success: true,
      message: 'Friend removed',
    })
  } catch (error) {
    next(error)
  }
}
