import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { addPostComment, deletePostComment, fetchPostComments } from '../api/webAppApi'
import { MentionContent } from '../utils/mentionContent'
import MentionTextarea from './MentionTextarea'

function formatCommentDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function buildCommentTree(comments) {
  const map = new Map()
  const roots = []

  comments.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] })
  })

  map.forEach((comment) => {
    if (comment.parentCommentId && map.has(comment.parentCommentId)) {
      map.get(comment.parentCommentId).replies.push(comment)
    } else {
      roots.push(comment)
    }
  })

  return roots
}

function CommentItem({
  comment,
  depth,
  user,
  postId,
  onDelete,
  onReply,
  replyingToId,
  replyDraft,
  onReplyDraftChange,
  onSubmitReply,
  submittingReply,
  highlightCommentId,
}) {
  const photoUrl = comment.author?.profilePhoto?.url
  const profilePath = comment.author?.username
    ? `/app/profile/${comment.author.username}`
    : '/app/profile'
  const isOwnComment = String(comment.author?.id) === String(user?.id)
  const isReplyingHere = replyingToId === comment.id

  return (
    <li
      id={`comment-${comment.id}`}
      className={`post-comment-item${depth > 0 ? ' post-comment-item-reply' : ''}${highlightCommentId === comment.id ? ' post-comment-item-highlight' : ''}`}
    >
      <Link to={profilePath} className="post-comment-avatar-link">
        <div className="post-comment-avatar">
          {photoUrl ? (
            <img src={photoUrl} alt="" />
          ) : (
            <i className="bi bi-person-fill" aria-hidden="true"></i>
          )}
        </div>
      </Link>
      <div className="post-comment-body">
        <div className="post-comment-bubble">
          <Link to={profilePath} className="post-comment-author">
            {comment.author?.fullName || comment.author?.username}
          </Link>
          <p>
            <MentionContent content={comment.content} mentions={comment.mentions} />
          </p>
        </div>
        <div className="post-comment-meta">
          <span>{formatCommentDate(comment.createdAt)}</span>
          <button type="button" className="post-comment-reply" onClick={() => onReply(comment)}>
            Reply
          </button>
          {isOwnComment && (
            <button type="button" className="post-comment-delete" onClick={() => onDelete(comment.id)}>
              Delete
            </button>
          )}
        </div>

        {isReplyingHere && (
          <form
            className="post-comment-reply-form"
            onSubmit={(event) => {
              event.preventDefault()
              onSubmitReply(comment.id)
            }}
          >
            <MentionTextarea
              className="form-control post-comment-input"
              rows={2}
              placeholder={`Reply to @${comment.author?.username}...`}
              value={replyDraft}
              onChange={(event) => onReplyDraftChange(event.target.value)}
              disabled={submittingReply}
              maxLength={1000}
            />
            <div className="post-comment-form-footer">
              <button
                type="button"
                className="post-comment-cancel-reply"
                onClick={() => onReply(null)}
                disabled={submittingReply}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-profile-save"
                disabled={submittingReply || !replyDraft.trim()}
              >
                {submittingReply ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </form>
        )}

        {comment.replies?.length > 0 && (
          <ul className="post-comments-list post-comments-replies">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                user={user}
                postId={postId}
                onDelete={onDelete}
                onReply={onReply}
                replyingToId={replyingToId}
                replyDraft={replyDraft}
                onReplyDraftChange={onReplyDraftChange}
                onSubmitReply={onSubmitReply}
                submittingReply={submittingReply}
                highlightCommentId={highlightCommentId}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

function PostComments({
  postId,
  open,
  onEngagementChange,
  autoOpen = false,
  highlightCommentId = null,
}) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyDraft, setReplyDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittingReply, setSubmittingReply] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  const loadComments = useCallback(() => {
    setLoading(true)
    setError('')

    return fetchPostComments(postId)
      .then((response) => {
        setComments(response.data.comments || [])
        setLoaded(true)
      })
      .catch(() => {
        setError('Unable to load comments.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [postId])

  useEffect(() => {
    if ((!open && !autoOpen) || loaded) return
    loadComments()
  }, [open, autoOpen, loaded, loadComments])

  useEffect(() => {
    if (!loaded || !highlightCommentId || loading) return undefined

    const timer = setTimeout(() => {
      document.getElementById(`comment-${highlightCommentId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 220)

    return () => clearTimeout(timer)
  }, [loaded, highlightCommentId, loading, comments])

  useEffect(() => {
    setLoaded(false)
    setComments([])
    setReplyingTo(null)
    setReplyDraft('')
    setContent('')
  }, [postId])

  const commentTree = useMemo(() => buildCommentTree(comments), [comments])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!content.trim() || submitting) return

    setSubmitting(true)
    setError('')

    try {
      const response = await addPostComment(postId, content.trim())
      setComments((prev) => [...prev, response.data.comment])
      setContent('')
      onEngagementChange?.(postId, response.data.engagement)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmitReply(parentCommentId) {
    if (!replyDraft.trim() || submittingReply) return

    setSubmittingReply(true)
    setError('')

    try {
      const response = await addPostComment(postId, replyDraft.trim(), parentCommentId)
      setComments((prev) => [...prev, response.data.comment])
      setReplyDraft('')
      setReplyingTo(null)
      onEngagementChange?.(postId, response.data.engagement)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add reply.')
    } finally {
      setSubmittingReply(false)
    }
  }

  async function handleDelete(commentId) {
    const confirmed = window.confirm('Delete this comment and all replies?')
    if (!confirmed) return

    try {
      const response = await deletePostComment(postId, commentId)
      await loadComments()
      onEngagementChange?.(postId, response.data.engagement)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment.')
    }
  }

  function handleReply(comment) {
    if (!comment) {
      setReplyingTo(null)
      setReplyDraft('')
      return
    }

    setReplyingTo(comment)
    setReplyDraft(`@${comment.author?.username} `)
  }

  if (!open && !autoOpen) return null

  return (
    <section className="post-comments">
      {error && <div className="profile-alert profile-alert-error">{error}</div>}

      {!loading && comments.length === 0 && (
        <p className="post-comments-empty webapp-muted">No comments yet. Start the conversation.</p>
      )}

      {(loading || comments.length > 0) && (
        <div className="post-comments-scroll">
          {loading && (
            <div className="post-comments-loading text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading comments...</span>
              </div>
            </div>
          )}

          {!loading && (
            <ul className="post-comments-list">
              {commentTree.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  user={user}
                  postId={postId}
                  onDelete={handleDelete}
                  onReply={handleReply}
                  replyingToId={replyingTo?.id}
                  replyDraft={replyDraft}
                  onReplyDraftChange={setReplyDraft}
                  onSubmitReply={handleSubmitReply}
                  submittingReply={submittingReply}
                  highlightCommentId={highlightCommentId}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <form className="post-comment-form" onSubmit={handleSubmit}>
        <MentionTextarea
          className="form-control post-comment-input"
          rows={2}
          placeholder="Write a comment... Use @ to mention someone"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={submitting}
          maxLength={1000}
        />
        <div className="post-comment-form-footer">
          <span className="webapp-muted">{content.length}/1000</span>
          <button
            type="submit"
            className="btn btn-sm btn-profile-save"
            disabled={submitting || !content.trim()}
          >
            {submitting ? 'Posting...' : 'Post comment'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default PostComments
