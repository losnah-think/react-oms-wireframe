import type { NextApiRequest, NextApiResponse } from "next";
import { fetchProducts as fetchCafe24Products } from "../../../../lib/adapters/cafe24";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const shopId = String(req.query.shopId || process.env.CAFE24_SHOP_ID || "1");
  try {
    const products = await fetchCafe24Products(shopId);
    return res.status(200).json({ products });
  } catch (err) {
    // fallback: try runtime mock slice
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path = require("path");
      const root = process.cwd();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(path.join(root, "src", "data", "mockProducts"));
      const mockProducts = mod?.mockProducts || mod?.default || [];
      return res.status(200).json({ products: mockProducts.slice(0, 8) });
    } catch (e) {
      return res.status(500).json({ error: "failed to load products" });
    }
  }
}
