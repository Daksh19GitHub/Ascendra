import { Router } from 'express'
import { getAnalytics } from '../controllers/analyticsController.js'
import { chatWithAssistant } from '../controllers/assistantController.js'
import { getDashboard } from '../controllers/appController.js'
import { listConversations, getChatUnreadCount, listMessagesWithFriend } from '../controllers/chatController.js'
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notificationController.js'
import {
  acceptFriendRequest,
  cancelFriendRequest,
  getFriends,
  getPendingFriendRequests,
  getSentFriendRequests,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from '../controllers/friendController.js'
import { getFeed } from '../controllers/feedController.js'
import { getRecommendedJobs } from '../controllers/jobController.js'
import { createPost, deletePost, getMyPosts, getPostById, getUserPosts, updatePost } from '../controllers/postController.js'
import {
  addPostComment,
  deletePostComment,
  getPostComments,
  getPostReactions,
  getPostReposts,
  setPostReaction,
  togglePostRepost,
} from '../controllers/postEngagementController.js'
import { getProfile, getUserProfile, removeProfilePhoto, updateProfile, uploadProfilePhoto } from '../controllers/profileController.js'
import { searchUsers } from '../controllers/userController.js'
import {
  deleteAllSearchHistory,
  deleteSearchHistoryEntry,
  listSearchHistory,
  recordSearchHistory,
} from '../controllers/searchHistoryController.js'
import { protect } from '../middleware/authMiddleware.js'
import {
  commentValidation,
  deleteCommentValidation,
  postIdParamValidation,
  reactionValidation,
} from '../middleware/postEngagementValidation.js'
import { createPostValidation, updatePostValidation } from '../middleware/postValidation.js'
import { updateProfileValidation } from '../middleware/profileValidation.js'
import {
  requestIdParamValidation,
  usernameParamValidation,
} from '../middleware/friendValidation.js'
import { handleUploadError, uploadProfilePhoto as uploadPhotoMiddleware } from '../middleware/uploadMiddleware.js'
import { assistantChatValidation } from '../middleware/assistantValidation.js'
import { validate } from '../middleware/validate.js'

const router = Router()

router.use(protect)

router.get('/dashboard', getDashboard)
router.get('/analytics', getAnalytics)
router.post('/assistant/chat', assistantChatValidation, validate, chatWithAssistant)
router.get('/feed', getFeed)
router.get('/jobs/recommended', getRecommendedJobs)
router.get('/posts/mine', getMyPosts)
router.get('/posts/:id', postIdParamValidation, validate, getPostById)
router.post('/posts', createPostValidation, validate, createPost)
router.put('/posts/:id', updatePostValidation, validate, updatePost)
router.delete('/posts/:id', deletePost)
router.post('/posts/:id/reaction', reactionValidation, validate, setPostReaction)
router.get('/posts/:id/reactions', postIdParamValidation, validate, getPostReactions)
router.get('/posts/:id/reposts', postIdParamValidation, validate, getPostReposts)
router.post('/posts/:id/repost', postIdParamValidation, validate, togglePostRepost)
router.get('/posts/:id/comments', postIdParamValidation, validate, getPostComments)
router.post('/posts/:id/comments', commentValidation, validate, addPostComment)
router.delete(
  '/posts/:id/comments/:commentId',
  deleteCommentValidation,
  validate,
  deletePostComment
)
router.get('/profile', getProfile)
router.get('/search-history', listSearchHistory)
router.post('/search-history', recordSearchHistory)
router.delete('/search-history', deleteAllSearchHistory)
router.delete('/search-history/:username', usernameParamValidation, validate, deleteSearchHistoryEntry)
router.get('/users/search', searchUsers)
router.get('/users/:username/posts', getUserPosts)
router.get('/users/:username', getUserProfile)
router.put('/profile', updateProfileValidation, validate, updateProfile)
router.post(
  '/profile/photo',
  (req, res, next) => {
    uploadPhotoMiddleware(req, res, (err) => {
      if (err) return handleUploadError(err, req, res, next)
      next()
    })
  },
  uploadProfilePhoto
)
router.delete('/profile/photo', removeProfilePhoto)
router.get('/friends', getFriends)
router.get('/friends/requests/pending', getPendingFriendRequests)
router.get('/friends/requests/sent', getSentFriendRequests)
router.post('/friends/request/:username', usernameParamValidation, validate, sendFriendRequest)
router.post('/friends/requests/:id/accept', requestIdParamValidation, validate, acceptFriendRequest)
router.post('/friends/requests/:id/reject', requestIdParamValidation, validate, rejectFriendRequest)
router.delete('/friends/requests/:id', requestIdParamValidation, validate, cancelFriendRequest)
router.delete('/friends/:username', usernameParamValidation, validate, removeFriend)
router.get('/chat/conversations', listConversations)
router.get('/chat/unread-count', getChatUnreadCount)
router.get('/chat/:username/messages', usernameParamValidation, validate, listMessagesWithFriend)
router.get('/notifications', getNotifications)
router.get('/notifications/unread-count', getUnreadNotificationCount)
router.post('/notifications/read-all', markAllNotificationsRead)
router.post('/notifications/:id/read', markNotificationRead)

export default router
