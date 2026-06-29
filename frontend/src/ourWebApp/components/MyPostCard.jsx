import { useState } from 'react'
import { deletePost, updatePost } from '../api/webAppApi'
import {
  formatJobDateInput,
  formatJobDateRange,
  getDefaultJobListingDates,
  getJobListingPhase,
} from '../utils/jobListingDates'
import FeedPostCard from './FeedPostCard'
import JobListingDateFields from './JobListingDateFields'
import MentionTextarea from './MentionTextarea'

function MyPostCard({ post, onUpdated, onDeleted, onError, onSuccess, onEngagementChange }) {
  const defaultJobDates = getDefaultJobListingDates()
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [editPostType, setEditPostType] = useState(post.postType || 'standard')
  const [editJobStartsAt, setEditJobStartsAt] = useState(
    formatJobDateInput(post.jobStartsAt) || defaultJobDates.jobStartsAt
  )
  const [editJobClosesAt, setEditJobClosesAt] = useState(
    formatJobDateInput(post.jobClosesAt) || defaultJobDates.jobClosesAt
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [togglingJobStatus, setTogglingJobStatus] = useState(false)
  const isRepost = Boolean(post.isRepost)
  const isJobPost = post.postType === 'job' && !isRepost
  const jobPhase = getJobListingPhase(post)

  const busy = saving || deleting || togglingJobStatus

  function startEdit() {
    setEditContent(post.content)
    setEditPostType(post.postType || 'standard')
    setEditJobStartsAt(formatJobDateInput(post.jobStartsAt) || defaultJobDates.jobStartsAt)
    setEditJobClosesAt(formatJobDateInput(post.jobClosesAt) || defaultJobDates.jobClosesAt)
    setEditing(true)
  }

  function cancelEdit() {
    setEditContent(post.content)
    setEditPostType(post.postType || 'standard')
    setEditJobStartsAt(formatJobDateInput(post.jobStartsAt) || defaultJobDates.jobStartsAt)
    setEditJobClosesAt(formatJobDateInput(post.jobClosesAt) || defaultJobDates.jobClosesAt)
    setEditing(false)
  }

  async function handleSave(e) {
    e.preventDefault()

    if (!editContent.trim()) {
      onError?.('Post content cannot be empty.')
      return
    }

    if (editPostType === 'job' && (!editJobStartsAt || !editJobClosesAt)) {
      onError?.('Choose a start date and end date for this job opening.')
      return
    }

    if (editPostType === 'job' && editJobClosesAt < editJobStartsAt) {
      onError?.('Job end date must be on or after the start date.')
      return
    }

    setSaving(true)
    onError?.('')

    try {
      const response = await updatePost(post.id, editContent.trim(), {
        postType: editPostType,
        ...(editPostType === 'job'
          ? {
              jobStartsAt: editJobStartsAt,
              jobClosesAt: editJobClosesAt,
            }
          : {}),
      })
      onUpdated?.(response.data.post)
      setEditing(false)
      onSuccess?.('Post updated successfully.')
    } catch (err) {
      onError?.(err.response?.data?.message || 'Failed to update post. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleJobStatus() {
    setTogglingJobStatus(true)
    onError?.('')

    try {
      const nextStatus = jobPhase === 'open' || jobPhase === 'scheduled' ? 'closed' : 'open'
      const response = await updatePost(post.id, post.content, {
        postType: post.postType,
        jobStatus: nextStatus,
        jobStartsAt: formatJobDateInput(post.jobStartsAt),
        jobClosesAt: formatJobDateInput(post.jobClosesAt),
      })
      onUpdated?.(response.data.post)
      onSuccess?.(
        nextStatus === 'closed' ? 'Job listing closed successfully.' : 'Job listing reopened successfully.'
      )
    } catch (err) {
      onError?.(err.response?.data?.message || 'Failed to update job listing status.')
    } finally {
      setTogglingJobStatus(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      isRepost
        ? 'Remove this repost from your profile?'
        : 'Delete this post? This cannot be undone.'
    )
    if (!confirmed) return

    setDeleting(true)
    onError?.('')

    try {
      await deletePost(post.id)
      onDeleted?.(post.id)
      onSuccess?.(isRepost ? 'Repost removed successfully.' : 'Post deleted successfully.')
    } catch (err) {
      onError?.(
        err.response?.data?.message ||
          (isRepost ? 'Failed to remove repost. Please try again.' : 'Failed to delete post. Please try again.')
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="my-post-card">
      {editing ? (
        <form className="compose-post-card my-post-edit-form" onSubmit={handleSave}>
          <h2>Edit post</h2>
          <div className="compose-post-type-toggle" role="group" aria-label="Post type">
            <button
              type="button"
              className={`compose-post-type-btn${editPostType === 'standard' ? ' active' : ''}`}
              onClick={() => setEditPostType('standard')}
              disabled={busy}
            >
              <i className="bi bi-chat-left-text me-1"></i>
              Normal post
            </button>
            <button
              type="button"
              className={`compose-post-type-btn${editPostType === 'job' ? ' active' : ''}`}
              onClick={() => setEditPostType('job')}
              disabled={busy}
            >
              <i className="bi bi-briefcase me-1"></i>
              Job opening
            </button>
          </div>
          {editPostType === 'job' && (
            <JobListingDateFields
              idPrefix={`edit-job-${post.id}`}
              jobStartsAt={editJobStartsAt}
              jobClosesAt={editJobClosesAt}
              onJobStartsAtChange={setEditJobStartsAt}
              onJobClosesAtChange={setEditJobClosesAt}
              disabled={busy}
            />
          )}
          <MentionTextarea
            className="form-control compose-post-input"
            rows={4}
            placeholder="Edit your post... Use @ to mention someone"
            value={editContent}
            onChange={(event) => setEditContent(event.target.value)}
            disabled={busy}
            maxLength={2000}
          />
          <div className="compose-post-footer">
            <span className="webapp-muted">{editContent.length}/2000</span>
            <div className="my-post-edit-actions">
              <button
                type="button"
                className="btn btn-sm btn-profile-remove"
                onClick={cancelEdit}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-profile-save"
                disabled={busy || !editContent.trim()}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <FeedPostCard post={post} isOwnPost onEngagementChange={onEngagementChange} />
          {isJobPost && (
            <div className="my-post-job-status">
              {jobPhase === 'open' && (
                <span className="job-listing-status-badge job-listing-status-open">
                  Open · {formatJobDateRange(post.jobStartsAt, post.jobClosesAt)}
                </span>
              )}
              {jobPhase === 'scheduled' && (
                <span className="job-listing-status-badge job-listing-status-scheduled">
                  Scheduled · {formatJobDateRange(post.jobStartsAt, post.jobClosesAt)}
                </span>
              )}
              {jobPhase === 'closed' && (
                <span className="job-listing-status-badge job-listing-status-closed">
                  Closed · {formatJobDateRange(post.jobStartsAt, post.jobClosesAt)}
                </span>
              )}
              {jobPhase === 'expired' && (
                <span className="job-listing-status-badge job-listing-status-expired">
                  Expired · {formatJobDateRange(post.jobStartsAt, post.jobClosesAt)}
                </span>
              )}
            </div>
          )}
          <div className="my-post-actions">
            {!isRepost && (
              <button
                type="button"
                className="btn btn-sm btn-profile-add"
                onClick={startEdit}
                disabled={busy}
              >
                <i className="bi bi-pencil me-1"></i>
                Edit
              </button>
            )}
            {isJobPost && jobPhase !== 'invalid' && (
              <button
                type="button"
                className="btn btn-sm btn-profile-add"
                onClick={handleToggleJobStatus}
                disabled={busy}
              >
                <i className={`bi ${jobPhase === 'open' || jobPhase === 'scheduled' ? 'bi-x-circle' : 'bi-arrow-repeat'} me-1`}></i>
                {togglingJobStatus
                  ? 'Updating...'
                  : jobPhase === 'open' || jobPhase === 'scheduled'
                    ? 'Close listing'
                    : 'Reopen listing'}
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-my-post-danger"
              onClick={handleDelete}
              disabled={busy}
            >
              <i className={`bi ${isRepost ? 'bi-repeat' : 'bi-trash'} me-1`}></i>
              {deleting ? (isRepost ? 'Removing...' : 'Deleting...') : isRepost ? 'Remove repost' : 'Delete'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default MyPostCard
