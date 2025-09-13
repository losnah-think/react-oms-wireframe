**Title**: feat(integrations,settings): card UI + per-integration intervals + settings CRUD & tsc fixes

**Description**
- **요약**: Integrations 페이지를 카드형 UI로 재구성하고, 각 연동별 수집 주기를 편집하는 모달을 추가했습니다. 또한 브랜드/상품 분류/시즌/연도 설정 페이지에 CRUD UI를 구현하고, 몇몇 TypeScript/목업 타입 불일치를 안전하게 완화해 `tsc` 빌드가 통과하도록 수정했습니다.
- **주요 변경점**: 카드형 Integration 목록, Secret 모달, Register 모달, IntegrationIntervalsModal(연동별 수집주기, undo/reorder 등), Settings CRUD(Brands, ProductClassifications, ProductSeasons, ProductYears).
- **브랜치**: `feat/integration-intervals-ui`
- **커밋 예시**: `a5dd5b9`

**변경 파일(주요)**
- `src/components/integrations/ConnectionsList.tsx`
- `src/components/integrations/IntegrationCard.tsx`
- `src/components/integrations/IntegrationIntervalsModal.tsx`
- `src/components/integrations/SecretModal.tsx`
- `src/components/integrations/RegisterIntegrationForm.tsx`
- `src/pages/settings/IntegrationsPage.tsx`
- `src/pages/settings/BrandsPage.tsx`
- `src/pages/settings/ProductClassificationsPage.tsx`
- `src/pages/settings/ProductSeasonsPage.tsx`
- `src/pages/settings/ProductYearsPage.tsx`
- 일부 제품/주문 유틸·컴포넌트 타입 완화: `src/utils/productUtils.ts`, `src/components/products/*`, `src/pages/orders/OrderListPage.tsx` 등

**동작 확인 방법 (검토자 체크리스트)**
- [ ] `npx tsc --noEmit` 명령이 에러 없이 종료되는지 확인.
- [ ] `npm test` 또는 `npx jest`로 테스트 실행(필요 시).
- [ ] 앱 실행 후 Integrations 페이지에서:
  - 기본 채널이 `All` 로 보이는지 확인.
  - 연동 카드의 시크릿 클릭 → `SecretModal`이 열리는지 확인(복사 버튼 포함).
  - `연동 등록` 버튼 → `RegisterIntegrationForm` 모달 동작 확인.
  - 카드의 `수집 주기` 버튼 → `IntegrationIntervalsModal`이 열리고, 추가/편집/삭제/undo/순서 변경이 저장되는지 확인.
  - 변경은 `localStorage` 키 `collectionIntervalsByIntegration`에 저장됩니다.
- [ ] Settings(브랜드/분류/시즌/연도) 페이지에서 항목 추가/편집/삭제가 정상 동작하고 `localStorage`에 반영되는지 확인.

**테스트 & 릴리스 노트**
- **테스트 명령**:
  - 타입 체크: `npx tsc --noEmit`
  - 유닛 테스트: `npm test` 또는 `npx jest --runInBand`
- **배포**: 브랜치가 원격에 푸시되어 있으면(이미 푸시됨) Vercel/GitHub Actions가 자동 배포를 트리거합니다(설정에 따라 다름).
- **주의사항(향후 개선)**:
  - 일부 파일에서 목업 데이터 타입(예: `mockProducts`)과 `src/types/database.ts`의 타입이 달라, 임시로 `any` 또는 캐스팅을 사용했습니다. 장기적으로는 목업/도메인 타입을 일치시키는 리팩토링 권장합니다.

**How to open PR**
- 웹에서 바로 열기:
  `https://github.com/losnah-think/react-oms-wireframe/compare/main...feat/integration-intervals-ui?expand=1`
- 또는 로컬에서 `gh` 사용 시(환경에 설치되어 있으면):
  - `gh pr create --base main --head feat/integration-intervals-ui --title "feat(integrations,settings): card UI + per-integration intervals" --body "$(cat PR_BODY.md)"`

원하시면 이 PR 본문을 수정하거나, 제가 PR 생성 명령을 준비해 드리겠습니다.
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
