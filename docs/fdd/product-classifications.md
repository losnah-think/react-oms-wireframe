# FDD: 분류 편집 (Product Classifications)

## 1. 기본 정보
- 화면 이름 (한국어): 분류 편집
- 화면 경로(Route): `/settings/classifications`
- 메뉴 ID: `product-classifications`
- 담당자: TBD
- 우선순위: P0

## 2. 목표 및 설명
- 목적: 내부 상품 분류를 계층형 트리로 관리하여 상품 카테고리 검색/분류에 사용합니다.

## 3. 주요 사용자 플로우
- 플로우 1: 루트 분류 추가 → 하위 분류 추가 → 편집 → 삭제(삭제 미리보기 확인)

## 4. UI 구성 요소
- 트리 뷰: 각 노드에 액션(추가/편집/삭제)
- 모달: 추가/편집 모달, 삭제 미리보기 모달

## 5. 입력값 / 출력값 (Contract)
- 입력값: 로컬 `productClassificationsTree` 또는 `GET /api/classifications`
- 출력값: 트리 변경사항(POST/PUT/DELETE 권장)

## 6. 데이터 모델 / 스키마(요약)
- Classification: id, name, parentId, children[], path[]

## 7. API 및 백엔드 요구사항
- Read: `GET /api/classifications`
- Write: `POST/PUT/DELETE /api/classifications`

## 8. 수용 기준 (Acceptance Criteria)
- 삭제 시 삭제 미리보기에 영향을 받는 모든 하위 노드가 정확히 표시되어야 한다.
- `AnimatedCollapse`의 접기/펼치기가 자연스럽게 동작해야 한다.

## 9. 엣지 케이스 및 오류 처리
- 트리의 깊이에 따른 퍼포먼스 이슈 및 무한 루프 방지

## 10. 테스트 시나리오(간단)
- 루트/하위 추가 및 로컬 저장 확인

## 11. 노트 및 구현 힌트
- 로컬 스토리지와 서버 동기화 정책 필요(충돌 해결 방식 정의)
