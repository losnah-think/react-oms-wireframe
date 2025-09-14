# FDD: 공유 컴포넌트 및 유틸리티 (Shared)

## 1. 기본 정보
- 항목: HierarchicalSelect, AnimatedCollapse, Modal sizing helpers
- 위치: `src/components/common/`
- 담당자: TBD

## 2. 목표 및 설명
- 목적: 여러 화면에서 재사용 가능한 UI 컴포넌트의 동작 정의, props 계약, 접근성 요구사항을 명확히 합니다.

## 3. 개별 컴포넌트 사양
- HierarchicalSelect
  - Props: items, selectedId, onSelect, colWidth?, maxDepth?
  - 동작: 포탈로 렌더, 컬럼 기반 뎁스 표시, 키보드 접근성 지원

- AnimatedCollapse
  - Props: isOpen, children, duration?
  - 동작: scrollHeight 기반 max-height 트랜지션

- Modal sizing helpers
  - 목적: 다양한 컨텍스트에서 일관된 모달 크기 제공 (max-w-3xl, max-w-2xl, max-w-xl)

## 4. 수용 기준
- 컴포넌트의 기본 props 계약이 문서와 일치하고, 주요 화면에서 재사용 가능해야 합니다.

## 5. 테스트 시나리오
- 포탈화된 드롭다운의 표시/숨김, 키보드 네비게이션 테스트
