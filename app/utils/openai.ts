import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Constants for rate limiting
const MAX_RETRIES = 3
const MIN_RETRY_DELAY = 1000 
const MAX_RETRY_DELAY = 60000
const JITTER_FACTOR = 0.1

function getExponentialBackoffDelay(retryCount: number): number {
  const baseDelay = Math.min(
    MIN_RETRY_DELAY * Math.pow(2, retryCount),
    MAX_RETRY_DELAY
  )
  const jitter = baseDelay * JITTER_FACTOR * (Math.random() * 2 - 1)
  return baseDelay + jitter
}

export async function callOpenAI<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: any
  
  for (let retryCount = 0; retryCount < MAX_RETRIES; retryCount++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      if (!isRetryableError(error)) {
        throw error
      }

      const resetDelay = getExponentialBackoffDelay(retryCount)
      await sleep(resetDelay)
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

function isRetryableError(error: any): boolean {
  return (
    error.status === 429 || 
    error.status >= 500 ||
    error.code === 'ECONNRESET' ||
    error.code === 'ETIMEDOUT'
  )
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export { openai } 