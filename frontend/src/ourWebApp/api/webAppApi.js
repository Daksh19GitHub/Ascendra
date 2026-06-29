import api from '../../api/axios'

export async function fetchAppDashboard() {
  const { data } = await api.get('/app/dashboard')
  return data
}

export async function fetchAnalytics() {
  const { data } = await api.get('/app/analytics')
  return data
}

export async function fetchFeed({ page = 1, limit = 25 } = {}) {
  const { data } = await api.get('/app/feed', { params: { page, limit } })
  return data
}

export async function fetchRecommendedJobs({ page = 1, limit = 25 } = {}) {
  const { data } = await api.get('/app/jobs/recommended', { params: { page, limit } })
  return data
}

export async function fetchPost(postId) {
  const { data } = await api.get(`/app/posts/${postId}`)
  return data
}

export async function fetchMyPosts() {
  const { data } = await api.get('/app/posts/mine')
  return data
}

export async function createPost(content, postType = 'standard', jobListing = {}) {
  const payload = { content, postType }
  if (postType === 'job') {
    payload.jobStartsAt = jobListing.jobStartsAt
    payload.jobClosesAt = jobListing.jobClosesAt
  }
  const { data } = await api.post('/app/posts', payload)
  return data
}

export async function updatePost(postId, content, options = {}) {
  const payload = { content }
  if (options.postType !== undefined) {
    payload.postType = options.postType
  }
  if (options.jobStatus !== undefined) {
    payload.jobStatus = options.jobStatus
  }
  if (options.jobStartsAt !== undefined) {
    payload.jobStartsAt = options.jobStartsAt
  }
  if (options.jobClosesAt !== undefined) {
    payload.jobClosesAt = options.jobClosesAt
  }
  const { data } = await api.put(`/app/posts/${postId}`, payload)
  return data
}

export async function deletePost(postId) {
  const { data } = await api.delete(`/app/posts/${postId}`)
  return data
}

export async function fetchProfile() {
  const { data } = await api.get('/app/profile')
  return data
}

export async function fetchUserProfile(username) {
  const { data } = await api.get(`/app/users/${encodeURIComponent(username)}`)
  return data
}

export async function fetchUserPosts(username) {
  const { data } = await api.get(`/app/users/${encodeURIComponent(username)}/posts`)
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.put('/app/profile', payload)
  return data
}

export async function uploadProfilePhoto(file) {
  const formData = new FormData()
  formData.append('photo', file)
  const { data } = await api.post('/app/profile/photo', formData)
  return data
}

export async function removeProfilePhoto() {
  const { data } = await api.delete('/app/profile/photo')
  return data
}

export async function setPostReaction(postId, type) {
  const { data } = await api.post(`/app/posts/${postId}/reaction`, { type })
  return data
}

export async function fetchPostReactions(postId) {
  const { data } = await api.get(`/app/posts/${postId}/reactions`)
  return data
}

export async function fetchPostReposts(postId) {
  const { data } = await api.get(`/app/posts/${postId}/reposts`)
  return data
}

export async function togglePostRepost(postId) {
  const { data } = await api.post(`/app/posts/${postId}/repost`)
  return data
}

export async function fetchPostComments(postId) {
  const { data } = await api.get(`/app/posts/${postId}/comments`)
  return data
}

export async function addPostComment(postId, content, parentCommentId = null) {
  const payload = { content }
  if (parentCommentId) {
    payload.parentCommentId = parentCommentId
  }
  const { data } = await api.post(`/app/posts/${postId}/comments`, payload)
  return data
}

export async function deletePostComment(postId, commentId) {
  const { data } = await api.delete(`/app/posts/${postId}/comments/${commentId}`)
  return data
}

export async function fetchFriends() {
  const { data } = await api.get('/app/friends')
  return data
}

export async function fetchPendingFriendRequests() {
  const { data } = await api.get('/app/friends/requests/pending')
  return data
}

export async function fetchSentFriendRequests() {
  const { data } = await api.get('/app/friends/requests/sent')
  return data
}

export async function sendFriendRequest(username) {
  const { data } = await api.post(`/app/friends/request/${encodeURIComponent(username)}`)
  return data
}

export async function acceptFriendRequest(requestId) {
  const { data } = await api.post(`/app/friends/requests/${requestId}/accept`)
  return data
}

export async function rejectFriendRequest(requestId) {
  const { data } = await api.post(`/app/friends/requests/${requestId}/reject`)
  return data
}

export async function cancelFriendRequest(requestId) {
  const { data } = await api.delete(`/app/friends/requests/${requestId}`)
  return data
}

export async function removeFriend(username) {
  const { data } = await api.delete(`/app/friends/${encodeURIComponent(username)}`)
  return data
}

export async function fetchChatConversations() {
  const { data } = await api.get('/app/chat/conversations')
  return data
}

export async function fetchChatUnreadCount() {
  const { data } = await api.get('/app/chat/unread-count')
  return data
}

export async function fetchChatMessages(username) {
  const { data } = await api.get(`/app/chat/${encodeURIComponent(username)}/messages`)
  return data
}

export async function searchUsers(query, limit = 8) {
  const { data } = await api.get('/app/users/search', {
    params: { q: query, limit },
  })
  return data
}

export async function fetchSearchHistory() {
  const { data } = await api.get('/app/search-history')
  return data
}

export async function addSearchHistory(username) {
  const { data } = await api.post('/app/search-history', { username })
  return data
}

export async function removeSearchHistoryEntry(username) {
  const { data } = await api.delete(`/app/search-history/${encodeURIComponent(username)}`)
  return data
}

export async function clearSearchHistory() {
  const { data } = await api.delete('/app/search-history')
  return data
}

export async function fetchNotifications() {
  const { data } = await api.get('/app/notifications')
  return data
}

export async function fetchUnreadNotificationCount() {
  const { data } = await api.get('/app/notifications/unread-count')
  return data
}

export async function markNotificationRead(notificationId) {
  const { data } = await api.post(`/app/notifications/${notificationId}/read`)
  return data
}

export async function markAllNotificationsRead() {
  const { data } = await api.post('/app/notifications/read-all')
  return data
}

export async function sendAssistantMessage(messages) {
  const { data } = await api.post('/app/assistant/chat', { messages })
  return data
}
