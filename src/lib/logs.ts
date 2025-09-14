import db from './db'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const insertLog = db.prepare(`INSERT INTO integration_logs (shop_id, adapter, level, message, meta) VALUES (@shop_id, @adapter, @level, @message, @meta)`)
const selectLogs = db.prepare(`SELECT id, created_at, shop_id, adapter, level, message, meta FROM integration_logs ORDER BY id DESC LIMIT ? OFFSET ?`)

export function logIntegration(shopId: string | null, adapter: string, level: LogLevel, message: string, meta?: any) {
  try {
    insertLog.run({ shop_id: shopId, adapter, level, message, meta: meta ? JSON.stringify(meta) : null })
  } catch (e) {
    // swallow logging errors to avoid cascading failures
    console.error('failed to write integration log', e)
  }
}

export function listIntegrationLogs(limit = 50, offset = 0) {
  return selectLogs.all(limit, offset).map((r: any) => ({ ...r, meta: r.meta ? JSON.parse(r.meta) : null }))
}
