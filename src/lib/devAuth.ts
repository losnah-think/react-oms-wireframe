export function shouldSkipAuth(): boolean {
  try {
    if (typeof process === 'undefined') return false
    const env = (process.env.NEXT_PUBLIC_DEV_NO_AUTH || process.env.NODE_ENV || '').toLowerCase()
    if (env === 'true') return true
    // Skip auth when running in development (but not in production)
    if ((process.env.NODE_ENV || '').toLowerCase() !== 'production') return true
  } catch (e) {
    // swallow
  }
  return false
}
