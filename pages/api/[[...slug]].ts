import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Dynamic proxying to server-side handlers is disabled in this build to
  // avoid bundler context warnings and accidental inclusion of non-code files.
  // Use direct API routes under `/api/*` instead of the catch-all proxy.
  return res.status(404).json({ error: 'dynamic API proxy disabled' });
}
