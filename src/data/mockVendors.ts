export interface MockVendor {
  id: string;
  name: string;
  code: string;
  platform: 'cafe24' | 'gmarket' | 'coupang' | 'naver';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  settings?: Record<string, unknown>;
}

const now = () => new Date().toISOString();

export const mockVendors: MockVendor[] = [
  {
    id: '1',
    name: '예시몰 A',
    code: 'EMA',
    platform: 'cafe24',
    is_active: true,
    created_at: '2024-01-01T12:00:00Z',
    updated_at: '2024-01-01T12:00:00Z',
    settings: { sync_interval: 'daily', manager: '홍길동' },
  },
  {
    id: '2',
    name: '예시몰 B',
    code: 'EMB',
    platform: 'coupang',
    is_active: false,
    created_at: '2024-02-15T09:30:00Z',
    updated_at: '2024-02-20T11:45:00Z',
    settings: { sync_interval: 'manual', manager: '김영희' },
  },
  {
    id: '3',
    name: '스마트스토어 C',
    code: 'SSC',
    platform: 'naver',
    is_active: true,
    created_at: '2024-03-10T08:20:00Z',
    updated_at: '2024-03-18T14:10:00Z',
    settings: { sync_interval: 'hourly', manager: '이철수' },
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
