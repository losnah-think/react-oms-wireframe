import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // attempt to load DB-backed helper dynamically
    let listShops: any = null;
    try {
      if (typeof window === 'undefined') {
        // server runtime: require using a static server-only path
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const shopsMod = require('../../../lib/shops');
        listShops = shopsMod?.listShops;
      } else {
        listShops = null;
      }
    } catch (e) {
      listShops = null;
    }

    if (typeof listShops === "function") {
      try {
        const shops = await listShops();
        return res.status(200).json(shops);
      } catch (e) {
        // fallback to mock below
      }
    }

    // fallback to bundling mock integrations only if available
    let mockIntegrations: any[] = [];
    try {
      if (typeof window === 'undefined') {
        // server runtime: require mock integrations statically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mockMod = require('../../../data/mockIntegrations');
        mockIntegrations = mockMod?.mockIntegrations || mockMod?.default || [];
      } else {
        mockIntegrations = [];
      }
    } catch (e) {
      mockIntegrations = [];
    }

    const mapped = (mockIntegrations || []).map((m: any) => ({
      id: m.id,
      platform: m.platform || "unknown",
      name: m.storeName || m.platform || m.id,
      credentials: m.secrets
        ? Object.fromEntries(m.secrets.map((s: any) => [s.key, s.value]))
        : undefined,
    }));
    return res.status(200).json(mapped);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
