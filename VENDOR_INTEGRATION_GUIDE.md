# 판매처 관리 ↔ 외부연동 데이터 모델 연동 가이드

## 📊 데이터 구조 개요

### 1. 통합 타입 시스템 (`src/types/vendor.ts`)

```typescript
// 기본 판매처 타입 - mockVendors에서 사용
BaseVendor {
  id, name, code, platform, is_active, created_at, updated_at, settings
}

// 판매처 관리 페이지용 타입
Vendor {
  id, name, type, platform, businessNumber, representative, 
  phone, email, address, status, registrationDate
  // BaseVendor 필드들은 optional
}

// 외부 연동 정보 타입
VendorIntegration {
  id, vendorId,  // vendorId는 BaseVendor.id를 참조
  vendorName, platform, apiKey, status,
  lastSync, nextSync, productCount, categoryCount
}
```

## 🔗 데이터 연동 구조

### 판매처 Master Data (`src/data/mockVendors.ts`)
```
mockVendors: BaseVendor[]
├─ id: "1" → 고도몰 샵
├─ id: "2" → 위사 전문관
├─ id: "3" → 마켓컬리 마켓
├─ id: "4" → 네이버 스마트스토어
├─ id: "5" → 카페24 오픈마켓
├─ id: "6" → 쿠팡
└─ id: "7" → G마켓
```

### 외부 연동 정보 (`src/data/mockVendorIntegrations.ts`)
```
allVendorIntegrations: VendorIntegration[]
├─ integration-1 → vendorId: "1" (고도몰 샵)
├─ integration-1-2 → vendorId: "1" (고도몰 샵 2호점)
├─ integration-2 → vendorId: "2" (위사 전문관)
├─ integration-3 → vendorId: "3" (마켓컬리 마켓)
├─ integration-4 → vendorId: "4" (네이버 스마트스토어)
├─ integration-4-2 → vendorId: "4" (스마트스토어 2호점)
├─ integration-5 → vendorId: "5" (카페24 오픈마켓)
├─ integration-6 → vendorId: "6" (쿠팡)
└─ integration-7 → vendorId: "7" (G마켓)
```

**핵심**: `VendorIntegration.vendorId`가 `BaseVendor.id`를 참조하여 연동됩니다!

## 🎯 사용 예시

### 1. 판매처 관리 페이지에서 연동 정보 조회

```typescript
import { getIntegrationsByVendorId } from '../../data/mockVendorIntegrations';

// 특정 판매처의 모든 연동 정보 가져오기
const vendorId = "1"; // 고도몰 샵
const integrations = getIntegrationsByVendorId(vendorId);
// 결과: [integration-1, integration-1-2] - 고도몰 샵의 1호점과 2호점
```

### 2. 외부연동 페이지에서 판매처 정보 조회

```typescript
import { mockVendors } from '../../data/mockVendors';

// 연동 정보에서 실제 판매처 찾기
const integration = allVendorIntegrations[0];
const vendor = mockVendors.find(v => v.id === integration.vendorId);
```

### 3. 연동 상태 업데이트

```typescript
import { updateIntegrationStatus } from '../../data/mockVendorIntegrations';

// 수집 시작
updateIntegrationStatus('integration-1', '수집중', {
  syncProgress: 0,
  syncStartTime: new Date().toLocaleString('ko-KR')
});

// 수집 완료
updateIntegrationStatus('integration-1', '연동중', {
  lastSync: new Date().toLocaleString('ko-KR'),
  productCount: 1500
});
```

## 📂 파일 구조

```
src/
├─ types/
│  └─ vendor.ts                    # 통합 타입 정의
├─ data/
│  ├─ mockVendors.ts              # 판매처 Master 데이터
│  └─ mockVendorIntegrations.ts   # 외부 연동 정보
├─ features/
│  ├─ partners/
│  │  └─ VendorManagementPage.tsx # 판매처 관리 (CRUD)
│  └─ settings/
│     └─ integration.tsx           # 외부 연동 관리
```

## 🔄 데이터 흐름

### 판매처 등록 시
```
1. VendorManagementPage에서 판매처 등록
2. LocalStorage에 Vendor 저장
3. (선택) mockVendors에 동기화 필요 시 API 호출
```

### 외부 연동 설정 시
```
1. integration.tsx에서 판매처 선택 (mockVendors 목록)
2. VendorIntegration 생성 (vendorId 설정)
3. API 키, 수집 설정 저장
4. allVendorIntegrations에 추가
```

### 데이터 수집 실행 시
```
1. integration.tsx에서 '실행' 버튼 클릭
2. VendorIntegration.status → '수집중' 업데이트
3. API 호출 (실제 구현 시)
4. 수집 완료 후 productCount, categoryCount 업데이트
5. VendorIntegration.status → '연동중' 업데이트
```

## 🛠️ 유틸리티 함수

### `src/types/vendor.ts`
- `baseVendorToVendor()` - BaseVendor → Vendor 변환
- `vendorToBaseVendor()` - Vendor → BaseVendor 변환
- `getPlatformLabel()` - 플랫폼 코드를 한글명으로 변환

### `src/data/mockVendorIntegrations.ts`
- `getIntegrationStatusCounts()` - 연동 상태별 개수
- `getIntegrationsByVendorId()` - 특정 판매처의 연동 목록
- `updateIntegrationStatus()` - 연동 상태 업데이트
- `addVendorIntegration()` - 새 연동 추가
- `removeVendorIntegration()` - 연동 삭제

## ✅ 체크리스트

- [x] `BaseVendor` 타입 정의 (mockVendors 기반)
- [x] `Vendor` 타입 정의 (판매처 관리 페이지용)
- [x] `VendorIntegration` 타입 정의 (외부 연동용)
- [x] `vendorId` 참조 관계 설정
- [x] mockVendorIntegrations 자동 생성 (mockVendors 기반)
- [x] 유틸리티 함수 제공
- [x] integration.tsx 업데이트 (새 데이터 모델 사용)
- [x] VendorManagementPage.tsx 업데이트 (통합 타입 사용)

## 🚀 다음 단계

### 1. API 연동 구현
```typescript
// src/api/vendors.ts
export async function syncVendorProducts(integrationId: string) {
  const integration = allVendorIntegrations.find(i => i.id === integrationId);
  const vendor = mockVendors.find(v => v.id === integration.vendorId);
  
  // API 호출
  const response = await fetch(`/api/integrations/${vendor.platform}/products`, {
    headers: { 'X-API-Key': integration.apiKey }
  });
  
  return response.json();
}
```

### 2. 실시간 동기화
- LocalStorage ↔ mockVendors 동기화
- VendorIntegration 변경 시 mockVendors 자동 업데이트

### 3. 상태 관리
- Zustand 또는 Context API로 전역 상태 관리
- 판매처 목록 / 연동 목록 실시간 공유

## 📝 주의사항

1. **vendorId는 필수**: 모든 VendorIntegration은 유효한 vendorId를 가져야 함
2. **platform 일관성**: BaseVendor.platform과 VendorIntegration.platform이 일치해야 함
3. **LocalStorage 마이그레이션**: 기존 데이터에 platform 필드 추가 로직 포함
4. **Mock 데이터 유지**: 현재 목업 데이터 구조는 그대로 유지됨

## 🔍 디버깅 팁

```typescript
// 콘솔에서 확인
console.log('판매처 목록:', mockVendors);
console.log('연동 목록:', allVendorIntegrations);
console.log('연동 통계:', getIntegrationStatusCounts());
console.log('고도몰 샵 연동:', getIntegrationsByVendorId('1'));
```
