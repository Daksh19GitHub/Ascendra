import { JOB_LISTING_OPEN_DAYS, MS_PER_DAY } from '../constants/jobListing.js'

export function getDefaultJobClosesAt(fromDate = new Date()) {
  return new Date(fromDate.getTime() + JOB_LISTING_OPEN_DAYS * MS_PER_DAY)
}

export function parseJobDateInput(value, boundary = 'start') {
  if (!value || typeof value !== 'string') {
    return null
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  if (boundary === 'end') {
    date.setUTCHours(23, 59, 59, 999)
  } else {
    date.setUTCHours(0, 0, 0, 0)
  }

  return date
}

export function formatJobDateInput(date) {
  if (!date) return ''
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ''

  const year = value.getUTCFullYear()
  const month = String(value.getUTCMonth() + 1).padStart(2, '0')
  const day = String(value.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function validateJobListingDates({ postType, jobStartsAt, jobClosesAt, existingPost = null }) {
  if (postType !== 'job') {
    return { jobStartsAt: null, jobClosesAt: null }
  }

  const startsAtInput = jobStartsAt ?? formatJobDateInput(existingPost?.jobStartsAt)
  const closesAtInput = jobClosesAt ?? formatJobDateInput(existingPost?.jobClosesAt)

  if (!startsAtInput || !closesAtInput) {
    return {
      error: {
        status: 400,
        message: 'Job openings require a start date and an end date.',
      },
    }
  }

  const parsedStartsAt = parseJobDateInput(startsAtInput, 'start')
  const parsedClosesAt = parseJobDateInput(closesAtInput, 'end')

  if (!parsedStartsAt || !parsedClosesAt) {
    return {
      error: {
        status: 400,
        message: 'Use valid calendar dates in YYYY-MM-DD format.',
      },
    }
  }

  if (parsedClosesAt.getTime() < parsedStartsAt.getTime()) {
    return {
      error: {
        status: 400,
        message: 'Job end date must be on or after the start date.',
      },
    }
  }

  return {
    jobStartsAt: parsedStartsAt,
    jobClosesAt: parsedClosesAt,
  }
}

export function buildActiveJobListingFilter(now = new Date()) {
  return {
    postType: 'job',
    repostOf: null,
    jobStatus: 'open',
    jobStartsAt: { $lte: now },
    jobClosesAt: { $gt: now },
  }
}

export function buildRecommendedJobListingFilter(now = new Date()) {
  return {
    postType: 'job',
    repostOf: null,
    jobStatus: 'open',
    jobClosesAt: { $gt: now },
  }
}

export function getJobListingPhase(post, now = new Date()) {
  if (!post || post.postType !== 'job') return null
  if (post.jobStatus === 'closed') return 'closed'

  const startsAt = post.jobStartsAt ? new Date(post.jobStartsAt) : null
  const closesAt = post.jobClosesAt ? new Date(post.jobClosesAt) : null
  const nowMs = now.getTime()

  if (!startsAt || !closesAt) return 'invalid'
  if (nowMs < startsAt.getTime()) return 'scheduled'
  if (nowMs > closesAt.getTime()) return 'expired'
  return 'open'
}

export function isJobListingActive(post, now = new Date()) {
  return getJobListingPhase(post, now) === 'open'
}

export function normalizeJobStatus(value) {
  return value === 'closed' ? 'closed' : 'open'
}

export function resolveJobListingFields({
  postType,
  jobStatus,
  jobStartsAt,
  jobClosesAt,
  existingPost = null,
}) {
  if (postType !== 'job') {
    return {
      jobStatus: 'open',
      jobStartsAt: null,
      jobClosesAt: null,
    }
  }

  const dateResult = validateJobListingDates({
    postType,
    jobStartsAt,
    jobClosesAt,
    existingPost,
  })

  if (dateResult.error) {
    return dateResult
  }

  return {
    jobStatus: normalizeJobStatus(
      jobStatus !== undefined ? jobStatus : existingPost?.jobStatus
    ),
    jobStartsAt: dateResult.jobStartsAt,
    jobClosesAt: dateResult.jobClosesAt,
  }
}
