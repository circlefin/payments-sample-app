import type { H3Event } from 'h3'

export interface AuthedUser {
  id: string
  email: string
}

interface SupabaseUserResponse {
  id?: string
  email?: string
}

/**
 * Verifies the Supabase access token sent by the browser and returns the
 * signed-in user. Every wallet route calls this first, so a visitor can only
 * ever act on their own wallet.
 */
export async function requireUser(event: H3Event): Promise<AuthedUser> {
  const config = useRuntimeConfig()
  const baseUrl: string = config.public.supabaseUrl
  const anonKey: string = config.public.supabaseAnonKey

  if (!baseUrl || !anonKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Sign-in is not configured on the server',
    })
  }

  const header = getHeader(event, 'authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Please sign in' })
  }

  let user: SupabaseUserResponse | null = null
  try {
    user = await $fetch<SupabaseUserResponse>(`${baseUrl}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
    })
  } catch (err: any) {
    user = null
  }

  if (!user || !user.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Your session has expired. Please sign in again',
    })
  }

  return { id: user.id, email: user.email || '' }
}

const rateBuckets = new Map<string, number[]>()

/**
 * Small per-user rate limit. Serverless instances do not share memory, so this
 * is a safety net against accidental double-clicks and simple abuse, not a
 * replacement for a real rate limiter.
 */
export function rateLimit(
  userId: string,
  action: string,
  maxCalls: number,
  windowMs: number,
): void {
  const key = `${action}:${userId}`
  const now = Date.now()
  const recent = (rateBuckets.get(key) || []).filter((t) => now - t < windowMs)
  if (recent.length >= maxCalls) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please wait a moment and try again',
    })
  }
  recent.push(now)
  rateBuckets.set(key, recent)
}
