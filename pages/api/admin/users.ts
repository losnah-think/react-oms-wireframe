import type { NextApiRequest, NextApiResponse } from "next";
import { listUsers, addUser } from "src/lib/users";
import { requireRole } from "src/lib/permissions";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const check = await requireRole(req, res, ["admin"]);
  if (!check.ok) return res.status(check.status).json(check.body);

  if (req.method === "GET") {
    return res.status(200).json(listUsers());
  }
  if (req.method === "POST") {
    const { email, name, role, password } = req.body || {};
    if (!email || !role)
      return res.status(400).json({ error: "email and role required" });
    const salt = bcrypt.genSaltSync(10);
    const hash = password ? bcrypt.hashSync(password, salt) : undefined;
    const u = addUser({
      id: `u-${Date.now()}`,
      email,
      name,
      role,
      password_hash: hash,
    });
    return res.status(201).json(u);
  }
  return res.status(405).end();
}
