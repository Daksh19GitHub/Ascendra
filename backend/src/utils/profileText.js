export function buildProfileMatchingText(user) {
  const profile = user?.profile || {}
  const parts = []

  if (profile.fullName?.trim()) {
    parts.push(`Name: ${profile.fullName.trim()}`)
  }

  if (profile.headline?.trim()) {
    parts.push(`Headline: ${profile.headline.trim()}`)
  }

  const skills = (profile.skills || []).filter((skill) => skill?.trim())
  if (skills.length) {
    parts.push(`Skills: ${skills.join(', ')}`)
  }

  for (const entry of profile.education || []) {
    const educationParts = [
      entry.degree,
      entry.field,
      entry.institution,
      entry.description,
    ].filter((value) => value?.trim())

    if (educationParts.length) {
      parts.push(`Education: ${educationParts.join('. ')}`)
    }
  }

  for (const entry of profile.workExperience || []) {
    const workParts = [entry.title, entry.company, entry.description].filter((value) => value?.trim())

    if (workParts.length) {
      parts.push(`Experience: ${workParts.join('. ')}`)
    }
  }

  for (const entry of profile.achievements || []) {
    const achievementParts = [entry.title, entry.description].filter((value) => value?.trim())

    if (achievementParts.length) {
      parts.push(`Achievement: ${achievementParts.join('. ')}`)
    }
  }

  return parts.join('\n')
}

export function profileHasMatchingSignals(user) {
  const profile = user?.profile || {}

  const hasSkills = (profile.skills || []).some((skill) => skill?.trim())
  const hasEducation = (profile.education || []).some((entry) => entry?.institution?.trim())
  const hasWork = (profile.workExperience || []).some((entry) => entry?.company?.trim())

  return hasSkills || hasEducation || hasWork
}
