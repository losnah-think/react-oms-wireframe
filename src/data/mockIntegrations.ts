export type Integration = {
  id: string;
  platform: string; // cafe24, godomall, sabangnet, oms-mock, etc
  storeName: string;
  storeDomain?: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: string;
  ordersCount: number;
  itemsCount: number;
  secrets?: { key: string; value: string }[];
};

export const mockIntegrations: Integration[] = [
  {
    id: 'int-001',
    platform: 'cafe24',
    storeName: "Sotatek Cafe24 Shop",
    storeDomain: 'sotatek.cafe24.com',
    status: 'connected',
    lastSync: '2025-09-14T10:12:00Z',
    ordersCount: 24,
    itemsCount: 48,
    secrets: [{ key: 'api_key', value: 'sk_live_1234abcd' }],
  },
  {
    id: 'int-002',
    platform: 'godomall',
    storeName: 'GodoMall Store A',
    storeDomain: 'godomall-a.example.com',
    status: 'disconnected',
    lastSync: undefined,
    ordersCount: 0,
    itemsCount: 0,
  },
  {
    id: 'int-003',
    platform: 'sabangnet',
    storeName: 'SabangNet Shop',
    storeDomain: 'sabang.example.com',
    status: 'error',
    lastSync: '2025-09-13T22:03:00Z',
    ordersCount: 5,
    itemsCount: 10,
    secrets: [{ key: 'token', value: 'tok_zz987' }],
  },
  {
    id: 'int-004',
    platform: 'cafe24',
    storeName: 'Cafe24 Multi Store 2',
    storeDomain: 'multi2.cafe24.com',
    status: 'syncing',
    lastSync: '2025-09-14T11:00:00Z',
    ordersCount: 3,
    itemsCount: 6,
  }
];
