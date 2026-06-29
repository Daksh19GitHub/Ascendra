import Post from '../models/Post.js'
import User from '../models/User.js'
import {
  addTextToInterestProfile,
  buildInterestProfileFromSkills,
  scoreContentMatch,
  tokenize,
} from '../utils/interestProfile.js'
import { profileHasMatchingSignals } from '../utils/profileText.js'
import { getOrCreateProfileEmbedding } from '../utils/profileEmbedding.js'
import { buildPaginationMeta } from '../utils/pagination.js'
import {
  buildRecommendedJobListingFilter,
  getJobListingPhase,
} from '../utils/jobListing.js'
import { enrichPostsWithEngagement } from '../utils/postEngagement.js'
import { cosineSimilarity, embedText } from './embeddingService.js'

const JOB_LIMIT = 25
const JOB_SCAN_LIMIT = 150
const EMBEDDING_BATCH_SIZE = 5
const SEMANTIC_WEIGHT = 0.75
const SKILL_WEIGHT = 0.25
const MIN_RECOMMENDED_MATCH_PERCENT = 25
const MIN_SEMANTIC_SCORE = 0.35

const postPopulate = [{ path: 'author' }]

function buildUserInterestProfile(user) {
  const profile = user?.profile || {}
  const interestProfile = {}

  buildInterestProfileFromSkills(interestProfile, profile.skills || [], 3)

  if (profile.headline?.trim()) {
    addTextToInterestProfile(interestProfile, profile.headline, 2)
  }

  for (const entry of profile.education || []) {
    addTextToInterestProfile(
      interestProfile,
      [entry.degree, entry.field, entry.institution, entry.description].filter(Boolean).join(' '),
      2
    )
  }

  for (const entry of profile.workExperience || []) {
    addTextToInterestProfile(
      interestProfile,
      [entry.title, entry.company, entry.description].filter(Boolean).join(' '),
      2
    )
  }

  for (const entry of profile.achievements || []) {
    addTextToInterestProfile(
      interestProfile,
      [entry.title, entry.description, entry.year].filter(Boolean).join(' '),
      2
    )
  }

  return interestProfile
}

function getMatchedSkillTokens(jobText, interestProfile) {
  const tokens = tokenize(jobText)
  const matched = []

  for (const token of tokens) {
    if (interestProfile[token] && !matched.includes(token)) {
      matched.push(token)
    }
  }

  return matched.slice(0, 5)
}

function buildMatchReason(matchedSkills, semanticScore) {
  if (matchedSkills.length >= 2) {
    return 'Strong skill overlap with your profile'
  }

  if (semanticScore >= 0.55) {
    return 'Semantically similar to your profile and experience'
  }

  if (semanticScore >= 0.4) {
    return 'Related to your background'
  }

  return 'May be worth exploring based on your profile'
}

function qualifiesForProfileMatch({ matchPercent, matchedSkills, semanticScore }) {
  if (matchPercent < MIN_RECOMMENDED_MATCH_PERCENT) {
    return false
  }

  return matchedSkills.length >= 1 || semanticScore >= MIN_SEMANTIC_SCORE
}

async function ensureJobEmbeddings(jobPosts) {
  const pending = jobPosts.filter((post) => !post.embedding?.length)

  for (let i = 0; i < pending.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = pending.slice(i, i + EMBEDDING_BATCH_SIZE)

    await Promise.all(
      batch.map(async (post) => {
        const embedding = await embedText(post.content)
        post.embedding = embedding
        await Post.updateOne({ _id: post._id }, { embedding })
      })
    )
  }
}

function sortRankedJobs(a, b) {
  const phaseRank = { open: 2, scheduled: 1 }
  const phaseDiff = (phaseRank[b.listingPhase] || 0) - (phaseRank[a.listingPhase] || 0)
  if (phaseDiff !== 0) return phaseDiff

  if (b.matchPercent !== a.matchPercent) {
    return b.matchPercent - a.matchPercent
  }

  return new Date(b.post.createdAt) - new Date(a.post.createdAt)
}

export async function buildRecommendedJobs(userId, { page = 1, limit = JOB_LIMIT } = {}) {
  const user = await User.findById(userId)

  if (!user) {
    return { jobs: [], message: 'User not found.' }
  }

  if (!profileHasMatchingSignals(user)) {
    return {
      jobs: [],
      message:
        'Add skills, education, or work experience to your profile to get personalized job recommendations.',
      needsProfile: true,
    }
  }

  const jobPosts = await Post.find(buildRecommendedJobListingFilter())
    .sort({ createdAt: -1 })
    .limit(JOB_SCAN_LIMIT)
    .populate(postPopulate)
    .select('+embedding')

  if (!jobPosts.length) {
    return {
      jobs: [],
      message: 'No matching open or upcoming job listings right now. Check back later.',
    }
  }

  await ensureJobEmbeddings(jobPosts)

  const profileEmbedding = await getOrCreateProfileEmbedding(user)
  const interestProfile = buildUserInterestProfile(user)

  const rankedJobs = jobPosts
    .map((postDoc) => {
      const semanticScore = cosineSimilarity(profileEmbedding, postDoc.embedding)
      const skillScore = scoreContentMatch(postDoc.content, interestProfile, 100) / 100
      const matchPercent = Math.round(
        (semanticScore * SEMANTIC_WEIGHT + skillScore * SKILL_WEIGHT) * 100
      )
      const matchedSkills = getMatchedSkillTokens(postDoc.content, interestProfile)

      return {
        post: postDoc.toPublicJSON(postDoc.author),
        listingPhase: getJobListingPhase(postDoc),
        matchPercent: Math.max(0, Math.min(100, matchPercent)),
        matchReason: buildMatchReason(matchedSkills, semanticScore),
        matchedSkills,
      }
    })
    .filter(qualifiesForProfileMatch)
    .sort(sortRankedJobs)

  const total = rankedJobs.length
  const start = (page - 1) * limit
  const pageJobs = rankedJobs.slice(start, start + limit)

  if (!total) {
    return {
      jobs: [],
      message:
        'No matching open or upcoming job listings for your profile right now. Try updating your skills or check back later.',
    }
  }

  const enrichedPosts = await enrichPostsWithEngagement(
    pageJobs.map((job) => job.post),
    userId
  )
  const enrichedById = new Map(enrichedPosts.map((post) => [post.id, post]))

  const jobs = pageJobs.map((job) => ({
    ...job,
    post: enrichedById.get(job.post.id) || job.post,
  }))

  return {
    jobs,
    pagination: buildPaginationMeta({ page, limit, total }),
  }
}
