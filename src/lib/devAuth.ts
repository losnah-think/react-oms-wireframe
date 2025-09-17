export function shouldSkipAuth(): boolean {
  try {
    // If running in a browser, prefer checking location.hostname so client code can skip auth.
    if (typeof window !== 'undefined') {
      const host = (window.location && window.location.hostname) ? String(window.location.hostname).toLowerCase() : ''
      if (host.includes('localhost') || host.includes('127.0.0.1')) return true
    }
    if (typeof process === 'undefined') return false
    // Skip auth when the explicit dev flag is set to '1' or 'true'.
    const flag = (process.env.NEXT_PUBLIC_DEV_NO_AUTH || '').toLowerCase()
    if (flag === '1' || flag === 'true') return true

  // Skip auth when running in development environment (convenience)
  if (process.env.NODE_ENV === 'development') return true

    // Also allow skipping auth automatically when running on localhost (developer convenience).
    // If NEXTAUTH_URL contains localhost or 127.0.0.1, treat as dev and skip auth.
    const nextAuthUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_NEXTAUTH_URL || process.env.NEXT_PUBLIC_VERCEL_URL || '').toLowerCase()
    if (nextAuthUrl.includes('localhost') || nextAuthUrl.includes('127.0.0.1')) return true
  } catch (e) {
    // swallow
  }
  return false
}
