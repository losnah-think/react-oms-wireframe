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
          rows.push({
            id: String(v.id) + `-${mp.id}`,
            productId: mp.id,
            title: mp.name,
            sku: v.code || v.sku || mp.code || "",
            barcode: v.barcode1 || v.barcode2 || v.barcode3 || null,
            image: prodImage,
            supplier: mp.supplier_id ? String(mp.supplier_id) : undefined,
          });
        });
      } else {
        rows.push({
          id: String(mp.id),
          productId: mp.id,
          title: mp.name,
          sku: mp.code || "",
          barcode: (mp.variants && mp.variants[0] && (mp.variants[0].barcode1 || mp.variants[0].barcode2)) || null,
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

  updateProductBarcode(id: string, barcode: string | null) {
    try {
      const arr = this.getProducts();
      const idx = arr.findIndex((p: any) => String(p.id) === String(id));
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], barcode };
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
        products[idx] = { ...products[idx], barcode: String(locationCode) };
        this.saveProducts(products);
        this.appendLog({ ts: new Date().toISOString(), user: "operator", action: "assign-location", locationCode, productId });
        return { ok: true };
      }
      return { ok: false, error: "product_not_found" };
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
