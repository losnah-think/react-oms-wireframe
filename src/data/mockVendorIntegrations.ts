/**
 * 판매처 외부 연동 Mock 데이터
 * mockVendors와 연동되어 실제 판매처 ID를 참조합니다
 */

import { VendorIntegration } from '../types/vendor';
import { mockVendors } from './mockVendors';

const now = new Date();

// 판매처 기반으로 연동 정보 생성
export const mockVendorIntegrations: VendorIntegration[] = mockVendors.map((vendor, index) => {
  // 상태를 다양하게 설정
  const statuses: ('연동중' | '오류' | '미연동' | '수집중')[] = ['연동중', '오류', '미연동', '수집중'];
  const status = index < 2 ? '연동중' : 
                 index === 2 ? '수집중' :
                 index === 3 ? '오류' : '미연동';

  const isCollecting = status === '수집중';
  const syncProgress = isCollecting ? Math.floor(Math.random() * 100) : undefined;
  
  // 마지막 실행 시간 (최근 7일 내 랜덤)
  const randomDaysAgo = Math.floor(Math.random() * 7);
  const randomHoursAgo = Math.floor(Math.random() * 24);
  const randomMinutesAgo = Math.floor(Math.random() * 60);
  const lastRunDate = new Date(
    now.getTime() - 
    (randomDaysAgo * 24 * 60 * 60 * 1000) - 
    (randomHoursAgo * 60 * 60 * 1000) - 
    (randomMinutesAgo * 60 * 1000)
  );
  
  const lastRunTime = status === '미연동' ? '-' : lastRunDate.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lastSync = status === '미연동' ? '-' : 
    new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const nextSync = status === '미연동' ? '-' :
    new Date(now.getTime() + Math.random() * 24 * 60 * 60 * 1000).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return {
    id: `integration-${vendor.id}`,
    vendorId: vendor.id, // mockVendors의 실제 ID 참조
    vendorName: vendor.name,
    platform: vendor.platform,
    apiKey: status === '미연동' ? '' : vendor.settings?.apiKey as string || `${vendor.platform}_api_key_${vendor.id}`,
    status,
    lastSync,
    nextSync,
    productCount: status === '미연동' ? 0 : Math.floor(Math.random() * 3000) + 100,
    categoryCount: status === '미연동' ? 0 : Math.floor(Math.random() * 50) + 5,
    syncProgress,
    syncStartTime: isCollecting ? lastRunTime : undefined,
    lastRunTime,
  };
});

// 추가 Mock 연동 데이터 (같은 판매처의 여러 스토어)
const additionalIntegrations: VendorIntegration[] = [
  {
    id: 'integration-1-2',
    vendorId: '1', // 고도몰 샵 2호점
    vendorName: '고도몰 샵 2호점',
    platform: 'godomall',
    apiKey: 'godomall_api_key_1_2',
    status: '연동중',
    lastSync: new Date(now.getTime() - 2 * 60 * 60 * 1000).toLocaleString('ko-KR'),
    nextSync: new Date(now.getTime() + 2 * 60 * 60 * 1000).toLocaleString('ko-KR'),
    productCount: 450,
    categoryCount: 12,
    lastRunTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toLocaleString('ko-KR'),
  },
  {
    id: 'integration-4-2',
    vendorId: '4', // 네이버 스마트스토어 2호점
    vendorName: '네이버 스마트스토어 2호점',
    platform: 'smartstore',
    apiKey: 'smartstore_api_key_4_2',
    status: '수집중',
    lastSync: new Date(now.getTime() - 30 * 60 * 1000).toLocaleString('ko-KR'),
    nextSync: new Date(now.getTime() + 30 * 60 * 1000).toLocaleString('ko-KR'),
    productCount: 1200,
    categoryCount: 25,
    syncProgress: 67,
    syncStartTime: new Date(now.getTime() - 10 * 60 * 1000).toLocaleString('ko-KR'),
    lastRunTime: new Date(now.getTime() - 10 * 60 * 1000).toLocaleString('ko-KR'),
  },
];

// 전체 연동 목록
export const allVendorIntegrations: VendorIntegration[] = [
  ...mockVendorIntegrations,
  ...additionalIntegrations,
];

// 연동 상태별 카운트 유틸리티
export function getIntegrationStatusCounts(integrations: VendorIntegration[] = allVendorIntegrations) {
  return {
    total: integrations.length,
    active: integrations.filter(i => i.status === '연동중').length,
    collecting: integrations.filter(i => i.status === '수집중').length,
    error: integrations.filter(i => i.status === '오류').length,
    disconnected: integrations.filter(i => i.status === '미연동').length,
  };
}

// 특정 판매처의 연동 정보 가져오기
export function getIntegrationsByVendorId(vendorId: string): VendorIntegration[] {
  return allVendorIntegrations.filter(i => i.vendorId === vendorId);
}

// 연동 정보 업데이트
export function updateIntegrationStatus(
  integrationId: string,
  status: VendorIntegration['status'],
  additionalData?: Partial<VendorIntegration>
): VendorIntegration | null {
  const index = allVendorIntegrations.findIndex(i => i.id === integrationId);
  if (index === -1) return null;

  allVendorIntegrations[index] = {
    ...allVendorIntegrations[index],
    status,
    ...additionalData,
  };

  return allVendorIntegrations[index];
}

// 새 연동 추가
export function addVendorIntegration(integration: Omit<VendorIntegration, 'id'>): VendorIntegration {
  const newIntegration: VendorIntegration = {
    ...integration,
    id: `integration-${Date.now()}`,
  };
  
  allVendorIntegrations.push(newIntegration);
  return newIntegration;
}

// 연동 삭제
export function removeVendorIntegration(integrationId: string): boolean {
  const index = allVendorIntegrations.findIndex(i => i.id === integrationId);
  if (index === -1) return false;
  
  allVendorIntegrations.splice(index, 1);
  return true;
}
