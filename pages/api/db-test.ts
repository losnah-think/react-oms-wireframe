import type { NextApiRequest, NextApiResponse } from "next";
// We avoid static import of 'pg' to prevent Next.js build from failing
// when 'pg' cannot be resolved in the build environment. We'll require it
// at runtime inside `getPool()` using `eval('require')` so bundlers won't
// try to statically analyze the dependency.
type Pool = any;

type Data = {
  ok: boolean;
  host?: string | null;
  shopsCount?: number;
  error?: string;
};

// Optional: set DB_TEST_SECRET in Vercel to require a header for this endpoint
const DB_TEST_SECRET = process.env.DB_TEST_SECRET;

const connectionString = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!connectionString) {
  // Note: we don't throw here because Next.js will import this file during build.
  console.warn("pages/api/db-test: DATABASE_URL is not set");
}

// Reuse pool across lambda invocations to avoid exhausting connections
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  var __pg_pool__: any | undefined;
}

function getPool() {
  if (!connectionString) throw new Error("DATABASE_URL not set");
  if (!global.__pg_pool__) {
    let pg: any;
    try {
      // use eval to avoid static analysis by bundlers
      // eslint-disable-next-line no-eval
      pg = eval("require")("pg");
    } catch (e) {
      throw new Error("'pg' module not available at runtime: " + String(e));
    }

    const PoolCtor = pg.Pool || pg.default?.Pool;
    if (!PoolCtor) throw new Error("'pg' Pool constructor not found");

    global.__pg_pool__ = new PoolCtor({
      connectionString,
      ssl:
        process.env.PGSSLMODE === "disable"
          ? false
          : ({ rejectUnauthorized: false } as any),
      max: 10,
    });
  }
  return global.__pg_pool__;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (DB_TEST_SECRET) {
    const provided = req.headers["x-db-test-secret"];
    if (!provided || provided !== DB_TEST_SECRET) {
      return res
        .status(401)
        .json({
          ok: false,
          error: "missing or invalid x-db-test-secret header",
        });
    }
  }

  // First try: if Supabase service key is available, use the REST API (no 'pg' required)
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/shops?select=id&limit=1`;
      const r = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Prefer: "count=exact",
        },
      });

      if (!r.ok) {
        const text = await r.text();
        throw new Error(`Supabase REST error: ${r.status} ${text}`);
      }

      const contentRange = r.headers.get("content-range");
      let shopsCount = 0;
      if (contentRange) {
        // content-range format: 0-0/<total>
        const parts = contentRange.split("/");
        shopsCount = parseInt(parts[1] ?? "0", 10) || 0;
      }

      return res.status(200).json({ ok: true, host: SUPABASE_URL, shopsCount });
    } catch (e: any) {
      // fall through to try pg client below
      console.warn("Supabase REST check failed:", String(e));
    }
  }

  // Fallback: try to use pg at runtime
  try {
    const pool = getPool();
    const client = await pool.connect();
    try {
      // Basic checks: Postgres version and shops count
      const r1 = await client.query(
        `SELECT current_database() as db, inet_server_addr() as host, version() as version`,
      );
      const r2 = await client.query(`SELECT count(*)::int as count FROM shops`);

      const host = r1.rows[0]?.host ?? null;
      const shopsCount = r2.rows[0]?.count ?? 0;

      return res.status(200).json({ ok: true, host, shopsCount });
    } finally {
      client.release();
    }
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
