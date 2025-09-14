# FDD: 설정 (Settings)

## 1. 기본 정보
- 화면 이름 (한국어): 설정
- 화면 경로(Route): `/settings`
- 메뉴 ID: `settings`
- 담당자: TBD
- 우선순위: P2

## 2. 목표 및 설명
- 목적: 앱 전반의 기본 설정(통화, 세금, 알림 등) 및 사용자 권한 관리를 제공합니다.

## 3. 주요 사용자 플로우
- 플로우 1: 기본 통화/세금 설정 변경 → 저장

## 4. UI 구성 요소
- 일반 설정 폼, 알림 토글, 사용자/권한 관리 섹션

## 5. 입력값 / 출력값 (Contract)
- 입력값: `GET /api/settings`
- 출력값: `PUT /api/settings`

## 6. 데이터 모델 / 스키마(요약)
- Settings: defaultCurrency, taxRate, notificationChannels[]

## 7. API 및 백엔드 요구사항
- Read/Write: `GET/PUT /api/settings`

## 8. 수용 기준 (Acceptance Criteria)
- 설정 변경 저장 시 시스템 전체에 반영되는지 확인(시뮬레이션)

## 9. 엣지 케이스 및 오류 처리
- 잘못된 포맷의 입력값(예: 통화 코드)에 대한 유효성 검사

## 10. 테스트 시나리오(간단)
- 설정 변경 후 저장 및 백엔드 동기화 확인

## 11. 노트 및 구현 힌트
- 사용자/권한 관리는 향후 ACL 연동 필요