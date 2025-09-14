#!/usr/bin/env node
const { Pool } = require('pg')

const url = process.env.DATABASE_URL
if (!url) {
  console.error('ERROR: set DATABASE_URL environment variable before running this script')
  process.exit(1)
}

const pool = new Pool({ connectionString: url })

async function main() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        role TEXT,
        password_hash TEXT
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id TEXT PRIMARY KEY,
        name TEXT,
        platform TEXT,
        credentials JSONB
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS integration_logs (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT now(),
        shop_id TEXT,
        adapter TEXT,
        level TEXT,
        message TEXT,
        meta JSONB
      );
    `)

    // insert demo user
    await client.query(`
      INSERT INTO users (id, email, name, role, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING
    `, ['dev-admin', 'admin@example.com', 'Dev Admin', 'admin', ''])

    // insert demo shop
    await client.query(`
      INSERT INTO shops (id, name, platform, credentials)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `, ['shop_demo_1', 'Demo Shop', 'supabase', JSON.stringify({ clientId: 'demo', clientSecret: 'demo' })])

    console.log('Inserted demo rows into Postgres')
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(err => { console.error(err); process.exit(1) })
