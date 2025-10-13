/**
 * 판매처/공급처 통합 타입 정의
 * 판매처 관리와 외부연동이 공유하는 중앙 타입
 */

// 기본 판매처 타입 (mockVendors 기반)
export interface BaseVendor {
  id: string;
  name: string;
  code: string;
  platform: 'godomall' | 'wisa' | 'kurly' | 'smartstore' | 'cafe24' | 'gmarket' | 'coupang' | 'naver';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  settings?: VendorSettings;
}

// 판매처 설정 정보
export interface VendorSettings {
  vendorType?: string;
  site?: string;
  commissionRate?: string;
  contact?: string;
  loginId?: string;
  orderDuplicatePolicy?: string;
  productPageUrl?: string;
  franchiseNumber?: string;
  apiKey?: string;
  imageBaseUrl?: string;
  nfaStatus?: string;
  [key: string]: unknown;
}

// 판매처 관리 페이지용 확장 타입 (LocalStorage 호환)
export interface Vendor {
  id: string;
  name: string;
  code?: string; // optional
  platform?: string; // 유연한 문자열 타입으로 변경 (UI 입력 허용)
  is_active?: boolean; // optional
  created_at?: string; // optional
  updated_at?: string; // optional
  settings?: VendorSettings; // optional
  
  // 관리 페이지 전용 필드
  type: '판매처' | '공급처';
  businessNumber: string;
  representative: string;
  phone: string;
  email?: string;
  address: string;
  fixedAddressId?: string;
  status: '사용중' | '정지';
  registrationDate: string;
}

// 외부 연동 정보 타입
export interface VendorIntegration {
  id: string;
  vendorId: string; // BaseVendor.id를 참조
  vendorName: string;
  platform: string;
  apiKey: string;
  status: '연동중' | '오류' | '미연동' | '수집중';
  lastSync: string;
  nextSync: string;
  productCount: number;
  categoryCount: number;
  syncProgress?: number;
  syncStartTime?: string;
  lastRunTime?: string;
}

// 고정 주소 타입
export interface FixedAddress {
  id: string;
  name: string;
  address: string;
  description?: string;
}

// 판매처 부가 정보
export interface VendorExtraInfo {
  id: string;
  vendorId: string;
  key: string;
  value: string;
  description?: string;
  mappingField?: string;
}

// 플랫폼 옵션
export const PLATFORM_OPTIONS = [
  { value: 'smartstore', label: '네이버 스마트스토어' },
  { value: 'coupang', label: '쿠팡' },
  { value: 'cafe24', label: '카페24' },
  { value: 'wisa', label: '위사몰' },
  { value: 'godo', label: '고도몰' },
  { value: 'godomall', label: '고도몰5' },
  { value: 'gmarket', label: 'G마켓' },
  { value: 'kurly', label: '마켓컬리' },
  { value: 'naver', label: '네이버' },
] as const;

// 유틸리티 함수: BaseVendor -> Vendor 변환
export function baseVendorToVendor(base: BaseVendor): Vendor {
  return {
    ...base,
    type: '판매처', // 기본값
    businessNumber: base.settings?.businessNumber as string || '',
    representative: base.settings?.contact as string || '',
    phone: base.settings?.phone as string || '',
    email: base.settings?.email as string || '',
    address: base.settings?.address as string || '',
    fixedAddressId: base.settings?.fixedAddressId as string,
    status: base.is_active ? '사용중' : '정지',
    registrationDate: base.created_at.split('T')[0],
  };
}

// 유틸리티 함수: Vendor -> BaseVendor 변환
export function vendorToBaseVendor(vendor: Vendor): BaseVendor {
  return {
    id: vendor.id,
    name: vendor.name,
    code: vendor.code || `CODE-${vendor.id}`, // 기본값 생성
    platform: (vendor.platform || 'cafe24') as BaseVendor['platform'], // 기본값 설정
    is_active: vendor.status === '사용중',
    created_at: vendor.created_at || new Date().toISOString(),
    updated_at: vendor.updated_at || new Date().toISOString(),
    settings: {
      ...vendor.settings,
      businessNumber: vendor.businessNumber,
      contact: vendor.representative,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      fixedAddressId: vendor.fixedAddressId,
    },
  };
}

// 유틸리티 함수: 플랫폼 레이블 가져오기
export function getPlatformLabel(platform: string): string {
  const option = PLATFORM_OPTIONS.find(opt => opt.value === platform);
  return option?.label || platform;
}
