import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // attempt to load DB-backed helper dynamically
    let listShops: any = null;
    try {
      // require at runtime so build won't fail when module absent
      // use an absolute project-root path to avoid webpack resolution issues
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const p = require("path");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const root = process.cwd();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const shopsMod = require(p.join(root, "src", "lib", "shops"));
      listShops = shopsMod?.listShops;
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
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const p = require("path");
      const root = process.cwd();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mockMod = require(p.join(root, "src", "data", "mockIntegrations"));
      mockIntegrations = mockMod?.mockIntegrations || mockMod?.default || [];
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
