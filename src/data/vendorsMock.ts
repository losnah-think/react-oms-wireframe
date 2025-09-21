export type Vendor = {
  id: number;
  name: string;
  code?: string;
};

export type FixedAddress = {
  id: number;
  vendor_id: number;
  label: string;
  address: string;
  is_default?: boolean;
};

export type VendorProduct = {
  id: number;
  vendor_id: number;
  product_id: number;
  vendor_sku?: string;
};

const VENDOR_KEY = 'vendors_local_v1';
const ADDR_KEY = 'vendors_fixed_addresses_v1';
const VP_KEY = 'vendor_products_v1';

const isServer = typeof window === 'undefined';
const serverStorePath = (() => {
  if (!isServer) return null;
  const path = require('path');
  return path.join(process.cwd(), 'tmp', 'vendors_data.json');
})();

function readServerStore() {
  try {
    const fs = require('fs');
    if (!serverStorePath) return null;
    if (!fs.existsSync(serverStorePath)) return null;
    const raw = fs.readFileSync(serverStorePath, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    return null;
  }
}

function writeServerStore(obj: any) {
  try {
    const fs = require('fs');
    const p = serverStorePath as string;
    const dir = require('path').dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

const sampleVendors: Vendor[] = [
  { id: 1, name: '네이버 스토어', code: 'naver' },
  { id: 2, name: '쿠팡', code: 'coupang' },
];

const sampleAddresses: FixedAddress[] = [
  { id: 1, vendor_id: 1, label: '본사창고', address: '서울특별시 강남구 테헤란로 1', is_default: true },
  { id: 2, vendor_id: 2, label: '쿠팡 전용 창고', address: '경기도 성남시 분당구', is_default: false },
];

const sampleVendorProducts: VendorProduct[] = [];

export function readVendors() {
  try {
    if (isServer) {
      const store = readServerStore();
      return (store && store.vendors) ? store.vendors : sampleVendors;
    }
    const raw = localStorage.getItem(VENDOR_KEY);
    if (!raw) return sampleVendors;
    return JSON.parse(raw);
  } catch (e) {
    return sampleVendors;
  }
}

export function writeVendors(arr: Vendor[]) {
  if (isServer) {
    const store = readServerStore() || {};
    store.vendors = arr;
    writeServerStore(store);
    return;
  }
  localStorage.setItem(VENDOR_KEY, JSON.stringify(arr));
}

export function readFixedAddresses(): FixedAddress[] {
  try {
    if (isServer) {
      const store = readServerStore();
      return (store && store.fixedAddresses) ? store.fixedAddresses : sampleAddresses;
    }
    const raw = localStorage.getItem(ADDR_KEY);
    if (!raw) return sampleAddresses;
    return JSON.parse(raw);
  } catch (e) {
    return sampleAddresses;
  }
}

export function writeFixedAddresses(arr: FixedAddress[]) {
  if (isServer) {
    const store = readServerStore() || {};
    store.fixedAddresses = arr;
    writeServerStore(store);
    return;
  }
  localStorage.setItem(ADDR_KEY, JSON.stringify(arr));
}

export function readVendorProducts(): VendorProduct[] {
  try {
    if (isServer) {
      const store = readServerStore();
      return (store && store.vendorProducts) ? store.vendorProducts : sampleVendorProducts;
    }
    const raw = localStorage.getItem(VP_KEY);
    if (!raw) return sampleVendorProducts;
    return JSON.parse(raw);
  } catch (e) {
    return sampleVendorProducts;
  }
}

export function writeVendorProducts(arr: VendorProduct[]) {
  if (isServer) {
    const store = readServerStore() || {};
    store.vendorProducts = arr;
    writeServerStore(store);
    return;
  }
  localStorage.setItem(VP_KEY, JSON.stringify(arr));
}
export const VENDORS = [
  { id: 'v1', name: '테스트 판매처 A', code: 'TESTA', platform: 'cafe24' },
  { id: 'v2', name: '테스트 판매처 B', code: 'TESTB', platform: 'gmarket' },
  { id: 'v3', name: '롯데온 셀메이트', code: 'LOTTE', platform: 'naver' },
  { id: 'v4', name: '티몬 셀메이트', code: 'TMON', platform: 'coupang' },
];

export const FIXED_ADDRESSES = [
  { id: 'a1', vendor: '테스트 판매처 A', title: '본사', receiver: '홍길동', phone: '010-1234-5678', zip: '12345', address1: '서울시 강남구 테헤란로 1', address2: '101호' },
  { id: 'a2', vendor: '테스트 판매처 B', title: '물류센터', receiver: '김영희', phone: '010-2222-3333', zip: '22222', address1: '경기도 성남시 분당구', address2: '2층' },
];
