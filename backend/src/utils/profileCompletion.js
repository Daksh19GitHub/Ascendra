function hasAddress(address) {
  if (!address) return false
  return ['street', 'city', 'state', 'country', 'postalCode'].some(
    (key) => Boolean(address[key]?.trim())
  )
}

function hasEducation(education) {
  return (
    Array.isArray(education) &&
    education.some((entry) => Boolean(entry?.institution?.trim()))
  )
}

function hasWorkExperience(workExperience) {
  return (
    Array.isArray(workExperience) &&
    workExperience.some((entry) => Boolean(entry?.company?.trim()))
  )
}

function hasAchievements(achievements) {
  return (
    Array.isArray(achievements) &&
    achievements.some((entry) => Boolean(entry?.title?.trim()))
  )
}

function hasSkills(skills) {
  return Array.isArray(skills) && skills.some((skill) => Boolean(skill?.trim()))
}

export function calculateProfileCompletion(user) {
  const profile = user.profile || {}

  const checks = [
    Boolean(user.username?.trim()),
    Boolean(user.email?.trim()),
    Boolean(profile.fullName?.trim()),
    Boolean(profile.headline?.trim()),
    hasAddress(profile.address),
    hasEducation(profile.education),
    hasSkills(profile.skills),
    hasAchievements(profile.achievements),
    hasWorkExperience(profile.workExperience),
    Boolean(profile.profilePhoto?.url?.trim()),
  ]

  const completed = checks.filter(Boolean).length
  return Math.round((completed / checks.length) * 100)
}
