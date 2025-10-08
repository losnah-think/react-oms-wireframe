# 사용자별 기본 상품 분류 설정 구현 문서

## 개요
각 사용자(계정)별로 상품 분류의 기본값을 설정하고 관리할 수 있는 기능을 구현했습니다.

## 데이터 저장 방식
**localStorage 기반 목업 구현**
- DB 연결 없이 브라우저의 localStorage를 사용하여 기본값 관리
- 키: `defaultProductClassification`
- 값: 카테고리 ID (예: `"default-1"`)

## 구현 내용

### 1. API 엔드포인트 (목업 모드)
**파일**: `pages/api/users/settings.ts`

목업 데이터를 사용하는 API를 생성했습니다. 실제로는 메모리에 임시 저장하지만, 프론트엔드는 localStorage를 우선 사용합니다.

#### GET `/api/users/settings?userId={userId}`
사용자의 기본 분류 설정을 조회합니다 (목업).

**응답 예시**:
```json
{
  "defaultClassificationId": "default-1"
}
```

#### PUT `/api/users/settings?userId={userId}`
사용자의 기본 분류 설정을 업데이트합니다 (목업).

**요청 본문**:
```json
{
  "defaultClassificationId": "default-1"
}
```

**응답 예시**:
```json
{
  "success": true,
  "defaultClassificationId": "default-1"
}
```

**참고**: API는 백업용이며, 실제 데이터는 프론트엔드 localStorage에 저장됩니다.

### 2. 상품 분류 페이지 UI 개선
**파일**: `src/features/settings/ProductCategoryPage.tsx`

#### 추가된 기능:
- ✅ 각 카테고리에 **"기본값 설정"** 버튼 추가
- ✅ 기본값으로 설정된 카테고리에 **"기본값"** 배지 표시
- ✅ 기본값 설정된 카테고리는 **"기본값 해제"** 버튼으로 전환
- ✅ 기본값 카테고리 삭제 시 자동으로 기본값 해제
- ✅ 페이지 로드 시 사용자의 기본 분류 설정 자동 불러오기

#### 사용자 경험:
1. 카테고리 목록에서 원하는 카테고리의 **"기본값 설정"** 버튼 클릭
2. 확인 다이얼로그에서 승인
3. 해당 카테고리에 **"기본값"** 배지가 표시됨
4. 다른 카테고리를 기본값으로 설정하면 이전 기본값은 자동 해제

### 3. 상품 등록 시 기본값 자동 적용
**파일**: 
- `src/features/products/ProductsAddPage.tsx`
- `src/features/products/individual-registration.tsx`

#### 동작 방식:
1. 상품 등록 페이지 진입 시 사용자의 기본 분류 설정을 API에서 자동 조회
2. 기본값이 설정되어 있으면 상품 분류 필드에 자동으로 적용
3. 사용자는 원하는 경우 다른 분류로 변경 가능

## 사용 흐름

### 기본 분류 설정하기
1. **환경설정 > 상품 분류** 페이지 접속
2. 원하는 카테고리의 **"기본값 설정"** 버튼 클릭
3. 확인 다이얼로그에서 **"확인"** 클릭
4. 성공 메시지 확인

### 기본 분류 변경하기
1. **환경설정 > 상품 분류** 페이지 접속
2. 새로운 카테고리의 **"기본값 설정"** 버튼 클릭
3. 이전 기본값은 자동으로 해제되고 새 카테고리가 기본값으로 설정됨

### 기본 분류 해제하기
1. **환경설정 > 상품 분류** 페이지 접속
2. 기본값으로 설정된 카테고리의 **"기본값 해제"** 버튼 클릭
3. 기본값이 해제됨

### 상품 등록 시 자동 적용
1. **상품 등록** 페이지 진입
2. 상품 분류 필드에 사용자의 기본 분류가 자동으로 선택됨
3. 필요시 다른 분류로 변경 가능

## 기술 스택
- **데이터 저장**: localStorage (브라우저)
- **백엔드**: Next.js API Routes (목업 모드)
- **프론트엔드**: React, TypeScript

## 현재 구현 특징
- ✅ **DB 연결 불필요**: localStorage만으로 동작
- ✅ **단일 기본값**: 한 번에 하나의 기본 분류만 설정 가능
- ✅ **즉시 적용**: 설정 즉시 상품 등록 시 반영
- ✅ **브라우저 저장**: 브라우저별로 설정 유지

## 개선 사항 제안

### 1. 데이터베이스 연동 (선택사항)
실제 DB 연동이 필요한 경우:
```typescript
// Prisma Schema에 추가
model User {
  ...
  defaultClassificationId String?
  ...
}

// API에서 DB 사용
const user = await prisma.user.update({
  where: { id: userId },
  data: { defaultClassificationId }
});
```

### 2. 에러 핸들링 개선
- Toast 알림 사용 (현재는 window.alert 사용)
- 로컬스토리지 쿼터 초과 처리
- 폴백 처리

### 3. 추가 기능
- 사용자별 즐겨찾기 분류 목록 (다중 선택)
- 최근 사용한 분류 히스토리
- 분류별 사용 통계
- 프로필 페이지에서 기본값 설정

## 테스트 방법

### 1. 기본 분류 설정 테스트
```bash
# 1. 환경설정 > 상품 분류 페이지 접속
# 2. 카테고리 "의류"에 대해 "기본값 설정" 버튼 클릭
# 3. "기본값" 배지가 표시되는지 확인
```

### 2. 상품 등록 시 자동 적용 테스트
```bash
# 1. 기본 분류를 "의류"로 설정
# 2. 상품 등록 페이지 접속
# 3. 상품 분류 필드에 "의류"가 자동 선택되었는지 확인
```

### 3. localStorage 확인
```javascript
// 브라우저 콘솔에서
localStorage.getItem('defaultProductClassification')
// 결과: "default-1" 또는 null

// 삭제
localStorage.removeItem('defaultProductClassification')
```

### 4. API 테스트 (목업 모드)
```bash
# 기본 분류 조회
curl -X GET "http://localhost:3000/api/users/settings?userId=mock-user-1"

# 기본 분류 설정
curl -X PUT "http://localhost:3000/api/users/settings?userId=mock-user-1" \
  -H "Content-Type: application/json" \
  -d '{"defaultClassificationId":"default-1"}'
```

## 주의사항
1. **브라우저별 저장**: localStorage는 브라우저마다 다르게 저장됩니다
2. **시크릿 모드**: 시크릿 모드에서는 설정이 유지되지 않습니다
3. **카테고리 삭제**: 삭제된 카테고리가 기본값이면 자동으로 해제됩니다
4. **목업 모드**: `NEXT_PUBLIC_USE_MOCKS=1` 환경변수 필요

## 작성일
2025-10-08

## 작성자
AI Assistant (Fulgo OMS 개발팀)

