import { query } from './pgClient'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be set for Postgres-only mode')

export async function logIntegration(shopId: string | null, adapter: string, level: LogLevel, message: string, meta?: any) {
  try {
    await query('INSERT INTO integration_logs (shop_id, adapter, level, message, meta) VALUES ($1, $2, $3, $4, $5)', [shopId, adapter, level, message, meta ? JSON.stringify(meta) : null])
  } catch (e) {
    console.error('failed to write integration log', e)
  }
}

export async function listIntegrationLogs(limit = 50, offset = 0) {
  const r = await query('SELECT id, created_at, shop_id, adapter, level, message, meta FROM integration_logs ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset])
  return r.rows.map((row: any) => ({ ...row, meta: row.meta ? JSON.parse(row.meta) : null }))
}
