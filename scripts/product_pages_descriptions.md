# Product Pages — Detailed Descriptions

Generated: 2025-09-20

This document describes each product-related SPA page in `src/features/products`. For every page it lists: Purpose, Route(s), Data model(s), Main UI sections, Interactions, Validation rules, Tests & acceptance criteria, and Implementation notes.

---

## Common conventions
- Date/time formatting: `toLocaleDateString('ko-KR')` + `toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'})` as used across the app.
- Price formatting: `formatPrice(value)` from `src/utils/productUtils`.
- Product normalization: `normalizeProductGroup(product)` from `src/utils/groupUtils`.
- Mock APIs live under `pages/api/*` and many pages read `/api/meta/*` for small lists.

---

## 1. `ProductsListPage` (`src/features/products/ProductsListPage.tsx`)
- Purpose: master listing and management UI for all products. Primary entry point to view, filter, batch-edit, export, and send products to external malls.
- Routes: SPA path `/products` (also used for `products-list` id in SPA router), and served by `pages/index.tsx` when SPA state is `products`.
- Data model: expects `Product` objects compatible with `normalizeProductGroup`. Minimal fields used:
  - `id, name, code, images[], variants[], selling_price, cost_price, supply_price, supplier_name, brand, created_at, is_selling, is_soldout, shipping_policy, tags[], classification, group, category_id`.
- Main UI sections:
  - Header with total counts and quick actions
  - Filters panel (toggleable): date range, category, brand, suppliers, groups, shipping-policy toggle, designers, registrants, seasons
  - Search bar with suggestions, recent queries, keyboard shortcuts (Cmd/Ctrl+K, /)
  - Action toolbar: export, batch-edit, option batch-edit, external send, delete
  - Table list: rows are clickable to open product detail/edit, with inline selection checkboxes and action buttons (external send, delete)
  - Modals: batch edit, option batch edit, category manager, supplier manager
- Interactions:
  - Clicking row navigates to product detail (SPA onNavigate or full page navigation to `/products/:id`).
  - Multi-select using checkboxes and "select all".
  - Search debounce (300ms) and local recent queries stored in `localStorage`.
  - Batch-edit operations apply locally to the `products` state (no network calls by default).
  - Soft-delete stores removed items in `localStorage` key `trashed_products_v1`.
- Validation:
  - Search input trimmed.
  - Batch edit numeric inputs parsed to numbers and sanitized (NaN ignored).
- Tests & acceptance criteria:
  - Unit tests for filtering logic (search, category, supplier, date-range). Use small in-memory product arrays.
  - Integration test: load page with mock `/api/products` and `/api/meta/*` responses; assert table rows count and filters work.
  - E2E: select items, open batch-edit, apply price change, verify table reflects change and toast appears.
- Implementation notes:
  - Ensure keyboard accessibility for row navigation and filter controls.
  - Avoid re-render explosion by memoizing heavy lists and keeping normalized product objects.

---

## 2. `ProductDetailPage` (`src/features/products/ProductDetailPage.tsx`)
- Purpose: detailed view and editor for a single product including images, variants, attributes, memos, and WYSIWYG description.
- Routes:
  - SPA route id `products-detail` or `products-edit` (rendered by `pages/index.tsx`) and canonical URL `/products/:id`.
- Data model (Product normalized):
  - Required: `id, name, code, images[], representative_image, variants[]` where variant includes `id, variant_name, code, barcode1/2/3, selling_price, cost_price, supply_price, stock, warehouse_location, is_selling, is_soldout, is_for_sale`.
  - Additional attributes: `supplier_id, supplier_name, created_at, updated_at, created_by, updated_by, classification_id, classification, tags[], memos[], externalMall, shipping_policy, origin_country, purchase_name, hs_code, box_qty, weight_g, width_cm, height_cm, depth_cm, volume_cc`.
- Main UI sections:
  - Top action bar: Back, Lock/Edit toggle, Product Settings, Delete
  - Metadata card: created/updated info and quick "set registration date to now"
  - Image management card: preview, thumbnail list, upload replace, URL edit (draft + commit), set representative, add blank URL slot, multi-upload
  - Basic info table: name, code, brand, supplier id
  - Price / stock section: selling/cost/supply prices, total stock, margin rate, created date
  - Additional attributes: supplier, origin, purchase name, shipping policy, HS code, box qty, stock-link toggle, classification, externalMall info
  - Tags and Memos: inline add/delete/edit for memos, tags input
  - Options table: list of variants with editable fields (variant_name, code, barcodes, selling/cost/supply price, stock, location, status badges)
  - Dimensions & weights form (editable), external mall field
  - WYSIWYG HTML description editor (contentEditable) with sanitization via `dompurify` or fallback regex
  - Settings modal: grouped toggles and fields, persisted to local product state
- Interactions & behaviors:
  - Loads product from `/api/products/:id` and gracefully falls back to a placeholder product if fetch fails.
  - `editing` state toggles whether inputs are editable; default is `true` in current file but can be adjusted.
  - Image drafts: editing image URL does not immediately overwrite product until blur/commit; uploading files reads via FileReader to data URLs and inserts into images array.
  - Replace/add image file inputs are hidden and triggered programmatically; representative image is managed consistently when images are reordered/removed.
  - WYSIWYG editor writes HTML to `product.description` and sanitation is applied before displaying.
  - Settings modal applies its values to the `product` local state when saved.
  - Soft-delete via localStorage for demo environment.
- Validation & constraints:
  - Price inputs accept numbers; conversions use `Number()` and default to 0 when empty.
  - Image URL input accepts data URLs or http(s) URLs; onError fallback to a placeholder image.
  - Memo count: UI allows arbitrary memos but app-level requirement recommends `maxItems:15` (enforce in validation if needed).
  - WYSIWYG HTML is sanitized with `dompurify` when available.
- Tests & acceptance criteria:
  - Unit tests for image draft lifecycle (edit URL -> commit -> product.images updated), add/remove images, and representative selection behavior.
  - Integration test: mock `/api/products/:id` returning a product with variants; verify rendered values, editing toggles, and settings modal persistence.
  - Accessibility: ensure keyboard: focusable thumbnails, `contentEditable` has accessible toolbar buttons and ARIA labels.
- Implementation notes:
  - Keep file input refs stable to avoid losing selection when React re-renders.
  - Consider moving image handling logic to a small hook `useProductImages(product, setProduct)` for reuse and testability.

---

## 3. `ProductsAddPage` (`src/features/products/ProductsAddPage.tsx`)
- Purpose: create a new product via single-form UI. (File present; implement similar fields to ProductDetailPage but for creation flow.)
- Route: SPA id `products-add` -> canonical `/products/add`.
- Data model: accepts `ProductCreate` payload: `name, code, brand, supplier_id, images[], variants[], selling_price, cost_price, supply_price, tags[], memos[], classification_id, shipping_policy, origin_country, purchase_name, hs_code, box_qty, dimensions, weight, externalMall`.
- UI sections: basic info, images (upload/URL), variants (ability to add options), price/stock, additional attributes, memos, WYSIWYG description, save & cancel.
- Interactions: form validation (required: `name`, at least one variant or price), create via `POST /api/products` (mockable), on success navigate to product detail or products list.
- Tests: form validation tests, successful POST with mock server, cancel flow.

---

## 4. `ProductCsvUploadPage` (`src/features/products/ProductCsvUploadPage.tsx`, also `csv.tsx` duplicate)
- Purpose: CSV import tool for bulk product creation/update.
- Route: `/products/csv` and SPA id `products-csv`.
- Data model: CSV columns accepted: `id,code,name,brand,price,cost,stock,sku,category,tags,images` with flexible mapping UI.
- UI: upload input, mapping step UI (map CSV columns to product fields), preview parsed rows, import options (create-only / update-only / upsert), progress and summary.
- Interactions: parse CSV in browser (PapaParse or similar), validate rows, show errors/duplicates, call `/api/products/bulk` with parsed JSON payload.
- Tests: CSV parse edge cases (commas/quotes/newlines), mapping persistence, import summary correctness.

---

## 5. `ProductImportPage` & `ExternalProductImportPage` (`ProductImportPage.tsx`, `ExternalProductImportPage.tsx`)
- Purpose: Import products from external marketplaces or via connector integrations.
- Routes: `/products/import` and `/products/external-import`.
- Features: connectors list (malls), manual fetch/sync, sample mapping preview, import history.
- Interactions: select mall, fetch remote products (mocked), map fields, import selected items.
- Tests: connector flow, mapping preview and import acceptance.

---

## 6. `bulk-edit.tsx` and `option-bulk.tsx` (`src/features/products/bulk-edit.tsx`, `option-bulk.tsx`)
- Purpose: Bulk-edit UI for products (price/stock/status) and for options specifically.
- Routes: `/products/bulk-edit` with query `?tab=product|option` for tab selection.
- UI: selection source (current selection or file upload), preview changes, apply locally or via `/api/products/bulk`.
- Tests: multiple combinations of price/stock modes and their application to variants.

---

## 7. `registration-history.tsx` (`src/features/products/registration-history.tsx`)
- Purpose: show history/logs of import/registration batches, success/failure counts, and re-run options.
- Route: `/products/registration-history`.
- Data model: registration batches: `id, batch_name, created_at, user, status, total, succeeded, failed, errors[]`.
- UI: list, detail modal with error rows and retry per-row options.
- Tests: ensure pagination and per-batch retry works with mock API.

---

## 8. `individual-registration.tsx` (`src/features/products/individual-registration.tsx`)
- Purpose: guided single-item registration flow (wizard) to assist onboarding new products.
- Route: `/products/individual-registration`.
- UI: multi-step wizard (basic info -> variants -> images -> review -> submit).
- Tests: wizard step validation and final POST payload shape.

---

## 9. `[id].tsx` (legacy Next page) (`src/features/products/[id].tsx`)
- Purpose: server-rendered fallback route for direct navigation to `/products/:id` when not using SPA index. It likely renders the same `ProductDetailPage` component.
- Route: `/products/:id` (Next dynamic page)
- Implementation note: ensure both dynamic page and SPA `pages/index.tsx` detail render produce consistent props and behavior.

---

## 10. `trash.tsx` (`src/features/products/trash.tsx`)
- Purpose: Trash view for soft-deleted products stored in localStorage key `trashed_products_v1`.
- Route: `/products/trash`.
- UI: list trashed items, restore single/all, permanently delete single/all, export trashed list.
- Tests: ensure restore removes item from `trashed_products_v1` and reinserts into `products_local_v1` or triggers `products:updated` event.

---

## Implementation & QA checklist (recommended)
- Ensure shared utilities (`formatPrice`, `normalizeProductGroup`) are used consistently to avoid duplicate logic.
- Add small unit tests for normalization and filtering logic (jest + react-testing-library).
- E2E smoke tests (Playwright) for list -> open detail -> edit -> save -> back to list flows.
- Accessibility: keyboard navigation for tables, ARIA labels for toolbar buttons, labels for inputs.
- Performance: when loading many products, avoid heavy re-renders by memoizing derived lists and extracting large forms into separate memoized components.

---

If you'd like, I can now:
- Create a single consolidated markdown or a Notion-friendly export for handoff to designers/QA;
- Generate component skeletons for a specific product page (e.g., `vendors/sales` or `products/add`);
- Add unit tests for `ProductsListPage` filtering logic and `ProductDetailPage` image handling.

Which next step should I do? (or say "Export" to save this doc and finish)