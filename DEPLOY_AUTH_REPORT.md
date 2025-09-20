Deployment Auth Report

- Date: 2025-09-15
- Deployment: https://react-oms-wireframe.vercel.app

Actions performed:
- Patched NextAuth authorize() to trim and case-normalize `ADMIN_EMAIL` and `ADMIN_PASSWORD`, and log when env-admin fallback is used.
  - Files: `src/server/api/auth/[...nextauth].ts`, `pages/api/auth/[...nextauth].ts`
- Seeded/updated admin user in Supabase via service-role REST API.
  - Scripts used/added: `scripts/update-admin-pass.js` (created), `scripts/create-sb-user.js` (existing)
  - Updated `admin@example.com` password to `admin-pass-123` (bcrypt hash stored).
- Performed E2E login against deployed app:
  - Obtained CSRF token from `/api/auth/csrf` and POSTed credentials to `/api/auth/callback/credentials`.
  - Observed `302` redirect and session cookie set.
  - Fetched `/api/auth/session` and confirmed:
    {
      "user": { "name": "Dev Admin", "email": "admin@example.com", "role": "admin" },
      "expires": "..."
    }

Recommendations / Next steps:
- Remove or protect `scripts/update-admin-pass.js` after use (it requires service-role key).
- Rotate `SUPABASE_SERVICE_ROLE_KEY` if it was used in an untrusted environment.
- Optionally set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in Vercel for quick bootstrapping without DB writes.
- Add structured logging for NextAuth signin failures in production to ease future debugging.

If you want, I can remove the update script and create a PR with these changes.
