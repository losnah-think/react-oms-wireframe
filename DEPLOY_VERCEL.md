# Deploying this repo to Vercel

This project is a Next.js app. Below are step-by-step instructions to create a deploy on Vercel from the current codebase, including required environment variables and optional CLI commands to create a branch and deploy.

## Required environment variables
For a production-like deploy you should set these in the Vercel project settings (Environment Variables):

- `DATABASE_URL` — Postgres connection string (used by Prisma/pg). If you use Supabase, set the Supabase `postgres` connection string here.
- `SUPABASE_URL` — (optional) Supabase base URL used by fallback scripts and some APIs.
- `SUPABASE_SERVICE_ROLE_KEY` — (optional) Supabase service role key for REST access (keep secret).
- `NEXTAUTH_URL` — base URL of the Vercel deployment (e.g. `https://your-app.vercel.app`).
- Any integration secrets referenced in your `.env` (e.g. `CAFE24_CLIENT_ID`, `CAFE24_CLIENT_SECRET`, etc.)

Notes:
- If you don't want to connect to a database and only need a static/test deploy, you can set `NEXT_PUBLIC_DEV_NO_AUTH=1` in Vercel (not recommended for production). Some server APIs will still error if `DATABASE_URL` is missing.
- Keep secret keys in Vercel's Environment Variables (do NOT commit them).

## Vercel project setup (GitHub/GitLab/Bitbucket)
1. Push your code to a Git provider (GitHub recommended).
2. In Vercel dashboard, create a new Project → Import Repository → select this repo.
3. During setup, Vercel will detect Next.js. Default build command: `npm run build` and output directory: (leave default).
4. Add the environment variables listed above in the Vercel project settings (Production and Preview as needed).
5. Deploy. Vercel will create a Production deployment for the default branch and Preview deployments for PRs/branches.

## Quick CLI flow (optional)
Install the Vercel CLI if you prefer to deploy from the terminal:

```bash
npm i -g vercel
# or
# yarn global add vercel
```

Create a deployment branch and push it (example commands):

```bash
# create a branch from main
git checkout -b deploy/vercel-snapshot-$(date +%Y%m%d)
git add -A
git commit -m "chore: snapshot for vercel deploy"
git push origin HEAD
```

Deploy with Vercel CLI (will prompt to link to project if not linked):

```bash
vercel --prod
```

Or create a preview deploy (no `--prod`):

```bash
vercel
```

Notes:
- The first time you run `vercel` you may need to `vercel login` and `vercel link` to connect the local repo to a Vercel project.
- CLI deploys still require the same environment variables to be configured in the Vercel project (or you can set them for the session using `vercel env add`).

## Post-deploy steps
- If you use Prisma, run migrations on the DB used by `DATABASE_URL`:

```bash
# after deployment, connect to your production DB and run migrations (locally or CI)
npx prisma migrate deploy
```

- Seed demo data if needed (see `scripts/` directory). Use `SUPABASE_*` envs for Supabase-based seeding scripts.

## Caveats & security reminders
- This repo contains code paths that expect a Postgres DB or Supabase; production deploy without `DATABASE_URL` will cause runtime errors on endpoints that query the DB.
- Do not expose service role keys or secrets publicly. Rotate keys if they were accidentally committed.

If you want, I can: create a Git branch for a deploy snapshot and push it, or run the `vercel` CLI commands for you (I'll need your confirmation and appropriate credentials/token). Tell me which option you prefer.
