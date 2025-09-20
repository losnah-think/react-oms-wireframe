Feat: Wire mock groups into product pages & add batch UI (mock)

Summary
- Fetch `/api/meta/groups` and populate group selects across product list/add/edit pages.
- Add normalization helper for legacy classification → `group` mapping.
- Add selection checkboxes, action toolbar (export, batch edit, option batch edit, delete, sort) on product list.
- Implement mock batch/option edit modals and category-manager modal (UI-only, client-side mock behavior).
- Add `Toast` for user feedback and several small UI/UX improvements.

Files changed (high level)
- pages/api/meta/groups.ts (new)
- src/utils/groupUtils.ts (new)
- src/components/Toast.tsx (new)
- src/features/products/ProductsListPage.tsx (updated)
- src/features/products/ProductsAddPage.tsx (updated)
- src/features/products/ProductsEditPage.tsx (updated)

Notes
- All batch/edit/delete flows are currently mock/local-only. They show modals and toasts and perform local state changes; server-side endpoints should be implemented to persist changes.
- TypeScript checks ran locally (`npx tsc --noEmit`) and passed.

How to test locally
1. Start dev server: `npm run dev`
2. Open: `http://localhost:3000/products`
3. Verify:
   - Group selector is populated (from `/api/meta/groups`).
   - You can select rows, use `선택삭제` to remove items locally and see a toast.
   - `상품 일괄수정` and `옵션 일괄수정` open modals and show toast when applying.
   - `상품분류 관리` opens the category manager modal.

Recommended next steps
- Wire batch/option/category APIs to persist changes.
- Add confirmation modal to `선택삭제` for production.
- Add unit/e2e tests for list filters and batch flows.
