# OMS-WMS Wireframe

Order Management System - Warehouse Management System Integration 통합 와이어프레임 프로젝트입니다.

## 📋 프로젝트 구조

```
oms-wms-wireframe/
├── app/
│   ├── components/
│   │   ├── ApprovalStatusTag.tsx      # 승인 상태 태그 컴포넌트
│   │   ├── InboundRequestForm.tsx     # 입고 요청 폼
│   │   └── InboundStatusModal.tsx     # 입고 상태 조회 모달
│   ├── services/
│   │   └── inboundAPI.ts             # API 호출 서비스
│   ├── types/
│   │   └── inbound.ts                # TypeScript 타입 정의
│   ├── layout.tsx                     # 레이아웃
│   ├── page.tsx                       # 홈 페이지
│   └── globals.css                    # 글로벌 스타일
├── public/                            # 정적 파일
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
# 또는
yarn install
```

### 2. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어주세요.

### 3. 프로덕션 빌드
```bash
npm run build
npm start
```

## ✨ 주요 기능

### 1. 입고 요청 (Inbound Request)
- 발주번호, 공급업체명, 예정 입고일 입력
- 상품 정보 추가/삭제
- WMS 승인 대기 상태 표시

### 2. 승인 상태 표시 (Approval Status)
상태별 색상 코드:
- 🟤 **승인대기** (#C4C4C4) - 회색
- 🟢 **승인완료** (#4CAF50) - 녹색
- 🔴 **반려됨** (#F44336) - 빨강
- 🔵 **입고완료** (#2196F3) - 파랑

### 3. 입고 상태 조회 (Inbound Status Inquiry)
- API 호출: `GET /api/inbound-status/{id}`
- 실시간 상태 조회
- 반려 사유 확인 가능

### 4. 성공 모달
- 입고 요청 제출 시 확인 메시지 표시
- 요청 ID 표시
- 즉시 상태 조회 가능

## 🔗 API 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/inbound-status/{id}` | 입고 요청 상태 조회 |
| POST | `/api/inbound-requests` | 입고 요청 제출 |
| GET | `/api/inbound-requests` | 입고 요청 목록 조회 |

## 🛠 기술 스택

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **i18n**: react-i18next (예정)

## 📝 환경 변수

`.env.local` 파일을 생성하고 다음을 설정하세요:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## 📱 반응형 디자인

- 모바일: 100%
- 태블릿: 768px 이상
- 데스크톱: 1024px 이상

## 🔄 상태 플로우

```
사용자 입력
    ↓
입고 요청 제출
    ↓
성공 모달 표시
    ↓
승인 상태: 승인대기
    ↓
입고 상태 조회 (API 호출)
    ↓
상태 업데이트 (승인완료/반려됨/입고완료)
```

## 📞 지원

문제가 발생하면 GitHub Issues에 문의주세요.
