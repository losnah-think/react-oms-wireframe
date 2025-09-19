import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "", {
  auth: { persistSession: false },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { sku } = req.query;
  if (!sku || typeof sku !== "string")
    return res.status(400).json({ error: "sku required" });
  try {
    // try external_sku column first
    let { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("external_sku", sku)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      // fallback to meta.external_sku or sku column
      const q = await supabase
        .from("products")
        .select("*")
        .or(`sku.eq.${sku},meta->>external_sku.eq.${sku}`)
        .limit(1)
        .maybeSingle();
      if (q.error) throw q.error;
      data = q.data;
    }
    if (!data) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ data });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || e });
  }
}
