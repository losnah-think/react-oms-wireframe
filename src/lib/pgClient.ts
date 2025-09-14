// Use runtime require for 'pg' so Next.js build doesn't fail when 'pg' isn't
// resolvable at build time. This keeps the module safe for Vercel serverless.
let pool: any = null

function makePool() {
  if (!process.env.DATABASE_URL) {
    console.warn('WARNING: process.env.DATABASE_URL is not set. DB client will not be able to connect.')
  }

  let pg: any
  try {
    // avoid static analysis by bundlers
    // eslint-disable-next-line no-eval
    pg = eval("require")('pg')
  } catch (e) {
    throw new Error("'pg' module not available at runtime: " + String(e))
  }

  const PoolCtor = pg.Pool || pg.default?.Pool
  if (!PoolCtor) throw new Error("'pg' Pool constructor not found")

  return new PoolCtor({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false } as any,
    max: 10,
  })
}

export async function query(text: string, params?: any[]) {
  if (!pool) pool = makePool()
  const client = await pool.connect()
  try {
    const res = await client.query(text, params)
    return res
  } finally {
    client.release()
  }
}

export default function getPool() {
  if (!pool) pool = makePool()
  return pool
}
