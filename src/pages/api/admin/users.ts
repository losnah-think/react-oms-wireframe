import type { NextApiRequest, NextApiResponse } from 'next'
import { listUsers, addUser } from 'src/lib/users'
import { requireRole } from 'src/lib/permissions'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const check = await requireRole(req, res, ['admin'])
  if (!check.ok) return res.status(check.status).json(check.body)

  if (req.method === 'GET') {
    const users = await listUsers()
    return res.status(200).json(users)
  }
  if (req.method === 'POST') {
    const { email, name, role, password } = req.body || {}
    if (!email || !role) return res.status(400).json({ error: 'email and role required' })
    const salt = bcrypt.genSaltSync(10)
    const hash = password ? bcrypt.hashSync(password, salt) : undefined
    // Dev-only: if x-dev-user is the special bootstrap token, perform a direct
    // Supabase REST POST and return raw response for debugging.
    if (process.env.NODE_ENV !== 'production' && req.headers['x-dev-user'] === '__dev__') {
      try {
        const sbUrl = process.env.SUPABASE_URL
        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!sbUrl || !sbKey) return res.status(500).json({ error: 'missing supabase env' })
        const nodeFetch = (await import('node-fetch')).default
        const body = { id: `u-${Date.now()}`, email, name, role, password_hash: hash }
        const resp = await nodeFetch(`${sbUrl.replace(/\/$/, '')}/rest/v1/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}`, 'Prefer': 'return=representation' },
          body: JSON.stringify(body)
        })
        const text = await resp.text()
        let parsed: any
        try { parsed = JSON.parse(text) } catch (_) { parsed = text }
        return res.status(200).json({ postStatus: resp.status, ok: resp.ok, text, parsed })
      } catch (err) {
        return res.status(500).json({ error: String(err) })
      }
    }
    try {
      const u = await addUser({ id: `u-${Date.now()}`, email, name, role, password_hash: hash })
      return res.status(201).json(u)
    } catch (e) {
      // fallback to Supabase REST
      try {
        const sbUrl = process.env.SUPABASE_URL
        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!sbUrl || !sbKey) throw e
  const nodeFetch = (await import('node-fetch')).default
  const body = { id: `u-${Date.now()}`, email, name, role, password_hash: hash }
        try {
          const fs = await import('fs')
          try { await fs.promises.mkdir('debug', { recursive: true }) } catch (_) {}
          fs.appendFileSync('debug/admin-users.log', JSON.stringify({ ts: Date.now(), event: 'REQUEST', url: `${sbUrl}/rest/v1/users`, body }) + '\n')
        } catch (err) {
          /* ignore file log errors */
        }
        console.log('[admin/users] Supabase fallback insert body:', body)
  const resp = await nodeFetch(`${sbUrl}/rest/v1/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}`, 'Prefer': 'return=representation' },
            body: JSON.stringify(body)
          })
        const text = await resp.text()
        try {
          const fs = await import('fs')
          const headersObj: any = {}
          try { for (const [k, v] of (resp.headers as any).entries()) headersObj[k] = v } catch (_) {}
          try { await fs.promises.mkdir('debug', { recursive: true }) } catch (_) {}
          fs.appendFileSync('debug/admin-users.log', JSON.stringify({ ts: Date.now(), event: 'RESPONSE', status: resp.status, headers: headersObj, body: text }) + '\n')
        } catch (err) {
          /* ignore file log errors */
        }
        console.log('[admin/users] Supabase response body:', text)
        if (!resp.ok) throw new Error('Supabase REST insert failed: ' + resp.status + ' ' + text)
        let rows: any
        try { rows = JSON.parse(text) } catch (err) { rows = text }
  // If Supabase returned a representation array with the new row, return it.
  if (Array.isArray(rows) && rows[0]) return res.status(201).json(rows[0])
        // Some Supabase setups / RLS may not return the representation even with Prefer header.
        // Fallback: query the user by email and return that row if present.
        try {
          const getResp = await nodeFetch(`${sbUrl.replace(/\/$/, '')}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`, {
            method: 'GET',
            headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}`, 'Accept': 'application/json' }
          })
          const getText = await getResp.text()
          try {
            const fs = await import('fs')
            const getHeadersObj: any = {}
            try { for (const [k, v] of (getResp.headers as any).entries()) getHeadersObj[k] = v } catch (_) {}
            try { await fs.promises.mkdir('debug', { recursive: true }) } catch (_) {}
            fs.appendFileSync('debug/admin-users.log', JSON.stringify({ ts: Date.now(), event: 'GET-FALLBACK', status: getResp.status, headers: getHeadersObj, body: getText }) + '\n')
          } catch (err) { }
          if (getResp.ok) {
            let getRows: any
            try { getRows = JSON.parse(getText) } catch (err) { getRows = getText }
            if (Array.isArray(getRows) && getRows[0]) return res.status(201).json(getRows[0])
            // If in dev bootstrap mode, return detailed debug info to aid diagnosis
            if (process.env.NODE_ENV !== 'production' && req.headers['x-dev-user'] === '__dev__') {
              return res.status(201).json({ debug: true, postStatus: resp.status, postText: text, getStatus: getResp.status, getText, parsedPost: rows, parsedGet: getRows })
            }
          }
        } catch (gErr) {
          console.log('[admin/users] GET fallback failed:', String(gErr))
        }
  // Last resort: return a minimal created indicator with email so caller can verify.
  return res.status(201).json({ created: true, email, raw: (rows && rows[0]) ? rows[0] : rows })
      } catch (e2) {
        return res.status(500).json({ error: 'failed to create user', detail: String(e2) })
      }
    }
  }
  return res.status(405).end()
}
