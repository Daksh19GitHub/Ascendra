function UserHeadline({ headline, className = '' }) {
  if (!headline?.trim()) return null

  return (
    <p className={`profile-headline${className ? ` ${className}` : ''}`}>{headline.trim()}</p>
  )
}

export default UserHeadline
