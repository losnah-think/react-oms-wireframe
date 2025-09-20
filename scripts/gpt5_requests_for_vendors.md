## vendors/sales

당신은 GPT-5-High입니다. OMS용 "판매처 관리 (Vendors / Sales)" 관리자 SPA 페이지를 구현하세요. 요구사항:
- 목적: 모든 판매처(벤더)를 목록으로 보여주고, 검색, 활성/비활성 필터, 페이지네이션, 보기/수정/비활성화/활성화/상품 동기화 등의 액션을 제공합니다.
- 데이터 모델(API) 필드: `id, name, code, platform, is_active, created_at, updated_at, settings`.
- 사용해야 할 엔드포인트(모의 또는 실제):
  - `GET /api/vendors?limit={}&offset={}&q={query}&is_active={}` -> { vendors: [], meta: { total, limit, offset } }
  - `GET /api/vendors/{id}` -> { vendor }
  - `POST /api/vendors` -> create
  - `PUT /api/vendors/{id}` -> update
  - `POST /api/vendors/{id}/sync-products` -> trigger sync
- UI 요구사항:
  - 테이블 컬럼: 이름, 코드, 플랫폼, 상태, 등록일, 액션
  - 액션: 보기(판매처 상세 패널 열기), 수정(인라인 수정 모달 열기), 활성/비활성 토글, 상품 동기화(확인 모달), 삭제(소프트 삭제)
  - 디바운스 처리된 검색 박스, 플랫폼/활성 상태 필터
  - 행과 버튼은 키보드 접근 가능해야 하며, 액션에 `aria-label`을 제공
- 검증: name 필수, code 고유(클라이언트 측에서 `GET /api/vendors?q=code:{code}`로 확인), platform은 `['cafe24','gmarket','coupang','naver']` 중 하나
- 테스트: 컴포넌트 렌더링 단위 테스트, 모의 fetch 응답으로 리스트+페이지네이션 통합 테스트, 기본 흐름(검색 → 수정 열기 → 저장 → 동기화)을 다루는 Playwright E2E 테스트
- 산출물: React 컴포넌트(TypeScript), 앱 디자인에 맞는 CSS/Tailwind, `pages/api/mock/vendors/*` 내 모의 서버 핸들러, 2~3개의 샘플 벤더 픽스처
- 예시 픽스처:
  - { id: 1, name: "예시몰 A", code: "EMA", platform: "cafe24", is_active: true, created_at: "2024-01-01T12:00:00Z" }

완료 조건: 페이지가 로드되고 픽스처가 표시되며, 검색이 동작하고, 수정 시 로컬 상태 업데이트 및 `PUT` 호출, 동기화 버튼 클릭 시 `POST /sync-products`가 호출되고 토스트가 노출되어야 합니다.

---

## vendors/vendor-products

당신은 GPT-5-High입니다. 각 판매처 플랫폼에 어떤 상품이 노출되는지 관리하는 "판매처별 상품 관리" 페이지를 구현하세요.
- 목적: 특정 판매처에 매핑된 상품을 보여주고, 상품 연결/해제, CSV를 통한 일괄 연결, 상태 동기화를 지원
- 데이터 모델: `VendorProduct` (`id, vendor_id, product_id, vendor_sku, vendor_price, is_listed, last_synced_at`)
- 엔드포인트:
  - `GET /api/vendors/{vendorId}/products?limit=&offset=&q=`
  - `POST /api/vendors/{vendorId}/products` -> link product(s)
  - `PUT /api/vendors/{vendorId}/products/{id}` -> update mapping
  - `DELETE /api/vendors/{vendorId}/products/{id}` -> unlink
- UI: 판매처 선택기, 매핑된 상품 테이블, `vendor_sku`/`vendor_price` 인라인 수정, 일괄 액션, CSV 가져오기 모달
- 테스트: 렌더링, 연결 흐름, CSV 가져오기 시 파싱 엣지 케이스
- 픽스처: 5개의 매핑된 상품과 10개의 미매핑 후보 상품을 가진 판매처

---

## vendors/vendor-info

당신은 GPT-5-High입니다. 판매처별 메타데이터와 템플릿을 저장하는 "판매처별 부가 정보" 페이지를 구현하세요.
- 필드: `vendor_id, store_url, shipping_policy, return_policy, account_info, credentials`(저장 시 암호화), `webhook_url`
- 엔드포인트: `GET/PUT /api/vendors/{id}/info`
- UI: 스토어/배송/결제/웹훅 섹션으로 구분된 폼, 도움말 툴팁, 웹훅 테스트 버튼(POST 시뮬레이션), 마스킹된 자격증명 및 "표시" 토글
- 테스트: URL 필드 검증, 마스킹 필드 처리, 저장 왕복 요청

---

## vendors/vendor-category-mapping

당신은 GPT-5-High입니다. 내부 상품 카테고리를 판매처 카테고리에 매핑하는 페이지를 구현하세요.
- 동작: 좌측에는 내부 카테고리 트리 UI, 우측에는 판매처 카테고리 목록; 드래그 앤 드롭 또는 선택 매핑; JSON 기반 일괄 가져오기/내보내기
- 엔드포인트: `GET /api/vendors/{id}/categories`, `POST /api/vendors/{id}/categories/mapping`
- 테스트: 매핑 저장 유지, 내보내기 포맷, 대규모 트리 처리

---

## vendors/delivery-companies

당신은 GPT-5-High입니다. 판매처 배송 파트너를 관리하는 "택배사 관리" 페이지를 구현하세요.
- 데이터: `id, name, code, is_active, contact, default_service`
- 엔드포인트: `/api/delivery-companies` CRUD, `/api/vendors/{id}/delivery-companies`를 통한 판매처 연결 관리
- UI: 목록, 생성 모달, 판매처와의 연결/해제, 판매처별 기본 서비스 지정
- 테스트: CRUD와 판매처 연결 시나리오

---

## vendors/fixed-addresses

당신은 GPT-5-High입니다. 판매처용 고정 주소를 관리하는 페이지를 구현하세요.
- 목적: 반품 주소 등을 사전에 저장하고 출고 시 선택할 수 있도록 함
- 데이터: `id, vendor_id, label, address_line1, address_line2, city, postal_code, contact_name, phone, is_default`
- 엔드포인트: `/api/vendors/{id}/fixed-addresses` CRUD
- UI: 목록, 생성/수정 모달, 기본값 설정, 주소 복사(클립보드) 액션
- 테스트: 생성/수정/기본값 설정 흐름

---

## vendors/automation

당신은 GPT-5-High입니다. 판매처 자동화 규칙 UI를 구현하세요.
- 기능: 트리거(예: "주문 생성", "재고 임계치")와 액션(예: "판매처 알림", "자동 동기화", "공급처 발주 생성")을 매핑하는 규칙 생성
- 데이터: `id, vendor_id, name, trigger, condition, action, is_active`
- 엔드포인트: `/api/vendors/{id}/automation-rules` CRUD, `/api/automation/execute` 시뮬레이션
- UI: 규칙 목록, JSON 고급 편집기가 포함된 빌더 UI, 활성/비활성 토글, 테스트 실행
- 테스트: 규칙 생성 및 시뮬레이션

---

## vendors/suppliers

당신은 GPT-5-High입니다. 판매처 영역 내에서 "공급처 관리" 페이지를 구현하세요(전역 공급처와는 구분됨).
- 목적: 판매처별 공급처 연결과 조달 옵션을 관리
- 데이터: `id, vendor_id, supplier_id, lead_time_days, cost_multiplier, is_active`
- 엔드포인트: `/api/vendors/{id}/suppliers` CRUD
- UI: 연결된 공급처 목록, 전역 공급처 관리로 이동하는 빠른 링크 포함
- 테스트: 연결/해제 흐름, `lead_time` 및 `multiplier` 검증

---

## vendors/supplier-orders

당신은 GPT-5-High입니다. 판매처 단위 발주 관리를 위한 "공급처 발주 관리" 페이지를 구현하세요.
- 목적: 판매처가 재고 확보를 위해 발주한 구매 주문을 생성/추적
- 데이터 모델: `PO { id, vendor_id, supplier_id, items: [{ sku, qty, price }], status, created_at, updated_at }`
- 엔드포인트: `/api/vendors/{id}/purchase-orders` CRUD, `/api/vendors/{id}/purchase-orders/{poId}/confirm`
- UI: 발주 목록, 발주 생성 모달(공급처 선택, 아이템 추가), 상태·메모를 포함한 발주 상세, 입고 처리 흐름
- 테스트: 발주 수명주기, 검증 로직

---

## vendors/payments

당신은 GPT-5-High입니다. 판매처 지불을 관리하는 "지불 관리" 페이지를 구현하세요.
- 목적: 판매처별 송장, 지불, 정산을 추적
- 데이터: `Invoice { id, vendor_id, amount, currency, due_date, status }`, `Payment { id, invoice_id, amount, method, processed_at }`
- 엔드포인트: `/api/vendors/{id}/invoices`, `/api/vendors/{id}/payments`
- UI: 송장 목록, 지불 기록 모달, 정산 상태, CSV 내보내기
- 테스트: 송장 생성, 지불 기록, 정산 로직