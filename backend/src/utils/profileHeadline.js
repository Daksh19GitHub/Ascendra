const STUDENT_YEAR_LABELS = ['1st Year', '2nd Year', '3rd Year', 'Final Year']

export const STUDENT_COLLEGES = [
  'NSUT',
  'IIT Bombay',
  'IIT Delhi',
  'BITS Pilani',
  'NIT Trichy',
  'Delhi University',
  'Anna University',
  'DTU',
  'VIT Vellore',
  'IIIT Delhi',
  'Stanford University',
  'MIT',
  'UC Berkeley',
  'Oxford University',
]

function pick(arr, index) {
  return arr[index % arr.length]
}

export function buildStudentHeadline(index, { university, persona, role, company } = {}) {
  const college = university || pick(STUDENT_COLLEGES, index)
  const yearLabel = pick(STUDENT_YEAR_LABELS, index)

  if (persona === 2 && role && company) {
    return `${role} at ${company}`
  }

  if (persona === 0) {
    return `${yearLabel} B.Tech Student at ${college}`
  }

  if (persona === 1) {
    return `${yearLabel} Student at ${college}`
  }

  return `${yearLabel} Student at ${college}`
}

export function buildRecruiterHeadline(company) {
  return `Recruiter at ${company}`
}

export function parseDemoUserNumber(username) {
  const match = /^ad(\d+)$/i.exec(username?.trim() || '')
  return match ? Number(match[1]) : null
}
