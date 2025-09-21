import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "1" ||
    process.env.NODE_ENV !== "production";
  if (!useMocks) return res.status(404).json({ error: "Not found" });
  const { id } = req.query;
  const pid = Array.isArray(id) ? id[0] : id || "0";
  const variants = [
    {
      id: `${pid}-v-1`,
      sku: `${pid}-SKU-1`,
      code: `V-${pid}-1`,
      variant_name: `옵션 1`,
      selling_price: 19900,
      cost_price: 12900,
      supply_price: 14900,
      margin_amount: 5000,
      stock: 10,
      safety_stock: 2,
      warehouse_location: '본사_보관존',
      barcode1: `88000${pid}01`,
      barcode2: `99000${pid}01`,
      barcode3: `77000${pid}01`,
      is_selling: true,
      is_soldout: false,
      is_stock_linked: true,
  extra_fields: { option_supplier_name: '자사', channel_option_codes: `NAVER:OPT-1`, inbound_expected_date: null, inbound_expected_qty: 0, order_status: null, option_memo1: '', option_memo2: '', option_memo3: '', option_memo4: '', option_memo5: '', english_option_name: '', foreign_currency_price: '', hidden_release: false, prevent_bundle: false, auto_scan: false, cafe_sale_use: '관리안함' },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
      attributes: { color: "red", size: "M" },
    },
    {
      id: `${pid}-v-2`,
      sku: `${pid}-SKU-2`,
      code: `V-${pid}-2`,
      variant_name: `옵션 2`,
      selling_price: 17900,
      cost_price: 11000,
      supply_price: 12000,
      margin_amount: 4000,
      stock: 3,
      safety_stock: 1,
      warehouse_location: '물류센터_A',
      barcode1: `88000${pid}02`,
      barcode2: `99000${pid}02`,
      barcode3: `77000${pid}02`,
      is_selling: true,
      is_soldout: false,
      is_stock_linked: false,
  extra_fields: { option_supplier_name: '공급처A', channel_option_codes: `CAFE24:OPT-2`, inbound_expected_date: null, inbound_expected_qty: 0, order_status: null, option_memo1: '', option_memo2: '', option_memo3: '', option_memo4: '', option_memo5: '', english_option_name: '', foreign_currency_price: '', hidden_release: false, prevent_bundle: false, auto_scan: false, cafe_sale_use: '관리안함' },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
      attributes: { color: "blue", size: "L" },
    },
  ];
  res.status(200).json(variants);
}
