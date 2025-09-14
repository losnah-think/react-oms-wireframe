#!/usr/bin/env bash
# Usage: ./scripts/e2e-login.sh email password
set -euo pipefail
EMAIL=${1:-}
PASSWORD=${2:-}
COOKIE_JAR=/tmp/react-oms-e2e-cookies.txt
if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "Usage: $0 email password"
  exit 2
fi
# get csrf
CSRF_JSON=$(curl -s -c $COOKIE_JAR http://localhost:3000/api/auth/csrf)
CSRF_TOKEN=$(echo "$CSRF_JSON" | jq -r .csrfToken)
if [ -z "$CSRF_TOKEN" ] || [ "$CSRF_TOKEN" == "null" ]; then
  echo "Failed to obtain CSRF token"
  exit 3
fi
# login via credentials JSON flow
RESP=$(curl -s -b $COOKIE_JAR -c $COOKIE_JAR -X POST -H "Content-Type: application/json" \
  -d "{\"csrfToken\":\"$CSRF_TOKEN\",\"json\":true,\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  http://localhost:3000/api/auth/callback/credentials)
echo "$RESP" | jq
if echo "$RESP" | jq -e .url >/dev/null 2>&1; then
  echo "Login seems successful. Session cookie stored in $COOKIE_JAR"
else
  echo "Login response did not contain url; check response above."
fi
