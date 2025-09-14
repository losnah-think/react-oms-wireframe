# FDD: 상품 목록 (Products List)

## 1. 기본 정보
- 화면 이름 (한국어): 상품 목록
- 화면 경로(Route): `/products`
- 메뉴 ID: `products-list`
- 담당자: TBD
- 우선순위: P0

## 2. 목표 및 설명
- 목적: 상품을 검색, 필터링, 정렬하고 다중 선택하여 일괄 작업(엑스포트, 일괄 상태 변경 등)을 수행할 수 있도록 합니다.

## 3. 주요 사용자 플로우
- 플로우 1: 검색어 입력 → 필터 선택(분류/브랜드) → 결과 확인 → 항목 선택 → 엑스포트
- 플로우 2: 개별 상품 클릭 → 상세 페이지로 이동

## 4. UI 구성 요소
- 상단: 검색 입력, 분류 필터(`HierarchicalSelect`), 브랜드/상태 드롭다운, 엑스포트 버튼
- 주요: 상품 테이블(이미지, 이름, 코드, 분류, 브랜드, 가격, 재고, 액션)
- 모달: 대량 작업 확인 모달(삭제/비활성화 등)

## 5. 입력값 / 출력값 (Contract)
- 입력값: `GET /api/products?query=&category=&brand=&page=&sort=` → 반환: products[], total
- 출력값: 엑스포트 파일(다운로드), 선택된 상품의 일괄 상태 변경 결과

## 6. 데이터 모델 / 스키마(요약)
- Product: id, code, name, brandId, price, variants[{id, sku, stock}], classificationPath[]

## 7. API 및 백엔드 요구사항
- Read: 페이징/필터/정렬 지원하는 `GET /api/products`
- Write: bulk update endpoint 권장 `POST /api/products/bulk` 또는 `PATCH /api/products`

## 8. 수용 기준 (Acceptance Criteria)
- 검색어/필터 조합으로 결과가 정확히 필터링되어야 한다.
- `HierarchicalSelect`가 모달 내부에서도 정상 동작해야 한다.

## 9. 엣지 케이스 및 오류 처리
- 이미지 로드 실패 시 대체 이미지 표시
- 서버 에러 시 사용자에게 에러 메시지와 재시도 버튼 제공

## 10. 테스트 시나리오(간단)
- 검색 결과 필터링 테스트
- 엑스포트 파일 내용 검증

## 11. 노트 및 구현 힌트
- `HierarchicalSelect` 사용: 포탈 렌더링, 컬럼 너비 조정
