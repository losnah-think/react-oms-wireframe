import type { NextApiRequest, NextApiResponse } from "next";
import { setShopCredentials, getShop } from "src/lib/shops";

async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
) {
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
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
    throw new Error(`token exchange failed: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  return data;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { code, state } = req.query;
  if (!code) return res.status(400).send("missing code");
  if (!state) return res.status(400).send("missing state");

  const stateVal = Array.isArray(state) ? state[0] : state;
  // state encoded as `${shopId}::${nonce}`
  const [shopId, nonce] = (stateVal || "").split("::");

  const shop = await getShop(shopId);
  const clientId = shop?.credentials?.clientId;
  const clientSecret = shop?.credentials?.clientSecret;
  const redirectUri = shop?.credentials?.redirectUri;
  const savedNonce = shop?.credentials?.oauthState;

  if (!clientId || !redirectUri) {
    return res.status(400).send("missing client credentials for shop");
  }

  if (!nonce || !savedNonce || nonce !== savedNonce) {
    return res.status(400).send("invalid oauth state");
  }

  try {
    const token = await exchangeCodeForToken(
      Array.isArray(code) ? code[0] : code,
      clientId,
      clientSecret || "",
      redirectUri,
    );
    // clear oauthState after successful exchange
    await setShopCredentials(shopId, {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      clientId,
      clientSecret,
      redirectUri,
      oauthState: undefined,
    });
    // redirect back to integration page
    return res.redirect("/settings/integration");
  } catch (err) {
    console.error("exchange error", err);
    return res.status(500).send("token exchange failed");
  }
}
