# FULGO Wireframe

React + TypeScript + Tailwind CSS 기반의 객체지향 Order Management System (주문관리시스템) 와이어프레임입니다.

## 라이브 데모
**[https://losnah-think.github.io/react-oms-wireframe](https://losnah-think.github.io/react-oms-wireframe)**

## 사용자 관리 시스템 (NEW)

### 완성된 기능
- **사용자 CRUD**: 생성, 조회, 수정, 삭제
- **고급 검색**: 이름, 이메일, 부서별 검색
- **일괄 작업**: 상태 변경, 삭제
- **통계 대시보드**: 실시간 사용자 현황
- **토스트 알림**: 사용자 친화적 피드백
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원

### 사용법
```bash
# 개발 서버 실행
npm run dev

# 사용자 관리 테스트
npm run test:users

# 데이터베이스 관리
npm run db:generate    # Prisma 클라이언트 생성
npm run db:push        # 스키마 푸시
npm run db:seed        # 시드 데이터 생성
npm run db:studio      # 데이터베이스 관리 도구
```

### 접근 경로
- **사용자 목록**: `/users/list`
- **사용자 관리**: `/users` (메인 대시보드)
- **API 테스트**: `/api/test/users`

## 아키텍처

### 객체지향 구조
- **Types**: 중앙화된 데이터베이스 스키마 타입 정의
- **Models**: 비즈니스 로직을 포함한 데이터 모델 클래스
- **Services**: 데이터 처리 및 API 호출 담당
- **Hooks**: React의 상태 관리와 서비스 연동
- **Components**: 재사용 가능한 UI 컴포넌트
- **Pages**: 페이지별 컴포넌트

### 데이터베이스 스키마

#### 상품 관리
- **Product**: 상품 기본 정보, 가격, 재고, 상태 관리
- **ProductVariant**: 상품 옵션별 변형 정보
- **Category**: 계층형 카테고리 구조
- **Brand**: 브랜드 정보 관리

#### 주문 관리
- **Order**: 주문 정보, 고객 정보, 배송/결제 상태
- **OrderItem**: 주문 상품 상세 정보

#### 판매처 연동
- **Mall**: 판매처 기본 정보 및 연결 상태
- **MallInfo**: 판매처별 배송비, 정책, 템플릿 설정
- **CategoryMapping**: 내부 카테고리와 판매처 카테고리 매핑
- **ShoppingMallIntegration**: 외부 판매처 API 연동 설정

#### 기타
- **User**: 사용자 계정 및 권한 관리
- **Vendor**: 공급업체/판매처 정보
- **DeliveryCompany**: 배송업체 정보 및 요금 설정

### 주요 클래스

#### Product 클래스
- 완전한 상품 정보 관리 (이름, 코드, 가격, 재고 등)
- 다국어 지원 (한글명, 영문명)
- 물리적 속성 (크기, 무게, 부피)
- 외부 판매처 연동 정보
- 재고 업데이트 및 상태 관리 메서드

#### Order 클래스
- 완전한 주문 정보 관리 (주문번호, 고객정보, 상품목록)
- 배송 및 결제 상태 관리
- 주문 항목 추가/제거/수정
- 자동 주문번호 생성
- 총액 계산 및 포맷팅

#### User 클래스
- 사용자 정보 및 권한 관리
- 역할 기반 접근 제어 메서드

## 기능

### 대시보드
- 실시간 통계 현황
- 최근 주문 목록
- 인기 상품 현황

### 상품 관리
- 상품 목록 조회
- 검색 및 필터링
- 재고 관리
- 카테고리별 분류

### 주문 관리  
- 주문 목록 조회
- 주문 상태 업데이트
- 고객별 주문 조회
- 주문 검색 기능

## 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 정적 타입 검사
- **Tailwind CSS** - 유틸리티 CSS 프레임워크
- **Custom Hooks** - 상태 관리 및 로직 분리

## 📁 프로젝트 구조

\`\`\`
src/
├── components/          # 재사용 가능한 컴포넌트
│   └── layout/         # 레이아웃 관련 컴포넌트
├── hooks/              # 커스텀 React 훅
├── models/             # 데이터 모델 클래스들
├── pages/              # 페이지 컴포넌트
├── services/           # 비즈니스 로직 및 API 서비스
└── App.tsx             # 메인 앱 컴포넌트
\`\`\`

## 시작하기

### 로컬 개발

1. 의존성 설치
\`\`\`bash
npm install
\`\`\`

2. 개발 서버 실행
\`\`\`bash
npm start
\`\`\`

3. 브라우저에서 http://localhost:3000 접속

### GitHub Pages 배포

1. 프로덕션 빌드 및 배포
\`\`\`bash
npm run deploy
\`\`\`

2. GitHub Pages 자동 배포 완료

## 📋 주요 특징

### 객체지향 설계
- 클래스 기반 모델 구현
- 비즈니스 로직의 캡슐화
- 상속과 다형성 활용

### 반응형 디자인
- Tailwind CSS를 활용한 모바일 우선 설계
- 다양한 화면 크기 대응

### 타입 안전성
- TypeScript를 통한 컴파일 타임 오류 방지
- 인터페이스 기반 계약 정의

### 재사용성
- 커스텀 훅을 통한 로직 재사용
- 컴포넌트 기반 아키텍처

## 📚 문서

### 사용자 가이드
- **[사용자 가이드](./USER_GUIDE.md)**: 시스템 사용법과 주요 기능 안내
- **[개발자 가이드](./DEVELOPER_GUIDE.md)**: 개발 환경 설정 및 코드 가이드
- **[API 문서](./API_DOCUMENTATION.md)**: REST API 명세 및 사용 예제

### 기술 문서
- **[정보 아키텍처](./INFORMATION_ARCHITECTURE.md)**: 데이터 모델 및 시스템 구조
- **[와이어프레임](./wireframe/)**: UI/UX 설계 문서
- **[구현 워크플로우](./IMPLEMENTATION_WORKFLOW.md)**: 체계적인 개발 로드맵 및 작업 계획

## 개발 목표

이 프로젝트는 현대적인 웹 개발 패러다임과 객체지향 프로그래밍 원칙을 결합하여, 확장 가능하고 유지보수가 용이한 React 애플리케이션의 예시를 제공합니다.

## 라이선스

MIT License

## Runtime DB configuration (production)

This project requires a Postgres-compatible database in production (for example Supabase). Configure `DATABASE_URL` (and `SUPABASE_*` if using Supabase) in your environment.

