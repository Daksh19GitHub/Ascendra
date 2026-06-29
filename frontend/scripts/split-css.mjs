import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'src')

function parseCssBlocks(css) {
  const blocks = []
  let i = 0

  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i += 1
    if (i >= css.length) break

    if (css[i] === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      const comment = css.slice(i, end + 2)
      blocks.push({ type: 'comment', content: comment })
      i = end + 2
      continue
    }

    const start = i
    let depth = 0
    let inString = false
    let stringChar = ''

    while (i < css.length) {
      const ch = css[i]

      if (inString) {
        if (ch === stringChar && css[i - 1] !== '\\') inString = false
        i += 1
        continue
      }

      if (ch === '"' || ch === "'") {
        inString = true
        stringChar = ch
        i += 1
        continue
      }

      if (ch === '{') depth += 1
      if (ch === '}') {
        depth -= 1
        if (depth === 0) {
          i += 1
          blocks.push({ type: 'rule', content: css.slice(start, i).trim() })
          break
        }
      }

      i += 1
    }
  }

  return blocks
}

function categorizeSelector(selectorText) {
  const s = selectorText.toLowerCase()

  if (s.includes(':root')) return 'variables'

  const checks = [
    ['ai-assistant', /\bai-assistant/],
    ['chat', /\bchat-/],
    ['analytics', /\banalytics-/],
    ['jobs', /\b(job-|jobs-page|job-recommendation)/],
    ['friends', /\b(friends-|friend-)/],
    ['posts', /\bcompose-/],
    [
      'feed',
      /\b(feed-|post-reactions|post-reposts|post-engagement|feed-load|feed-post|post-comments|post-content|post-action|reaction-picker|engagement-stat)/,
    ],
    ['notifications', /\bnotification-/],
    ['profile-search', /\bprofile-search/],
    ['profile', /\b(profile-|public-profile|mention-|webapp-profile-details)/],
    [
      'layout',
      /\bwebapp-(page|loading|navbar|nav|brand|main|body|sidebar|rail|hero|route|content|page-content|nav-search)/,
    ],
  ]

  for (const [category, pattern] of checks) {
    if (pattern.test(s)) return category
  }

  return 'shared'
}

function categorizeBlock(content) {
  const trimmed = content.trim()

  if (trimmed.startsWith('@media') || trimmed.startsWith('@supports')) {
    const inner = trimmed.slice(trimmed.indexOf('{') + 1, trimmed.lastIndexOf('}'))
    const innerBlocks = parseCssBlocks(inner)
    const categories = new Set()

    for (const block of innerBlocks) {
      if (block.type !== 'rule') continue
      const selector = block.content.split('{')[0]
      categories.add(categorizeSelector(selector))
    }

    if (categories.size === 1) return [...categories][0]
    if (categories.has('layout')) return 'layout'
    if (categories.has('shared')) return 'shared'
    return [...categories][0]
  }

  if (trimmed.startsWith('@keyframes')) return 'shared'

  const selector = trimmed.split('{')[0]
  return categorizeSelector(selector)
}

function splitFile(sourcePath, outputDir, importOrder) {
  const css = fs.readFileSync(sourcePath, 'utf8')
  const blocks = parseCssBlocks(css)
  const buckets = Object.fromEntries(importOrder.map((name) => [name, []]))

  for (const block of blocks) {
    if (block.type === 'comment') {
      buckets.shared.push(block.content)
      continue
    }

    const category = categorizeBlock(block.content)
    if (!buckets[category]) buckets[category] = []
    buckets[category].push(block.content)
  }

  fs.mkdirSync(outputDir, { recursive: true })

  for (const name of importOrder) {
    const content = (buckets[name] || []).join('\n\n')
    if (!content.trim()) continue
    fs.writeFileSync(path.join(outputDir, `${name}.css`), `${content.trim()}\n`)
  }

  const indexContent = importOrder
    .filter((name) => {
      const filePath = path.join(outputDir, `${name}.css`)
      return fs.existsSync(filePath)
    })
    .map((name) => `@import './${name}.css';`)
    .join('\n')

  fs.writeFileSync(path.join(outputDir, 'index.css'), `${indexContent}\n`)
}

const webappOrder = [
  'variables',
  'layout',
  'shared',
  'profile-search',
  'feed',
  'posts',
  'jobs',
  'friends',
  'chat',
  'profile',
  'analytics',
  'notifications',
  'ai-assistant',
  'theme',
]

splitFile(
  path.join(root, 'ourWebApp', 'webapp.css'),
  path.join(root, 'ourWebApp', 'styles'),
  webappOrder.filter((name) => name !== 'theme')
)

fs.copyFileSync(
  path.join(root, 'ourWebApp', 'ascendra-theme.css'),
  path.join(root, 'ourWebApp', 'styles', 'theme.css')
)

const themeIndex = fs.readFileSync(path.join(root, 'ourWebApp', 'styles', 'index.css'), 'utf8')
fs.writeFileSync(
  path.join(root, 'ourWebApp', 'styles', 'index.css'),
  `${themeIndex.trim()}\n@import './theme.css';\n`
)

const landingOrder = ['variables', 'layout', 'home', 'shared-pages', 'about', 'support', 'auth']

function splitLandingLandingCss() {
  const css = fs.readFileSync(path.join(root, 'landing_page', 'home', 'landing.css'), 'utf8')
  const blocks = parseCssBlocks(css)
  const buckets = {
    variables: [],
    layout: [],
    home: [],
  }

  for (const block of blocks) {
    if (block.type === 'comment') {
      buckets.home.push(block.content)
      continue
    }

    const content = block.content
    const selector = content.split('{')[0].toLowerCase()

    if (selector.includes(':root')) {
      buckets.variables.push(content)
    } else if (
      selector.includes('ascendra-navbar') ||
      selector.includes('landing-page') ||
      selector.includes('ascendra-footer') ||
      content.startsWith('@media')
    ) {
      buckets.layout.push(content)
    } else {
      buckets.home.push(content)
    }
  }

  const outputDir = path.join(root, 'landing_page', 'styles')
  fs.mkdirSync(outputDir, { recursive: true })

  for (const [name, items] of Object.entries(buckets)) {
    if (!items.length) continue
    fs.writeFileSync(path.join(outputDir, `${name}.css`), `${items.join('\n\n').trim()}\n`)
  }
}

splitLandingLandingCss()

function splitPagesCss() {
  const css = fs.readFileSync(path.join(root, 'landing_page', 'shared', 'pages.css'), 'utf8')
  const blocks = parseCssBlocks(css)
  const buckets = { 'shared-pages': [], about: [], support: [] }

  for (const block of blocks) {
    if (block.type === 'comment') {
      buckets['shared-pages'].push(block.content)
      continue
    }

    const selector = block.content.split('{')[0].toLowerCase()

    if (selector.includes('about-')) {
      buckets.about.push(block.content)
    } else if (selector.includes('support-')) {
      buckets.support.push(block.content)
    } else {
      buckets['shared-pages'].push(block.content)
    }
  }

  const outputDir = path.join(root, 'landing_page', 'styles')

  for (const [name, items] of Object.entries(buckets)) {
    if (!items.length) continue
    fs.writeFileSync(path.join(outputDir, `${name}.css`), `${items.join('\n\n').trim()}\n`)
  }
}

splitPagesCss()

fs.copyFileSync(
  path.join(root, 'landing_page', 'auth', 'auth.css'),
  path.join(root, 'landing_page', 'styles', 'auth.css')
)

const landingIndex = landingOrder
  .filter((name) => fs.existsSync(path.join(root, 'landing_page', 'styles', `${name}.css`)))
  .map((name) => `@import './${name}.css';`)
  .join('\n')

fs.writeFileSync(path.join(root, 'landing_page', 'styles', 'index.css'), `${landingIndex}\n`)

console.log('CSS split complete')
