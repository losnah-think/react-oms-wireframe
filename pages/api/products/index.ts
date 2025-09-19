import { NextApiRequest, NextApiResponse } from "next";

const sampleProducts = Array.from({ length: 20 }).map((_, i) => {
  const id = 1000 + i;
  const brand = ["Acme", "Globex", "Initech", "Umbrella"][i % 4];
  const category = ["Clothing", "Electronics", "Home", "Sports"][i % 4];
  const colors = ["red", "blue", "green", "black"];
  const sizes = ["S", "M", "L", "XL"];
  // Use Unsplash images for nicer demo thumbnails (stable queries)
  const unsplashSeeds = [
    "fashion,clothing",
    "electronics,gadget",
    "furniture,home",
    "sports,fitness",
    "beauty,cosmetics",
    "accessories,bag",
  ];
  const seed = unsplashSeeds[i % unsplashSeeds.length];
  const images = [
    `https://source.unsplash.com/collection/190727/400x300?${encodeURIComponent(seed)}&sig=${i}`,
    `https://source.unsplash.com/collection/190727/400x300?${encodeURIComponent(seed)}&sig=${i + 10}`,
  ];
  const variants = [
    {
      id: `v-${id}-1`,
      sku: `SKU-${id}-01`,
      stock: Math.max(0, 30 - i),
      price: (10 + i) * 1000,
      attributes: {
        color: colors[i % colors.length],
        size: sizes[i % sizes.length],
      },
    },
    {
      id: `v-${id}-2`,
      sku: `SKU-${id}-02`,
      stock: Math.max(0, 15 - i),
      price: (9 + i) * 1000,
      attributes: {
        color: colors[(i + 1) % colors.length],
        size: sizes[(i + 1) % sizes.length],
      },
    },
  ];
  // ~66% of items will have a shipping policy value for testing the filter
  const hasShippingPolicy = i % 3 !== 0;
  const suppliers = ["자사", "공급처A", "공급처B", "공급처C"];
  const supplier_name = suppliers[i % suppliers.length];
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
