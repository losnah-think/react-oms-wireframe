import { NextApiRequest, NextApiResponse } from "next";
import { getProduct, makePlaceholderProduct } from "src/lib/products";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query as { id: string };
  if (req.method !== "GET") return res.status(405).end("Method not allowed");
  try {
    console.debug("[api/products/[id]] request id=", id);
    const p = await getProduct(id);
    if (!p) {
      console.debug("[api/products/[id]] product not found for id=", id);
      const placeholder = makePlaceholderProduct(id);
      return res.status(200).json({ product: placeholder });
    }
    console.debug("[api/products/[id]] found product id=", p.id);
    res.status(200).json({ product: p });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown" });
  }
}
