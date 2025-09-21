import { NextApiRequest, NextApiResponse } from "next";

const sampleProducts = Array.from({ length: 20 }).map((_, i) => {
  const id = 1000 + i;
  const brand = ["Acme", "Globex", "Initech", "Umbrella"][i % 4];
  const category = ["Clothing", "Electronics", "Home", "Sports"][i % 4];
  const colors = ["red", "blue", "green", "black"];
  const sizes = ["S", "M", "L", "XL"];
  // Use picsum.photos seeded images for stable local mocks
  const images = [
    `https://picsum.photos/seed/${id}/800/600`,
    `https://picsum.photos/seed/${id}-1/800/600`,
  ];
  const suppliers = ["자사", "공급처A", "공급처B", "공급처C"];
  const supplier_name = suppliers[i % suppliers.length];

  const variants = [
    {
      id: `v-${id}-1`,
      sku: `SKU-${id}-01`,
      code: `V-${id}-1`,
      variant_name: `옵션 1`,
      selling_price: (10 + i) * 1000,
      cost_price: (7 + i) * 1000,
      supply_price: (8 + i) * 1000,
      margin_amount: 2000,
      stock: Math.max(0, 30 - i),
      safety_stock: 2,
      warehouse_location: '본사_보관존',
      barcode1: `88000${id}01`,
      barcode2: `99000${id}01`,
      barcode3: `77000${id}01`,
      is_selling: true,
      is_soldout: false,
      is_stock_linked: true,
      extra_fields: {
        option_supplier_name: supplier_name,
        channel_option_codes: `NAVER:OPT-1`,
        inbound_expected_date: null,
        inbound_expected_qty: 0,
        order_status: null,
        option_memo1: '',
        option_memo2: '',
        option_memo3: '',
        option_memo4: '',
        option_memo5: '',
        english_option_name: '',
        foreign_currency_price: '',
        hidden_release: false,
        prevent_bundle: false,
        auto_scan: false,
        cafe_sale_use: '관리안함',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attributes: {
        color: colors[i % colors.length],
        size: sizes[i % sizes.length],
      },
    },
    {
      id: `v-${id}-2`,
      sku: `SKU-${id}-02`,
      code: `V-${id}-2`,
      variant_name: `옵션 2`,
      selling_price: (9 + i) * 1000,
      cost_price: (6 + i) * 1000,
      supply_price: (7 + i) * 1000,
      margin_amount: 1500,
      stock: Math.max(0, 15 - i),
      safety_stock: 1,
      warehouse_location: '물류센터_A',
      barcode1: `88000${id}02`,
      barcode2: `99000${id}02`,
      barcode3: `77000${id}02`,
      is_selling: true,
      is_soldout: false,
      is_stock_linked: false,
      extra_fields: {
        option_supplier_name: supplier_name,
        channel_option_codes: `CAFE24:OPT-2`,
        inbound_expected_date: null,
        inbound_expected_qty: 0,
        order_status: null,
        option_memo1: '',
        option_memo2: '',
        option_memo3: '',
        option_memo4: '',
        option_memo5: '',
        english_option_name: '',
        foreign_currency_price: '',
        hidden_release: false,
        prevent_bundle: false,
        auto_scan: false,
        cafe_sale_use: '관리안함',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attributes: {
        color: colors[(i + 1) % colors.length],
        size: sizes[(i + 1) % sizes.length],
      },
    },
  ];
  // ~66% of items will have a shipping policy value for testing the filter
  const hasShippingPolicy = i % 3 !== 0;
  return {
    id: String(id),
    name: `Demo ${brand} ${category} ${i + 1}`,
    sku: `SKU-${id}`,
    brand,
    category,
    tags: ["demo", category.toLowerCase(), brand.toLowerCase()],
    price: (10 + i) * 1000,
    images,
    description: `This is a demo ${category.toLowerCase()} product from ${brand}. Great for testing UI rendering.`,
    inventory: variants.reduce((s, v) => s + v.stock, 0),
    weight_g: 500 + i * 10,
    variants,
    shipping_policy: hasShippingPolicy
      ? i % 2 === 0
        ? "무료배송"
        : "착불"
      : "",
    supplier_name,
  };
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "1" ||
    process.env.NODE_ENV !== "production";
  if (!useMocks) return res.status(404).json({ error: "Not found" });

  const { limit = 1000 } = req.query;
  const l =
    typeof limit === "string" ? parseInt(limit, 10) : Number(limit || 1000);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.status(200).json(sampleProducts.slice(0, l));
}
