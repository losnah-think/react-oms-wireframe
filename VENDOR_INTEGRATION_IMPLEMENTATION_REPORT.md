# 판매처 관리 ↔ 외부연동 데이터 모델 재구성 완료 보고서

## 📋 작업 요약

판매처 관리와 외부연동 기능이 서로 분리된 데이터로 운영되던 문제를 **통합 데이터 모델**로 재구성하여 해결했습니다.

## 🎯 주요 변경 사항

### 1. 통합 타입 시스템 구축 ✅

**파일**: `src/types/vendor.ts` (신규 생성)

```typescript
// 기본 타입 (mockVendors 기반)
BaseVendor {
  id, name, code, platform, is_active, created_at, updated_at, settings
}

// 판매처 관리 페이지용
Vendor {
  id, name, type, platform, businessNumber, representative, ...
}

// 외부 연동 정보
VendorIntegration {
  id, vendorId,  // ← BaseVendor.id를 참조
  vendorName, platform, apiKey, status, ...
}
```

**핵심**: `vendorId`로 판매처와 연동 정보를 연결!

### 2. Mock 데이터 업데이트 ✅

#### `src/data/mockVendors.ts`
- `MockVendor` → `BaseVendor` 타입으로 변경
- 7개 판매처 데이터 유지 (고도몰, 위사, 마켓컬리, 스마트스토어, 카페24, 쿠팡, G마켓)
- 연동 상태 업데이트 함수 추가: `updateVendorIntegrationStatus()`

#### `src/data/mockVendorIntegrations.ts` (신규 생성)
- `mockVendors` 기반으로 자동 생성되는 연동 정보
- 각 판매처마다 1개 이상의 연동 정보 생성
- 실제 `vendorId` 참조로 데이터 연결

```typescript
// 예시
{
  id: 'integration-1',
  vendorId: '1',  // mockVendors[0].id
  vendorName: '고도몰 샵',
  platform: 'godomall',
  status: '연동중',
  ...
}
```

### 3. 컴포넌트 업데이트 ✅

#### `src/features/settings/integration.tsx`
**Before**: 독립적인 Mock 데이터 생성
```typescript
const mockVendorIntegrations = generateMockVendorIntegrations(); // 랜덤 생성
```

**After**: 실제 판매처 데이터 기반
```typescript
import { allVendorIntegrations } from '../../data/mockVendorIntegrations';
import { mockVendors } from '../../data/mockVendors';

// vendorId로 실제 판매처 참조
const vendor = mockVendors.find(v => v.id === integration.vendorId);
```

#### `src/features/partners/VendorManagementPage.tsx`
- 통합 타입 시스템 적용
- `PLATFORM_OPTIONS` 사용으로 일관성 확보

## 🔗 데이터 연동 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    mockVendors (Master)                     │
│  id: "1" → 고도몰 샵                                          │
│  id: "2" → 위사 전문관                                        │
│  id: "3" → 마켓컬리                                          │
│  id: "4" → 스마트스토어                                       │
│  id: "5" → 카페24                                           │
│  id: "6" → 쿠팡                                             │
│  id: "7" → G마켓                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓ vendorId로 참조
┌─────────────────────────────────────────────────────────────┐
│              allVendorIntegrations (연동 정보)              │
│  ┌──────────────────────────────────────────────┐          │
│  │ integration-1 → vendorId: "1" (고도몰 1호점)  │          │
│  │ integration-1-2 → vendorId: "1" (고도몰 2호점)│          │
│  │ integration-2 → vendorId: "2" (위사)         │          │
│  │ integration-3 → vendorId: "3" (마켓컬리)      │          │
│  │ integration-4 → vendorId: "4" (스마트스토어 1) │          │
│  │ integration-4-2 → vendorId: "4" (스마트스토어 2)│         │
│  │ integration-5 → vendorId: "5" (카페24)       │          │
│  │ integration-6 → vendorId: "6" (쿠팡)         │          │
│  │ integration-7 → vendorId: "7" (G마켓)        │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ 제공된 유틸리티 함수

### `src/types/vendor.ts`
```typescript
// 타입 변환
baseVendorToVendor(base: BaseVendor): Vendor
vendorToBaseVendor(vendor: Vendor): BaseVendor

// 플랫폼 레이블
getPlatformLabel(platform: string): string
// 예: 'smartstore' → '네이버 스마트스토어'
```

### `src/data/mockVendorIntegrations.ts`
```typescript
// 연동 상태 통계
getIntegrationStatusCounts()
// → { total: 9, active: 3, collecting: 2, error: 1, disconnected: 3 }

// 특정 판매처의 연동 목록
getIntegrationsByVendorId(vendorId: string)
// 예: getIntegrationsByVendorId('1') → [integration-1, integration-1-2]

// 연동 상태 업데이트
updateIntegrationStatus(integrationId, status, additionalData)

// 연동 추가/삭제
addVendorIntegration(integration)
removeVendorIntegration(integrationId)
```

## �️ 데이터 무결성 보호

### 판매처 삭제 시 연동 체크

판매처를 삭제하기 전에 외부 연동 정보를 자동으로 확인합니다:

#### 1. 활성 연동이 있는 경우 (삭제 차단)
```
❌ 삭제 불가능

이 판매처는 2개의 활성 연동이 있습니다.
연동을 먼저 해제한 후 삭제해주세요.

활성 연동:
• 고도몰 샵 1호점 (연동중)
• 고도몰 샵 2호점 (수집중)
```

#### 2. 비활성 연동만 있는 경우 (경고 후 진행)
```
⚠️ 주의

이 판매처는 1개의 비활성 연동 정보가 있습니다.
삭제하시면 연동 정보도 함께 삭제됩니다.

계속 진행하시겠습니까?
```

#### 3. 연동이 없는 경우 (바로 삭제 확인)
```
⚠️ 판매처 삭제 확인

다음 판매처를 삭제하시겠습니까?

[판매처 정보 표시]

⚠️ 삭제된 데이터는 복구할 수 없습니다.
```

### 구현 코드

```typescript
// VendorManagementPage.tsx
const handleDelete = (vendor: Vendor) => {
  // 외부 연동 정보 확인
  const integrations = getIntegrationsByVendorId(vendor.id);
  
  if (integrations.length > 0) {
    const activeIntegrations = integrations.filter(
      i => i.status === '연동중' || i.status === '수집중'
    );
    
    // 활성 연동이 있으면 삭제 차단
    if (activeIntegrations.length > 0) {
      alert('❌ 삭제 불가능\n\n' + 
            `이 판매처는 ${activeIntegrations.length}개의 활성 연동이 있습니다.\n` +
            '연동을 먼저 해제한 후 삭제해주세요.');
      return;
    }
    
    // 비활성 연동이 있으면 경고
    const inactiveIntegrations = integrations.filter(
      i => i.status === '미연동' || i.status === '오류'
    );
    if (inactiveIntegrations.length > 0) {
      if (!confirm('⚠️ 주의\n\n삭제하시면 연동 정보도 함께 삭제됩니다.')) {
        return;
      }
    }
  }
  
  setVendorToDelete(vendor);
  setShowDeleteConfirmModal(true);
};
```

## �📊 사용 예시

### 예시 1: 판매처 관리에서 연동 정보 확인
```typescript
// VendorManagementPage.tsx
import { getIntegrationsByVendorId } from '../../data/mockVendorIntegrations';

const handleViewIntegrations = (vendorId: string) => {
  const integrations = getIntegrationsByVendorId(vendorId);
  console.log(`${vendorId} 판매처의 연동: ${integrations.length}개`);
};
```

### 예시 2: 외부연동에서 판매처 정보 표시
```typescript
// integration.tsx
import { mockVendors } from '../../data/mockVendors';

const getVendorInfo = (vendorId: string) => {
  const vendor = mockVendors.find(v => v.id === vendorId);
  return {
    name: vendor?.name,
    platform: vendor?.platform,
    settings: vendor?.settings
  };
};
```

### 예시 3: 데이터 수집 실행
```typescript
// integration.tsx
import { updateIntegrationStatus } from '../../data/mockVendorIntegrations';

const runSync = async (integrationId: string) => {
  // 수집 시작
  updateIntegrationStatus(integrationId, '수집중', {
    syncProgress: 0,
    syncStartTime: new Date().toLocaleString('ko-KR')
  });
  
  // API 호출
  const result = await syncAPI(integrationId);
  
  // 수집 완료
  updateIntegrationStatus(integrationId, '연동중', {
    productCount: result.count,
    lastSync: new Date().toLocaleString('ko-KR')
  });
};
```

## 📝 목업 데이터 유지 확인 ✅

기존 Mock 데이터 구조는 **완전히 유지**되었습니다:

### mockVendors (7개 판매처)
- ✅ 고도몰 샵 (id: "1", platform: "godomall")
- ✅ 위사 전문관 (id: "2", platform: "wisa")
- ✅ 마켓컬리 마켓 (id: "3", platform: "kurly")
- ✅ 네이버 스마트스토어 (id: "4", platform: "smartstore")
- ✅ 카페24 오픈마켓 (id: "5", platform: "cafe24")
- ✅ 쿠팡 (id: "6", platform: "coupang")
- ✅ G마켓 (id: "7", platform: "gmarket")

### allVendorIntegrations (9개 연동)
- ✅ 각 판매처의 실제 ID 참조
- ✅ 다양한 상태 (연동중, 수집중, 오류, 미연동)
- ✅ 실시간 진행률 업데이트 지원

## 🎉 구현 완료 사항

### 필수 요구사항
- [x] 판매처 Master 데이터 유지
- [x] 외부 연동 정보 구조화
- [x] `vendorId`로 데이터 참조 관계 설정
- [x] Mock 데이터 형태 보존
- [x] 판매처 삭제 시 외부 연동 체크
- [x] 판매처 정보에 플랫폼 표시

### 추가 구현
- [x] 통합 타입 시스템
- [x] 유틸리티 함수 라이브러리
- [x] 자동 데이터 생성 로직
- [x] 실시간 상태 업데이트 지원
- [x] 플랫폼 레이블 매핑
- [x] 마이그레이션 로직 (LocalStorage)
- [x] 판매처 삭제 시 연동 정보 검증
  - 활성 연동이 있으면 삭제 차단
  - 비활성 연동이 있으면 경고 후 진행
- [x] 판매처 목록에 플랫폼 및 연동 상태 표시
  - 플랫폼 배지 (파란색)
  - 연동 상태 배지 (초록색: 활성, 회색: 비활성)
  - 연동된 스토어명 표시

## 📚 문서화

### 1. VENDOR_INTEGRATION_GUIDE.md
- 데이터 구조 설명
- 사용 예시
- 디버깅 팁
- 체크리스트

### 2. scripts/test-vendor-integration.ts
- 데이터 연동 테스트 코드
- 브라우저 콘솔에서 실행 가능

## 🚀 다음 단계 제안

### 1. API 연동 구현
```typescript
// src/api/vendorIntegration.ts
export async function syncVendorData(integrationId: string) {
  const integration = allVendorIntegrations.find(i => i.id === integrationId);
  const vendor = mockVendors.find(v => v.id === integration.vendorId);
  
  return fetch(`/api/sync/${vendor.platform}`, {
    method: 'POST',
    headers: { 'X-API-Key': integration.apiKey },
    body: JSON.stringify({ vendorId: vendor.id })
  });
}
```

### 2. 상태 관리
```typescript
// Zustand 또는 Context API
const useVendorStore = create((set) => ({
  vendors: mockVendors,
  integrations: allVendorIntegrations,
  updateIntegration: (id, data) => { ... }
}));
```

### 3. 실시간 동기화
- WebSocket 연결로 실시간 상태 업데이트
- 여러 탭 간 LocalStorage 동기화

## ✅ 검증 완료

- ✅ TypeScript 컴파일 에러 없음
- ✅ 모든 `vendorId` 참조 유효성 확인
- ✅ 기존 Mock 데이터 구조 유지
- ✅ 양방향 참조 가능 (판매처 ↔ 연동)
- ✅ 유틸리티 함수 정상 동작

## 🎯 핵심 성과

1. **단일 진실의 원천**: `mockVendors`가 Master 데이터
2. **명확한 참조 관계**: `vendorId`로 일관된 연동
3. **유연한 확장성**: 새 판매처/연동 추가 간편
4. **타입 안전성**: TypeScript로 타입 체크
5. **Mock 데이터 보존**: 기존 데이터 100% 유지

---

**작성일**: 2025-10-13  
**작성자**: GitHub Copilot  
**상태**: ✅ 완료
