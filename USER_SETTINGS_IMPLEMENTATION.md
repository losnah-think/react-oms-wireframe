# 사용자별 기본 상품 분류 설정 구현 문서

## 개요
각 사용자(계정)별로 상품 분류의 기본값을 설정하고 관리할 수 있는 기능을 구현했습니다.

## 구현 내용

### 1. 데이터베이스 스키마 변경
**파일**: `prisma/schema.prisma`

User 모델에 `defaultClassificationId` 필드를 추가했습니다:
```prisma
model User {
  ...
  defaultClassificationId String? // 기본 상품 분류
  ...
}
```

#### 마이그레이션 실행 방법
```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 마이그레이션 생성 및 실행
npx prisma migrate dev --name add_user_default_classification

# 또는 프로덕션 환경
npx prisma migrate deploy
```

### 2. API 엔드포인트
**파일**: `pages/api/users/settings.ts`

사용자 설정을 저장하고 조회하는 API를 생성했습니다.

#### GET `/api/users/settings?userId={userId}`
사용자의 기본 분류 설정을 조회합니다.

**응답 예시**:
```json
{
  "defaultClassificationId": "category-id-123"
}
```

#### PUT `/api/users/settings?userId={userId}`
사용자의 기본 분류 설정을 업데이트합니다.

**요청 본문**:
```json
{
  "defaultClassificationId": "category-id-123"
}
```

**응답 예시**:
```json
{
  "success": true,
  "defaultClassificationId": "category-id-123"
}
```

### 3. 상품 분류 페이지 UI 개선
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

### 4. 상품 등록 시 기본값 자동 적용
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
- **데이터베이스**: PostgreSQL (Prisma ORM)
- **백엔드**: Next.js API Routes
- **프론트엔드**: React, TypeScript

## 개선 사항 제안

### 1. 인증 통합
현재는 임시로 localStorage에서 `currentUserId`를 가져오고 있습니다.
실제 프로덕션에서는 NextAuth 세션에서 사용자 정보를 가져와야 합니다:

```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// API에서
const session = await getServerSession(req, res, authOptions);
const userId = session?.user?.id;

// 프론트엔드에서
import { useSession } from "next-auth/react";
const { data: session } = useSession();
const userId = session?.user?.id;
```

### 2. 에러 핸들링 개선
- Toast 알림 사용 (현재는 window.alert 사용)
- 네트워크 에러 재시도 로직
- 낙관적 업데이트 (Optimistic Update)

### 3. 성능 최적화
- React Query 또는 SWR을 사용한 캐싱
- 사용자 설정을 Context API로 전역 관리

### 4. 추가 기능
- 사용자별 즐겨찾기 분류 목록
- 최근 사용한 분류 히스토리
- 분류별 사용 통계

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

### 3. API 테스트
```bash
# 기본 분류 조회
curl -X GET "http://localhost:3000/api/users/settings?userId=temp-user-1"

# 기본 분류 설정
curl -X PUT "http://localhost:3000/api/users/settings?userId=temp-user-1" \
  -H "Content-Type: application/json" \
  -d '{"defaultClassificationId":"default-1"}'
```

## 주의사항
1. 데이터베이스 마이그레이션을 먼저 실행해야 합니다
2. 기존 사용자들의 `defaultClassificationId`는 `null`이 기본값입니다
3. 카테고리 삭제 시 해당 카테고리를 기본값으로 설정한 사용자들의 설정도 자동 해제됩니다

## 작성일
2025-10-08

## 작성자
AI Assistant (Fulgo OMS 개발팀)

