import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "1" ||
    process.env.NODE_ENV !== "production";
  if (!useMocks) return res.status(404).json({ error: "Not found" });
  const { id, vid } = req.query;
  const pid = Array.isArray(id) ? id[0] : id || "0";
  const v = Array.isArray(vid) ? vid[0] : vid || "v-1";
  const variant = {
    id: `${pid}-${v}`,
    sku: `${pid}-${v}`,
    stock: 7,
    attributes: { color: "red", size: "M" },
  };
  res.status(200).json(variant);
}
