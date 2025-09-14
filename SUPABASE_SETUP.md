# Supabase (Postgres) Quick Setup

This guide shows how to create a free Supabase Postgres database and connect it to this app.

1. Sign up / Sign in to Supabase: https://supabase.com/
2. Create a new project (Free tier is sufficient for development).
   - Choose a name and a strong password.
3. After the project is created, go to `Settings -> Database` and copy the `Connection string (URI)`.
   - This will be a `postgres://...` URL.
4. In your Vercel project, add a new Environment Variable named `DATABASE_URL` with the connection string value.
   - For local development, create a `.env.local` with:
     ```
     DATABASE_URL=postgres://user:pass@dbhost:5432/dbname
     SQLITE_DB_PATH=./data/app.db
     PGSSLMODE=require
     ```
5. Initialize Prisma or your migration tool locally to create tables.
   - If using Prisma, run `npx prisma migrate deploy` (or `npx prisma migrate dev` during development).
6. Deploy to Vercel. The app will read `process.env.DATABASE_URL` and use the Postgres DB.

Notes:
- Supabase provides a web SQL editor and table browser for convenience.
- Set proper role/permissions and rotate keys for production.
- Monitor usage on the Supabase dashboard to avoid hitting free-tier limits.
