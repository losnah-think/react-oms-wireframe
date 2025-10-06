# Alert & Confirm 공통 컴포넌트 정리 방안

## 현재 문제점 분석

### 1. Alert/Confirm 관련 중복 및 일관성 문제
- **중복된 구현**: Toast가 여러 곳에서 개별 정의됨
- **일관성 없는 방식**: `window.alert()`, 커스텀 Toast, 인라인 모달이 혼재
- **접근성 부족**: 스크린리더 지원, 키보드 내비게이션 미흡

### 2. 발견된 패턴 (35건 분석)
```javascript
// 문제 1: 브라우저 네이티브 사용 (UX 불일치)
window.alert("카테고리 이름을 입력하세요");
window.confirm("삭제하시겠습니까?");

// 문제 2: 개별 Toast 구현 (중복)
showToast("저장되었습니다.", "success");

// 문제 3: 인라인 모달 (복잡도 증가)
{showModal && <div>...</div>}
```

## 제안하는 해결 방안

### 1. 공통 알림 시스템 구축 ✅ 완료
- **Alert 컴포넌트**: 성공/오류/경고/정보 알림용
- **Confirm 컴포넌트**: 확인/취소 다이얼로그
- **NotificationProvider**: 전역 상태 관리 + 간편한 Hook

### 2. 사용법 (Hook 기반)
```typescript
import { useNotification } from '@/design-system';

const Component = () => {
  const { showAlert, showConfirm } = useNotification();
  
  const handleSave = async () => {
    try {
      await saveData();
      showAlert("저장되었습니다.", "success");
    } catch (error) {
      showAlert("저장에 실패했습니다.", "error");
    }
  };
  
  const handleDelete = async () => {
    const confirmed = await showConfirm("삭제하시겠습니까?", {
      title: "삭제 확인",
      confirmText: "삭제",
      confirmVariant: "danger"
    });
    
    if (confirmed) {
      // 삭제 로직
    }
  };
};
```

## 화면설계서 공통 부분 정리

### 1. 공통 UI 규칙
- **알림 표시 위치**: 화면 우측 상단 고정
- **자동 닫힘**: 성공 3초, 오류 5초, 정보 3초
- **접근성**: aria-live, 키보드 ESC 지원
- **애니메이션**: 우측에서 슬라이드 인 (0.3초)

### 2. 색상 및 아이콘 체계
```typescript
success: { color: '#10b981', icon: '✓' }  // 저장완료, 등록성공
error:   { color: '#ef4444', icon: '✕' }  // 검증실패, 서버오류
warning: { color: '#f59e0b', icon: '⚠' }  // 권한부족, 주의사항
info:    { color: '#3b82f6', icon: 'ℹ' }  // 진행상황, 안내메시지
```

### 3. 메시지 표준화
```typescript
// 저장/등록
"저장되었습니다.", "등록되었습니다.", "수정되었습니다."

// 삭제
"삭제되었습니다.", "{항목명}이(가) 삭제되었습니다."

// 검증 오류
"필수 항목을 입력해주세요.", "{필드명}을(를) 확인해주세요."

// 서버 오류
"저장에 실패했습니다. 잠시 후 다시 시도해주세요."
"네트워크 연결을 확인해주세요."

// 확인 다이얼로그
"삭제하시겠습니까?", "변경사항을 저장하지 않고 나가시겠습니까?"
```

### 4. 화면설계서 공통 컴포넌트 목록

#### A. 알림/피드백 관련
- [x] **Alert**: 자동 닫힘 알림 (Toast 대체)
- [x] **Confirm**: 확인/취소 다이얼로그 (window.confirm 대체)
- [x] **NotificationProvider**: 전역 알림 관리
- [ ] **ProgressToast**: 진행률 표시 알림 (파일 업로드용)
- [ ] **ActionableAlert**: 액션 버튼 포함 알림

#### B. 폼/입력 관련 (기존 개선 필요)
- [ ] **FormField**: 레이블+입력+에러 조합
- [ ] **FileUpload**: 드래그앤드롭 + 진행률
- [ ] **SearchInput**: 검색 + 자동완성
- [ ] **DateRangePicker**: 기간 선택
- [ ] **MultiSelect**: 다중 선택 드롭다운

#### C. 데이터 표시 관련
- [ ] **DataTable**: 정렬+필터+페이징 (Table 확장)
- [ ] **EmptyState**: 빈 상태 일관된 표시
- [ ] **LoadingState**: 로딩 스피너 + 스켈레톤
- [ ] **StatusBadge**: 상태별 색상 통일
- [ ] **Breadcrumb**: 페이지 경로 표시

#### D. 레이아웃 관련
- [ ] **PageHeader**: 타이틀+액션버튼+설명
- [ ] **SidePanel**: 우측 슬라이드 패널
- [ ] **FilterPanel**: 검색 필터 영역
- [ ] **CardList**: 반응형 카드 그리드

### 5. 마이그레이션 계획

#### 1단계: 긴급 (window.alert/confirm 교체)
```bash
# 35건의 window.alert/confirm을 useNotification으로 교체
src/features/partners/CategoryMappingPage.tsx (1건)
src/features/settings/ProductCategoryPage.tsx (4건)
src/features/settings/ProductGroupsPage.tsx (4건)
# ... 등
```

#### 2단계: 중복 제거 (Toast 통합)
```bash
# 개별 Toast 구현을 공통 Alert로 교체
src/features/partners/CategoryMappingPage.tsx (Toast 컴포넌트 삭제)
src/components/Toast.tsx (공통으로 이미 있음, 개선 필요)
```

#### 3단계: 접근성 개선
- 키보드 내비게이션 추가
- 스크린리더 지원 강화
- 색상 대비 개선
- 포커스 관리 개선

## 즉시 적용 가능한 액션 아이템

1. **App.tsx에 NotificationProvider 추가**
2. **CategoryMappingPage.tsx 마이그레이션 (예시)**
3. **문서 작성**: 사용법 가이드
4. **팀 공유**: 새로운 알림 시스템 안내

이렇게 정리하면 일관성 있고 접근성이 좋은 사용자 경험을 제공할 수 있습니다.