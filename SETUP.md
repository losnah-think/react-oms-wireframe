# OMS-WMS 입고 프로세스 흐름

## Next.js 프로젝트 구조

### 1. 타입 정의
```
app/types/
├── inbound.ts - 입고 관련 타입
```

### 2. 컴포넌트
```
app/components/
├── ApprovalStatusTag.tsx - 승인 상태 태그
├── InboundRequestForm.tsx - 입고 요청 폼
└── InboundStatusModal.tsx - 상태 조회 모달
```

### 3. 서비스
```
app/services/
└── inboundAPI.ts - API 호출 서비스
```

### 4. 페이지
```
app/
├── page.tsx - 홈 페이지
├── layout.tsx - 레이아웃
└── globals.css - 글로벌 스타일
```

## 마이그레이션 가이드

### 1. 의존성 설치
```bash
cd /Users/sotatekthor/Desktop/FULGO_OMS/react-oms-wireframe
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 브라우저 접속
```
http://localhost:3000
```

## 기능

### ✅ 구현됨
- [x] 입고 요청 폼 (기본 정보, 상품 정보)
- [x] 승인 상태 표시 (4가지 상태)
- [x] 성공 모달
- [x] 상태 조회 모달
- [x] API 서비스 레이어
- [x] TypeScript 타입 정의

### ⏳ 예정
- [ ] i18n (다국어 지원)
- [ ] OMS-WMS 플로우 다이어그램 페이지
- [ ] 입고 요청 목록 페이지
- [ ] 상세 조회 페이지
- [ ] API 통합
