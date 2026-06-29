import { JOB_LISTING_OPEN_DAYS } from '../constants/jobListing.js'

function pad(value) {
  return String(value).padStart(2, '0')
}

export function formatJobDateInput(date) {
  if (!date) return ''
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ''

  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}

export function getDefaultJobListingDates() {
  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + JOB_LISTING_OPEN_DAYS)

  return {
    jobStartsAt: formatJobDateInput(start),
    jobClosesAt: formatJobDateInput(end),
  }
}

export function formatJobDateRange(startDate, endDate) {
  const format = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  if (!startDate || !endDate) return ''
  return `${format(startDate)} – ${format(endDate)}`
}

export function getJobListingPhase(post, now = new Date()) {
  if (post?.postType !== 'job') return null
  if (post.jobStatus === 'closed') return 'closed'

  const startsAt = post.jobStartsAt ? new Date(post.jobStartsAt) : null
  const closesAt = post.jobClosesAt ? new Date(post.jobClosesAt) : null
  const nowMs = now.getTime()

  if (!startsAt || !closesAt) return 'invalid'
  if (nowMs < startsAt.getTime()) return 'scheduled'
  if (nowMs > closesAt.getTime()) return 'expired'
  return 'open'
}
