#!/usr/bin/env bash
# Usage: ./scripts/bootstrap-admin.sh email password role [setup_secret]
set -euo pipefail
EMAIL=${1:-}
PASSWORD=${2:-}
ROLE=${3:-admin}
SETUP_SECRET=${4:-${ADMIN_SETUP_SECRET:-}}
if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "Usage: $0 email password [role] [setup_secret]"
  exit 2
fi
if [ -z "$SETUP_SECRET" ]; then
  echo "ADMIN_SETUP_SECRET not provided (either pass as 4th arg or set ADMIN_SETUP_SECRET env var)"
  exit 3
fi
curl -sS -X POST http://localhost:3000/api/admin/create-initial-admin \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"role\":\"$ROLE\",\"setup_secret\":\"$SETUP_SECRET\"}" | jq
