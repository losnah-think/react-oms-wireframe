Deploying the react-oms-wireframe

1) Create a GitHub repository and push your code to `main`:

   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:<your-org>/<your-repo>.git
   git push -u origin main

2) Configure GitHub Actions secrets (Settings → Secrets)
   - `NEXTAUTH_URL` (e.g. https://your-site.vercel.app)
   - `DATABASE_URL` (Supabase DB URL if used)
   - `SUPABASE_SERVICE_ROLE_KEY` (if import/export needs it)
   - Optional: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` for automatic Vercel deploy

3) The workflow `.github/workflows/deploy.yml` will:
   - Install dependencies
   - Build the Next.js app
   - Run Playwright E2E tests
   - Deploy to Vercel when Vercel secrets are present

4) Manual Vercel setup:
   - Create a Vercel project and connect it to your GitHub repo
   - Set required Environment Variables in Vercel (same as GitHub secrets)
   - Push to `main` to trigger a deployment

5) Notes:
   - The CI expects Node 22 and uses `npm ci` for reproducible installs.
   - If your app uses direct DB connections blocked by network rules, prefer using Supabase service role and REST APIs for server-side operations.
