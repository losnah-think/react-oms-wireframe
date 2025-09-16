#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
let upsertProductToSupabase = null;
try {
  upsertProductToSupabase = require('../src/lib/importers/supabaseproductimporter').upsertProductToSupabase || require('../src/lib/importers/supabaseproductimporter').default;
} catch (e) {
  // module missing; the script will skip actual upserts when missing
  upsertProductToSupabase = null;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || !args.includes('--write');
  const fileArgIndex = args.indexOf('--file');
  let products = null;
  if (fileArgIndex >= 0 && args[fileArgIndex+1]) {
    const filePath = path.resolve(process.cwd(), args[fileArgIndex+1]);
    products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else {
    // attempt to load real products loader from lib if present
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { listProducts } = require('../src/lib/products')
      if (typeof listProducts === 'function') {
        products = await listProducts({ limit: 100 })
      }
    } catch (e) {
      // fallback to mock products — may be TypeScript source not require-able in node
      try {
        products = require('../src/data/mockProducts').mockProducts;
      } catch (err) {
        console.warn('mockProducts not available as require() module; proceeding with empty list')
        products = []
      }
    }
  }

  for (const p of products.slice(0, 5)) { // limit for quick runs
    console.log('Importing product', p.id, p.code);
    if (upsertProductToSupabase) {
      const res = await upsertProductToSupabase(p, { dryRun });
      console.log('Result:', res && typeof res === 'object' ? 'OK' : res);
    } else {
      console.log('upsertProductToSupabase not available; skipping (dry run)')
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
