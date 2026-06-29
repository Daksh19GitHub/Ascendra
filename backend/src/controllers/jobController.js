import { buildRecommendedJobs } from '../services/jobRecommendationService.js'
import { parsePaginationQuery } from '../utils/pagination.js'

export async function getRecommendedJobs(req, res, next) {
  try {
    const { page, limit } = parsePaginationQuery(req.query, { defaultLimit: 25, maxLimit: 50 })
    const { jobs, message, needsProfile, pagination } = await buildRecommendedJobs(req.user._id, {
      page,
      limit,
    })

    res.json({
      success: true,
      data: {
        jobs,
        ...(pagination ? { pagination } : {}),
        ...(message ? { message } : {}),
        ...(needsProfile ? { needsProfile: true } : {}),
      },
    })
  } catch (error) {
    next(error)
  }
}
