import { buildPersonalizedFeed } from '../services/feedRankingService.js'
import { parsePaginationQuery } from '../utils/pagination.js'

export async function getFeed(req, res, next) {
  try {
    const { page, limit } = parsePaginationQuery(req.query, { defaultLimit: 25, maxLimit: 50 })
    const { posts, message, pagination } = await buildPersonalizedFeed(req.user._id, {
      page,
      limit,
    })

    res.json({
      success: true,
      data: {
        posts,
        pagination,
        ...(message ? { message } : {}),
      },
    })
  } catch (error) {
    next(error)
  }
}
