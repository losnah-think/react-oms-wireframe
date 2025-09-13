# chore(ci): CI workflow + page-summary reporting + cleanup

## 요약
- CI 워크플로우 추가 (`.github/workflows/ci.yml`): PR/푸시 시 `npm ci` 후 Jest 테스트를 실행하고, 페이지 렌더 요약(`pages-summary`)을 아티팩트로 업로드합니다.
- 페이지 렌더 요약 테스트 보강 (`src/pages/__tests__/all-pages.summary.test.tsx`): CI 환경에서 `test-results/pages-summary.json`을 생성합니다.
- 테스트 안정성 및 방어적 코드 수정:
  - `src/utils/orderUtils.ts`: null/undefined 안전성 보강 (기본값, 빈 배열 처리 등).
  - `src/pages/orders/OrderListPage.tsx`: mock 매핑에 안전한 기본값 추가.
  - `src/components/orders/OrderTable.tsx`: item/order key 안정화 및 방어적 렌더링.
- 자잘한 리팩터 및 정리:
  - 중복 Jest 설정 제거/정리.
  - `Icon` 컴포넌트 추가(`src/design-system/components/Icon.tsx`) 및 디자인 시스템에 재수출 추가.
  - `src/assets/icons` 정리(중복 아이콘 제거, `public/icons`을 canonical으로 사용).

## 변경 사항 하이라이트
- 브랜치: `chore/ci-and-report`
- 주요 파일:
  - `.github/workflows/ci.yml`
  - `src/pages/__tests__/all-pages.summary.test.tsx`
  - `src/utils/orderUtils.ts`
  - `src/pages/orders/OrderListPage.tsx`
  - `src/components/orders/OrderTable.tsx`
  - `src/design-system/components/Icon.tsx`

## 테스트
- 로컬: `npx jest --config=jest.config.cjs --runInBand` — 모든 테스트 통과 확인 완료.
- CI: PR에서 Action이 실행되면 `test-results/pages-summary.json` 아티팩트를 확인할 수 있습니다.

## 후속 권장 작업
1. CI에서 생성된 `pages-summary.json`을 검토하고 페이지별 실패가 있을 경우 필요한 Mock/방어 코드 추가
2. 아이콘 최적화: `public/icons` 기반으로 `Icon` 사용으로 전환하거나 SVGR 도입
3. 디자인 시스템 트리쉬이킹: 개별 컴포넌트 import 방식으로 변경해 번들 크기 개선
4. (선택) `mockOrders` 규모 축소로 테스트 속도 개선

## 주의
- 삭제된 아이콘이나 설정은 커밋에 포함되므로 이 PR로 변경사항을 리뷰 후 필요 시 롤백 가능합니다.

---

작업을 PR로 생성하고 싶습니다. 계속 진행할까요?

# tiny-noop: retrigger CI
