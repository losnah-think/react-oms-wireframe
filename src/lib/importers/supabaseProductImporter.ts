import supabaseAdmin from '../../lib/supabaseClient';

type ProductPayload = any;

function mapProductRow(payload: ProductPayload) {
  const stock = payload.variants ? payload.variants.reduce((s: number, v: any) => s + (v.stock || 0), 0) : (payload.stock || 0);
  return {
    id: payload.id || payload.code || `prd-${Date.now()}`,
    name: payload.name,
    sku: payload.code || null,
    price: payload.selling_price || null,
    stock,
    shop_id: payload.shop_id || null,
    // keep extended data in meta JSON
    meta: {
      englishName: payload.english_name || null,
      classification: payload.classification || null,
      classificationId: payload.classificationId || payload.category_id || null,
      brand: payload.brand_id || payload.brand || null,
      supplier: payload.supplier_id || null,
      originalCost: payload.cost_price || null,
      supplyPrice: payload.supply_price || null,
      retailPrice: payload.retail_price || null,
      description: payload.description || null,
      images: payload.images || [],
      dimensions: payload.variants && payload.variants[0] ? {
        width_cm: payload.variants[0].width_cm || null,
        height_cm: payload.variants[0].height_cm || null,
        depth_cm: payload.variants[0].depth_cm || null,
        weight_g: payload.variants[0].weight_g || null,
      } : null,
      hs_code: payload.hs_code || null,
      origin_country: payload.origin_country || null,
      tags: payload.tags || null,
      memos: payload.memos || null,
      season: payload.season || null
    }
  };
}

function mapVariantRow(productId: string, variant: any) {
  const optionValues: any = {
    name: variant.variant_name || variant.name || null,
    attributes: {},
    barcodes: [variant.barcode1, variant.barcode2, variant.barcode3].filter(Boolean),
    cost_price: variant.cost_price || null,
    supply_price: variant.supply_price || null,
    warehouse_location: variant.warehouse_location || null,
  };
  // try parse "Color=Red;Size=M" style into attributes
  if (variant.variant_name && variant.variant_name.includes('=')) {
    variant.variant_name.split(';').forEach((pair: string) => {
      const [k, v] = pair.split('=');
      if (k && v) optionValues.attributes[k.trim()] = v.trim();
    });
  }

  return {
    product_id: productId,
    sku: variant.code || variant.sku || null,
    option_values: optionValues,
    stock: variant.stock || 0,
    price: variant.selling_price || variant.price || null
  };
}

async function ensureBrand(name: string, dryRun: boolean) {
  // In dry run return a deterministic fake id
  if (dryRun) return `brand::${name}`;
  // try find by name
  const q = await supabaseAdmin.from('brands').select('id').eq('name', name).limit(1).maybeSingle();
  if (q.error) throw q.error;
  if (q.data && q.data.id) return q.data.id;
  // insert with id = name (text) to keep simple mapping
  const { data, error } = await supabaseAdmin.from('brands').insert({ id: name, name }).select('id').single();
  if (error) throw error;
  return data.id;
}

async function ensureSupplier(nameOrId: string, dryRun: boolean) {
  if (dryRun) return `supplier::${nameOrId}`;
  const q = await supabaseAdmin.from('suppliers').select('id').eq('name', nameOrId).limit(1).maybeSingle();
  if (q.error) throw q.error;
  if (q.data && q.data.id) return q.data.id;
  const { data, error } = await supabaseAdmin.from('suppliers').insert({ id: nameOrId, name: nameOrId }).select('id').single();
  if (error) throw error;
  return data.id;
}

async function ensureCategory(codeOrId: string, dryRun: boolean) {
  if (dryRun) return `category::${codeOrId}`;
  const q = await supabaseAdmin.from('categories').select('id').eq('name', codeOrId).limit(1).maybeSingle();
  if (q.error) throw q.error;
  if (q.data && q.data.id) return q.data.id;
  const { data, error } = await supabaseAdmin.from('categories').insert({ id: codeOrId, name: codeOrId }).select('id').single();
  if (error) throw error;
  return data.id;
}

export async function upsertProductToSupabase(payload: ProductPayload, opts?: { dryRun?: boolean }) {
  const dryRun = opts?.dryRun ?? true;
  const productRow = mapProductRow(payload);

  if (dryRun) {
    console.log('DRY RUN - product row would be upserted:', JSON.stringify(productRow, null, 2));
  }

  // Upsert product by productCode if available, otherwise insert new row
  let productId: string | null = null;
  let productUpsertResult: any = null;
  if (!dryRun) {
    // ensure masters: brand, supplier, category using original payload values
    productRow.meta = productRow.meta || {};
    const brandName = payload.brand_id || payload.brand || payload.meta?.brand || null;
    const supplierName = payload.supplier_id || payload.supplier || payload.meta?.supplier || null;
    const classificationCode = payload.classificationId || payload.category_id || payload.classification || null;
    if (brandName) {
      const brandId = await ensureBrand(String(brandName), dryRun);
      (productRow.meta as any)['brand_id'] = brandId;
    }
    if (supplierName) {
      const supplierId = await ensureSupplier(String(supplierName), dryRun);
      (productRow.meta as any)['supplier_id'] = supplierId;
    }
    if (classificationCode) {
      const catId = await ensureCategory(String(classificationCode), dryRun);
      (productRow.meta as any)['classification_id'] = catId;
    }

  // choose conflict column: prefer id if provided else sku
  const conflictCol = productRow.id ? 'id' : 'sku';
  const { data, error } = await supabaseAdmin.from('products').upsert(productRow, { onConflict: conflictCol }).select('id').single();
    if (error) throw error;
    productUpsertResult = data;
    productId = data?.id;
  } else {
    productId = payload.id ? String(payload.id) : null;
  }

  // Upsert variants
  if (payload.variants && payload.variants.length) {
    const variantsRows = payload.variants.map((v: any) => mapVariantRow(productId || '', v));
    if (dryRun) {
      console.log('DRY RUN - variant rows would be upserted:', JSON.stringify(variantsRows, null, 2));
      return { productRow, variantsRows };
    }

    // Use sku as unique key for variants when possible
  const { data: upserted, error: variantError } = await supabaseAdmin.from('product_variants').upsert(variantsRows, { onConflict: 'sku' }).select('id,sku');
  if (variantError) throw variantError;
  return { product: productUpsertResult, variants: upserted };
  }

  return { product: productId };
}

export default upsertProductToSupabase;
