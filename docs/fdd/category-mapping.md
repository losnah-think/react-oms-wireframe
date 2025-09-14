# FDD: 카테고리 매핑 (Category Mapping)

## 1. 기본 정보
- 화면 이름 (한국어): 카테고리 매핑
- 화면 경로(Route): `/malls/category-mapping`
- 메뉴 ID: `category-mapping`
- 담당자: TBD
- 우선순위: P0

## 2. 목표 및 설명
- 목적: 내부 분류와 쇼핑몰 카테고리 간의 대응 관계를 생성/관리하여 상품 등록/수출 시 카테고리 자동 할당에 사용합니다.

## 3. 주요 사용자 플로우
- 플로우 1: 쇼핑몰 선택 → 내부 카테고리 선택 → 쇼핑몰 카테고리 선택 → 매핑 생성 → 엑스포트

## 4. UI 구성 요소
- 쇼핑몰 타일 그리드, 내부 카테고리 리스트(HierarchicalSelect 또는 리스트), 쇼핑몰 카테고리 패널, 매핑 테이블

## 5. 입력값 / 출력값 (Contract)
- 입력값: `GET /api/malls`, `GET /api/classifications`, `GET /api/mall-categories?mallId=`
- 출력값: `POST /api/mappings` 생성, `GET /api/mappings` 조회

## 6. 데이터 모델 / 스키마(요약)
- Mapping: id, mallId, internalCategoryId, mallCategoryId, active, createdAt

## 7. API 및 백엔드 요구사항
- Read: `GET /api/mappings?mallId=`
- Write: `POST /api/mappings`, `DELETE /api/mappings/:id`, `PATCH /api/mappings/:id`(active)

## 8. 수용 기준 (Acceptance Criteria)
- 동일한 internalCategoryId + mallCategoryId + mallId 조합이 중복 생성되지 않아야 한다.

## 9. 엣지 케이스 및 오류 처리
- 쇼핑몰 카테고리 구조가 매우 깊을 때의 렌더링 퍼포먼스

## 10. 테스트 시나리오(간단)
- 매핑 생성 → 목록에 반영 → 중복 매핑 차단 확인

## 11. 노트 및 구현 힌트
- 엑스포트는 CSV/XLSX로 지원, 큰 파일은 스트리밍 방식 고려
