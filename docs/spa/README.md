# SPA Viewer (docs/spa)

This folder contains a self-contained static SPA viewer for the FDD pages. It is intended to be served as static files (e.g., GitHub Pages, Netlify, or a simple static server).

Quick start (requires Node.js):

```bash
# serve from repository root
npx http-server docs/spa -p 8001
# then open http://localhost:8001
```

Notes:
- All pages are under `docs/spa/pages/` and the SPA shell is `docs/spa/index.html`.
- Language toggle persists to `localStorage` (`fdd_locale`).
- Accessibility: skip link, keyboard navigation and reduced-motion support included.

To deploy to GitHub Pages, you can use the `deploy:docs` script in the repository root `package.json` (it publishes the entire `docs` folder).
