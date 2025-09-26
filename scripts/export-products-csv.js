#!/usr/bin/env node
/*
  scripts/export-products-csv.js
  - Exports products + variants to CSV using the project's Prisma client if available.
  - Output columns (matches sample template):
    id,product_code,product_name,brand,price,stock,thumbnail_url,variant_id,variant_name,variant_price,variant_stock

  Usage:
    node scripts/export-products-csv.js [--out=path/to/out.csv] [--encoding=utf8|euc-kr]

  Notes:
  - Requires generated Prisma client or @prisma/client available. If not present, falls back to writing the sample template CSV in scripts/templates/
  - The script attempts common field name fallbacks for product/variant attributes. Adjust mapping where needed for your schema.
*/

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [k, v] = arg.slice(2).split('=');
      args[k] = v === undefined ? true : v;
    } else if (arg.includes('=')) {
      const [k, v] = arg.split('=');
      args[k] = v;
    }
  });
  return args;
}

function csvEscape(s) {
  if (s === null || s === undefined) return '';
  const str = String(s);
  if (str.includes('"')) return `"${str.replace(/\"/g, '"').replace(/"/g, '""')}"`;
  if (str.includes(',') || str.includes('\n') || str.includes('\r')) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

async function main() {
  const args = parseArgs();
  const out = path.resolve(process.cwd(), args.out || args.o || 'products-export.csv');
  const encoding = (args.encoding || 'utf8').toLowerCase();

  // Try to load a Prisma client: first prefer generated client, then @prisma/client
  let PrismaClient = null;
  try {
    // project may generate a client under generated/prisma/client.js
    PrismaClient = require(path.join(process.cwd(), 'generated', 'prisma', 'client')).PrismaClient;
  } catch (e) {
    try {
      PrismaClient = require('@prisma/client').PrismaClient;
    } catch (e2) {
      PrismaClient = null;
    }
  }

  if (!PrismaClient) {
    console.warn('Prisma client not found. Falling back to template CSV (mock).');
    const templatePath = path.join(process.cwd(), 'scripts', 'templates', 'products-bulk-sample.csv');
    if (fs.existsSync(templatePath)) {
      const data = fs.readFileSync(templatePath);
      fs.writeFileSync(out, data);
      console.log(`Wrote mock CSV to ${out}`);
      return;
    } else {
      console.error('Template not found at', templatePath);
      process.exit(1);
    }
  }

  const prisma = new PrismaClient();

  // Try a few common model names and field fallbacks.
  let products = [];
  const tryQueries = [
    // common: product model with variants relation
    async () => prisma.product.findMany({ include: { variants: true } }),
    async () => prisma.product.findMany({ include: { options: true } }),
    async () => prisma.products.findMany({ include: { variants: true } }),
    async () => prisma.Product.findMany({ include: { variants: true } }),
  ];

  let lastError = null;
  for (const q of tryQueries) {
    try {
      products = await q();
      if (Array.isArray(products)) break;
    } catch (e) {
      lastError = e;
    }
  }

  if (!Array.isArray(products)) {
    console.error('Failed to query products from Prisma client. Last error:', lastError && lastError.message);
    console.error('If your Prisma model is named differently, adjust the script to match your schema.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const header = ['id','product_code','product_name','brand','price','stock','thumbnail_url','variant_id','variant_name','variant_price','variant_stock'];
  const rows = [header.join(',')];

  for (const p of products) {
    // product-level fallbacks
    const pid = p.id ?? p.productId ?? p._id ?? p.id_str ?? '';
    const pcode = p.code ?? p.product_code ?? p.productCode ?? p.sku ?? p.externalCode ?? '';
    const pname = p.name ?? p.product_name ?? p.title ?? '';
    const brand = p.brand ?? p.manufacturer ?? p.vendor ?? '';
    const price = p.price ?? p.defaultPrice ?? p.listPrice ?? '';
    const stock = p.stock ?? p.inventory ?? p.quantity ?? '';
    const thumb = p.thumbnailUrl ?? p.thumbnail_url ?? p.imageUrl ?? p.cover ?? '';

    const variants = p.variants ?? p.options ?? p.productVariants ?? [];

    if (!Array.isArray(variants) || variants.length === 0) {
      const row = [pid,pcode,pname,brand,price,stock,thumb,'','','',''].map(csvEscape).join(',');
      rows.push(row);
    } else {
      for (const v of variants) {
        const vid = v.id ?? v.variantId ?? v.sku ?? '';
        const vname = v.name ?? v.variant_name ?? v.title ?? '';
        const vprice = v.price ?? v.variantPrice ?? v.listPrice ?? '';
        const vstock = v.stock ?? v.inventory ?? v.quantity ?? '';
        const row = [pid,pcode,pname,brand,price,stock,thumb,vid,vname,vprice,vstock].map(csvEscape).join(',');
        rows.push(row);
      }
    }
  }

  // write file
  fs.writeFileSync(out, rows.join('\n'), { encoding: 'utf8' });
  console.log(`Exported ${rows.length-1} rows to ${out}`);

  await prisma.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
