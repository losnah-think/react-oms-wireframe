Batch import helper

Usage

- Convert your marketplace dump (JSON array) to NDJSON or let the script convert a JSON array.
- Run the helper script with Supabase env vars in your shell:

```bash
export SUPABASE_URL='https://your-project.supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='your_service_role_key'
./scripts/run-batch-import.sh /path/to/large.json 500 4
```

What it does
- Converts JSON array to NDJSON (if necessary).
- Splits the NDJSON into chunk files (default 500 lines each).
- Runs `scripts/supabase-upsert.js` for each chunk in parallel (default concurrency 4).
- Collects `import-report.json` from each chunk and writes `combined-report.json`.

Safety tips
- Test with a small sample chunk first (`--write` flag) before running entire dump.
- Ensure `sql/002-add-external-sku.sql` has been applied to your Supabase DB.
- Consider running with lower concurrency if you hit rate limits.
- Backup your DB or run on a staging project first.
