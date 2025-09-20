import type { NextApiRequest, NextApiResponse } from "next";
import { listClassifications } from "../../../lib/classifications";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const data = await listClassifications();
    return res.status(200).json({ classifications: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
