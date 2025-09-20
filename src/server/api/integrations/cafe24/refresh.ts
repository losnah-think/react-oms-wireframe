import type { NextApiRequest, NextApiResponse } from "next";
import { setShopCredentials, getShop } from "src/lib/shops";
import { requireRole } from "src/lib/permissions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();
  const { shopId } = req.body || {};
  if (!shopId) return res.status(400).json({ error: "shopId required" });
  const check = await requireRole(req as any, res as any, [
    "admin",
    "operator",
  ]);
  if (!check.ok) return res.status(check.status).json(check.body);
  const shop = await getShop(shopId);
  const refreshToken = shop?.credentials?.refreshToken;
  const clientId = shop?.credentials?.clientId || process.env.CAFE24_CLIENT_ID;
  const clientSecret =
    shop?.credentials?.clientSecret || process.env.CAFE24_CLIENT_SECRET;
  const redirectUri =
    shop?.credentials?.redirectUri || process.env.CAFE24_REDIRECT_URI;
  if (!shop || !refreshToken)
    return res.status(400).json({ error: "no refresh token" });
  if (!clientId || !clientSecret || !redirectUri)
    return res.status(400).json({ error: "missing client credentials" });

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("redirect_uri", redirectUri);

    const tokenUrl = "https://oauth.cafe24.com/oauth/token";
    const resp = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`refresh failed: ${resp.status} ${text}`);
    }
    const data = await resp.json();
    await setShopCredentials(shopId, {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "refresh failed" });
  }
}
