import type { NextApiRequest, NextApiResponse } from "next";
import { upsertProductVariants } from "@/lib/products";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: "missing product id" });
  if (req.method !== "POST")
    return res.status(405).json({ error: "method not allowed" });
  try {
    const variants =
      req.body && Array.isArray(req.body) ? req.body : req.body?.variants || [];
    const data = await upsertProductVariants(id, variants);
    return res.status(200).json({ ok: true, variants: data });
  } catch (e: any) {
    console.error("variants upsert error", e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
}
