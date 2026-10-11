/**
 * Browser-side sign-in for the wallet app, using Supabase Auth over its REST
 * API. The Supabase URL and anon key are public by design. Wallet actions go
 * through our own /api routes, which check the access token on the server.
 */

export const APP_NAME = 'Faremit'

export interface Session {
  accessToken: string
  refreshToken: string
  expiresAt: number
  email: string
}

const STORAGE_KEY = 'fm.session'

/** Turns any error (ours, Supabase's or the network's) into a sentence. */
export function errorText(
  err: any,
  fallback = 'Something went wrong. Please try again.',
): string {
  const data = err?.data
  const code = data?.error_code || data?.code
  if (code === 'invalid_credentials') {
    return 'That email and password do not match. Please try again.'
  }
  if (code === 'user_already_exists' || code === 'email_exists') {
    return 'An account with this email already exists. Try logging in.'
  }
  if (code === 'weak_password') {
    return 'Choose a stronger password with at least 8 characters.'
  }
  const message =
    data?.statusMessage ||
    data?.message ||
    data?.msg ||
    data?.error_description ||
    err?.statusMessage ||
    err?.message
  return typeof message === 'string' && message ? message : fallback
}

function readStored(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    if (parsed && parsed.accessToken && parsed.refreshToken) {
      return parsed as Session
    }
  } catch {
    // Storage can be blocked (private windows). Treat as signed out.
  }
  return null
}

function writeStored(value: Session | null): void {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore: the session still works for this tab.
  }
}

let refreshing: Promise<boolean> | null = null

export function useAuth() {
  const config = useRuntimeConfig()
  const session = useState<Session | null>('fm-session', () => null)
  const loaded = useState<boolean>('fm-session-loaded', () => false)

  function load(): void {
    if (loaded.value || !import.meta.client) {
      return
    }
    loaded.value = true
    session.value = readStored()
  }

  function setSession(value: Session | null): void {
    session.value = value
    writeStored(value)
  }

  async function authRequest(
    path: string,
    body: Record<string, unknown>,
    token?: string,
  ): Promise<any> {
    const baseUrl = String(config.public.supabaseUrl || '')
    const anonKey = String(config.public.supabaseAnonKey || '')
    if (!baseUrl || !anonKey) {
      throw new Error(
        'Sign-in is not set up yet. The site owner needs to add the Supabase settings.',
      )
    }
    return await $fetch<any>(`${baseUrl}/auth/v1${path}`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
    })
  }

  function toSession(result: any): Session | null {
    if (!result || !result.access_token || !result.refresh_token) {
      return null
    }
    const seconds = Number(result.expires_in) > 0 ? Number(result.expires_in) : 3600
    return {
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      expiresAt: Date.now() + seconds * 1000,
      email: result.user?.email || '',
    }
  }

  /** Creates an account. `confirmed` is false when the user must verify email first. */
  async function signUp(
    email: string,
    password: string,
  ): Promise<{ confirmed: boolean }> {
    const result = await authRequest('/signup', { email, password })
    const next = toSession(result)
    if (next) {
      setSession(next)
      return { confirmed: true }
    }
    return { confirmed: false }
  }

  async function signIn(email: string, password: string): Promise<void> {
    const result = await authRequest('/token?grant_type=password', {
      email,
      password,
    })
    const next = toSession(result)
    if (!next) {
      throw new Error('Could not sign in. Please try again.')
    }
    setSession(next)
  }

  async function refresh(): Promise<boolean> {
    const current = session.value
    if (!current) {
      return false
    }
    if (!refreshing) {
      refreshing = (async () => {
        try {
          const result = await authRequest('/token?grant_type=refresh_token', {
            refresh_token: current.refreshToken,
          })
          const next = toSession(result)
          if (!next) {
            return false
          }
          setSession(next)
          return true
        } catch {
          return false
        } finally {
          refreshing = null
        }
      })()
    }
    return await refreshing
  }

  async function signOut(): Promise<void> {
    const current = session.value
    setSession(null)
    if (current) {
      try {
        await authRequest('/logout', {}, current.accessToken)
      } catch {
        // Already signed out locally. Nothing more to do.
      }
    }
  }

  /** Calls one of our /api routes with the user's access token. */
  async function api<T>(
    path: string,
    options: { method?: 'GET' | 'POST'; body?: Record<string, unknown> } = {},
  ): Promise<T> {
    load()
    if (!session.value) {
      throw new Error('Please log in to continue.')
    }
    if (Date.now() > session.value.expiresAt - 60_000) {
      await refresh()
    }

    const call = async () =>
      await $fetch<any>(path, {
        method: options.method || 'GET',
        body: options.body,
        headers: { Authorization: `Bearer ${session.value?.accessToken || ''}` },
      })

    try {
      return await call()
    } catch (err: any) {
      if (err?.statusCode === 401 && (await refresh())) {
        return await call()
      }
      if (err?.statusCode === 401) {
        setSession(null)
      }
      throw err
    }
  }

  return { session, load, signUp, signIn, signOut, refresh, api }
}
