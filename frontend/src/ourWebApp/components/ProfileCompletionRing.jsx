function ProfileCompletionRing({ percentage }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="profile-completion-ring" aria-label={`Profile ${percentage}% complete`}>
      <svg viewBox="0 0 120 120" role="img" aria-hidden="true">
        <circle className="profile-ring-bg" cx="60" cy="60" r={radius} />
        <circle
          className="profile-ring-progress"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="profile-ring-label">
        <span className="profile-ring-value">{percentage}%</span>
        <span className="profile-ring-text">Complete</span>
      </div>
    </div>
  )
}

export default ProfileCompletionRing
