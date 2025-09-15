#!/usr/bin/env node
const fs = require('fs')
const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('Please set DATABASE_URL in environment')
  process.exit(1)
}

(async function(){
  const sql = fs.readFileSync('./db/init.sql', 'utf8')
  const client = new Client({ connectionString: DATABASE_URL })
  try {
    await client.connect()
    await client.query(sql)
    console.log('Applied db/init.sql successfully')
    process.exit(0)
  } catch (e) {
    console.error('Failed to apply SQL:', e.message || e)
    process.exit(1)
  } finally {
    await client.end().catch(()=>{})
  }
})()
