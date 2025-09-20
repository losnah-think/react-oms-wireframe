import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "src/lib/pgClient";

type Data = {
  ok: boolean;
  host?: string | null;
  shopsCount?: number;
  error?: string;
};

// Optional: set DB_TEST_SECRET in Vercel to require a header for this endpoint
const DB_TEST_SECRET = process.env.DB_TEST_SECRET;

if (!process.env.DATABASE_URL) {
  // Note: we don't throw here because Next.js will import this file during build.
  console.warn("src/server/api/db-test: DATABASE_URL is not set");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  // Guard for Jest: when tests import pages, `req` may be undefined or not a Next request.
  if (typeof process !== "undefined" && !!process.env.JEST_WORKER_ID) {
    if (!res || typeof (res as any).status !== "function")
      return undefined as any;
  }
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

  try {
    // Use runtime-safe query helper which creates a pool when needed
    const r1 = await query(
      `SELECT current_database() as db, inet_server_addr() as host, version() as version`,
    );
    const r2 = await query(`SELECT count(*)::int as count FROM shops`);

    const host = r1.rows[0]?.host ?? null;
    const shopsCount = r2.rows[0]?.count ?? 0;
    return res.status(200).json({ ok: true, host, shopsCount });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
