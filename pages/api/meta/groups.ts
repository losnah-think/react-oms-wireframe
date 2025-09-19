import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Mock groups for UI selects
  const groups = [
    { id: "g-1", name: "안나앤 그룹" },
    { id: "g-2", name: "내부 브랜드 A" },
    { id: "g-3", name: "파트너사 B" },
  ];
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.status(200).json({ groups });
}
