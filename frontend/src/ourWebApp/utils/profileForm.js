export const emptyEducation = () => ({
  institution: '',
  degree: '',
  field: '',
  startYear: '',
  endYear: '',
  description: '',
})

export const emptyAchievement = () => ({
  title: '',
  description: '',
  year: '',
})

export const emptyWorkExperience = () => ({
  company: '',
  title: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
})

export function buildProfileForm(user) {
  const profile = user?.profile || {}

  return {
    fullName: profile.fullName || '',
    headline: profile.headline || '',
    address: {
      street: profile.address?.street || '',
      city: profile.address?.city || '',
      state: profile.address?.state || '',
      country: profile.address?.country || '',
      postalCode: profile.address?.postalCode || '',
    },
    education:
      profile.education?.length > 0
        ? profile.education.map((entry) => ({ ...emptyEducation(), ...entry }))
        : [emptyEducation()],
    skills: profile.skills?.length > 0 ? [...profile.skills] : [''],
    achievements:
      profile.achievements?.length > 0
        ? profile.achievements.map((entry) => ({ ...emptyAchievement(), ...entry }))
        : [emptyAchievement()],
    workExperience:
      profile.workExperience?.length > 0
        ? profile.workExperience.map((entry) => ({
            ...emptyWorkExperience(),
            ...entry,
          }))
        : [emptyWorkExperience()],
  }
}

export function sanitizeProfilePayload(form) {
  return {
    fullName: form.fullName.trim(),
    headline: form.headline.trim(),
    address: {
      street: form.address.street.trim(),
      city: form.address.city.trim(),
      state: form.address.state.trim(),
      country: form.address.country.trim(),
      postalCode: form.address.postalCode.trim(),
    },
    education: form.education
      .map((entry) => ({
        institution: entry.institution.trim(),
        degree: entry.degree.trim(),
        field: entry.field.trim(),
        startYear: entry.startYear.trim(),
        endYear: entry.endYear.trim(),
        description: entry.description.trim(),
      }))
      .filter((entry) => entry.institution),
    skills: form.skills.map((skill) => skill.trim()).filter(Boolean),
    achievements: form.achievements
      .map((entry) => ({
        title: entry.title.trim(),
        description: entry.description.trim(),
        year: entry.year.trim(),
      }))
      .filter((entry) => entry.title),
    workExperience: form.workExperience
      .map((entry) => ({
        company: entry.company.trim(),
        title: entry.title.trim(),
        startDate: entry.startDate.trim(),
        endDate: entry.endDate.trim(),
        current: Boolean(entry.current),
        description: entry.description.trim(),
      }))
      .filter((entry) => entry.company),
  }
}

function hasAddress(address) {
  return ['street', 'city', 'state', 'country', 'postalCode'].some((key) =>
    Boolean(address?.[key]?.trim())
  )
}

export function calculateProfileCompletion(user, form) {
  const profile = form || user?.profile || {}
  const address = form?.address || profile.address || {}

  const checks = [
    Boolean(user?.username?.trim()),
    Boolean(user?.email?.trim()),
    Boolean((form?.fullName ?? profile.fullName)?.trim()),
    Boolean((form?.headline ?? profile.headline)?.trim()),
    hasAddress(address),
    (form?.education || profile.education || []).some((entry) =>
      entry?.institution?.trim()
    ),
    (form?.skills || profile.skills || []).some((skill) => skill?.trim()),
    (form?.achievements || profile.achievements || []).some((entry) =>
      entry?.title?.trim()
    ),
    (form?.workExperience || profile.workExperience || []).some((entry) =>
      entry?.company?.trim()
    ),
    Boolean((user?.profile?.profilePhoto?.url || profile.profilePhoto?.url)?.trim()),
  ]

  const completed = checks.filter(Boolean).length
  return Math.round((completed / checks.length) * 100)
}
