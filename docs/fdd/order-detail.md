# FDD: 주문 상세 (Order Detail)

## 1. 기본 정보
- 화면 이름 (한국어): 주문 상세
- 화면 경로(Route): `/orders/:id`
- 메뉴 ID: `order-detail`
- 담당자: TBD
- 우선순위: P0

## 2. 목표 및 설명
- 목적: 주문의 품목, 결제/배송/고객 정보를 확인하고 발송/환불 등의 내부 처리를 수행하도록 지원합니다.

## 3. 주요 사용자 플로우
- 플로우 1: 주문 목록에서 상세 진입 → 발송 처리(송장 입력) → 상태 변경

## 4. UI 구성 요소
- 주문 요약, 품목 리스트, 고객/배송 정보, 내부 메모, 상태 변경 드롭다운

## 5. 입력값 / 출력값 (Contract)
- 입력값: `GET /api/orders/:id`
- 출력값: `PATCH /api/orders/:id`(status, shipping info)

## 6. 데이터 모델 / 스키마(요약)
- Order: id, orderNumber, items[{productId,variantId,qty,price}], shipping{carrier,trackingNumber,status}

## 7. API 및 백엔드 요구사항
- Read: `GET /api/orders/:id`
- Write: `PATCH /api/orders/:id`(status, shipping)

## 8. 수용 기준 (Acceptance Criteria)
- 발송 처리 시 송장번호 입력 후 상태가 `발송 완료`로 변경되어야 한다.

## 9. 엣지 케이스 및 오류 처리
- 잘못된 송장번호 포맷이나 배송사 미지원 케이스 처리

## 10. 테스트 시나리오(간단)
- 발송 처리 시 상태 변경 및 UI 반영 확인

## 11. 노트 및 구현 힌트
- 외부 배송사 API 연동 시 비동기 처리 및 실패 리트라이 정책 고려