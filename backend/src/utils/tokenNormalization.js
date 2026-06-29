const SHORT_TOKEN_WHITELIST = new Set(['ai', 'ml', 'cs', 'js', 'ts', 'ui', 'ux', 'os', 'db', 'qa', 'hr', 'io'])

const TOKEN_ALIASES = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  cs: 'computerscience',
  ai: 'artificialintelligence',
  ml: 'machinelearning',
  dl: 'deeplearning',
  nlp: 'naturallanguageprocessing',
  dsa: 'dsa',
  db: 'database',
  sql: 'sql',
  nosql: 'database',
  mongo: 'mongodb',
  mongodb: 'mongodb',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  reactjs: 'react',
  react: 'react',
  node: 'nodejs',
  nodejs: 'nodejs',
  expressjs: 'express',
  express: 'express',
  nextjs: 'nextjs',
  next: 'nextjs',
  vuejs: 'vue',
  vue: 'vue',
  angularjs: 'angular',
  angular: 'angular',
  devops: 'devops',
  internship: 'internship',
  internships: 'internship',
  intern: 'internship',
  fullstack: 'fullstack',
  frontend: 'frontend',
  backend: 'backend',
  resume: 'resume',
  cv: 'resume',
  job: 'job',
  jobs: 'job',
  hire: 'hiring',
  hiring: 'hiring',
  placed: 'placement',
  placement: 'placement',
  cpp: 'cpp',
  'c++': 'cpp',
  golang: 'golang',
  go: 'golang',
  k8s: 'kubernetes',
  kubernetes: 'kubernetes',
  aws: 'aws',
  azure: 'azure',
  gcp: 'gcp',
}

function preprocessRawText(text) {
  return text
    .toLowerCase()
    .replace(/c\+\+/gi, ' cpp ')
    .replace(/c\s*#/gi, ' csharp ')
    .replace(/f\s*#/gi, ' fsharp ')
    .replace(/\.net/gi, ' dotnet ')
    .replace(/[^a-z0-9\s#+]/g, ' ')
}

export function stemToken(token) {
  if (!token || token.length <= 3) return token

  if (token.endsWith('ies') && token.length > 4) {
    return `${token.slice(0, -3)}y`
  }

  if (token.endsWith('ings') && token.length > 6) {
    return token.slice(0, -4)
  }

  if (token.endsWith('ing') && token.length > 5) {
    return token.slice(0, -3)
  }

  if (token.endsWith('ed') && token.length > 4) {
    return token.slice(0, -2)
  }

  if (token.endsWith('es') && token.length > 4) {
    return token.slice(0, -2)
  }

  if (token.endsWith('s') && !token.endsWith('ss') && token.length > 4) {
    return token.slice(0, -1)
  }

  return token
}

export function normalizeToken(rawToken) {
  if (!rawToken) return ''

  let token = rawToken.toLowerCase().trim()
  if (!token) return ''

  if (TOKEN_ALIASES[token]) {
    token = TOKEN_ALIASES[token]
  }

  token = stemToken(token)

  if (TOKEN_ALIASES[token]) {
    token = TOKEN_ALIASES[token]
  }

  return token
}

export function isValidNormalizedToken(token) {
  if (!token) return false
  if (token.length >= 3) return true
  return SHORT_TOKEN_WHITELIST.has(token)
}

export function splitRawTokens(text) {
  return preprocessRawText(text).split(/\s+/).map((token) => token.trim()).filter(Boolean)
}

export { SHORT_TOKEN_WHITELIST, TOKEN_ALIASES }
