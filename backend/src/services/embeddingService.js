import { pipeline } from '@xenova/transformers'

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2'

let extractorPromise = null

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline('feature-extraction', MODEL_ID)
  }

  return extractorPromise
}

export async function embedText(text) {
  if (!text?.trim()) {
    return []
  }

  const extractor = await getExtractor()
  const output = await extractor(text.trim(), { pooling: 'mean', normalize: true })

  return Array.from(output.data)
}

export function cosineSimilarity(vectorA, vectorB) {
  if (!vectorA?.length || !vectorB?.length || vectorA.length !== vectorB.length) {
    return 0
  }

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vectorA.length; i += 1) {
    dot += vectorA[i] * vectorB[i]
    normA += vectorA[i] * vectorA[i]
    normB += vectorB[i] * vectorB[i]
  }

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}
