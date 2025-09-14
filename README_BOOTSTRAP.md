Bootstrap admin setup

For security the developer bootstrap admin endpoint is protected by an environment secret.

- Set `ADMIN_SETUP_SECRET` in your `.env.local` (a strong random string).
- To create an initial admin, POST to `/api/admin/create-initial-admin` with JSON body:
  {
    "email": "admin@example.com",
    "password": "strongpassword",
    "role": "admin",
    "setup_secret": "<your ADMIN_SETUP_SECRET>"
  }

Example using curl:

```bash
curl -X POST http://localhost:3000/api/admin/create-initial-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"pw","role":"admin","setup_secret":"mysecret"}'
```

If `ADMIN_SETUP_SECRET` is not configured the endpoint will be disabled and return 500.

Quick scripts

 - `scripts/bootstrap-admin.sh` — helper to post to `/api/admin/create-initial-admin`. Usage:

```bash
ADMIN_SETUP_SECRET=yoursecret ./scripts/bootstrap-admin.sh admin@example.com strongpassword admin
```

 - `scripts/e2e-login.sh` — performs CSRF fetch + JSON credentials login and saves cookies to `/tmp/react-oms-e2e-cookies.txt` for quick testing:

```bash
./scripts/e2e-login.sh test+e2e@example.com password123
```

Make sure the app is running on `http://localhost:3000` when using these scripts.
