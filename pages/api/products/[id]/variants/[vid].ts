import { NextApiRequest, NextApiResponse } from "next";
import { getProduct } from "src/lib/products";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "1" ||
    process.env.NODE_ENV !== "production";
  if (!useMocks) return res.status(404).json({ error: "Not found" });
  const { id, vid } = req.query;
  const pid = Array.isArray(id) ? id[0] : id || "0";
  const v = Array.isArray(vid) ? vid[0] : vid || "v-1";

  try {
    const p = await getProduct(String(pid));
    if (p && Array.isArray((p as any).variants)) {
      const candidates = (p as any).variants as any[];
      const found = candidates.find((variant, idx) => {
        const possibleIds = [
          variant.id,
          variant.variant_id,
          variant.option_id,
          variant.code,
          variant.option_code,
          variant.barcode1,
          variant.barcode,
          `index-${idx}`,
          String(idx),
        ]
          .filter(Boolean)
          .map((x) => String(x));
        return possibleIds.includes(String(v));
      });
      if (found) return res.status(200).json({ variant: found });
    }
  } catch (e) {
    // ignore and fall back to minimal mock
  }

  const variant = {
    id: `${pid}-${v}`,
    sku: `${pid}-${v}`,
    code: `V-${pid}-${v}`,
    variant_name: `옵션 ${v}`,
    selling_price: 19900,
    cost_price: 12900,
    supply_price: 14900,
    margin_amount: 5000,
    stock: 7,
    safety_stock: 2,
    warehouse_location: '본사_보관존',
    barcode1: `8800000${pid}${v}`,
    barcode2: `9900000${pid}${v}`,
    barcode3: `7700000${pid}${v}`,
    is_selling: true,
    is_soldout: false,
    is_stock_linked: true,
    extra_fields: {
      option_supplier_name: '샘플공급처',
      channel_option_codes: 'NAVER:OPT-1;CAFE24:OPT-2',
      foreign_currency_price: '',
      inbound_expected_date: '',
      inbound_expected_qty: 0,
    },
    attributes: { color: "red", size: "M" },
  };
  return res.status(200).json({ variant });
}
