Modal Guidelines (S / M / L)
=============================

Purpose
-------
Guidelines for modal usage, sizes and internal layout. Modal dimensions are intentionally preserved in pixels to make visual alignment and handoff precise.

Common rules
------------
- Overlay: `rgba(0,0,0,0.4)` full-screen.
- Header height: 56px. Footer height: 56px.
- Body padding: top 24px, left/right 24px, bottom 16px. Body area scrolls independently if content is tall.
- Corner radius: 12px.
- Internal grid: 12 columns inside modal with 16px gutter.
- Close button size: 32x32 (touch target 40x40).
- Title font size: 20–22px suggested.
- Footer: buttons aligned right, gap 8px.

Sizes
-----
- Small (S): width 480px, max-height 70vh. Use for confirmations and short forms.
- Medium (M): width 720px, max-height 80vh. Use for typical forms and selection dialogs.
- Large (L): width 1024px (or up to 90vw on small screens), max-height 80–90vh. Use for bulk actions, preview, or embedded tables.
- L+ (optional): 1200–1280px for large-screen previews by team decision.

Focus & Keyboard
----------------
- When modal opens: focus first actionable control. Save previously focused element to return focus on close.
- Tab cycles inside modal (focus trap). ESC closes modal (unless disabled).

Content Hints
-------------
- For long forms: split into sections using sub-headers and keep consistent spacing tokens within modal.
- For large tables inside modals: provide fixed header and internal table scroll area.

Accessibility
-------------
- `role="dialog"` + `aria-modal="true"` and `aria-labelledby`/`aria-describedby` set.
- Provide visible focus styles for keyboard users.

Examples
--------
- Confirm Delete: S modal with text body and two buttons (Cancel | Delete-danger).
- Bulk Upload: L modal with file upload area, preview table, and send button in footer.
