Product List — Wireframe & Layout
=================================

Purpose
-------
Primary screen for browsing and managing products. Designed for fast scanning, bulk actions, and refined filtering.

Tokens used
-----------
- --space-gutter-desktop
- --space-gutter-mobile
- --space-1 / --space-2 / --space-3 / --space-4
- --size-header
- --size-toolbar
- --pad-card-md
- --size-control-md
- --size-row-header
- --size-row / --size-row-compact
- --thumb-regular / --thumb-compact
- --pad-cell-x
- Grid: 24 columns

High-level layout
-----------------
1) Header (global search band)
2) Top toolbar: title + total count (left), actions (right)
3) Filter Card (collapsible)
4) Filter chips summary row
5) Product table

Wireframe (tokens displayed in brackets)
----------------------------------------
[--space-gutter-desktop]
[LNB: --lnb-width][Main container width: full - gutters]

[Header: --size-header]
[Toolbar: --size-toolbar]
[Filter Card: pad --pad-card-md]
[Chips Row: height --size-chips-bar]
[Table: header --size-row-header | rows --size-row]

Table row detail
----------------
[Checkbox (sticky)] [Thumb: --thumb-regular] [Product info (title, code, brand)] [Stock] [Price] [Status badge] [Created] [Actions]

Responsive behavior
-------------------
- On narrow viewports: left LNB collapses, table becomes stacked card-like rows (thumbnail above product info). Controls maintain token-based heights and spacing.

Interactions
------------
- Row click navigates to Product Detail (except when clicking an interactive control inside row).
- Checkbox selection supports page-select and multi-select states; there's a sticky header checkbox for select all.
- Batch actions appear when one or more items selected.

Examples for designers
----------------------
- Use 24-grid to place filter fields: 8/8/8 for first row (period / category / supplier). Second row 6/6/6/6 for designer/registrant/policy/toggle.
- Place the main export and batch-edit buttons in the toolbar's right side using --space-inline spacing.

Content states
--------------
- Loading: large placeholder with skeleton rows using row height --size-row.
- Empty: centered card with action buttons (new product, import).

Accessibility
-------------
- Table headers use `<th>`, checkboxes have `aria-label`. Sticky header must remain keyboard reachable.

Notes for handoff
-----------------
- Provide product name truncation rules (e.g., 2 lines, ellipsis) and tooltip on hover to show full name.
- Provide avatar rules for thumbnails: focal point centered, fallback icon when no image.
