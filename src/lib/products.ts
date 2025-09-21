// Supabase admin client is optional for demo/static deploys. When not present,
// fall back to local mock data so pages (e.g. product detail) still render.
let supabaseAdmin: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const client = require('./supabaseClient')
  supabaseAdmin = client?.default || client
} catch (e) {
  supabaseAdmin = null
}

function tryRequireMock() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const root = process.cwd()
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(path.join(root, 'src', 'data', 'mockProductFilters'))
    return mod?.mockProductFilterOptions || mod?.default || { brands: [], categories: [], suppliers: [], status: [] }
  } catch (e) {
    return { brands: [], categories: [], suppliers: [], status: [] }
  }
}

function requireMockProducts() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('../data/mockProducts')
}

export async function listProductFilters() {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('brand_id, brand:brands(name,id), category_id, supplier_id')
      .limit(100)
    if (error) throw error
    if (data && data.length > 0) {
      // basic shape: extract unique brands/categories/suppliers
      const brands: any[] = []
      const categories: any[] = []
      const suppliers: any[] = []
      data.forEach((r: any) => {
        if (r.brand) brands.push(r.brand)
        if (r.category_id) categories.push({ id: r.category_id, name: r.category_name || String(r.category_id) })
        if (r.supplier_id) suppliers.push({ id: r.supplier_id, name: r.supplier_name || String(r.supplier_id) })
      })
      const uniq = (arr: any[]) => Array.from(new Map(arr.map((a) => [a.id, a])).values())
      return { brands: uniq(brands), categories: uniq(categories), suppliers: uniq(suppliers), status: [] }
    }
  } catch (e) {
    // ignore and fallback
  }
  return tryRequireMock()
}
export type ProductSummary = {
  id: string
  name: string
  sku?: string
  price?: number
  stock?: number
  shop_id?: string
}

export async function listProducts(limit = 100, offset = 0): Promise<ProductSummary[]> {
  if (!supabaseAdmin) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = requireMockProducts()
      const { mockProducts } = mod
      return (mockProducts || []).slice(offset, offset + limit).map((p: any) => ({
        id: String(p.id),
        name: p.name,
        sku: p.code || p.sku,
        price: p.selling_price,
        stock: (p.variants || []).reduce((s: number, v: any) => s + (v.stock || 0), 0),
        shop_id: p.shop_id
      }))
    } catch (e) {
      return []
    }
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, name, sku, price, stock, shop_id')
    .order('created_at', { ascending: false })
    .range(offset, Math.max(0, offset + limit - 1))

  if (error) throw error
  return (data || []) as ProductSummary[]
}

export async function getProduct(id: string) {
  if (!supabaseAdmin) {
    try {
      console.debug('[lib/products] supabaseAdmin not configured — using mock fallback')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = requireMockProducts()
      const { mockProducts } = mod
      const found = (mockProducts || []).find((p: any) => String(p.id) === String(id))
      if (found) return found

      // If not found in mock data, generate a lightweight placeholder so UI can render
      const pid = Number(id) || Date.now()
      const placeholder = makePlaceholderProduct(String(pid))
      return placeholder
    } catch (e) {
      return null
    }
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Attempts to match an order to a product using product.matching_keywords.
 * Returns an object with `matched: boolean` and `matchedKeywords: string[]`.
 * Matching is case-insensitive and checks common order fields and item names/SKUs.
 */
export function matchOrder(order: any, product: any): { matched: boolean; matchedKeywords: string[] } {
  if (!order || !product) return { matched: false, matchedKeywords: [] }
  const rawKeywords = product.matching_keywords || product.matchingKeywords || []
  const keywords = Array.isArray(rawKeywords) ? rawKeywords.map((k: any) => String(k).trim()).filter(Boolean) : []
  if (keywords.length === 0) return { matched: false, matchedKeywords: [] }

  const haystackFields: string[] = []
  // common top-level order fields
  if (order.customer_name) haystackFields.push(String(order.customer_name))
  if (order.buyer_name) haystackFields.push(String(order.buyer_name))
  if (order.shipping_address) haystackFields.push(String(order.shipping_address))
  if (order.memo) haystackFields.push(String(order.memo))
  if (order.order_note) haystackFields.push(String(order.order_note))

  // item-level fields
  if (Array.isArray(order.items)) {
    for (const it of order.items) {
      if (it.name) haystackFields.push(String(it.name))
      if (it.sku) haystackFields.push(String(it.sku))
      if (it.options) haystackFields.push(String(it.options))
    }
  }

  const haystack = haystackFields.join(" \n ").toLowerCase()
  const matchedKeywords: string[] = []
  for (const kw of keywords) {
    const k = String(kw).toLowerCase()
    if (k.length === 0) continue
    if (haystack.indexOf(k) !== -1) matchedKeywords.push(kw)
  }
  return { matched: matchedKeywords.length > 0, matchedKeywords }
}

export function makePlaceholderProduct(id: string) {
  const pid = Number(id) || Date.now()
  // If caller requests the demo product 1000, return the exact sample payload
  if (String(pid) === '1000') {
    return {
      id: pid,
      code: `PRD-1000`,
      name: `라뮤즈 본딩 하프코트 SET`,
      selling_price: 0,
      supply_price: 0,
      cost_price: 0,
      images: [
        `https://picsum.photos/seed/${pid}/800/600`
      ],
      variants: [
        {
          id: `v-${pid}-1`,
          code: `V-${pid}-1`,
          variant_name: '단일상품',
          option_supplier_name: '',
          selling_price: 0,
          cost_price: 0,
          supply_price: 0,
          margin_amount: 0,
          stock: 0,
          safety_stock: 0,
          warehouse_location: 'ON',
          barcode1: `10034620000`,
          barcode2: '',
          barcode3: '',
          is_selling: true,
          is_soldout: false,
          is_stock_linked: true,
          extra_fields: {
            option_supplier_name: '',
            channel_option_codes: '',
            inbound_expected_date: null,
            inbound_expected_qty: 0,
            order_status: null,
            option_memo1: '',
            option_memo2: '',
            option_memo3: '',
            option_memo4: '',
            option_memo5: '',
            english_option_name: '',
            foreign_currency_price: '',
            hidden_release: false,
            prevent_bundle: false,
            auto_scan: false,
            cafe_sale_use: '관리안함',
          },
          created_at: '2025-06-23T10:46:05.000Z',
          created_by: 'smart',
          updated_at: '2025-08-20T15:38:00.000Z',
          updated_by: 'sbkim',
        },
      ],
      description: '샘플 상품(테스트용) - 전체 필드 채워짐',
      created_at: '2025-06-23T10:46:05.000Z',
      tags: ['데모', '샘플'],
      brand: '샘플 브랜드',
      brand_id: null,
      supplier_id: null,
      memos: ['샘플 메모 1'],
      classification_id: 'demo-cat-1',
      hs_code: '0000.00',
      origin_country: 'KR',
      box_qty: 1,
      externalMall: null,
    }
  }
  return {
    id: pid,
    code: `PRD-PLACEHOLDER-${pid}`,
    name: `샘플 상품 (${pid})`,
    selling_price: 19900,
    supply_price: 14900,
    cost_price: 12900,
    images: [
      `https://picsum.photos/seed/${pid}/800/600`
    ],
    variants: [
      {
        id: `v-${pid}-1`,
        code: `V-${pid}-1`,
        variant_name: '기본 옵션',
        selling_price: 19900,
        cost_price: 12900,
        supply_price: 14900,
        margin_amount: 5000,
        stock: 25,
        safety_stock: 5,
        warehouse_location: '본사_보관존',
        barcode1: `8800000${pid}1`,
        barcode2: `9900000${pid}1`,
        barcode3: `7700000${pid}1`,
        is_selling: true,
        is_soldout: false,
        is_stock_linked: true,
        extra_fields: {
          option_supplier_name: '샘플공급처',
          channel_option_codes: 'NAVER:OPT-1;CAFE24:OPT-2',
          foreign_currency_price: '',
          inbound_expected_date: null,
          inbound_expected_qty: 0,
          order_status: null,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    description: '데모 환경: 실제 데이터가 없습니다.',
    created_at: new Date().toISOString(),
    tags: ['데모', '샘플'],
    brand: '샘플 브랜드',
    brand_id: null,
    supplier_id: null,
    memos: ['샘플 메모 1', '샘플 메모 2'],
    classification_id: 'demo-cat-1',
    hs_code: '0000.00',
    origin_country: 'KR',
    box_qty: 1,
    externalMall: null,
  }
}

export type ProductVariantUpsert = {
  id?: string
  sku?: string
  price?: number
  stock?: number
  option_values?: any
}

export async function upsertProductVariants(productId: string, variants: ProductVariantUpsert[]) {
  if (!Array.isArray(variants)) throw new Error('variants must be array')
  // strategy: upsert by id when provided, else insert new with generated uuid
  const toInsert = variants.filter(v => !v.id).map(v => ({ ...v, product_id: productId }))
  const toUpdate = variants.filter(v => v.id)

  // perform inserts
  if (toInsert.length > 0) {
    const { error: insertErr } = await supabaseAdmin.from('product_variants').insert(toInsert)
    if (insertErr) throw insertErr
  }

  // perform updates one-by-one (Supabase JS upsert with PK mapping can be used if id provided)
  for (const v of toUpdate) {
    const id = v.id as string
  const patch: any = { ...v }
  delete patch.id
  // ensure product_id is set
  patch.product_id = productId
    const { error: uErr } = await supabaseAdmin.from('product_variants').update(patch).eq('id', id)
    if (uErr) throw uErr
  }

  // return current list
  const { data, error } = await supabaseAdmin.from('product_variants').select('*').eq('product_id', productId)
  if (error) throw error
  return data
}
