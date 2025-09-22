// Simple client-side barcode store that uses localStorage as the single source of truth
// and emits a global custom event when data changes so different pages/components
// update automatically. This is intentionally minimal for demo/mock purposes.
import { mockProducts } from "../data/mockProducts";

const KEY_PRODUCTS = "products_local_v1";
const KEY_LOCATIONS = "location_barcodes_local_v1";
const KEY_LOGS = "barcodes_logs_v1";

function safeParse(raw: any) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function dispatchChange(detail: any = {}) {
  try {
    window.dispatchEvent(new CustomEvent("clientBarcodesChanged", { detail }));
  } catch (e) {
    // ignore
  }
}

function normalizeProductsFromMock() {
  const rows: any[] = [];
  try {
    mockProducts.forEach((mp: any) => {
      const prodImage = Array.isArray(mp.images) && mp.images.length > 0 ? mp.images[0] : undefined;
      if (Array.isArray(mp.variants) && mp.variants.length > 0) {
        mp.variants.forEach((v: any) => {
          // distribute variant stock across product.location_codes if available
          const locCodes = Array.isArray(mp.location_codes) && mp.location_codes.length ? mp.location_codes : [];
          const locations: any[] = [];
          if (locCodes.length) {
            const total = Number(v.stock || 0) || 0;
            const base = Math.floor(total / locCodes.length);
            let rem = total - base * locCodes.length;
            for (let li = 0; li < locCodes.length; li++) {
              const qty = base + (rem > 0 ? 1 : 0);
              if (rem > 0) rem--;
              locations.push({ code: String(locCodes[li]), qty });
            }
          }
          rows.push({
            id: String(v.id) + `-${mp.id}`,
            productId: mp.id,
            variantId: v.id,
            variantName: v.variant_name || v.variantName || null,
            title: mp.name,
            sku: v.code || v.sku || mp.code || "",
            // UI-level assigned locations (array of { code, qty })
            locations,
            barcode: null,
            // preserve available barcodes from mock
            barcodes: Array.isArray(v.barcodes) ? v.barcodes.slice() : (v.barcode1 ? [v.barcode1] : []),
            image: prodImage,
            supplier: mp.supplier_id ? String(mp.supplier_id) : undefined,
            stock: v.stock || 0,
          });
        });
      } else {
        rows.push({
          id: String(mp.id),
          productId: mp.id,
          title: mp.name,
          sku: mp.code || "",
          locations: Array.isArray(mp.location_codes) ? mp.location_codes.map((c: any) => ({ code: String(c), qty: 0 })) : [],
          barcode: null,
          barcodes: Array.isArray(mp.barcodes) ? mp.barcodes.slice() : [],
          image: prodImage,
          supplier: mp.supplier_id ? String(mp.supplier_id) : undefined,
        });
      }
    });
  } catch (e) {
    return [];
  }
  return rows;
}

export const clientBarcodeStore = {
  initIfNeeded() {
    const raw = safeParse(localStorage.getItem(KEY_PRODUCTS));
    if (!Array.isArray(raw) || raw.length === 0) {
      const seeded = normalizeProductsFromMock();
      localStorage.setItem(KEY_PRODUCTS, JSON.stringify(seeded));
    }
    const locRaw = safeParse(localStorage.getItem(KEY_LOCATIONS));
    if (!Array.isArray(locRaw) || locRaw.length === 0) {
      // provide an empty starter so UI shows zero-state
      localStorage.setItem(KEY_LOCATIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEY_LOGS)) {
      localStorage.setItem(KEY_LOGS, JSON.stringify([]));
    }
  },

  getProducts() {
    const raw = safeParse(localStorage.getItem(KEY_PRODUCTS));
    return Array.isArray(raw) ? raw : [];
  },

  saveProducts(arr: any[]) {
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(arr));
    dispatchChange({ type: "products", count: arr.length });
  },

  // Force re-seed products from the in-repo mockProducts array (useful for dev)
  reseedFromMock() {
    try {
      const seeded = normalizeProductsFromMock();
      localStorage.setItem(KEY_PRODUCTS, JSON.stringify(seeded));
      dispatchChange({ type: "products", count: seeded.length, source: 'reseed' });
      return { ok: true, count: seeded.length };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },

  // convenience: force reseed now and mark flag
  reseedNow() {
    const res = this.reseedFromMock();
    try { localStorage.setItem('client_reseed_done_v1', String(Date.now())); } catch (e) {}
    return res;
  },

  // Seed location barcodes from mockProducts variants (dev helper)
  reseedLocationsFromMock() {
    try {
      const locs: any[] = [];
      // gather unique barcodes from mockProducts variants and product.location_codes
      const seen = new Set<string>();
      try {
        mockProducts.forEach((mp: any) => {
          if (Array.isArray(mp.variants) && mp.variants.length) {
            mp.variants.forEach((v: any, idx: number) => {
              // gather from v.barcodes array if present
              if (Array.isArray(v.barcodes)) {
                v.barcodes.forEach((c: any, ci: number) => {
                  if (!c) return;
                  if (seen.has(c)) return;
                  seen.add(c);
                  locs.push({ id: Date.now() + locs.length + idx + ci, code: String(c), created_at: new Date().toISOString().slice(0,19).replace('T',' ') });
                });
              }
              // fallback to location_code
              if (v.location_code && !seen.has(v.location_code)) {
                seen.add(v.location_code);
                locs.push({ id: Date.now() + locs.length + idx + 100, code: String(v.location_code), created_at: new Date().toISOString().slice(0,19).replace('T',' ') });
              }
            });
          }
          // include product-level location_codes if present
          if (Array.isArray(mp.location_codes) && mp.location_codes.length) {
            mp.location_codes.forEach((lc: any, idx2: number) => {
              if (!lc) return;
              if (seen.has(lc)) return;
              seen.add(lc);
              locs.push({ id: Date.now() + locs.length + idx2 + 1000, code: String(lc), created_at: new Date().toISOString().slice(0,19).replace('T',' ') });
            });
          }
        });
      } catch (e) {}
      localStorage.setItem(KEY_LOCATIONS, JSON.stringify(locs));
      dispatchChange({ type: 'locations', count: locs.length, source: 'reseed-locations' });
      return { ok: true, count: locs.length };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },

  updateProductBarcode(id: string, barcode: string | null) {
    try {
      const arr = this.getProducts();
      const idx = arr.findIndex((p: any) => String(p.id) === String(id));
      if (idx >= 0) {
        // maintain legacy single barcode field and also keep array `barcodes`
        const p = arr[idx];
        const barcodes = Array.isArray(p.barcodes) ? p.barcodes.slice() : [];
        // remove previous single barcode if present and different
        if (p.barcode && p.barcode !== barcode) {
          // keep legacy single in history but do not duplicate
        }
        if (barcode) {
          if (!barcodes.includes(String(barcode))) barcodes.push(String(barcode));
        }
        arr[idx] = { ...p, barcode, barcodes };
        this.saveProducts(arr);
        // append log
        try {
          const logs = safeParse(localStorage.getItem(KEY_LOGS)) || [];
          logs.unshift({ ts: new Date().toISOString(), user: "operator", action: "manual-edit", id, value: barcode });
          localStorage.setItem(KEY_LOGS, JSON.stringify(logs.slice(0, 1000)));
        } catch (e) {}
        return { ok: true };
      }
      return { ok: false, error: "not_found" };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },

  getLocationBarcodes() {
    const raw = safeParse(localStorage.getItem(KEY_LOCATIONS));
    return Array.isArray(raw) ? raw : [];
  },

  addProductBarcode(productRowId: string, barcode: string) {
    try {
      const products = this.getProducts();
      const idx = products.findIndex((p: any) => String(p.id) === String(productRowId));
      if (idx >= 0) {
        const p = products[idx];
        const barcodes = Array.isArray(p.barcodes) ? p.barcodes.slice() : [];
        if (!barcodes.includes(String(barcode))) barcodes.push(String(barcode));
        // keep the legacy `barcode` as the primary if not set
        const primary = p.barcode || String(barcode);
        products[idx] = { ...p, barcodes, barcode: primary };
        this.saveProducts(products);
        this.appendLog({ ts: new Date().toISOString(), user: "operator", action: "add-product-barcode", productRowId, barcode });
        return { ok: true };
      }
      return { ok: false, error: 'not_found' };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },

  removeProductBarcode(productRowId: string, barcode: string) {
    try {
      const products = this.getProducts();
      const idx = products.findIndex((p: any) => String(p.id) === String(productRowId));
      if (idx >= 0) {
        const p = products[idx];
        const barcodes = (Array.isArray(p.barcodes) ? p.barcodes : []).filter((b:any)=> String(b) !== String(barcode));
        // if removed barcode was primary, unset primary or pick another
        let primary = p.barcode;
        if (String(primary) === String(barcode)) {
          primary = barcodes.length > 0 ? barcodes[0] : null;
        }
        products[idx] = { ...p, barcodes, barcode: primary };
        this.saveProducts(products);
        this.appendLog({ ts: new Date().toISOString(), user: "operator", action: "remove-product-barcode", productRowId, barcode });
        return { ok: true };
      }
      return { ok: false, error: 'not_found' };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
  saveLocationBarcodes(rows: any[]) {
    localStorage.setItem(KEY_LOCATIONS, JSON.stringify(rows));
    dispatchChange({ type: "locations", count: rows.length });
  },

  addLocationBarcodes(rows: any[]) {
    const prev = this.getLocationBarcodes();
    const next = [...rows, ...prev];
    this.saveLocationBarcodes(next);
  },

  updateLocationBarcode(id: number, patch: Partial<{ code: string; created_at: string }>) {
    try {
      const arr = this.getLocationBarcodes();
      const idx = arr.findIndex((r: any) => Number(r.id) === Number(id));
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], ...patch };
        this.saveLocationBarcodes(arr);
        this.appendLog({ ts: new Date().toISOString(), user: "operator", action: "update-location", id, patch });
        return { ok: true };
      }
      return { ok: false, error: "not_found" };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },

  deleteLocationBarcode(id: number) {
    try {
      const arr = this.getLocationBarcodes();
      const idx = arr.findIndex((r: any) => Number(r.id) === Number(id));
      if (idx >= 0) {
        arr.splice(idx, 1);
        this.saveLocationBarcodes(arr);
        this.appendLog({ ts: new Date().toISOString(), user: "operator", action: "delete-location", id });
        return { ok: true };
      }
      return { ok: false, error: "not_found" };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },

  // assign a location code to a product's barcode field (simple association)
  assignLocationToProduct(locationCode: string, productId: string) {
    try {
      const products = this.getProducts();
      const idx = products.findIndex((p: any) => String(p.id) === String(productId));
      if (idx >= 0) {
        // legacy single-barcode assignment -> convert to locations array
        const existing = products[idx];
        const locs = Array.isArray(existing.locations) ? existing.locations.slice() : [];
        const found = locs.find((l: any) => l.code === String(locationCode));
        if (found) {
          // already assigned
        } else {
          locs.push({ code: String(locationCode), qty: 0 });
        }
        products[idx] = { ...existing, locations: locs, barcode: null };
        this.saveProducts(products);
        this.appendLog({ ts: new Date().toISOString(), user: "operator", action: "assign-location", locationCode, productId });
        return { ok: true };
      }
      return { ok: false, error: "product_not_found" };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },

  assignLocationQty(productRowId: string, locationCode: string, qty: number) {
    try {
      const products = this.getProducts();
      const idx = products.findIndex((p: any) => String(p.id) === String(productRowId));
      if (idx >= 0) {
        const p = products[idx];
        const locs = Array.isArray(p.locations) ? p.locations.slice() : [];
        const found = locs.find((l: any) => l.code === String(locationCode));
        if (found) {
          found.qty = Number(qty);
        } else {
          locs.push({ code: String(locationCode), qty: Number(qty) });
        }
        products[idx] = { ...p, locations: locs };
        this.saveProducts(products);
        this.appendLog({ ts: new Date().toISOString(), user: "operator", action: "assign-location-qty", productRowId, locationCode, qty });
        return { ok: true };
      }
      return { ok: false, error: 'not_found' };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },

  updateLocationQty(productRowId: string, locationCode: string, qty: number) {
    return this.assignLocationQty(productRowId, locationCode, qty);
  },

  removeLocation(productRowId: string, locationCode: string) {
    try {
      const products = this.getProducts();
      const idx = products.findIndex((p: any) => String(p.id) === String(productRowId));
      if (idx >= 0) {
        const p = products[idx];
        const locs = (Array.isArray(p.locations) ? p.locations : []).filter((l:any)=> l.code !== String(locationCode));
        products[idx] = { ...p, locations: locs };
        this.saveProducts(products);
        this.appendLog({ ts: new Date().toISOString(), user: "operator", action: "remove-location", productRowId, locationCode });
        return { ok: true };
      }
      return { ok: false, error: 'not_found' };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },

  unassignLocationFromProduct(productId: string) {
    try {
      const products = this.getProducts();
      const idx = products.findIndex((p: any) => String(p.id) === String(productId));
      if (idx >= 0) {
        products[idx] = { ...products[idx], barcode: null };
        this.saveProducts(products);
        this.appendLog({ ts: new Date().toISOString(), user: "operator", action: "unassign-location", productId });
        return { ok: true };
      }
      return { ok: false, error: "product_not_found" };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },

  appendLog(entry: any) {
    try {
      const logs = safeParse(localStorage.getItem(KEY_LOGS)) || [];
      logs.unshift(entry);
      localStorage.setItem(KEY_LOGS, JSON.stringify(logs.slice(0, 1000)));
      dispatchChange({ type: "logs" });
    } catch (e) {}
  },
};

export default clientBarcodeStore;

// expose helper in browser dev tools so developer can force reseed
try {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__clientBarcodeStore = clientBarcodeStore;
  }
} catch (e) {
  // ignore
}
