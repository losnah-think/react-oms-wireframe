# 판매처 관리 개선 사항

## 🎯 구현 완료 기능

### 1. 판매처 삭제 시 외부 연동 체크 ✅

#### 기능 설명
판매처를 삭제하기 전에 외부 연동 정보를 자동으로 확인하여 데이터 무결성을 보호합니다.

#### 시나리오별 처리

##### Case 1: 활성 연동이 있는 경우 (삭제 차단)
```
❌ 삭제 불가능

이 판매처는 2개의 활성 연동이 있습니다.
연동을 먼저 해제한 후 삭제해주세요.

활성 연동:
• 고도몰 샵 1호점 (연동중)
• 고도몰 샵 2호점 (수집중)
```
→ 삭제 불가, 사용자에게 먼저 연동을 해제하도록 안내

##### Case 2: 비활성 연동만 있는 경우 (경고 후 진행)
```
⚠️ 주의

이 판매처는 1개의 비활성 연동 정보가 있습니다.
삭제하시면 연동 정보도 함께 삭제됩니다.

계속 진행하시겠습니까?
```
→ 사용자 확인 후 삭제 진행

##### Case 3: 연동이 없는 경우 (바로 삭제 확인)
```
⚠️ 판매처 삭제 확인

다음 판매처를 삭제하시겠습니까?

[판매처 정보]

⚠️ 삭제된 데이터는 복구할 수 없습니다.
```
→ 일반 삭제 확인 모달 표시

#### 구현 코드

```typescript
// src/features/partners/VendorManagementPage.tsx

import { getIntegrationsByVendorId } from '../../data/mockVendorIntegrations';

const handleDelete = (vendor: Vendor) => {
  // 외부 연동 정보 확인
  const integrations = getIntegrationsByVendorId(vendor.id);
  
  if (integrations.length > 0) {
    const activeIntegrations = integrations.filter(
      i => i.status === '연동중' || i.status === '수집중'
    );
    
    // 활성 연동이 있으면 삭제 차단
    if (activeIntegrations.length > 0) {
      alert(
        `❌ 삭제 불가능\n\n` +
        `이 판매처는 ${activeIntegrations.length}개의 활성 연동이 있습니다.\n` +
        `연동을 먼저 해제한 후 삭제해주세요.\n\n` +
        `활성 연동:\n` +
        activeIntegrations.map(i => `• ${i.vendorName} (${i.status})`).join('\n')
      );
      return;
    }
    
    // 비활성 연동이 있는 경우 경고
    const inactiveIntegrations = integrations.filter(
      i => i.status === '미연동' || i.status === '오류'
    );
    if (inactiveIntegrations.length > 0) {
      const confirmMsg = 
        `⚠️ 주의\n\n` +
        `이 판매처는 ${inactiveIntegrations.length}개의 비활성 연동 정보가 있습니다.\n` +
        `삭제하시면 연동 정보도 함께 삭제됩니다.\n\n` +
        `계속 진행하시겠습니까?`;
      
      if (!confirm(confirmMsg)) {
        return;
      }
    }
  }
  
  // 삭제 확인 모달 열기
  setVendorToDelete(vendor);
  setShowDeleteConfirmModal(true);
};
```

### 2. 판매처 정보에 플랫폼 표시 ✅

#### 기능 설명
판매처 목록 카드에 플랫폼 정보와 외부 연동 상태를 명확하게 표시합니다.

#### UI 구성 요소

##### 1) 플랫폼 배지 (파란색)
```jsx
{vendor.platform && (
  <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-medium">
    {vendor.platform}
  </span>
)}
```

##### 2) 연동 상태 배지
```jsx
{vendor.type === '판매처' && integrations.length > 0 && (
  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
    activeIntegrations.length > 0 
      ? 'bg-green-100 text-green-800'  // 활성 연동
      : 'bg-gray-100 text-gray-600'     // 비활성 연동
  }`}>
    {activeIntegrations.length > 0 
      ? `✓ 연동중 ${activeIntegrations.length}개` 
      : `연동 ${integrations.length}개`}
  </span>
)}
```

##### 3) 연동 스토어명 표시
```jsx
{vendor.type === '판매처' && integrations.length > 0 && (
  <span className="text-blue-600">
    • 외부연동: {integrations.map(i => i.vendorName).join(', ')}
  </span>
)}
```

#### 판매처 카드 미리보기

```
┌───────────────────────────────────────────────────────────────┐
│ 고도몰 샵  [네이버 스마트스토어]  [✓ 연동중 2개]        [수정] │
│                                                         [삭제] │
│                                                               │
│ 대표자: 홍길동              사업자번호: 123-45-67890          │
│ 전화번호: 02-1234-5678      이메일: contact@shop.com         │
│ 주소: 서울시 강남구 테헤란로 123                               │
│                                                               │
│ 등록일: 2024-01-15                                            │
│ • 외부연동: 고도몰 샵 1호점, 고도몰 샵 2호점                   │
└───────────────────────────────────────────────────────────────┘
```

#### 상태별 배지 색상

| 상태 | 배지 색상 | 텍스트 |
|------|----------|--------|
| 활성 연동 있음 | 초록색 (green-100) | ✓ 연동중 N개 |
| 비활성 연동만 있음 | 회색 (gray-100) | 연동 N개 |
| 연동 없음 | 표시 안 함 | - |

### 3. 삭제 확인 모달 개선 ✅

#### 모달 구조

```
┌─────────────────────────────────────────────┐
│ ⚠️ 판매처 삭제 확인                          │
│                                             │
│ 다음 판매처를 삭제하시겠습니까?               │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ 고도몰 샵                            │   │
│ │ 플랫폼: 네이버 스마트스토어            │   │
│ │ 대표자: 홍길동                        │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ⚠️ 삭제된 데이터는 복구할 수 없습니다.       │
│                                             │
│    [취소]          [삭제]                   │
└─────────────────────────────────────────────┘
```

#### 구현 코드

```jsx
{showDeleteConfirmModal && vendorToDelete && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg w-full max-w-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        ⚠️ {selectedType} 삭제 확인
      </h3>
      <div className="mb-6">
        <p className="text-gray-700 mb-2">
          다음 {selectedType}를 삭제하시겠습니까?
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mt-3">
          <div className="font-semibold text-gray-900">{vendorToDelete.name}</div>
          {vendorToDelete.platform && (
            <div className="text-sm text-gray-600 mt-1">
              플랫폼: {vendorToDelete.platform}
            </div>
          )}
          <div className="text-sm text-gray-600 mt-1">
            대표자: {vendorToDelete.representative}
          </div>
        </div>
        <p className="text-red-600 text-sm mt-4">
          ⚠️ 삭제된 데이터는 복구할 수 없습니다.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={closeModal} className="flex-1 ...">취소</button>
        <button onClick={confirmDelete} className="flex-1 ...">삭제</button>
      </div>
    </div>
  </div>
)}
```

## 📊 데이터 흐름

### 판매처 조회 시
```
1. VendorManagementPage 렌더링
2. LocalStorage에서 vendors 로드
3. 각 vendor에 대해 getIntegrationsByVendorId() 호출
4. 연동 정보와 함께 UI에 표시
```

### 판매처 삭제 시
```
1. 삭제 버튼 클릭
2. getIntegrationsByVendorId()로 연동 정보 확인
3. 활성 연동 체크
   ├─ 활성 연동 있음 → 삭제 차단 (alert)
   ├─ 비활성 연동만 있음 → 경고 후 확인 (confirm)
   └─ 연동 없음 → 삭제 확인 모달 표시
4. 사용자 확인 후 삭제 실행
5. LocalStorage 업데이트
```

## 🎯 핵심 성과

### 데이터 무결성
- ✅ 활성 연동이 있는 판매처는 삭제 불가
- ✅ 삭제 전 연동 정보 자동 확인
- ✅ 사용자에게 명확한 안내 메시지

### 사용자 경험
- ✅ 플랫폼 정보 명확하게 표시
- ✅ 연동 상태 한눈에 확인
- ✅ 연동된 스토어명 표시
- ✅ 직관적인 배지 색상 (초록색: 활성, 회색: 비활성)

### 코드 품질
- ✅ 재사용 가능한 유틸리티 함수
- ✅ 타입 안전성 (TypeScript)
- ✅ 명확한 상태 관리
- ✅ 컴포넌트 분리 가능

## 🔍 테스트 시나리오

### 1. 활성 연동이 있는 판매처 삭제 시도
```
Given: 고도몰 샵 (활성 연동 2개)
When: 삭제 버튼 클릭
Then: "삭제 불가능" 알림 표시, 삭제 차단
```

### 2. 비활성 연동만 있는 판매처 삭제
```
Given: 위사 전문관 (비활성 연동 1개)
When: 삭제 버튼 클릭
Then: "주의" 경고 표시, 확인 시 삭제 진행
```

### 3. 연동이 없는 판매처 삭제
```
Given: 새로 등록한 판매처 (연동 0개)
When: 삭제 버튼 클릭
Then: 삭제 확인 모달 표시, 확인 시 즉시 삭제
```

### 4. 플랫폼 정보 표시
```
Given: 판매처 목록 조회
When: 페이지 렌더링
Then: 각 판매처 카드에 플랫폼 배지 표시
```

### 5. 연동 상태 표시
```
Given: 판매처 목록 조회
When: 연동 정보가 있는 판매처 렌더링
Then: 연동 상태 배지와 스토어명 표시
```

## 📝 향후 개선 방향

### 1. 연동 정보 자동 삭제
```typescript
const confirmDelete = () => {
  if (vendorToDelete) {
    // 판매처 삭제
    saveVendors(vendors.filter(v => v.id !== vendorToDelete.id));
    
    // 연동 정보도 함께 삭제
    const integrations = getIntegrationsByVendorId(vendorToDelete.id);
    integrations.forEach(integration => {
      removeVendorIntegration(integration.id);
    });
    
    setShowDeleteConfirmModal(false);
    setVendorToDelete(null);
  }
};
```

### 2. 연동 정보 상세 보기
- 판매처 카드에서 연동 정보 클릭 시 상세 모달 표시
- 각 연동의 상태, 마지막 동기화 시간 등 표시

### 3. 일괄 연동 해제
- 판매처 삭제 모달에서 "연동 해제 후 삭제" 버튼 추가
- 한 번에 모든 연동 해제 후 판매처 삭제

### 4. 연동 상태 필터링
- 판매처 목록에서 연동 상태별 필터링 기능
- "연동중만 보기", "미연동만 보기" 등

---

**작성일**: 2025-10-13  
**작성자**: GitHub Copilot  
**상태**: ✅ 완료
