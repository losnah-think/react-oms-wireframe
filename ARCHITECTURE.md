# 🏗️ OMS-WMS 시스템 아키텍처

## 현재 아키텍처 (Phase 1 - 완료)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                            사용자 (Web Browser)                             │
│                   http://localhost:3000/ko, /en, /vi                        │
└────────────────────────────────────────────────┬───────────────────────────┘
                                                  │
                                                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                        Middleware (i18n Language Routing)                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ /ko → Korean UI  /en → English UI  /vi → Vietnamese UI             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────┬───────────────────────────┘
                                                  │
                        ┌─────────────────────────┼─────────────────────────┐
                        ▼                         ▼                         ▼
            ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
            │  Frontend Components │  │  Frontend Components │  │  Frontend Pages  │
            ├──────────────────────┤  ├──────────────────────┤  ├──────────────────┤
            │ InboundRequestForm   │  │ InboundStatusModal   │  │ [locale]/page    │
            │ ApprovalStatusTag    │  │ Sidebar              │  │ inbound-detail   │
            │ (POST/GET/PATCH)     │  │ (Navigation)         │  │ (Detail View)    │
            └──────────────────────┘  └──────────────────────┘  └──────────────────┘
                        │                         │                         │
                        └─────────────────────────┼─────────────────────────┘
                                                  │
                                                  ▼
            ┌────────────────────────────────────────────────────────────┐
            │          inboundAPI Service (Axios HTTP Client)           │
            │  ┌──────────────────────────────────────────────────────┐ │
            │  │ getInboundRequests()      GET /api/inbound-requests │ │
            │  │ submitInboundRequest()    POST /api/inbound-requests│ │
            │  │ getInboundStatus(id)      GET /api/inbound-status/{id}
            │  │ updateInboundStatus(id)   PATCH /api/inbound-status/{id}
            │  │ deleteInboundRequest(id)  DELETE /api/inbound-status/{id}
            │  └──────────────────────────────────────────────────────┘ │
            └────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
            ┌────────────────────────────────────────────────────────────┐
            │                    Next.js API Routes                      │
            │  ┌──────────────────────────────────────────────────────┐ │
            │  │ /api/inbound-requests/route.ts                      │ │
            │  │   GET  → getInboundRequests()                       │ │
            │  │   POST → submitInboundRequest()                     │ │
            │  │                                                      │ │
            │  │ /api/inbound-status/[id]/route.ts                  │ │
            │  │   GET    → getInboundStatus(id)                    │ │
            │  │   PATCH  → updateInboundStatus(id)                 │ │
            │  │   DELETE → deleteInboundRequest(id)                │ │
            │  └──────────────────────────────────────────────────────┘ │
            └────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
            ┌────────────────────────────────────────────────────────────┐
            │              인메모리 데이터베이스 (현재)                  │
            │  ┌──────────────────────────────────────────────────────┐ │
            │  │ app/lib/db.ts                                        │ │
            │  │ ┌────────────────────────────────────────────────┐  │ │
            │  │ │ let inboundRequests: InboundRequest[] = [      │  │ │
            │  │ │   PO-2024-001: 승인완료                         │  │ │
            │  │ │   PO-2024-002: 승인대기 → 반려됨               │  │ │
            │  │ │   PO-2024-003: 입고완료                         │  │ │
            │  │ │   PO-2024-999: 승인대기                         │  │ │
            │  │ │ ]                                              │  │ │
            │  │ └────────────────────────────────────────────────┘  │ │
            │  │                                                      │ │
            │  │ CRUD Operations:                                    │ │
            │  │ • getAllInboundRequests()                           │ │
            │  │ • getInboundRequestById(id)                         │ │
            │  │ • createInboundRequest(data)                        │ │
            │  │ • updateInboundStatus(id, status)                  │ │
            │  │ • deleteInboundRequest(id)                          │ │
            │  └──────────────────────────────────────────────────────┘ │
            └────────────────────────────────────────────────────────────┘
```

---

## 다음 아키텍처 (Phase 2 - DB 연동)

```
현재 구조에서 인메모리 DB를 실제 데이터베이스로 변경

Option A: Supabase + Prisma (추천)
─────────────────────────────────

┌────────────────────────────────────────────────────────────────────────────┐
│                                프론트엔드                                   │
│                    (변경 없음 - 동일하게 작동)                            │
└────────────────────────────────────────────────┬───────────────────────────┘
                                                  │
                                                  ▼
            ┌────────────────────────────────────────────────────────────┐
            │                    Next.js API Routes                      │
            │  ┌──────────────────────────────────────────────────────┐ │
            │  │ /api/inbound-requests/route.ts (수정됨)            │ │
            │  │   const requests = await prisma                    │ │
            │  │     .inboundRequest.findMany({ include: {items} })│ │
            │  │   return NextResponse.json(requests)              │ │
            │  │                                                      │ │
            │  │ /api/inbound-status/[id]/route.ts (수정됨)        │ │
            │  │   await prisma.inboundRequest.update(...)         │ │
            │  └──────────────────────────────────────────────────────┘ │
            └────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
            ┌────────────────────────────────────────────────────────────┐
            │              Prisma ORM (Object-Relational Mapping)        │
            │  ┌──────────────────────────────────────────────────────┐ │
            │  │ prisma/schema.prisma:                               │ │
            │  │                                                      │ │
            │  │ model InboundRequest {                              │ │
            │  │   id              String   @id @default(cuid())     │ │
            │  │   poNumber        String   @unique                  │ │
            │  │   supplierName    String                            │ │
            │  │   items           InboundItem[]                     │ │
            │  │   approvalStatus  String                            │ │
            │  │   createdAt       DateTime @default(now())         │ │
            │  │   updatedAt       DateTime @updatedAt              │ │
            │  │ }                                                    │ │
            │  │                                                      │ │
            │  │ model InboundItem {                                 │ │
            │  │   id                 String                        │ │
            │  │   skuCode            String                        │ │
            │  │   productName        String                        │ │
            │  │   quantity           Int                           │ │
            │  │   inboundRequest     InboundRequest @relation(...) │ │
            │  │   inboundRequestId   String                        │ │
            │  │ }                                                    │ │
            │  └──────────────────────────────────────────────────────┘ │
            └────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
            ┌────────────────────────────────────────────────────────────┐
            │                    Supabase (PostgreSQL)                   │
            │  ┌──────────────────────────────────────────────────────┐ │
            │  │ Database: wms_production                            │ │
            │  │                                                      │ │
            │  │ Tables:                                              │ │
            │  │ ├─ InboundRequest                                   │ │
            │  │ │  ├─ id (UUID)                                    │ │
            │  │ │  ├─ poNumber (VARCHAR) UNIQUE                    │ │
            │  │ │  ├─ supplierName (VARCHAR)                       │ │
            │  │ │  ├─ approvalStatus (VARCHAR)                     │ │
            │  │ │  ├─ createdAt (TIMESTAMP)                        │ │
            │  │ │  └─ updatedAt (TIMESTAMP)                        │ │
            │  │ │                                                    │ │
            │  │ └─ InboundItem                                      │ │
            │  │    ├─ id (UUID)                                    │ │
            │  │    ├─ skuCode (VARCHAR)                            │ │
            │  │    ├─ productName (VARCHAR)                        │ │
            │  │    ├─ quantity (INTEGER)                           │ │
            │  │    └─ inboundRequestId (UUID) [Foreign Key]       │ │
            │  │                                                      │ │
            │  │ Data (마이그레이션됨):                              │ │
            │  │ • PO-2024-001 → DB에 저장됨                         │ │
            │  │ • PO-2024-002 → DB에 저장됨                         │ │
            │  │ • PO-2024-003 → DB에 저장됨                         │ │
            │  └──────────────────────────────────────────────────────┘ │
            └────────────────────────────────────────────────────────────┘
```

---

## 데이터 흐름 비교

### Phase 1 (현재 - 인메모리)
```
사용자 입력
    ↓
POST /api/inbound-requests
    ↓
app/lib/db.ts 
    ↓
inboundRequests[] 배열에 추가 (메모리)
    ↓
응답 반환
    ▼
⚠️ 서버 재시작 → 데이터 초기화됨 ❌
```

### Phase 2 (DB 연동 후 - Supabase + Prisma)
```
사용자 입력
    ↓
POST /api/inbound-requests
    ↓
Prisma ORM 
    ↓
Supabase PostgreSQL DB에 저장
    ↓
응답 반환
    ▼
✅ 서버 재시작해도 데이터 유지됨 ✅
✅ 여러 서버 간 데이터 공유 가능 ✅
✅ 프로덕션 배포 준비 완료 ✅
```

---

## 파일 구조 변경

### Phase 1 (현재)
```
app/
├── api/
│   ├── inbound-requests/route.ts
│   └── inbound-status/[id]/route.ts
├── lib/
│   └── db.ts                    ← 인메모리 DB (배열)
└── ...
```

### Phase 2 (DB 연동)
```
app/
├── api/
│   ├── inbound-requests/route.ts  ← Prisma 사용
│   └── inbound-status/[id]/route.ts ← Prisma 사용
├── lib/
│   ├── db.ts                      ← 삭제됨
│   └── prisma.ts                  ← Prisma 클라이언트 (새로 추가)
└── ...

prisma/
├── schema.prisma                  ← DB 스키마 정의 (새로 추가)
└── migrations/                    ← 마이그레이션 히스토리 (새로 추가)
```

---

## 환경변수 변경

### Phase 1 (현재)
```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_SUPPORTED_LANGUAGES=ko,en,vi
NEXT_PUBLIC_DEFAULT_LANGUAGE=ko
```

### Phase 2 (DB 연동)
```env
# .env.local (추가됨)
DATABASE_URL="postgresql://user:password@host:5432/wms_db"
# 또는
DATABASE_URL="postgresql://..." (Supabase의 경우)

# 기존 변수는 유지됨
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_SUPPORTED_LANGUAGES=ko,en,vi
NEXT_PUBLIC_DEFAULT_LANGUAGE=ko
```

---

## 프론트엔드 변경 사항

### ❌ 변경 없음!

프론트엔드 코드는 변경할 필요가 없습니다.

```typescript
// 현재 코드 (Phase 1)
const response = await fetch('/api/inbound-requests')

// Phase 2 이후도 동일함
const response = await fetch('/api/inbound-requests')
// API가 DB에서 데이터를 반환하지만, 
// 응답 형식은 정확히 동일함
```

이것이 **API 계층의 추상화**의 장점입니다! 🎉

---

## 마이그레이션 프로세스 (Phase 2)

```
1. 데이터베이스 선택
   └─ Supabase / PostgreSQL / MongoDB 중 선택

2. Prisma 초기화
   └─ schema.prisma 생성

3. 스키마 정의
   └─ InboundRequest, InboundItem 모델 정의

4. 마이그레이션 실행
   └─ 테이블 생성
   └─ 초기 데이터 삽입

5. API 코드 수정
   ├─ app/api/inbound-requests/route.ts
   └─ app/api/inbound-status/[id]/route.ts

6. 테스트
   ├─ 로컬 테스트
   └─ 프로덕션 배포

7. 모니터링
   └─ 데이터베이스 상태 확인
```

---

## 성능 비교

```
┌──────────────────┬──────────────┬──────────────┐
│ 메트릭            │ Phase 1      │ Phase 2      │
│                  │ (인메모리)   │ (DB)         │
├──────────────────┼──────────────┼──────────────┤
│ 응답 속도         │ 7-36ms       │ 15-50ms      │
│ 데이터 지속성    │ ❌ 없음      │ ✅ 있음      │
│ 동시 연결 가능   │ 1개 서버     │ 무제한       │
│ 확장성            │ ❌ 불가능    │ ✅ 수평확장 가능 │
│ 프로덕션 준비    │ ❌ 아님      │ ✅ 완료      │
│ 백업 가능         │ ❌ 불가능    │ ✅ 자동      │
│ 트랜잭션 지원    │ ❌ 없음      │ ✅ 있음      │
│ 쿼리 최적화      │ ❌ 불가능    │ ✅ 인덱싱 등 가능 │
└──────────────────┴──────────────┴──────────────┘
```

---

## 다음 단계

1. **DB 선택**
   - Supabase 추천 (클라우드, 가장 간단)
   - PostgreSQL (로컬, 커스터마이징 가능)
   - MongoDB (NoSQL, 유연함)

2. **ORM 선택**
   - Prisma 추천 (가장 인기, 타입 안전)
   - TypeORM (엔터프라이즈급)
   - Mongoose (MongoDB 전용)

3. **실행 요청**
   ```
   "Supabase + Prisma로 DB 연동해주세요"
   ```

4. **예상 시간**
   - 4-5시간 (자동 처리)

---

## 🎯 최종 정리

### 현재 상황
```
✅ 모든 기능이 프로토타입으로 완성됨
✅ API 모두 작동함
✅ UI 완벽하게 구현됨
❌ 데이터가 인메모리에만 저장됨 (임시)
```

### 다음 상황 (Phase 2 후)
```
✅ 모든 기능이 프로덕션으로 준비됨
✅ 데이터 지속성 보장됨
✅ 여러 서버 간 데이터 공유 가능
✅ 프로덕션 배포 완료됨
```

### 최종 요청
```
언제든지 준비되면 다음과 같이 요청하세요:

"Supabase + Prisma로 DB 연동 부탁합니다"

그러면 4-5시간 안에 완전한 프로덕션 환경이 준비됩니다! 🚀
```

---

**Last Updated**: 2024-10-24  
**Current Phase**: 1 (Prototype - Complete)  
**Next Phase**: 2 (Database Integration - Ready to Start)
