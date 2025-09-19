import { NextApiRequest, NextApiResponse } from "next";
import { listOrders } from "src/lib/orders";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") return res.status(405).end("Method not allowed");
  const limit = parseInt(String(req.query.limit || "100"), 10);
  const offset = parseInt(String(req.query.offset || "0"), 10);
  try {
    const items = await listOrders(limit, offset);
    res.status(200).json({ orders: items });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown" });
  }
}
