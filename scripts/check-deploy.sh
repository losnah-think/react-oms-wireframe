#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DEPLOY_URL:-}" ]; then
  echo "Set DEPLOY_URL env var to the deployed site (e.g. https://react-oms-wireframe.vercel.app)"
  exit 1
fi

if [ -z "${DB_TEST_SECRET:-}" ]; then
  echo "Set DB_TEST_SECRET env var for db-test header"
  exit 1
fi

echo "Checking db-test..."
curl -sS -H "x-db-test-secret: $DB_TEST_SECRET" "$DEPLOY_URL/api/db-test" | jq -C '.'

echo "Checking connected-shops..."
curl -sS "$DEPLOY_URL/api/integrations/connected-shops" | jq -C '.'

echo "Done"
