import type { NextApiRequest } from 'next';

export type ProductAdapter = (shopId: string, params?: any) => Promise<any[]>;

const registry: Record<string, ProductAdapter> = {};

// Helper to register adapters (in future, adapters can import and register themselves)
export function registerAdapter(platform: string, fn: ProductAdapter) {
  registry[platform] = fn;
}

export function getAdapter(platform: string): ProductAdapter | undefined {
  return registry[platform];
}

// Register known adapters
import * as cafe24 from './cafe24';
if (cafe24 && (cafe24 as any).fetchProducts) {
  registerAdapter('cafe24', (cafe24 as any).fetchProducts);
}

export default registry;
