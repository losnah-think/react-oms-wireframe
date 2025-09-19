export function parseJsonSafe<T = any>(raw: string | null): T | null {
  try {
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    return null;
  }
}

export function getFirstExistingArray(keys: string[]): any[] {
  for (const k of keys) {
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(k) : null;
      const arr = parseJsonSafe<any[]>(raw);
      if (Array.isArray(arr)) return arr;
    } catch (e) {
      // ignore
    }
  }
  return [];
}

export function getMergedArrays(keys: string[]): any[] {
  const out: any[] = [];
  for (const k of keys) {
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(k) : null;
      const arr = parseJsonSafe<any[]>(raw);
      if (Array.isArray(arr)) out.push(...arr);
    } catch (e) {
      // ignore
    }
  }
  return out;
}

export function getTrashedCounts() {
  const prod =
    getFirstExistingArray(["trashed_products_v1", "trashed_products"]) || [];
  const sup =
    getFirstExistingArray(["trashed_suppliers_v1", "trashed_suppliers"]) || [];
  return {
    products: Array.isArray(prod) ? prod.length : 0,
    suppliers: Array.isArray(sup) ? sup.length : 0,
  };
}
