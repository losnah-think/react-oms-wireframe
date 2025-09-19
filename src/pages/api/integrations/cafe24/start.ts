import type { NextApiRequest, NextApiResponse } from "next";
import { setShopCredentials, getShop } from "src/lib/shops";
import crypto from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();
  const { shopId, clientId } = req.body || {};
  if (!shopId || !clientId)
    return res.status(400).json({ error: "shopId and clientId required" });

  // determine origin to build redirectUri
  const origin =
    (req.headers.origin as string) ||
    `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
  const redirectUri = `${origin}/api/integrations/cafe24/callback`;

  const nonce = crypto.randomBytes(16).toString("hex");

  // persist clientId, redirectUri and oauth state
  // if server env has a global client secret, save it as well
  const creds: any = { clientId, redirectUri, oauthState: nonce };
  if (process.env.CAFE24_CLIENT_SECRET)
    creds.clientSecret = process.env.CAFE24_CLIENT_SECRET;
  await setShopCredentials(shopId, creds);

  const state = encodeURIComponent(`${shopId}::${nonce}`);
  const authUrl = `https://auth.cafe24.com/oauth/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  return res.status(200).json({ authUrl });
}
