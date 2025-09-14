# Functional Design Document (FDD)

**PROJECT:** FULGO OMS

**Module:** Admin site

**Document Version:** 1.0

**Date:** 2025-09-14

**Prepared by:** Hansol (Thor) Choi

---

## I. Use of Document
이 문서는 FULGO OMS(이하 "프로젝트")의 기능 설계 문서입니다. 해당 문서의 모든 내용은 SotaTek의 소유이며, 사전 허가 없이 복제, 전송, 사용될 수 없습니다. 문서는 프로젝트 진행에 따라 변경될 수 있으며, 변경 사항은 Section II의 문서 이력에 기록되어야 합니다.

## II. Document Control
| Version | Date | Author | Comments |
|---|---:|---|---|
| 1.0 | 2025-09-14 | Hansol (Thor) Choi | Initial Version |
| - | - | - | - |

---

## III. Table of Contents
- I. Use of Document
- II. Document Control
- III. Table of Contents
- IV. Introduction
- V. User Site (Use Cases)
- VI. Non-functional Requirements
- VII. API Contracts
- VIII. Data Models (summary)
- IX. Acceptance Criteria
- X. Appendix (Wireframes / Notes)

---

## IV. Introduction

### 4.1 Document Purpose
이 FDD는 PROJECT_NAME의 화면, 기능, 입력/출력, 비즈니스 규칙 및 수용 기준을 명확히 정의하여 개발 및 QA에 필요한 구현 가이드를 제공합니다.

### 4.2 Project Abstract
PROJECT_NAME은 건강 상담을 위한 AI 기반 서비스입니다. 본 문서는 Admin(관리자) 및 유저 사이트의 핵심 화면과 흐름을 기술합니다.

### 4.3 Intended Audience
- Project Managers
- Business Analysts
- Development Leads
- QA Engineers

### 4.4 Terms and Abbreviations
- BR: Business Rule
- UC: Use Case
- API: Application Programming Interface

### 4.5 Scope of Services
서비스 범위에 포함되는 항목: 프로젝트 관리, UI/UX 디자인, 기능 설계 문서(FDD), 품질 보증, 교육, 고객 지원(필요 시).

### 4.6 Scope of Work
본 문서는 다음 화면/기능의 상세 정의를 포함합니다: 회원 인증(가입/로그인/로그아웃), 온보딩, 상품/분류(예시) 관리, 주문 관리, 몰 연동 설정 등.

---

## V. User Site — Use Cases (요약)

### UC1: Sign up (회원가입)
- ID: UC1
- Use case name: Sign up
- Author: Ha.do
- Description: 사용자가 계정을 생성하는 흐름입니다.

#### Trigger
사용자가 '시작하기/Start' 버튼을 클릭합니다.

#### Pre-conditions
N/A

#### Post-conditions
사용자가 정상적으로 가입되어 앱에 접근할 수 있습니다.

#### Business Rules
- BR-01: 인증코드는 전송 후 5분(300초) 후 만료됩니다.

#### Flow / Details
1) Welcome → 약관 동의 → 본인인증(휴대폰) → 개인정보 입력(이름, 생년월일, 성별) → 가입 완료

#### 화면별 요소 / Validation (요약)
- 약관 동의: 전체동의 체크박스가 개별 체크박스와 연동됩니다.
- 생년월일: YYYY.MM.DD 포맷, 연령 제한(1930 ~ 현재연도-14)
- 휴대폰: 숫자만 입력, 11자리
- 인증번호: 숫자 6자리, 타이머 3:00

---

### UC2: Log in (로그인)
- ID: UC2
- Use case name: Log in
- Author: Ha.do
- Description: 기존 계정으로 앱에 로그인합니다.

#### Trigger
Welcome 화면에서 '로그인하기' 버튼 클릭

#### Pre-conditions
사용자가 이미 회원 가입을 완료한 상태

#### Post-conditions
사용자가 로그인되어 홈 화면으로 이동합니다.

#### Business Rules
- BR-01: 인증코드는 전송 후 5분 내 사용해야 합니다.

#### Flow / Details
- 전화번호 입력 → 인증 요청 → 인증번호 입력/확인 → 로그인

---

### UC3: Log out (로그아웃)
- ID: UC3
- Use case name: Log out
- Description: 사용자가 세션을 종료합니다.

#### Trigger
설정 메뉴에서 '로그아웃' 버튼 클릭

#### Post-conditions
사용자가 로그아웃되고 Welcome 화면으로 리다이렉트됩니다.

---

## VI. Non-functional Requirements (요약)
- 반응성: 모바일/데스크톱에서 응답성 보장
- 보안: 인증 토큰은 안전하게 저장(예: HttpOnly cookie 또는 secure storage)
- 접근성: 기본적인 키보드 내비게이션 및 대체 텍스트 제공

---

## VII. API Contracts (요약)
- POST /api/auth/send-code { phone } → 200 { success }
- POST /api/auth/verify-code { phone, code } → 200 { token }
- GET /api/products?query=&category=&brand=&page=&sort= → 200 { products[], total }

---

## VIII. Data Models (summary)
- Product (id, code, name, brandId, price, variants[], classificationPath[])
- User (id, phone, name, dob, gender)

---

## IX. Acceptance Criteria
- 필수 항목: 인증 코드 타이머 동작(3:00), 필수 필드 검증, 전화번호/인증 흐름 정상 동작

---

## X. Appendix
- Wireframes / Figma links:

---

### Notes
원문에 포함된 상세한 화면 단위 항목(각 버튼, 라벨, 동작 규칙)은 개별 스크린 FDD(예: `signup.md`, `login.md`)로 분리하여 보관하는 것을 권장합니다. 전체 변환 및 페이퍼 문서 업로드를 원하시면 알려주세요.
