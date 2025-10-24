# OMS-WMS Wireframe

Order Management System - Warehouse Management System Integration 통합 시스템입니다.  
완전한 API 통신 구조와 다국어 지원(한국어, 영어, 베트남어)을 포함합니다.

**Live Demo**: https://wms-wireframe.vercel.app/ko

## 📋 프로젝트 구조

```
oms-wms-wireframe/
├── app/
│   ├── api/                          # Next.js API Routes
│   │   ├── inbound-requests/
│   │   │   └── route.ts              # GET, POST
│   │   └── inbound-status/
│   │       └── [id]/
│   │           └── route.ts          # GET, PATCH, DELETE
│   ├── [locale]/                     # 언어별 라우팅
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── inbound-detail/
│   │       └── page.tsx
│   ├── components/
│   │   ├── Sidebar.tsx               # 좌측 네비게이션 (언어 선택)
│   │   ├── ApprovalStatusTag.tsx     # 승인 상태 태그
│   │   ├── InboundRequestForm.tsx    # 입고 요청 폼
│   │   └── InboundStatusModal.tsx    # 입고 상태 모달
│   ├── lib/
│   │   └── db.ts                     # 인메모리 데이터베이스
│   ├── services/
│   │   └── inboundAPI.ts             # API 클라이언트
│   ├── types/
│   │   └── inbound.ts                # TypeScript 타입
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── middleware.ts                     # i18n 미들웨어
├── API_DOCUMENTATION.md              # 상세 API 문서
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── vercel.json
```

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 열기:
- 한국어: http://localhost:3000/ko
- 영어: http://localhost:3000/en
- 베트남어: http://localhost:3000/vi

### 3. 프로덕션 빌드
```bash
npm run build
npm start
```

## ✨ 주요 기능

### 1. 🌐 다국어 지원
- **한국어 (KO)**: `/ko` - 전체 UI 한국어
- **영어 (EN)**: `/en` - 전체 UI 영어
- **베트남어 (VI)**: `/vi` - 전체 UI 베트남어
- Sidebar에서 언어 즉시 전환 가능

### 2. 📦 입고 요청 (Inbound Request)
- 발주번호, 공급업체명, 예정 입고일 입력
- 상품 정보 동적 추가/삭제
- 다중 상품 지원

### 3. 🎯 승인 상태 관리
상태별 색상:
- **승인대기** (#C4C4C4) - 회색
- **승인완료** (#4CAF50) - 녹색
- **반려됨** (#F44336) - 빨강
- **입고완료** (#2196F3) - 파랑

### 4. 📊 입고 상세 페이지
- 요약 정보 (요청ID, 날짜, 배송자, 창고)
- 진행 상황 타임라인 (6단계)
- 상품 목록 테이블
- 응답 정보 섹션

### 5. � REST API 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/inbound-requests` | 모든 입고 요청 조회 |
| POST | `/api/inbound-requests` | 새 입고 요청 생성 |
| GET | `/api/inbound-status/{id}` | 특정 요청 상태 조회 |
| PATCH | `/api/inbound-status/{id}` | 상태 업데이트 |
| DELETE | `/api/inbound-status/{id}` | 요청 삭제 |

### 6. 📡 API 통신 구조
- Next.js API Routes를 통한 백엔드 구현
- 인메모리 데이터베이스 (샘플 데이터 포함)
- 완전한 CRUD 작업 지원
- 에러 처리 및 유효성 검사

## 🔗 API 예제

### 모든 입고 요청 조회
```bash
curl http://localhost:3000/api/inbound-requests
```

### 새 입고 요청 생성
```bash
curl -X POST http://localhost:3000/api/inbound-requests \
  -H "Content-Type: application/json" \
  -d '{
    "poNumber": "PO-2024-005",
    "supplierName": "New Supplier",
    "items": [
      {
        "id": "item-1",
        "skuCode": "SKU-007",
        "productName": "Product",
        "quantity": 100,
        "unit": "EA"
      }
    ],
    "requestDate": "2024-10-23",
    "expectedDate": "2024-10-28"
  }'
```

### 상태 조회
```bash
curl http://localhost:3000/api/inbound-status/PO-2024-001
```

### 상태 업데이트
```bash
curl -X PATCH http://localhost:3000/api/inbound-status/PO-2024-001 \
  -H "Content-Type: application/json" \
  -d '{"status": "승인완료", "reason": "Approved"}'
```

더 자세한 API 문서는 **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** 를 참조하세요.

## 🛠 기술 스택

- **Framework**: Next.js 14.2.33
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.3.0
- **HTTP Client**: Axios 1.6.2
- **Build Tool**: Webpack
- **Deployment**: Vercel

## 📝 환경 변수

`.env.local` 파일:
```
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_SUPPORTED_LANGUAGES=ko,en,vi
NEXT_PUBLIC_DEFAULT_LANGUAGE=ko
```

## 📱 반응형 디자인

- 모바일: 100% 반응형
- 태블릿: 768px 이상 최적화
- 데스크톱: 1024px 이상 풀 레이아웃

## 🔄 상태 플로우

```
언어 선택 (/ko, /en, /vi)
    ↓
입고 요청 폼 입력
    ↓
POST /api/inbound-requests
    ↓
성공 응답 + ID 생성
    ↓
상태 조회 모달 열기
    ↓
GET /api/inbound-status/{id}
    ↓
실시간 상태 업데이트
    ↓
PATCH /api/inbound-status/{id}
```

## 📦 샘플 데이터

앱 시작 시 3개의 샘플 입고 요청이 로드됩니다:
- PO-2024-001 (승인완료)
- PO-2024-002 (승인대기)
- PO-2024-003 (입고완료)

## 🚢 Vercel 배포

이 프로젝트는 Vercel에 자동으로 배포됩니다:

```bash
git push origin main
# → Vercel 자동 배포 시작
```

## 🎓 주요 학습 포인트

- ✅ Next.js 14 App Router 사용
- ✅ 동적 라우팅 (`[locale]`, `[id]`)
- ✅ API Routes 구현
- ✅ Middleware를 통한 i18n 처리
- ✅ TypeScript 타입 안전성
- ✅ Tailwind CSS 유틸리티 클래스
- ✅ RESTful API 설계
- ✅ 상태 관리 (React Hooks)

## 📖 상세 문서

- **API 문서**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **설정 가이드**: [SETUP.md](./SETUP.md)
- **마이그레이션**: [MIGRATION.md](./MIGRATION.md)

## 🐛 알려진 이슈

없음 (현재 버전: 1.0.0)

## 🔮 향후 개선사항

- [ ] 실제 데이터베이스 연동 (PostgreSQL/MongoDB)
- [ ] 인증 & 권한 관리
- [ ] 페이지네이션
- [ ] 검색/필터 기능
- [ ] 파일 업로드
- [ ] 이메일 알림
- [ ] 웹훅 지원
- [ ] 로깅 & 모니터링

## 📞 지원

문제가 발생하면 GitHub Issues에 보고해주세요:  
https://github.com/losnah-think/react-oms-wireframe/issues

## 📄 라이선스

MIT License

---

**Last Updated**: 2024-10-24  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
