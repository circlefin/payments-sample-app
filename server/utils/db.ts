/**
 * Minimal Supabase database access over its REST API (PostgREST), using the
 * service role key. The key only exists on the server. The tables have row
 * level security switched on with no policies, so browsers cannot read them
 * directly; they go through the routes in server/api instead.
 */

export interface WalletRow {
  user_id: string
  circle_wallet_id: string
  address: string
  blockchain: string
  created_at?: string
}

interface DbOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown>
  prefer?: string
}

async function dbRequest<T>(
  path: string,
  options: DbOptions = {},
): Promise<T> {
  const config = useRuntimeConfig()
  const baseUrl = String(config.public.supabaseUrl || '')
  const serviceKey = String(config.supabaseServiceRoleKey || '')

  if (!baseUrl || !serviceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The database is not configured on the server',
    })
  }

  const headers: Record<string, string> = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  }
  if (options.prefer) {
    headers.Prefer = options.prefer
  }

  try {
    return await $fetch<any>(`${baseUrl}/rest/v1/${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body,
    })
  } catch (err: any) {
    console.error('Database request failed', path, err?.statusCode, err?.data)
    throw createError({
      statusCode: 502,
      statusMessage: 'The database request failed',
    })
  }
}

export async function getWalletRow(userId: string): Promise<WalletRow | null> {
  const rows = await dbRequest<WalletRow[]>(
    `wallets?user_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`,
  )
  return rows.length > 0 ? rows[0] : null
}

export async function saveWalletRow(row: WalletRow): Promise<WalletRow> {
  const rows = await dbRequest<WalletRow[]>('wallets', {
    method: 'POST',
    body: { ...row },
    prefer: 'resolution=ignore-duplicates,return=representation',
  })
  if (rows.length > 0) {
    return rows[0]
  }
  // Another request saved a wallet for this user first. Use that one.
  const existing = await getWalletRow(row.user_id)
  if (!existing) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not save the wallet',
    })
  }
  return existing
}

export async function getSetting(key: string): Promise<string | null> {
  const rows = await dbRequest<Array<{ key: string; value: string }>>(
    `app_settings?key=eq.${encodeURIComponent(key)}&select=key,value&limit=1`,
  )
  return rows.length > 0 ? rows[0].value : null
}

export async function saveSetting(key: string, value: string): Promise<void> {
  await dbRequest<unknown>('app_settings', {
    method: 'POST',
    body: { key, value },
    prefer: 'resolution=ignore-duplicates,return=minimal',
  })
}
