#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function usage() {
  console.log('Usage: node scripts/supabase-upsert.js --file <path-to-json> [--write]');
  process.exit(1);
}

const args = process.argv.slice(2);
const fileIdx = args.indexOf('--file');
if (fileIdx < 0 || !args[fileIdx + 1]) return usage();
const filePath = path.resolve(process.cwd(), args[fileIdx + 1]);
const write = args.includes('--write');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in env — running in dry-run only');
}

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
}

function mapProduct(p) {
  const stock = p.variants ? p.variants.reduce((s, v) => s + (v.stock || 0), 0) : (p.stock || 0);
    const id = p.id || p.code || `prd-${Date.now()}`;
    return {
    id,
    name: p.name,
    sku: p.code || null,
    external_sku: p.external_sku || p.code || null,
    price: p.selling_price || null,
    stock,
    shop_id: p.shop_id || null,
    meta: {
      external_sku: p.external_sku || p.code || null,
      englishName: p.english_name || null,
      classification: p.classification || null,
      classificationId: p.classificationId || p.category_id || null,
      brand: p.brand_id || p.brand || null,
      supplier: p.supplier_id || null,
      originalCost: p.cost_price || null,
      supplyPrice: p.supply_price || null,
      retailPrice: p.retail_price || null,
      description: p.description || null,
      images: p.images || [],
      dimensions: p.variants && p.variants[0] ? {
        width_cm: p.variants[0].width_cm || null,
        height_cm: p.variants[0].height_cm || null,
        depth_cm: p.variants[0].depth_cm || null,
        weight_g: p.variants[0].weight_g || null,
      } : null,
      hs_code: p.hs_code || null,
      origin_country: p.origin_country || null,
      tags: p.tags || null,
      memos: p.memos || null,
      season: p.season || null
    }
  };
}

function mapVariant(pId, v) {
  return {
    product_id: pId,
    sku: v.code || null,
    option_values: {
      name: v.variant_name || null,
      barcodes: [v.barcode1, v.barcode2, v.barcode3].filter(Boolean),
      attributes: {}
    },
    stock: v.stock || 0,
    price: v.selling_price || null
  };
}

async function run() {
  const raw = fs.readFileSync(filePath, 'utf8');
  const products = JSON.parse(raw);
  const report = { total: products.length, valid: 0, invalid: 0, errors: [], written: { products: [], variants: [] } };
  const batchSize = 50;
  for (const p of products) {
    const pr = mapProduct(p);
    console.log('Mapped product:', pr.sku || pr.name || pr.id);
    const vErrors = validateProduct(pr);
    if (vErrors.length) {
      report.invalid++;
      report.errors.push({ id: pr.id, errors: vErrors });
      console.warn('Validation errors for', pr.id, vErrors);
      continue;
    }
    report.valid++;
    // resolve masters
    if (supabase && write) {
      if (pr.brandId) {
        pr.brandId = await ensureBrand(pr.brandId, supabase);
      }
      if (pr.supplierId) {
        pr.supplierId = await ensureSupplier(pr.supplierId, supabase);
      }
      if (pr.classificationId) {
        pr.classificationId = await ensureCategory(pr.classificationId, supabase);
      }
    } else {
      // dry-run mode: simulate ids
      if (pr.brandId) pr.brandId = `brand::${pr.brandId}`;
      if (pr.supplierId) pr.supplierId = `supplier::${pr.supplierId}`;
      if (pr.classificationId) pr.classificationId = `category::${pr.classificationId}`;
    }

    if (!write || !supabase) {
      console.log('DRY RUN:', JSON.stringify(pr, null, 2));
      if (p.variants && p.variants.length) console.log('DRY RUN variants:', JSON.stringify(p.variants.map(v=>mapVariant(null,v)), null, 2));
      continue;
    }

  // write product - use `id` (primary key) as the conflict key per Supabase schema
    const { data: prodData, error: prodErr } = await supabase.from('products').upsert(pr, { onConflict: 'id' }).select('id,sku');
    if (prodErr) {
      console.error('Product upsert error', prodErr);
      report.errors.push({ id: pr.id, error: prodErr });
      continue;
    }
    // prodData may be an array (batch) or single object; normalize
    const pid = Array.isArray(prodData) ? (prodData[0] && prodData[0].id) : (prodData && prodData.id);
    const psku = Array.isArray(prodData) ? (prodData[0] && prodData[0].sku) : (prodData && prodData.sku);
    console.log('Upserted product id=', pid, 'sku=', psku);
    if (p.variants && p.variants.length) {
      const variantRows = p.variants.map(v=>mapVariant(pid, v));
      try {
        const { data: varData } = await batchUpsert(supabase, 'product_variants', variantRows, 'sku');
        console.log('Upserted variants:', varData.length);
        report.written.variants.push(...(varData.map(r=>r.id)));
      } catch (e) {
        console.error('Variant batch upsert failed', e.message || e);
        report.errors.push({ id: pr.id, error: e.message || e });
      }
    }
    // record written product id
    if (pid) report.written.products.push(pid);
  }
  // always write a report file next to the input file (so batch runner can collect it)
  try {
    const reportJson = JSON.stringify(report, null, 2);
    // write generic name in cwd for backwards compatibility
    fs.writeFileSync('import-report.json', reportJson);
    console.log('Wrote import-report.json');
    // also write per-input-file report: <input-filename>.report.json
    const reportPath = path.join(path.dirname(filePath), path.basename(filePath) + '.report.json');
    fs.writeFileSync(reportPath, reportJson);
    console.log('Wrote per-file report:', reportPath);
    // also copy into cwd (where batch runner expects reports)
    try {
      const cwdReport = path.join(process.cwd(), path.basename(filePath) + '.report.json');
      fs.writeFileSync(cwdReport, reportJson);
      console.log('Also wrote report to cwd:', cwdReport);
    } catch (e) {
      console.warn('Failed to write report to cwd', e.message || e);
    }
  } catch (e) {
    console.error('Failed to write report file', e);
  }
}

function validateProduct(pr) {
  const errors = [];
  if (!pr.name || typeof pr.name !== 'string' || pr.name.trim() === '') errors.push('name-required');
  if (!pr.sku || typeof pr.sku !== 'string' || pr.sku.trim() === '') errors.push('sku-required');
  if (pr.price !== null && pr.price !== undefined && typeof pr.price !== 'number') errors.push('price-must-be-number');
  if (pr.stock !== null && pr.stock !== undefined && !Number.isInteger(pr.stock)) errors.push('stock-must-be-integer');
  return errors;
}

function validateVariant(vr) {
  const errors = [];
  if (!vr.sku || typeof vr.sku !== 'string' || vr.sku.trim() === '') errors.push('variant-sku-required');
  if (vr.price !== null && vr.price !== undefined && typeof vr.price !== 'number') errors.push('variant-price-number');
  if (vr.stock !== null && vr.stock !== undefined && !Number.isInteger(vr.stock)) errors.push('variant-stock-integer');
  return errors;
}

async function batchUpsert(supabase, table, rows, key, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const { data, error } = await supabase.from(table).upsert(rows, { onConflict: key }).select('id');
    if (!error) return { data };
    console.warn(`Upsert attempt ${attempt} failed for ${table}:`, error.message || error);
    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
  }
  throw new Error(`Failed to upsert to ${table} after ${retries+1} attempts`);
}

async function ensureBrand(name, supabase) {
  // brands table uses id (text) as primary key; try to find by name first, then insert
  const q = await supabase.from('brands').select('id').eq('name', name).limit(1).maybeSingle();
  if (q.error) throw q.error;
  if (q.data && q.data.id) return q.data.id;
  const { data, error } = await supabase.from('brands').insert({ name }).select('id').single();
  if (error) throw error;
  return data.id;
}

async function ensureSupplier(name, supabase) {
  const q = await supabase.from('suppliers').select('id').eq('name', name).limit(1).maybeSingle();
  if (q.error) throw q.error;
  if (q.data && q.data.id) return q.data.id;
  const { data, error } = await supabase.from('suppliers').insert({ name }).select('id').single();
  if (error) throw error;
  return data.id;
}

async function ensureCategory(code, supabase) {
  // categories table in your schema uses id and name; try lookup by code or name first
  const q = await supabase.from('categories').select('id').or(`code.eq.${code},name.eq.${code}`).limit(1).maybeSingle();
  if (q.error) throw q.error;
  if (q.data && q.data.id) return q.data.id;
  const { data, error } = await supabase.from('categories').insert({ code }).select('id').single();
  if (error) throw error;
  return data.id;
}

run().catch(e=>{ console.error(e); process.exit(1); });
