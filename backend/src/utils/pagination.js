export function parsePaginationQuery(query, { defaultLimit = 25, maxLimit = 50 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit))

  return { page, limit }
}

export function buildPaginationMeta({ page, limit, total }) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  }
}
