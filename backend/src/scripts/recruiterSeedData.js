import {
  CITIES,
  COMPANIES,
  FIRST_NAMES,
  LAST_NAMES,
  UNIVERSITIES,
} from './demoSeedData.js'
import { buildRecruiterHeadline } from '../utils/profileHeadline.js'

const JOB_ROLES = [
  'Software Engineer Intern',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst Intern',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'QA Engineer',
  'Product Analyst',
  'Business Analyst',
  'UI/UX Designer',
  'Android Developer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'Technical Program Manager Intern',
]

const REQUIRED_SKILLS = [
  ['JavaScript', 'React', 'Node.js', 'MongoDB'],
  ['Python', 'SQL', 'Data Analysis', 'Excel'],
  ['Java', 'Spring Boot', 'REST APIs', 'Git'],
  ['React', 'TypeScript', 'CSS', 'HTML'],
  ['Node.js', 'Express', 'MongoDB', 'System Design basics'],
  ['Python', 'Machine Learning', 'Pandas', 'Statistics'],
  ['AWS', 'Docker', 'Linux', 'CI/CD'],
  ['Manual Testing', 'Automation', 'Selenium', 'API Testing'],
  ['Figma', 'UI Design', 'Prototyping', 'User Research'],
  ['Kotlin', 'Android', 'Firebase', 'REST APIs'],
  ['C++', 'DSA', 'OOP', 'Problem Solving'],
  ['Go', 'Microservices', 'Kubernetes', 'SQL'],
  ['Network Security', 'Linux', 'Python', 'Incident Response'],
  ['Communication', 'Agile', 'Documentation', 'Stakeholder Management'],
  ['React Native', 'JavaScript', 'Mobile UI', 'API Integration'],
]

const ELIGIBILITY_OPTIONS = [
  'Open to final-year students and recent graduates (2024–2026) with strong fundamentals.',
  'Candidates pursuing B.Tech/BE in CS, IT, or related branches. CGPA 7.0+ preferred.',
  'Students in pre-final or final year with at least one internship or major project.',
  'Graduates within 2 years with portfolio projects and willingness to relocate.',
  'Open to MBA/BBA graduates interested in analytics and product operations.',
  'Final-year students available for a 6-month internship starting immediately.',
  'Recent graduates with good DSA, CS fundamentals, and communication skills.',
  'Engineering students with hands-on experience in the required tech stack.',
]

function pick(arr, index) {
  return arr[index % arr.length]
}

function slugifyCompany(company) {
  return company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function buildRecruiterUser(num) {
  const index = num - 101
  const firstName = pick(FIRST_NAMES, index + 40)
  const lastName = pick(LAST_NAMES, index * 9)
  const location = pick(CITIES, index * 3)
  const company = pick(COMPANIES, index * 7)
  const university = pick(UNIVERSITIES, index * 5)
  const field = pick(
    ['Human Resources', 'Talent Acquisition', 'Engineering Leadership', 'Campus Recruitment'],
    index
  )
  const title = pick(
    ['Talent Acquisition Partner', 'Senior Recruiter', 'Campus Hiring Lead', 'Engineering Manager'],
    index
  )
  const role = pick(JOB_ROLES, index)
  const skills = pick(REQUIRED_SKILLS, index)
  const handle = `ad${num}`

  return {
    username: handle,
    email: `${handle}@gmail.com`,
    password: `${handle}@ascendra`,
    isDemo: true,
    profile: {
      fullName: `${firstName} ${lastName}`,
      headline: buildRecruiterHeadline(company),
      address: {
        street: `${200 + num} Hiring Lane`,
        city: location.city,
        state: location.state,
        country: location.country,
        postalCode: `${500000 + num}`,
      },
      education: [
        {
          institution: university,
          degree: pick(['MBA', 'BBA', 'M.Tech', 'B.Tech'], index),
          field,
          startYear: String(2010 + (index % 6)),
          endYear: String(2014 + (index % 6)),
          description: 'Focused on organizational behavior, hiring strategy, and people operations.',
        },
      ],
      skills: [
        ...skills.slice(0, 2),
        'Campus Hiring',
        'Interviewing',
        'Employer Branding',
        'Communication',
      ],
      achievements: [
        {
          title: 'Top Campus Recruiter',
          description: `Recognized for closing high-impact ${role} hires at ${company}.`,
          year: String(2023 + (index % 2)),
        },
        {
          title: 'Hiring Excellence Award',
          description: 'Led successful internship drives across multiple engineering colleges.',
          year: String(2022 + (index % 3)),
        },
      ],
      workExperience: [
        {
          company,
          title,
          startDate: `Jan ${2018 + (index % 4)}`,
          endDate: '',
          current: true,
          description:
            'Own end-to-end hiring for early-career roles, partner with hiring managers, and mentor candidates through the interview process.',
        },
        {
          company: pick(COMPANIES, index * 11 + 3),
          title: pick(['Recruiter', 'HR Associate', 'Talent Specialist'], index),
          startDate: `Jun ${2014 + (index % 4)}`,
          endDate: `Dec ${2017 + (index % 4)}`,
          current: false,
          description: 'Managed candidate pipelines, screening, and offer coordination for technical roles.',
        },
      ],
      profilePhoto: { url: '', publicId: '' },
    },
    company,
    role,
    skills,
    eligibility: pick(ELIGIBILITY_OPTIONS, index),
  }
}

export function buildJobOpeningPost(userData, num) {
  const companySlug = slugifyCompany(userData.company)
  const skillsList = userData.skills.join(', ')
  const applyUrl = `https://careers.${companySlug}.example.com/apply/ascendra-${num}`

  return {
    content: `Hiring alert from ${userData.company}!

We are opening a ${userData.role} position on my team.

Required skills: ${skillsList}

Eligibility: ${userData.eligibility}

If you are interested, apply here: ${applyUrl}

Happy to answer questions from students and early-career professionals on Ascendra.`,
  }
}
