import { kv } from '@vercel/kv'
import { getSession } from './auth'

const CACHE_TTL = 60 * 60 // 1 hour

export async function getCachedSession() {
  const sessionKey = 'session'
  let session = await kv.get(sessionKey)
  
  if (!session) {
    session = await getSession()
    if (session) {
      await kv.set(sessionKey, session, { ex: CACHE_TTL })
    }
  }
  
  return session
}

export { getSession } from './auth' 