export function shouldSkipAuth(): boolean {
  try {
    // If running in a browser, prefer checking location.hostname so client code can skip auth.
    if (typeof window !== 'undefined') {
      const host = (window.location && window.location.hostname) ? String(window.location.hostname).toLowerCase() : ''
      // Do not automatically skip auth for localhost; require explicit env flag to opt-out.
      // if (host.includes('localhost') || host.includes('127.0.0.1')) return true
    }
    if (typeof process === 'undefined') return false
    // Skip auth when the explicit dev flag is set to '1' or 'true'.
    const flag = (process.env.NEXT_PUBLIC_DEV_NO_AUTH || '').toLowerCase()
    if (flag === '1' || flag === 'true') return true
    // Note: we intentionally do NOT auto-skip auth based on NODE_ENV or NEXTAUTH_URL.
    // This ensures authorize() runs locally and surfaces credential authentication errors.
  } catch (e) {
    // swallow
  }
  return false
}
