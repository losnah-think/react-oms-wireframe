Product Detail — Wireframe
==========================

Purpose
-------
Detailed editor and viewer for single product, including variants, inventory, shipping settings and interchanges with external malls.

Tokens used
-----------
- --space-gutter-desktop
- --space-1/2/3/4
- --pad-card-md
- --size-control-md / --size-control-sm
- --thumb-regular
- --pad-cell-x

High-level layout
-----------------
- Header (global search band remains visible)
- Main area split: content column + right-side meta/quick actions (or second column for large screens)
- Sections stacked vertically: Basic info, Options/Variants (expandable), Images, Inventory, Shipping/Policies, Activity/History

Wireframe (tokens)
-------------------
[LNB] [Main column width: spans e.g. 16col] [Right meta column: spans e.g. 8col]

Header
[ Product title row (name, sku, action buttons) ]

Sections (as Card components)
- Basic info card: --pad-card-md
- Image gallery card: thumbnails --thumb-regular
- Variants: collapsible rows (variant rows similar to product list compact)
- Inventory table: small controls --size-control-sm

Interactions
------------
- Save actions appear as sticky footer actions on edit mode.
- Variant click opens inline editor or navigates to option detail.
- Image upload uses drag & drop with preview thumbnails.

Accessibility
-------------
- Inline editors must keep focus context; modal/popover editors trap focus and return focus after close.

Handoff details
---------------
- Provide exact truncation and wrapping rules for description fields.
- Provide variant id generation rules (client-side only), and guidance on how to display fallback values while saving.
