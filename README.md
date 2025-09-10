# React OMS Wireframe

React + TypeScript + Tailwind CSS 기반의 객체지향 Order Management System (주문관리시스템) 와이어프레임입니다.

## 🌐 라이브 데모
**[https://losnah-think.github.io/react-oms-wireframe](https://losnah-think.github.io/react-oms-wireframe)**

## 🏗️ 아키텍처

### 객체지향 구조
- **Models**: 비즈니스 로직을 포함한 데이터 모델
- **Services**: 데이터 처리 및 API 호출 담당
- **Hooks**: React의 상태 관리와 서비스 연동
- **Components**: 재사용 가능한 UI 컴포넌트
- **Pages**: 페이지별 컴포넌트

### 주요 클래스

#### Product 클래스
- 상품 정보 관리
- 재고 업데이트 기능
- 가격 포맷팅 메서드

#### Order 클래스  
- 주문 정보 관리
- 주문 항목 추가/제거
- 주문 상태 관리
- 총액 계산 자동화

#### User 클래스
- 사용자 정보 관리
- 권한 체크 메서드

## 🚀 기능

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

## 🛠️ 기술 스택

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

## 🚀 시작하기

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

## 🎯 개발 목표

이 프로젝트는 현대적인 웹 개발 패러다임과 객체지향 프로그래밍 원칙을 결합하여, 확장 가능하고 유지보수가 용이한 React 애플리케이션의 예시를 제공합니다.

## 📝 라이선스

MIT License
