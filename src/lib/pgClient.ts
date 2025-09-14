import { Pool } from 'pg'

if (!process.env.DATABASE_URL) {
  console.warn('WARNING: process.env.DATABASE_URL is not set. DB client will not be able to connect.')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Allow environments like Heroku that require SSL; set rejectUnauthorized by env var
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false } as any,
  max: 10,
})

export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const res = await client.query(text, params)
    return res
  } finally {
    client.release()
  }
}

export default pool
