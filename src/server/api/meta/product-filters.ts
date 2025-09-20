import type { NextApiRequest, NextApiResponse } from "next";
import { listProductFilters } from "../../../lib/products";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const filters = await listProductFilters();
    return res.status(200).json({ filters });
  } catch (e) {
    return res
      .status(200)
      .json({
        filters: { brands: [], categories: [], suppliers: [], status: [] },
      });
  }
}
