# 🚀 Next.js 프로젝트 마이그레이션 완료

기존의 HTML 기반 OMS-WMS 와이어프레임을 Next.js 프로젝트로 전환했습니다!

## 📂 프로젝트 구조

```
react-oms-wireframe/
├── app/
│   ├── components/
│   │   ├── ApprovalStatusTag.tsx       # 승인 상태 태그 컴포넌트
│   │   ├── InboundRequestForm.tsx      # 입고 요청 폼 (메인 컴포넌트)
│   │   └── InboundStatusModal.tsx      # 입고 상태 조회 모달
│   ├── services/
│   │   └── inboundAPI.ts              # API 호출 서비스 레이어
│   ├── types/
│   │   └── inbound.ts                 # TypeScript 타입 정의
│   ├── layout.tsx                      # 전체 레이아웃
│   ├── page.tsx                        # 홈 페이지
│   └── globals.css                     # 글로벌 스타일
├── public/                             # 정적 파일
├── .env.local                          # 환경 변수
├── .gitignore
├── next.config.js                      # Next.js 설정
├── tsconfig.json                       # TypeScript 설정
├── tailwind.config.ts                  # Tailwind 설정
├── postcss.config.js                   # PostCSS 설정
├── package.json
├── README.md                           # 프로젝트 설명
├── SETUP.md                            # 셋업 가이드
└── oms-wms-flow.html                  # 기존 HTML 파일 (보관)
```

## ✨ 주요 기능

### 1. 입고 요청 폼 (`InboundRequestForm.tsx`)
**기본 정보 입력:**
- 발주번호 (PO Number)
- 공supply업체명
- 예정 입고일
- 승인 상태 (기본값: 승인대기)
- 메모

**상품 정보:**
- SKU 코드
- 상품명
- 수량
- 단위 (개/박스/팔레트)
- 추가/삭제 기능

### 2. 승인 상태 태그 (`ApprovalStatusTag.tsx`)
상태별 색상:
```
🟤 승인대기   → Gray (#C4C4C4)
🟢 승인완료   → Green (#4CAF50)
🔴 반려됨    → Red (#F44336)
🔵 입고완료   → Blue (#2196F3)
```

### 3. 성공 모달
입고 요청 제출 시:
- ✓ 성공 메시지 표시
- 요청 ID 표시
- 즉시 상태 조회 가능

### 4. 입고 상태 조회 (`InboundStatusModal.tsx`)
- API 호출: `GET /api/inbound-status/{id}`
- 실시간 상태 조회
- 반려 사유 확인
- 새로고침 버튼

## 🛠 기술 스택

| 항목 | 기술 |
|------|------|
| Framework | Next.js 14 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Package Manager | npm/yarn |

## 🚀 시작하기

### 1단계: 의존성 설치
```bash
cd /Users/sotatekthor/Desktop/FULGO_OMS/react-oms-wireframe
npm install
```

### 2단계: 환경 변수 설정
`.env.local` 파일 생성/수정:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### 3단계: 개발 서버 실행
```bash
npm run dev
```

### 4단계: 브라우저 접속
```
http://localhost:3000
```

## 📋 사용 가능한 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start

# 린트 검사
npm run lint
```

## 🔗 API 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/inbound-status/{id}` | 입고 요청 상태 조회 |
| POST | `/api/inbound-requests` | 입고 요청 제출 |
| GET | `/api/inbound-requests` | 입고 요청 목록 조회 |

## 📝 타입 정의 (TypeScript)

### ApprovalStatus
```typescript
type ApprovalStatus = '승인대기' | '승인완료' | '반려됨' | '입고완료'
```

### InboundRequest
```typescript
interface InboundRequest {
  id: string
  poNumber: string
  supplierName: string
  items: InboundItem[]
  requestDate: string
  expectedDate: string
  approvalStatus: ApprovalStatus
  memo?: string
}
```

### InboundStatusResponse
```typescript
interface InboundStatusResponse {
  id: string
  status: ApprovalStatus
  updatedAt: string
  reason?: string
}
```

## 🎯 다음 단계

### 예정된 기능:
- [ ] 다국어 지원 (i18n) - 한국어, 영어, 베트남어
- [ ] OMS-WMS 플로우 다이어그램 페이지
- [ ] 입고 요청 목록 페이지
- [ ] 상세 조회 페이지
- [ ] 실제 API 통합
- [ ] 사용자 인증
- [ ] 데이터베이스 연동

## 🔄 상태 흐름 다이어그램

```
┌─────────────┐
│  사용자 입력   │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│  입고 요청 제출        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  성공 모달 표시        │
│  (요청 ID 표시)       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 승인 상태: 승인대기    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  입고 상태 조회        │
│  (API 호출)          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   상태 업데이트        │
│ (승인완료/반려됨/완료)  │
└──────────────────────┘
```

## 📱 반응형 설계

- **모바일**: 전체 너비 (기본)
- **태블릿**: 768px 이상
- **데스크톱**: 1024px 이상

## 🎨 UI/UX 특징

✅ 직관적인 폼 레이아웃
✅ 실시간 상태 표시
✅ 모달 기반 상태 조회
✅ 색상 기반 상태 구분
✅ 로딩 상태 표시
✅ 에러 메시지 표시

## 💡 개발 팁

### 1. 컴포넌트 수정
```tsx
// ApprovalStatusTag.tsx - 상태 색상 변경
const statusColors = { ... }
```

### 2. API 서비스
```tsx
// inboundAPI.ts에서 실제 API로 교체
// const response = await axios.get(...)
```

### 3. 환경 변수
```bash
# .env.local에서 API URL 변경
NEXT_PUBLIC_API_BASE_URL=http://your-api-url/api
```

## 📞 문제 해결

### npm install 오류
```bash
rm -rf node_modules package-lock.json
npm install
```

### 포트 3000이 이미 사용 중인 경우
```bash
npm run dev -- -p 3001
```

### TypeScript 오류
```bash
npm run build
```

## ✅ 완료된 작업

- [x] Next.js 프로젝트 초기화
- [x] TypeScript 설정
- [x] Tailwind CSS 설정
- [x] 입고 요청 폼 컴포넌트
- [x] 승인 상태 태그 컴포넌트
- [x] 상태 조회 모달 컴포넌트
- [x] API 서비스 레이어
- [x] 타입 정의
- [x] 홈 페이지
- [x] 문서화

## 🎉 축하합니다!

Next.js 기반 OMS-WMS 와이어프레임 프로젝트가 완성되었습니다!

이제 `npm run dev`를 실행하여 프로젝트를 시작하세요! 🚀
