import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Serve the Swagger UI page located at /docs/api by redirecting
  return res.redirect('/docs/api');
}
