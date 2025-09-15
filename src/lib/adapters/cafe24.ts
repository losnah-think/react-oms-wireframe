// Lightweight Cafe24 adapter skeleton.
// This file provides a function to fetch products from Cafe24 Admin API.
// Note: actual integration requires secure token storage and server-side OAuth handling.

export interface Cafe24RawProduct {
  product_no?: string;
  product_name?: string;
  price?: number;
  inventory?: number;
  selling?: boolean;
  updated_at?: string;
  // ...other Cafe24 fields
}

import { getShop } from '../shops'
import { logIntegration } from '../logs'

export async function fetchCafe24Products(accessToken: string, shopId: string) : Promise<Cafe24RawProduct[]> {
  // Dev-mode shortcut: if running locally and token looks like our dev token, return mock products
  if (process.env.NODE_ENV !== 'production' && typeof accessToken === 'string' && accessToken.startsWith('dev_access_')) {
    logIntegration(shopId, 'cafe24', 'info', 'dev token detected — returning mock products')
    const devMock: Cafe24RawProduct[] = [
      { product_no: 'dev_001', product_name: '[DEV] 샘플 상품 1', price: 10000, inventory: 5, selling: true, updated_at: '2025-09-14' },
      { product_no: 'dev_002', product_name: '[DEV] 샘플 상품 2', price: 20000, inventory: 2, selling: true, updated_at: '2025-09-13' },
    ]
    return devMock
  }
  // Skeleton: replace URL and params with the actual Cafe24 Admin API endpoint
  const url = `https://api.cafe24.com/admin/products?shop_no=${shopId}`;
  const fetchFn: typeof fetch = (globalThis as any).fetch || fetch;

  async function doRequest(token: string) {
    const res = await fetchFn(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return res;
  }

  // Retry loop with exponential backoff (max 10 attempts)
  const maxAttempts = 10
  let attempt = 0
  let lastError: any = null

  while (attempt < maxAttempts) {
    attempt += 1
    try {
      logIntegration(shopId, 'cafe24', 'info', `attempt ${attempt}: requesting products`, { attempt })
      const tokenToUse = attempt === 1 ? accessToken : ((await getShop(shopId))?.credentials?.accessToken || accessToken)
      let res = await doRequest(tokenToUse)

      if (res.status === 401) {
        // try server-side refresh
        try {
          const base = (process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || process.env.NEXTAUTH_URL) || ''
          const refreshUrl = base ? `${base.replace(/\/$/, '')}/api/integrations/cafe24/refresh` : '/api/integrations/cafe24/refresh'
          const refreshResp = await fetchFn(refreshUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shopId }) })
          if (!refreshResp.ok) {
            const txt = await refreshResp.text().catch(() => '')
            throw new Error(`refresh endpoint failed: ${refreshResp.status} ${txt}`)
          }
          logIntegration(shopId, 'cafe24', 'info', `refresh succeeded on attempt ${attempt}`)
          // after refresh, loop will retry using updated token
          lastError = null
        } catch (e) {
          lastError = e
          logIntegration(shopId, 'cafe24', 'warn', `refresh attempt failed: ${String(e)}`, { attempt })
        }
      } else if (!res.ok) {
        const text = await res.text().catch(() => '')
        lastError = new Error(`Cafe24 API error: ${res.status} ${text}`)
        logIntegration(shopId, 'cafe24', 'warn', `request failed: ${res.status}`, { attempt, text })
      } else {
        const data = await res.json().catch(() => ({}))
        const items = (data?.products || data?.items || []) as Cafe24RawProduct[]
        logIntegration(shopId, 'cafe24', 'info', `request succeeded on attempt ${attempt}`, { count: Array.isArray(items) ? items.length : 0 })
        return items
      }
    } catch (e) {
      lastError = e
      logIntegration(shopId, 'cafe24', 'error', `request error: ${String(e)}`, { attempt })
    }

    // exponential backoff before next attempt
    const backoffMs = Math.min(30000, Math.pow(2, attempt) * 100)
    await new Promise(r => setTimeout(r, backoffMs))
  }

  // after exhausting attempts, throw accumulated error
  logIntegration(shopId, 'cafe24', 'error', `exhausted ${maxAttempts} attempts`, { error: String(lastError) })
  throw lastError || new Error('Cafe24 adapter: unknown error after retries')
}

// Registry-compatible wrapper: (shopId, params) => products[]
export async function fetchProducts(shopId: string, params?: any) {
  // Try to read shop credentials from registry
  const shop = await getShop(shopId)
  const accessToken = shop?.credentials?.accessToken || process.env.CAFE24_ACCESS_TOKEN || ''
  // If no token available, throw or return empty in production; here we simulate.
  if (!accessToken) {
    // return mock until credentials are configured
    return []
  }
  const raw = await fetchCafe24Products(accessToken, shopId)
  // Normalize raw products into ExternalProduct-like shape
  return raw.map((r: any) => ({
    id: String(r.product_no || r.id || Math.random()),
    externalName: r.product_name || r.name || '',
    externalCode: r.product_no || r.sku || '',
    price: r.price || r.sale_price || 0,
    category: r.category_name || '',
    brand: r.brand || '',
    hasBarcode: !!r.barcode,
    externalUrl: r.product_url || '',
    selected: false,
    displayStatus: r.display === true || r.selling ? 'Y' : 'N',
    sellStatus: r.selling ? 'Y' : 'N',
    productStatus: r.sold_out ? 'soldout' : r.selling ? 'sale' : 'stop',
    registDate: r.created_at || r.regist_date || '',
    modifyDate: r.updated_at || r.modify_date || '',
    stockQty: r.inventory || r.stock || 0,
    categoryCode: r.category_code || '',
  }));
}
