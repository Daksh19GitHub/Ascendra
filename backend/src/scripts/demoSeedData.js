export const FIRST_NAMES = [
  'Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Sneha', 'Arjun', 'Meera',
  'Kabir', 'Isha', 'Dev', 'Nisha', 'Rahul', 'Kavya', 'Aditya', 'Pooja',
  'Nikhil', 'Shruti', 'Karan', 'Divya', 'Amit', 'Neha', 'Suresh', 'Lakshmi',
  'Harish', 'Tanvi', 'Manoj', 'Ritu', 'Sanjay', 'Anjali', 'Vivek', 'Sonia',
  'Gaurav', 'Preeti', 'Ashok', 'Deepa', 'Rajesh', 'Maya', 'Vinod', 'Kiran',
  'Mohit', 'Swati', 'Pranav', 'Aisha', 'Yash', 'Fatima', 'Harsh', 'Zara',
  'Ibrahim', 'Nadia', 'Ethan', 'Chloe', 'Noah', 'Emma', 'Liam', 'Olivia',
  'Mason', 'Ava', 'Lucas', 'Sophia', 'Oliver', 'Mia', 'Elijah', 'Isabella',
  'James', 'Charlotte', 'Benjamin', 'Amelia', 'Henry', 'Harper', 'Alexander',
  'Evelyn', 'Daniel', 'Abigail', 'Matthew', 'Emily', 'Joseph', 'Elizabeth',
  'David', 'Sofia', 'Jackson', 'Avery', 'Sebastian', 'Ella', 'Jack', 'Scarlett',
  'Owen', 'Grace', 'Samuel', 'Victoria', 'John', 'Riley', 'Dylan', 'Aria',
  'Nathan', 'Lily', 'Isaac', 'Aurora', 'Ryan', 'Zoey', 'Andrew', 'Penelope',
]

export const LAST_NAMES = [
  'Sharma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Iyer', 'Nair',
  'Mehta', 'Joshi', 'Kapoor', 'Malhotra', 'Chopra', 'Bansal', 'Agarwal',
  'Verma', 'Das', 'Roy', 'Mukherjee', 'Chatterjee', 'Pillai', 'Menon',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
]

export const CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
  { city: 'Delhi', state: 'Delhi', country: 'India' },
  { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  { city: 'Pune', state: 'Maharashtra', country: 'India' },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  { city: 'Kolkata', state: 'West Bengal', country: 'India' },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  { city: 'San Francisco', state: 'California', country: 'USA' },
  { city: 'New York', state: 'New York', country: 'USA' },
  { city: 'London', state: 'England', country: 'UK' },
  { city: 'Toronto', state: 'Ontario', country: 'Canada' },
  { city: 'Singapore', state: 'Singapore', country: 'Singapore' },
  { city: 'Dubai', state: 'Dubai', country: 'UAE' },
]

export const UNIVERSITIES = [
  'NSUT', 'IIT Bombay', 'IIT Delhi', 'BITS Pilani', 'NIT Trichy', 'Delhi University',
  'Anna University', 'Stanford University', 'MIT', 'UC Berkeley', 'Oxford University',
  'National University of Singapore', 'University of Toronto', 'Imperial College London',
]

export const COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Flipkart', 'Infosys', 'TCS', 'Accenture',
  'Deloitte', 'Goldman Sachs', 'McKinsey', 'Stripe', 'Shopify', 'Razorpay',
  'Zomato', 'Swiggy', 'Adobe', 'Salesforce', 'IBM', 'Oracle', 'Meta',
]

const SKILLS_POOL = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Data Analysis', 'Leadership',
  'Public Speaking', 'Project Management', 'UI/UX Design', 'SQL', 'MongoDB',
  'Machine Learning', 'Communication', 'Teamwork', 'Problem Solving',
  'Financial Modeling', 'Marketing', 'Sales', 'Product Strategy', 'Agile',
]

const INTERN_POSTS = [
  'Excited to start my summer internship at {company}! Grateful for the opportunity to learn from experienced mentors and contribute to real projects.',
  'Just wrapped up week one as a university intern. Balancing coursework and workplace learning is challenging, but incredibly rewarding.',
  'Networking tip for fellow students: reach out to alumni on Ascendra before applying — it made a huge difference for my {field} internship search.',
  'Completed my first sprint as an intern. Learning how professional teams collaborate has been eye-opening.',
  'Thrilled to share that I joined {company} as a {role} intern. Looking forward to growing my skills this semester.',
  'Reflecting on my internship journey: the best growth happens when you ask questions early and document what you learn.',
]

const PROFESSIONAL_POSTS = [
  'Five years in {field} taught me that consistency beats intensity. Small improvements compound over time.',
  'Proud of our team at {company} for shipping a major release this quarter. Collaboration across departments made it possible.',
  'Sharing a lesson from my career: clarity in communication saves more time than any productivity tool.',
  'Just mentored three junior colleagues this month. Giving back to the community that helped me grow feels incredible.',
  'Transitioned into a {role} role at {company}. Grateful for leaders who believed in my potential.',
  'Professional growth is not linear. Took a sideways move into {field} and it became my biggest career accelerator.',
  'Attended an industry conference and left with fresh ideas on leadership and innovation. Always keep learning.',
  'Our product hit 1M users this week. Thank you to every teammate who pushed through the hard sprints.',
]

const STUDENT_POSTS = [
  'Final-year {field} student here — actively looking for graduate roles. Open to connect with recruiters and peers.',
  'Led our university tech club this year and learned more about leadership than any textbook could teach.',
  'Just published my capstone project on {field}. Would love feedback from professionals in the space.',
  'Campus placement season is intense, but staying authentic in interviews has worked better than rehearsed answers.',
  'Grateful for professors who encouraged internships early. It changed how I approach my career path.',
]

import { buildStudentHeadline } from '../utils/profileHeadline.js'

function pick(arr, index) {
  return arr[index % arr.length]
}

function pickRandom(arr, seed) {
  return arr[seed % arr.length]
}

function pickSkills(index) {
  const count = 4 + (index % 4)
  const skills = []
  for (let i = 0; i < count; i += 1) {
    const skill = SKILLS_POOL[(index + i * 3) % SKILLS_POOL.length]
    if (!skills.includes(skill)) skills.push(skill)
  }
  return skills
}

export function buildDemoUser(index) {
  const num = index + 1
  const firstName = pick(FIRST_NAMES, index)
  const lastName = pick(LAST_NAMES, index * 7)
  const location = pick(CITIES, index * 5)
  const persona = index % 3
  const field =
    persona === 0
      ? pick(['Computer Science', 'Information Technology', 'Electronics'], index)
      : persona === 1
        ? pick(['Business Analytics', 'Finance', 'Marketing', 'Operations'], index)
        : pick(['Software Engineering', 'Product Management', 'Consulting', 'Design'], index)

  const company = pick(COMPANIES, index * 11)
  const university = pick(UNIVERSITIES, index * 13)
  const role =
    persona === 0
      ? pick(['Software Intern', 'Data Intern', 'Research Intern', 'Engineering Intern'], index)
      : persona === 1
        ? pick(['Analyst', 'Associate', 'Consultant', 'Product Analyst'], index)
        : pick(['Senior Engineer', 'Manager', 'Director', 'Lead Designer'], index)

  const profile = {
    fullName: `${firstName} ${lastName}`,
    headline: buildStudentHeadline(index, { university, persona, role, company }),
    address: {
      street: `${100 + num} Ascendra Avenue`,
      city: location.city,
      state: location.state,
      country: location.country,
      postalCode: `${400000 + num}`,
    },
    education: [
      {
        institution: university,
        degree: persona === 0 ? 'B.Tech' : persona === 1 ? 'BBA / MBA' : 'M.Tech / MBA',
        field,
        startYear: String(2016 + (index % 6)),
        endYear: String(2020 + (index % 6)),
        description:
          persona === 0
            ? 'Focused on practical projects, hackathons, and industry collaborations.'
            : 'Built strong foundations in strategy, analytics, and professional communication.',
      },
    ],
    skills: pickSkills(index),
    achievements: [
      {
        title: persona === 0 ? 'Dean\'s List' : 'Employee of the Quarter',
        description:
          persona === 0
            ? 'Recognized for academic excellence and campus leadership.'
            : `Awarded for impact at ${company} during a key product cycle.`,
        year: String(2022 + (index % 3)),
      },
      {
        title: persona === 2 ? 'Industry Speaker' : 'Hackathon Winner',
        description:
          persona === 2
            ? 'Invited to speak at a regional professional summit.'
            : 'Led a team to build a solution adopted by local startups.',
        year: String(2021 + (index % 4)),
      },
    ],
    workExperience: [
      {
        company,
        title: role,
        startDate: persona === 0 ? 'Jun 2024' : `Jan ${2018 + (index % 5)}`,
        endDate: persona === 0 ? 'Aug 2024' : '',
        current: persona !== 0,
        description:
          persona === 0
            ? 'Supported product development, documentation, and cross-team learning initiatives.'
            : 'Delivered projects, mentored juniors, and drove measurable business outcomes.',
      },
    ],
    profilePhoto: { url: '', publicId: '' },
  }

  if (persona === 2) {
    profile.workExperience.unshift({
      company: pick(COMPANIES, index * 17),
      title: pick(['Engineer', 'Analyst', 'Specialist'], index),
      startDate: `Mar ${2014 + (index % 4)}`,
      endDate: `Dec ${2017 + (index % 4)}`,
      current: false,
      description: 'Built core skills and learned to thrive in fast-paced teams.',
    })
  }

  const handle = `ad${num}`

  return {
    username: handle,
    email: `${handle}@gmail.com`,
    password: `${handle}@ascendra`,
    isDemo: true,
    profile,
    persona,
    field,
    company,
    role,
  }
}

export function buildDemoPosts(userData, index) {
  const templates =
    userData.persona === 0
      ? [...INTERN_POSTS, ...STUDENT_POSTS]
      : PROFESSIONAL_POSTS

  const postCount = 2 + (index % 3)
  const posts = []

  for (let i = 0; i < postCount; i += 1) {
    const template = pickRandom(templates, index + i * 9)
    const content = template
      .replaceAll('{company}', userData.company)
      .replaceAll('{field}', userData.field)
      .replaceAll('{role}', userData.role)

    posts.push({ content })
  }

  return posts
}
