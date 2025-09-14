import { Cafe24Auth } from '../types/cafe24';

export async function getCafe24Token(auth: Cafe24Auth): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
  // Dev-mode shortcut: if running locally and code starts with `dev-`, return a mock token
  if (process.env.NODE_ENV !== 'production' && (auth as any).code && String((auth as any).code).startsWith('dev-')) {
    const devCode = String((auth as any).code)
    return {
      accessToken: `dev_access_${devCode.replace(/^dev-/, '')}`,
      refreshToken: `dev_refresh_${devCode.replace(/^dev-/, '')}`,
      expiresIn: 3600,
    }
  }

  // Exchange authorization code for access token with Cafe24 OAuth
  // auth: { code?, clientId, clientSecret, redirectUri }
  const tokenUrl = 'https://oauth.cafe24.com/oauth/token'
  const params = new URLSearchParams()

  // default to authorization_code grant
  if ((auth as any).code) {
    params.append('grant_type', 'authorization_code')
    params.append('code', (auth as any).code)
  } else if ((auth as any).refreshToken) {
    params.append('grant_type', 'refresh_token')
    params.append('refresh_token', (auth as any).refreshToken)
  } else {
    throw new Error('getCafe24Token requires either code or refreshToken')
  }

  if ((auth as any).clientId) params.append('client_id', (auth as any).clientId)
  if ((auth as any).clientSecret) params.append('client_secret', (auth as any).clientSecret)
  if ((auth as any).redirectUri) params.append('redirect_uri', (auth as any).redirectUri)

  const fetchFn: typeof fetch = (globalThis as any).fetch || fetch
  const resp = await fetchFn(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '')
    throw new Error(`Cafe24 token exchange failed: ${resp.status} ${txt}`)
  }

  const data = await resp.json().catch(() => ({}))

  // Typical fields: access_token, refresh_token, expires_in
  return {
    accessToken: data.access_token || data.accessToken || '',
    refreshToken: data.refresh_token || data.refreshToken,
    expiresIn: data.expires_in || data.expiresIn || undefined,
  }
}
