import type { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'

type Data = {
	ok: boolean
	host?: string | null
	shopsCount?: number
	error?: string
}

// Optional: set DB_TEST_SECRET in Vercel to require a header for this endpoint
const DB_TEST_SECRET = process.env.DB_TEST_SECRET

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
	// Note: we don't throw here because Next.js will import this file during build.
	console.warn('pages/api/db-test: DATABASE_URL is not set')
}

// Reuse pool across lambda invocations to avoid exhausting connections
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	var __pg_pool__: Pool | undefined
}

function getPool() {
	if (!connectionString) throw new Error('DATABASE_URL not set')
	if (!global.__pg_pool__) {
		global.__pg_pool__ = new Pool({
			connectionString,
			ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false } as any,
			max: 10,
		})
	}
	return global.__pg_pool__!
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	if (DB_TEST_SECRET) {
		const provided = req.headers['x-db-test-secret']
		if (!provided || provided !== DB_TEST_SECRET) {
			return res.status(401).json({ ok: false, error: 'missing or invalid x-db-test-secret header' })
		}
	}

	try {
		const pool = getPool()
		const client = await pool.connect()
		try {
			// Basic checks: Postgres version and shops count
			const r1 = await client.query(`SELECT current_database() as db, inet_server_addr() as host, version() as version`)
			const r2 = await client.query(`SELECT count(*)::int as count FROM shops`)

			const host = r1.rows[0]?.host ?? null
			const shopsCount = r2.rows[0]?.count ?? 0

			return res.status(200).json({ ok: true, host, shopsCount })
		} finally {
			client.release()
		}
	} catch (e: any) {
		return res.status(500).json({ ok: false, error: String(e) })
	}
}

