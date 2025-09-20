import type { NextApiRequest, NextApiResponse } from "next";
import { fetchProducts } from "@/lib/adapters/cafe24";
import { upsertProductFromExternal } from "@/lib/importers/cellmate";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const shopId =
      (req.query.shopId as string) ||
      (req.body && req.body.shopId) ||
      "onedns2";
    const dryRun = req.query.dry === "1" || req.body?.dry === true;

    // fetch raw products via adapter
    const raw = await fetchProducts(shopId);
    // Map raw to importer format (ExternalProduct)
    const mapped = (raw as any[]).map((r) => ({
      product_no: r.externalCode || r.id,
      name: r.externalName || r.externalName,
      price: r.price || 0,
      inventory: r.stockQty || r.stockQty || 0,
      selling: r.sellStatus === "Y" || r.productStatus === "sale",
      last_update: r.modifyDate || r.modifyDate,
      options: r.options || {},
      image: r.image || r.representativeImage || r.thumbnailUrl || "",
      externalId: r.externalCode || r.id,
      category: r.category || r.categoryCode || "",
      brand: r.brand || "",
      description: r.description || "",
    }));

    const results = [];
    for (const item of mapped) {
      const out = await upsertProductFromExternal(item as any, { dryRun });
      results.push(out);
    }

    res.status(200).json({ ok: true, count: results.length, results });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
}
