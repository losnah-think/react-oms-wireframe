#!/usr/bin/env ts-node

const { upsertProductFromExternal } = require('../../src/lib/importers/cellmate');
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const fileArgIndex = argv.indexOf('--file');
const dryRun = argv.includes('--dry-run');
const inputFile = fileArgIndex >= 0 && argv[fileArgIndex + 1] ? argv[fileArgIndex + 1] : null;

async function main() {
  console.log('Cellmate import scaffold running');

  // Example: replace this with actual fetch from cafe24 API or read from file
  let items: any[] = [];
  if (inputFile) {
    const full = path.resolve(process.cwd(), inputFile);
    if (!fs.existsSync(full)) {
      console.error('Input file not found:', full);
      process.exit(1);
    }
    const raw = fs.readFileSync(full, 'utf8');
    try {
      const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) items = parsed;
  else items = [parsed];
    } catch (e) {
      console.error('Failed to parse input JSON:', e);
      process.exit(1);
    }
  } else {
    items = [
      { product_no: 'CM-1001', name: '샘플1', price: 15000, inventory: 100, selling: true, options: { color: 'Red', size: 'M' }, image: '' },
      { product_no: 'CM-1002', name: '샘플2', price: 25000, inventory: 50, selling: true, options: {}, image: '' },
    ];
  }

  for (const s of items) {
    const p = await upsertProductFromExternal(s, { dryRun });
    if (dryRun) console.log('[dry-run] upsert simulated for', s.product_no || s.name);
    else console.log('Upserted', p.id, p.productName);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
