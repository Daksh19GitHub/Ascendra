import Friendship from '../models/Friendship.js'

export async function findFriendshipBetween(userAId, userBId) {
  return Friendship.findOne({
    $or: [
      { requester: userAId, recipient: userBId },
      { requester: userBId, recipient: userAId },
    ],
  })
}

export async function areFriends(userAId, userBId) {
  const record = await findFriendshipBetween(userAId, userBId)
  return record?.status === 'accepted'
}

export async function countFriends(userId) {
  return Friendship.countDocuments({
    status: 'accepted',
    $or: [{ requester: userId }, { recipient: userId }],
  })
}

export async function getFriendshipContext(viewerId, profileUserId) {
  if (viewerId.toString() === profileUserId.toString()) {
    const [friendsCount, pendingIncomingCount] = await Promise.all([
      countFriends(viewerId),
      Friendship.countDocuments({ recipient: viewerId, status: 'pending' }),
    ])

    return {
      status: 'self',
      requestId: null,
      friendsCount,
      pendingIncomingCount,
    }
  }

  const record = await findFriendshipBetween(viewerId, profileUserId)

  if (!record) {
    return {
      status: 'none',
      requestId: null,
    }
  }

  if (record.status === 'accepted') {
    return {
      status: 'friends',
      requestId: record._id,
    }
  }

  if (record.requester.toString() === viewerId.toString()) {
    return {
      status: 'pending_sent',
      requestId: record._id,
    }
  }

  return {
    status: 'pending_received',
    requestId: record._id,
  }
}

export function mapUserToFriendJSON(user) {
  return {
    id: user._id,
    username: user.username,
    fullName: user.profile?.fullName || user.username,
    headline: user.profile?.headline || '',
    profilePhoto: user.profile?.profilePhoto || { url: '', publicId: '' },
  }
}

export async function getFriendIds(userId) {
  const friendships = await Friendship.find({
    status: 'accepted',
    $or: [{ requester: userId }, { recipient: userId }],
  }).select('requester recipient')

  return friendships.map((record) =>
    record.requester.toString() === userId.toString() ? record.recipient : record.requester
  )
}

export function getFriendUserFromRecord(record, currentUserId) {
  const otherUser =
    record.requester._id.toString() === currentUserId.toString()
      ? record.recipient
      : record.requester

  return mapUserToFriendJSON(otherUser)
}
