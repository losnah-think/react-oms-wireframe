// Load the generated Prisma client in a way that works for both ESM and CJS.
// Prefer explicit file path to the generated entrypoint to avoid directory import errors.
import { createRequire } from 'module';
const requireFn = typeof require === 'undefined' ? createRequire(import.meta.url) : require;
const { PrismaClient } = requireFn('../../../generated/prisma/index.js');

const prisma = new PrismaClient();

// Ensure client is connected and model delegates are present before usage.
async function ensurePrismaReady() {
  if (!prisma) return;
  // If a known model delegate is missing, try to connect which will initialize delegates.
  try {
    // eslint-disable-next-line no-console
    console.log('ensurePrismaReady: before connect, product type =', typeof (prisma as any).product);
    if (typeof (prisma as any).product === 'undefined') {
      await prisma.$connect();
      // eslint-disable-next-line no-console
      console.log('ensurePrismaReady: after connect, product type =', typeof (prisma as any).product);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('ensurePrismaReady: $connect error', e && (e as any).message ? (e as any).message : e);
  }
}

export type ExternalProduct = {
  product_no?: string;
  name: string;
  price: number;
  inventory: number;
  selling: boolean;
  last_update?: string;
  options?: Record<string, string>;
  image?: string;
  externalId?: string;
  category?: string;
  brand?: string;
  description?: string;
  barcodes?: string[];
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  hsCode?: string;
  origin?: string;
};

export async function upsertProductFromExternal(ep: ExternalProduct, options?: { dryRun?: boolean }) {
  const dryRun = options?.dryRun || false;
  const externalId = ep.externalId || ep.product_no || null;
  await ensurePrismaReady();

  // If dryRun, avoid any DB calls and return a simulated upsert result.
  if (dryRun) {
    const createData: any = {
      productName: ep.name,
      productCode: ep.product_no,
      representativeSellingPrice: ep.price,
      stock: ep.inventory || 0,
      isSelling: ep.selling ?? true,
      externalProductId: externalId,
      description: ep.description,
      representativeImage: ep.image,
      hsCode: ep.hsCode,
      origin: ep.origin,
      width: ep.width,
      height: ep.height,
      depth: ep.depth,
      weight: ep.weight,
    };

    // variant simulation
    let variantPayload: any;
    if (!ep.options || Object.keys(ep.options).length === 0) {
      const variantSku = createData.productCode || `dry-${Math.random().toString(16).slice(2,10)}`;
      variantPayload = {
        productId: createData.productCode || `dry-${Math.random().toString(16).slice(2,10)}`,
        sku: variantSku,
        price: ep.price,
        stock: ep.inventory || 0,
        optionValues: {},
        barcode: (ep as any).barcodes ? (ep as any).barcodes[0] : null,
      };
    } else {
      const optionKey = Object.keys(ep.options).sort().map(k => `${k}=${ep.options![k]}`).join(',');
      const sku = `${createData.productCode ?? `dry-${Math.random().toString(16).slice(2,10)}`}-${Buffer.from(optionKey).toString('hex').slice(0,8)}`;
      variantPayload = {
        productId: createData.productCode || `dry-${Math.random().toString(16).slice(2,10)}`,
        sku,
        price: ep.price,
        stock: ep.inventory || 0,
        optionValues: ep.options as any,
        barcode: (ep as any).barcodes ? (ep as any).barcodes[0] : null,
      };
    }

    return { id: createData.productCode || `dry-${Math.random().toString(16).slice(2,10)}`, ...createData, variant: variantPayload } as any;
  }

  let product: any = null;
  if (externalId) {
    product = await prisma.product.findFirst({ where: { externalProductId: externalId } });
  }
  if (!product && ep.product_no) {
    product = await prisma.product.findFirst({ where: { productCode: ep.product_no } });
  }

  if (!product) {
    const createData: any = {
      productName: ep.name,
      productCode: ep.product_no,
      representativeSellingPrice: ep.price,
      stock: ep.inventory || 0,
      isSelling: ep.selling ?? true,
      externalProductId: externalId,
      description: ep.description,
      representativeImage: ep.image,
      hsCode: ep.hsCode,
      origin: ep.origin,
      width: ep.width,
      height: ep.height,
      depth: ep.depth,
      weight: ep.weight,
    };
    if (dryRun) {
      return { id: createData.productCode || `dry-${Math.random().toString(16).slice(2,10)}`, ...createData } as any;
    }
    product = await prisma.product.create({ data: createData });
  } else {
    const updateData: any = {
      productName: ep.name,
      representativeSellingPrice: ep.price,
      stock: ep.inventory || 0,
      isSelling: ep.selling ?? true,
      description: ep.description,
      representativeImage: ep.image,
      externalProductId: externalId || product.externalProductId,
      hsCode: ep.hsCode,
      origin: ep.origin,
      width: ep.width,
      height: ep.height,
      depth: ep.depth,
      weight: ep.weight,
    };
    if (dryRun) {
      return { ...product, ...updateData } as any;
    }
    product = await prisma.product.update({ where: { id: product.id }, data: updateData });
  }

  // variants
  if (!ep.options || Object.keys(ep.options).length === 0) {
    const variantSku = product.productCode ?? product.id;
    const variantPayload: any = {
      productId: product.id as any,
      sku: variantSku,
      price: ep.price,
      stock: ep.inventory || 0,
      optionValues: {},
      barcode: (ep as any).barcodes ? (ep as any).barcodes[0] : null,
    };
    if (dryRun) {
      return { ...product, variant: variantPayload } as any;
    }
    const variant = await prisma.productVariant.upsert({ where: { sku: variantSku }, update: variantPayload, create: variantPayload });
    await prisma.inventoryMovement.create({ data: { productId: product.id as any, variantId: variant.id, quantity: ep.inventory || 0, type: 'import', note: `Imported from external source ${externalId ?? ''}` } });
    return { ...product, variant } as any;
  }

  const optionKey = Object.keys(ep.options).sort().map(k => `${k}=${ep.options![k]}`).join(',');
  const sku = `${product.productCode ?? product.id}-${Buffer.from(optionKey).toString('hex').slice(0,8)}`;
  const variantPayload: any = {
    productId: product.id as any,
    sku,
    price: ep.price,
    stock: ep.inventory || 0,
    optionValues: ep.options as any,
    barcode: (ep as any).barcodes ? (ep as any).barcodes[0] : null,
  };
  if (dryRun) {
    return { ...product, variant: variantPayload } as any;
  }
  const variant = await prisma.productVariant.upsert({ where: { sku }, update: variantPayload, create: variantPayload });
  await prisma.inventoryMovement.create({ data: { productId: product.id as any, variantId: variant.id, quantity: ep.inventory || 0, type: 'import', note: `Imported from external source ${externalId ?? ''}` } });
  return { ...product, variant } as any;
}

const cellmateImporter = { upsertProductFromExternal };

export default cellmateImporter;

// CommonJS compatibility for scripts using `require()` (ts-node / node)
// Only assign to module.exports when running in a CommonJS environment
// (in ESM `module` is undefined).
try {
  // @ts-ignore
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // @ts-ignore
    module.exports = { upsertProductFromExternal };
  }
} catch (e) {
  // ignore in ESM contexts
}
