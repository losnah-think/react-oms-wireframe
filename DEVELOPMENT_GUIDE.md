# 📋 OMS-WMS 프로젝트 진행 상황 및 개발 가이드

## 🎯 현재까지의 진행 상황

### ✅ 완료된 작업 (1단계 - 프로토타입)

#### 1️⃣ **API 개발** ✅ 완료
- Next.js API Routes 구현 완료
- 5개 엔드포인트 모두 작동
- 인메모리 DB 사용 (CRUD 전부 가능)
- 에러 처리 및 검증 완비

**구현된 엔드포인트:**
```
✅ GET    /api/inbound-requests           → 모든 요청 조회
✅ POST   /api/inbound-requests           → 새 요청 생성
✅ GET    /api/inbound-status/{id}        → 특정 요청 상태 조회
✅ PATCH  /api/inbound-status/{id}        → 상태 업데이트
✅ DELETE /api/inbound-status/{id}        → 요청 삭제
```

**파일 위치:** `app/api/inbound-*`, `app/lib/db.ts`

---

#### 2️⃣ **API 연동 (프론트엔드)** ✅ 완료
- 모든 API 호출 클라이언트 구현
- 비동기 처리 (async/await)
- 에러 핸들링 완료
- 다국어 지원 (3개 언어)

**구현된 UI 기능:**
```
✅ 입고 요청 폼 → POST /api/inbound-requests
✅ 입고 상태 조회 → GET /api/inbound-status/{id}
✅ 최근 요청 목록 → GET /api/inbound-requests
✅ 상태 업데이트 (관리자) → PATCH /api/inbound-status/{id}
✅ 상태 배지 (컬러코딩)
```

**파일 위치:** `app/components/`, `app/services/inboundAPI.ts`

---

#### 3️⃣ **프론트엔드 화면** ✅ 완료
- 한국어/영어/베트남어 UI
- 반응형 디자인
- 타임라인 표시
- 상품 목록 테이블
- Sidebar 네비게이션

**페이지:**
```
✅ /ko, /en, /vi           → 홈페이지 (입고 요청 폼)
✅ /ko/inbound-detail      → 상세 페이지 (타임라인 + 상품)
```

---

### 📊 현재 데이터베이스 상태

**인메모리 DB 사용중:**
```javascript
// app/lib/db.ts
let inboundRequests: InboundRequest[] = [...]  // 메모리에 배열로 저장
```

**문제점:**
- ❌ 서버 재시작하면 데이터 초기화됨
- ❌ 여러 서버/인스턴스 간 데이터 공유 불가
- ❌ 프로덕션 환경에 부적합

---

## 🔄 다음 단계별 진행 계획

### **단계 1: 실제 DB 연결** (준비 중)

#### 옵션 A: PostgreSQL (추천) ✅ 가장 안정적
```
장점:
- 관계형 데이터베이스
- 확장성 좋음
- 프로덕션 수준의 성능
- 무료 (오픈소스)

필요한 것:
1. PostgreSQL 설치/환경 구성
2. Database 및 테이블 생성
3. connection string 설정
4. ORM 라이브러리 (Prisma 또는 TypeORM)
```

#### 옵션 B: MongoDB (대안)
```
장점:
- NoSQL (유연한 스키마)
- 빠른 개발
- JSON 친화적

필요한 것:
1. MongoDB 설치 또는 MongoDB Atlas (클라우드)
2. connection string 설정
3. Mongoose 또는 MongoDB driver
```

#### 옵션 C: Supabase (가장 간단) ⭐ 추천
```
장점:
- PostgreSQL 기반 (관리형)
- 클라우드 호스팅 (설치 불필요)
- 무료 tier 충분
- 실시간 기능 포함

필요한 것:
1. Supabase 계정 생성
2. Database 생성
3. API key 취득
4. connection string 복사
```

---

## 📝 구체적인 작업 항목

### Phase 1: 데이터베이스 선택 및 준비

**질문: 어떤 DB를 사용하시겠습니까?**

```
선택 옵션:
A) PostgreSQL (로컬 또는 Docker)
B) MongoDB (로컬 또는 Atlas)
C) Supabase (클라우드, 추천)
D) 아직 미정
```

**답변 방식:**
```
예시: "Supabase로 진행해주세요"
또는: "PostgreSQL 로컬 환경으로 설정해주세요"
```

---

### Phase 2: ORM/Driver 설정

#### 선택지: Prisma (가장 추천)

**장점:**
```
✅ 타입 안전성 (TypeScript)
✅ 자동 마이그레이션
✅ 스키마 정의 간편
✅ 다양한 DB 지원
✅ 학습 곡선 낮음
```

**대안: TypeORM, Sequelize, Drizzle**

---

### Phase 3: 데이터 마이그레이션

**현재 인메모리 데이터 → 실제 DB로 이동**

```
작업 순서:
1. 테이블 스키마 생성
   - InboundRequest 테이블
   - InboundItem 테이블 (관계형)

2. 샘플 데이터 마이그레이션
   - PO-2024-001 이동
   - PO-2024-002 이동
   - PO-2024-003 이동

3. 데이터 유효성 검증
```

---

### Phase 4: API 수정

**기존 API Routes 업데이트**

```javascript
// Before: app/lib/db.ts 사용
let inboundRequests = [...]

// After: Prisma 또는 직접 SQL 쿼리
import { prisma } from '@/lib/prisma'

export async function getInboundRequests() {
  return await prisma.inboundRequest.findMany({
    include: { items: true }
  })
}
```

**수정 대상 파일:**
```
app/api/inbound-requests/route.ts
app/api/inbound-status/[id]/route.ts
```

---

### Phase 5: 프론트엔드 연동 테스트

**기존 코드 수정 불필요** (API 인터페이스 동일)

```javascript
// 프론트엔드는 변경 없음
const response = await fetch('/api/inbound-requests')
// DB가 바뀌어도 같은 응답 받음
```

---

## 🚀 빠른 시작 가이드 (추천 방법)

### 가장 간단한 방법: Supabase + Prisma

**1단계: Supabase 준비 (5분)**
```bash
1. https://supabase.com 접속
2. 무료 계정 생성
3. 새 프로젝트 생성
4. Database URL 복사
```

**2단계: 프로젝트에 Prisma 설치 (3분)**
```bash
npm install @prisma/client
npm install -D prisma
```

**3단계: Prisma 초기화 (2분)**
```bash
npx prisma init
# .env.local에 DATABASE_URL 붙여넣기
```

**4단계: 스키마 정의 (5분)**
```prisma
# prisma/schema.prisma

model InboundRequest {
  id             String   @id @default(cuid())
  poNumber       String   @unique
  supplierName   String
  items          InboundItem[]
  requestDate    String
  expectedDate   String
  approvalStatus String
  memo           String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model InboundItem {
  id              String   @id @default(cuid())
  skuCode         String
  productName     String
  quantity        Int
  unit            String
  inboundRequest  InboundRequest @relation(fields: [inboundRequestId], references: [id])
  inboundRequestId String
}
```

**5단계: 마이그레이션 (1분)**
```bash
npx prisma migrate dev --name init
```

**6단계: API 업데이트 (10분)**
```typescript
// app/api/inbound-requests/route.ts
import { prisma } from '@/lib/prisma'

export async function GET() {
  const requests = await prisma.inboundRequest.findMany({
    include: { items: true }
  })
  return NextResponse.json({ success: true, data: requests })
}
```

---

## 📞 요청 방법 가이드

### 방법 1: 데이터베이스 선택 요청

**명확한 요청:**
```
"PostgreSQL + Prisma로 DB 연동 진행해주세요"
```

**응답:**
```
1. PostgreSQL 환경 설정
2. Prisma ORM 설치
3. 스키마 정의
4. 마이그레이션 실행
5. API 수정
6. 테스트
```

---

### 방법 2: 특정 단계 완료 요청

**예시 1:**
```
"Supabase로 DB 설정하고, 
스키마 생성해서 Prisma로 연동해주세요"
```

**예시 2:**
```
"PostgreSQL 테이블 생성하고,
기존 인메모리 데이터 마이그레이션해주세요"
```

**예시 3:**
```
"API 수정해서 실제 DB에서 데이터 가져오게 해주세요"
```

---

### 방법 3: 문제 해결 요청

**예시:**
```
"DB 연결 후 API 테스트해봤는데
POST 요청이 실패해요. 확인해주세요"
```

**응답:**
```
1. 에러 메시지 확인
2. 원인 파악
3. 수정 작업
4. 재테스트
```

---

## 🎯 체크리스트

### 현재 완료된 항목 ✅
```
✅ API 개발 (인메모리 DB 사용)
✅ 프론트엔드 화면 구현
✅ API 연동 (클라이언트)
✅ 다국어 지원
✅ 배포 (Vercel)
✅ 문서화
```

### 다음 완료할 항목 📋
```
⬜ 1. DB 선택 및 준비
⬜ 2. ORM/Driver 설치
⬜ 3. 스키마 정의
⬜ 4. 데이터 마이그레이션
⬜ 5. API 수정
⬜ 6. 프론트엔드 테스트
⬜ 7. 배포
```

---

## 💡 추가 기능 (나중에)

```
⬜ 인증 (JWT/OAuth)
⬜ 권한 관리 (Role-based)
⬜ 로깅 및 모니터링
⬜ 캐싱 (Redis)
⬜ 검색/필터 기능
⬜ 페이지네이션
⬜ 이메일 알림
⬜ 파일 업로드
```

---

## 📚 참고 자료

### Prisma 공식 문서
- https://www.prisma.io/docs

### Supabase 가이드
- https://supabase.com/docs

### PostgreSQL 설치
- Windows: https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql`
- Docker: `docker run -e POSTGRES_PASSWORD=password postgres`

---

## 🔗 현재 코드 위치

```
프론트엔드:
app/components/InboundRequestForm.tsx     ← 폼 (POST 호출)
app/components/InboundStatusModal.tsx     ← 상태 조회 (GET 호출)

백엔드 (API):
app/api/inbound-requests/route.ts         ← GET, POST
app/api/inbound-status/[id]/route.ts      ← GET, PATCH, DELETE

데이터베이스:
app/lib/db.ts                             ← 현재: 인메모리
(다음: Prisma ORM 또는 직접 SQL)

서비스 레이어:
app/services/inboundAPI.ts                ← 클라이언트 호출
```

---

## ✨ 최종 정리

### 현재 상태
- **프로토타입**: 100% 완성 ✅
- **인메모리 DB**: 작동 중
- **API**: 모두 구현됨
- **UI**: 3개 언어 지원

### 다음 진행
- **실제 DB**: 선택 필요
- **ORM**: Prisma 추천
- **마이그레이션**: 데이터 이동
- **배포**: 환경변수 업데이트

### 예상 작업 시간
```
DB 선택 및 준비:     1시간
Prisma 설정:        30분
스키마 정의:        30분
API 수정:           1시간
테스트 및 배포:     1시간
─────────────────────────
총 소요 시간:       약 4시간
```

---

## 🎉 다음 질문을 기다립니다

**가장 좋은 요청 방식:**

```
"Supabase + Prisma로 DB 연동 해주세요"
```

또는

```
"PostgreSQL 로컬 환경에 Prisma 적용해주세요"
```

또는

```
"MongoDB Atlas로 데이터베이스 연동하고,
mongoose로 연동 후 API 테스트까지 해주세요"
```

이렇게 명확하고 구체적으로 요청해주시면  
더 정확하고 빠르게 진행할 수 있습니다! 🚀

---

**Last Updated**: 2024-10-24  
**Project Status**: Prototype Ready (Ready for DB Integration)  
**Next Phase**: Database Integration
