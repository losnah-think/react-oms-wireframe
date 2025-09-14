# FDD: 주문 목록 (Orders List)

## 1. 기본 정보
- 화면 이름 (한국어): 주문 목록
- 화면 경로(Route): `/orders`
- 메뉴 ID: `orders-list`
- 담당자: TBD
- 우선순위: P0

## 2. 목표 및 설명
- 목적: 주문을 검색/필터/상태 변경하고, 주문 상세로 이동하여 처리를 진행할 수 있도록 합니다.

## 3. 주요 사용자 플로우
- 플로우 1: 주문 검색 → 상태 필터 적용 → 주문 상세로 이동 → 상태 변경

## 4. UI 구성 요소
- 검색/필터 바, 주문 테이블, 상세 패널

## 5. 입력값 / 출력값 (Contract)
- 입력값: `GET /api/orders?query=&status=&from=&to=`
- 출력값: `PATCH /api/orders/:id/status` 등

## 6. 데이터 모델 / 스키마(요약)
- Order: id, orderNumber, date, customer{name,phone}, items[], total, status

## 7. API 및 백엔드 요구사항
- Read: 페이징/필터 지원 `GET /api/orders`
- Write: 상태 변경 `PATCH /api/orders/:id`(status)

## 8. 수용 기준 (Acceptance Criteria)
- 검색/필터 적용 결과가 정확히 반영되어야 한다.

## 9. 엣지 케이스 및 오류 처리
- 동시성으로 인한 상태 충돌: 서버에서의 최종 상태 확인 필요

## 10. 테스트 시나리오(간단)
- 주문 상태 변경 후 UI 및 이력 표시 확인

## 11. 노트 및 구현 힌트
- 대량 데이터에 대비한 서버사이드 페이징 권장
