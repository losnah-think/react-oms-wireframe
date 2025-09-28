Header / Global Search Band
===========================

Purpose
-------
Global entry for search, quick actions and user account access. Visible on all pages and provides keyboard shortcut focus to the search box.

Tokens used
-----------
- --size-header
- --size-control-md
- --search-max-w
- --space-inline
- --icon-md

Layout description
------------------
- Left: Logo area (not emphasized), padding --space-2
- Middle: Search band (dominant element). Search input height --size-control-md, width up to --search-max-w.
- Right: Quick actions (help, notifications, user menu) grouped with --space-inline

Keyboard
--------
- `⌘/Ctrl+K` or `/` focuses the search input
- Escape clears suggestions / blurs search

Accessibility
-------------
- Input has `aria-label` and `role="combobox"` if suggestions exist
- Icons use `aria-hidden` when decorative

ASCII wireframe (tokens in brackets)
------------------------------------
[--size-header]
[Logo]  [  Search input (width: up to --search-max-w)  ]  [ Help ] [ Bell ] [User]

Interaction notes
-----------------
- Typing shows suggestion list anchored to the input (panel width matches input, max height --suggest-max-h)
- Enter triggers search. Suggestions navigable with Up/Down keys.
