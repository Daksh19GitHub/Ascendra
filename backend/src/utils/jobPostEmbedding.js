import { embedText } from '../services/embeddingService.js'
import { resolveJobListingFields } from './jobListing.js'

export function normalizePostType(value) {
  return value === 'job' ? 'job' : 'standard'
}

export async function buildJobPostFields({
  content,
  postType,
  jobStatus,
  jobStartsAt,
  jobClosesAt,
  existingPost = null,
}) {
  const normalizedType = normalizePostType(postType)
  const listingFields = resolveJobListingFields({
    postType: normalizedType,
    jobStatus,
    jobStartsAt,
    jobClosesAt,
    existingPost,
  })

  if (listingFields.error) {
    return listingFields
  }

  if (normalizedType !== 'job') {
    return {
      postType: normalizedType,
      embedding: [],
      ...listingFields,
    }
  }

  return {
    postType: normalizedType,
    embedding: await embedText(content),
    ...listingFields,
  }
}
