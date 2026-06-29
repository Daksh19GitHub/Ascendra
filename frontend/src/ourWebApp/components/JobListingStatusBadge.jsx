import { formatJobDateRange, getJobListingPhase } from '../utils/jobListingDates'

const PHASE_CONFIG = {
  open: {
    className: 'job-listing-status-open',
    icon: 'bi-check-circle-fill',
    label: 'Open',
  },
  scheduled: {
    className: 'job-listing-status-scheduled',
    icon: 'bi-calendar-event',
    label: 'Scheduled',
  },
  closed: {
    className: 'job-listing-status-closed',
    icon: 'bi-x-circle-fill',
    label: 'Closed',
  },
  expired: {
    className: 'job-listing-status-expired',
    icon: 'bi-clock-history',
    label: 'Expired',
  },
}

function JobListingStatusBadge({ post, className = '' }) {
  if (post?.postType !== 'job') return null

  const phase = getJobListingPhase(post)
  const config = PHASE_CONFIG[phase]

  if (!config || !post.jobStartsAt || !post.jobClosesAt) return null

  return (
    <span className={`job-listing-status-badge ${config.className}${className ? ` ${className}` : ''}`}>
      <i className={`bi ${config.icon} me-1`}></i>
      {config.label} · {formatJobDateRange(post.jobStartsAt, post.jobClosesAt)}
    </span>
  )
}

export default JobListingStatusBadge
