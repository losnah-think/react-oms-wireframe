export interface MockVendor {
  id: string;
  name: string;
  code: string;
  platform: 'godomall' | 'wisa' | 'kurly' | 'smartstore' | 'cafe24' | 'gmarket' | 'coupang' | 'naver';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  settings?: Record<string, unknown>;
}

const now = () => new Date().toISOString();

export const mockVendors: MockVendor[] = [
  {
    id: '1',
    name: '고도몰 샵',
    code: 'GODOMALL001',
    platform: 'godomall',
    is_active: true,
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-02-01T12:30:00Z',
    settings: {
      vendorType: '오픈마켓',
      site: 'GodomallAPI',
      commissionRate: '0%',
      contact: '홍길동',
      loginId: 'godo_manager',
      orderDuplicatePolicy: '전체 판매처 주문번호',
      productPageUrl: 'https://shop.godo.com/product',
    },
  },
  {
    id: '2',
    name: '위사 전문관',
    code: 'WISA002',
    platform: 'wisa',
    is_active: true,
    created_at: '2024-02-10T08:10:00Z',
    updated_at: '2024-02-22T15:45:00Z',
    settings: {
      vendorType: '전용 판매처',
      site: 'WisaAPI',
      commissionRate: '2%',
      franchiseNumber: 'WSA-001-234',
      loginId: 'wisa_ops',
      productPageUrl: 'https://wisa.store/product',
    },
  },
  {
    id: '3',
    name: '마켓컬리 마켓',
    code: 'KURLY003',
    platform: 'kurly',
    is_active: true,
    created_at: '2024-03-02T10:20:00Z',
    updated_at: '2024-03-15T09:15:00Z',
    settings: {
      vendorType: '마켓컬리',
      site: '마켓컬리 OPEN API',
      apiKey: 'MK-OPEN-KEY',
      imageBaseUrl: 'https://kurly-images.s3.ap-northeast-2.amazonaws.com',
      commissionRate: '5%',
      loginId: 'kurly_admin',
      productPageUrl: 'https://www.kurly.com/goods',
    },
  },
  {
    id: '4',
    name: '네이버 스마트스토어',
    code: 'SMART004',
    platform: 'smartstore',
    is_active: false,
    created_at: '2024-03-25T14:40:00Z',
    updated_at: '2024-04-01T18:05:00Z',
    settings: {
      vendorType: '스마트스토어',
      site: '스마트스토어주문API',
      commissionRate: '0%',
      nfaStatus: '발행됨',
      loginId: 'naver_shop',
      productPageUrl: 'https://smartstore.naver.com/product',
    },
  },
  {
    id: '5',
    name: '카페24 오픈마켓',
    code: 'CAFE24005',
    platform: 'cafe24',
    is_active: true,
    created_at: '2024-04-10T07:55:00Z',
    updated_at: '2024-04-18T11:00:00Z',
    settings: {
      vendorType: '카페24',
      site: 'Cafe24Api3.0',
      commissionRate: '3%',
      loginId: 'cafe24_admin',
      productPageUrl: 'https://cafe24.com/product',
    },
  },
];

export function cloneVendor(vendor: MockVendor): MockVendor {
  return JSON.parse(JSON.stringify(vendor));
}

export function stampVendor(partial: Partial<MockVendor> & { id?: string }): MockVendor {
  const timestamp = now();
  const id = partial.id ?? String(Date.now());
  return {
    id,
    name: partial.name ?? '',
    code: partial.code ?? '',
    platform: (partial.platform as MockVendor['platform']) ?? 'cafe24',
    is_active: partial.is_active ?? true,
    created_at: partial.created_at ?? timestamp,
    updated_at: timestamp,
    settings: partial.settings ?? {},
  };
}

let vendorsStore: MockVendor[] = mockVendors.map(cloneVendor);

export function listVendors() {
  return vendorsStore.slice();
}

export function replaceVendors(next: MockVendor[]) {
  vendorsStore = next.slice();
}

export function upsertVendor(vendor: MockVendor) {
  const idx = vendorsStore.findIndex((item) => item.id === vendor.id);
  if (idx === -1) vendorsStore = [vendor, ...vendorsStore];
  else vendorsStore[idx] = vendor;
}

export function removeVendor(id: string) {
  vendorsStore = vendorsStore.filter((item) => item.id !== id);
}
