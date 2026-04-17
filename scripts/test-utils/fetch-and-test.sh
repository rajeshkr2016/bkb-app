#!/usr/bin/env bash
# Fetches bkb-app endpoints and verifies their responses.
# Intended to run under cron or launchd. Exits non-zero on any failure.
#
# Usage:
#   ./fetch-and-test.sh                       # run all checks
#   SUPABASE_URL=... SUPABASE_ANON_KEY=... ./fetch-and-test.sh
#
# Scheduling examples:
#   cron (every 15 min):
#     */15 * * * * /Users/rradhakrishnan/projects/bkb-app/scripts/test-utils/fetch-and-test.sh
#   launchd: see com.bkb.fetchtest.plist in this directory.
#
# Requires: curl, jq

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${LOG_DIR:-$SCRIPT_DIR/logs}"
LOG_FILE="$LOG_DIR/fetch-and-test.log"
mkdir -p "$LOG_DIR"

# Load env from repo .env.local if present (doesn't override existing env).
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
if [[ -f "$REPO_ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$REPO_ROOT/.env.local"
  set +a
fi

SUPABASE_URL="${SUPABASE_URL:-${EXPO_PUBLIC_SUPABASE_URL:-https://ywleqlcyxtalbxejniov.supabase.co}}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-${EXPO_PUBLIC_SUPABASE_ANON_KEY:-}}"

fail_count=0
run_count=0

log() {
  printf '[%s] %s\n' "$(TZ='America/Los_Angeles' date +'%Y-%m-%dT%H:%M:%S%z')" "$*" | tee -a "$LOG_FILE"
}

# Args: name, url, jq_check (a jq filter that must print "true")
check_endpoint() {
  local name="$1" url="$2" jq_check="$3"
  run_count=$((run_count + 1))

  local start_ms end_ms elapsed_ms http_code body tmp
  tmp="$(mktemp)"
  start_ms=$(python3 -c 'import time;print(int(time.time()*1000))')

  http_code=$(curl -sS -o "$tmp" -w '%{http_code}' \
    --max-time 30 \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    "$url" || echo "000")

  end_ms=$(python3 -c 'import time;print(int(time.time()*1000))')
  elapsed_ms=$((end_ms - start_ms))
  body="$(cat "$tmp")"
  rm -f "$tmp"

  if [[ "$http_code" != "200" ]]; then
    log "FAIL $name url=$url http=$http_code ${elapsed_ms}ms body=${body:0:200}"
    fail_count=$((fail_count + 1))
    return
  fi

  if ! echo "$body" | jq -e . >/dev/null 2>&1; then
    log "FAIL $name url=$url invalid-json ${elapsed_ms}ms body=${body:0:200}"
    fail_count=$((fail_count + 1))
    return
  fi

  local verdict
  verdict=$(echo "$body" | jq -r "$jq_check" 2>/dev/null || echo "false")
  if [[ "$verdict" != "true" ]]; then
    log "FAIL $name url=$url check-failed ${elapsed_ms}ms body=${body:0:200}"
    fail_count=$((fail_count + 1))
    return
  fi

  local summary
  summary=$(echo "$body" | jq -r '"events=\(.events|length) group=\(.group.name // "none")"' 2>/dev/null || echo "")
  log "PASS $name url=$url ${elapsed_ms}ms $summary"
}

# Args: name, url, required_substring (optional, "" to skip)
check_html_endpoint() {
  local name="$1" url="$2" needle="$3"
  run_count=$((run_count + 1))

  local start_ms end_ms elapsed_ms http_code size tmp
  tmp="$(mktemp)"
  start_ms=$(python3 -c 'import time;print(int(time.time()*1000))')

  http_code=$(curl -sSL -o "$tmp" -w '%{http_code}' \
    --max-time 30 \
    -A "bkb-fetchtest/1.0" \
    "$url" || echo "000")

  end_ms=$(python3 -c 'import time;print(int(time.time()*1000))')
  elapsed_ms=$((end_ms - start_ms))
  size=$(wc -c < "$tmp" | tr -d ' ')

  if [[ "$http_code" != "200" ]]; then
    log "FAIL $name http=$http_code ${elapsed_ms}ms size=$size"
    rm -f "$tmp"
    fail_count=$((fail_count + 1))
    return
  fi

  if [[ "$size" -lt 100 ]]; then
    log "FAIL $name url=$url body-too-small ${elapsed_ms}ms size=$size"
    rm -f "$tmp"
    fail_count=$((fail_count + 1))
    return
  fi

  if [[ -n "$needle" ]] && ! grep -q -- "$needle" "$tmp"; then
    log "FAIL $name url=$url missing-substring=\"$needle\" ${elapsed_ms}ms size=$size"
    rm -f "$tmp"
    fail_count=$((fail_count + 1))
    return
  fi

  rm -f "$tmp"
  log "PASS $name url=$url ${elapsed_ms}ms size=$size"
}

log "=== run start url=$SUPABASE_URL ==="

check_endpoint \
  "meetup-events" \
  "$SUPABASE_URL/functions/v1/meetup-events" \
  '(.error // null) == null and (.events | type) == "array"'

check_html_endpoint \
  "github-pages" \
  "https://rajeshkr2016.github.io/bkb-app/" \
  "expo-reset"

log "=== run end ok=$((run_count - fail_count))/$run_count ==="

exit $(( fail_count > 0 ? 1 : 0 ))
