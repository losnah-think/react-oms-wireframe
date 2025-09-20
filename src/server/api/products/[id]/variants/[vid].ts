import type { NextApiRequest, NextApiResponse } from "next";
import supabaseAdmin from "@/lib/supabaseClient";
import { upsertProductVariants } from "@/lib/products";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id, vid } = req.query as { id: string; vid: string };
  if (!id || !vid) return res.status(400).json({ error: "missing id or vid" });
  if (req.method === "PUT") {
    try {
      const payload = req.body || {};
      // use upsert helper to update single variant
      const data = await upsertProductVariants(id, [{ id: vid, ...payload }]);
      return res.status(200).json({ ok: true, variants: data });
    } catch (e: any) {
      console.error("variant update error", e);
      return res.status(500).json({ error: e?.message || String(e) });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { error } = await supabaseAdmin
        .from("product_variants")
        .delete()
        .eq("id", vid);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error("variant delete error", e);
      return res.status(500).json({ error: e?.message || String(e) });
    }
  }

  return res.status(405).json({ error: "method not allowed" });
}
