import type { NextApiRequest, NextApiResponse } from "next";
import { mockCafe24Orders } from "../../../../data/mockCafe24Orders";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Return sample cafe24 orders for UI/testing
  return res.status(200).json({ orders: mockCafe24Orders });
}
