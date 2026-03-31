#!/usr/bin/env bash
#
# 05-health-check.sh — Verify all services are running and accessible
#
# Usage: bash 05-health-check.sh
#

set -euo pipefail

PROJECT_DIR="$HOME/bkb-app"
PASS=0
FAIL=0
WARN=0

green()  { echo -e "\e[32m$1\e[0m"; }
red()    { echo -e "\e[31m$1\e[0m"; }
yellow() { echo -e "\e[33m$1\e[0m"; }

check() {
  local label="$1"
  local result="$2"
  if [ "$result" = "pass" ]; then
    green "  [PASS] $label"
    ((PASS++))
  elif [ "$result" = "warn" ]; then
    yellow "  [WARN] $label"
    ((WARN++))
  else
    red "  [FAIL] $label"
    ((FAIL++))
  fi
}

echo "========================================="
echo " BKB Community — Health Check"
echo "========================================="
echo ""

# --- Load nvm ---
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# --- 1. Docker ---
echo "Docker:"
if docker info &>/dev/null; then
  check "Docker daemon running" "pass"
  CONTAINERS=$(docker ps --format '{{.Names}}' | grep -c supabase || true)
  if [ "$CONTAINERS" -ge 5 ]; then
    check "Supabase containers running ($CONTAINERS)" "pass"
  else
    check "Supabase containers running ($CONTAINERS — expected 5+)" "fail"
  fi
else
  check "Docker daemon running" "fail"
fi

# --- 2. Supabase API ---
echo ""
echo "Supabase API:"

ANON_KEY=$(grep 'SUPABASE_ANON_KEY' "$PROJECT_DIR/app/src/lib/supabase.ts" 2>/dev/null | grep -oP '"\K[^"]+' || echo "")

if [ -z "$ANON_KEY" ]; then
  check "Anon key found in supabase.ts" "fail"
else
  check "Anon key found in supabase.ts" "pass"

  # Local API
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "http://127.0.0.1:54321/rest/v1/" \
    -H "apikey: $ANON_KEY" \
    --max-time 5 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "200" ]; then
    check "API responding locally (127.0.0.1:54321)" "pass"
  else
    check "API responding locally (HTTP $HTTP_CODE)" "fail"
  fi

  # External API
  SERVER_IP=$(hostname -I | awk '{print $1}')
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "http://$SERVER_IP:54321/rest/v1/" \
    -H "apikey: $ANON_KEY" \
    --max-time 5 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "200" ]; then
    check "API responding externally ($SERVER_IP:54321)" "pass"
  else
    check "API responding externally ($SERVER_IP:54321 — HTTP $HTTP_CODE)" "warn"
    echo "         Run 03-configure-network.sh to fix this."
  fi
fi

# --- 3. Auth service ---
echo ""
echo "Auth Service:"

AUTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  "http://127.0.0.1:54321/auth/v1/health" \
  -H "apikey: $ANON_KEY" \
  --max-time 5 2>/dev/null || echo "000")

if [ "$AUTH_CODE" = "200" ]; then
  check "Auth service healthy" "pass"
else
  check "Auth service (HTTP $AUTH_CODE)" "fail"
fi

# --- 4. Database ---
echo ""
echo "Database:"

DB_CONTAINER=$(docker ps --filter "name=supabase_db" -q 2>/dev/null)
if [ -n "$DB_CONTAINER" ]; then
  check "Database container running" "pass"

  # Check tables
  TABLE_COUNT=$(docker exec "$DB_CONTAINER" \
    psql -U postgres -d postgres -t -c \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" \
    2>/dev/null | tr -d ' ')

  if [ "$TABLE_COUNT" -ge 7 ]; then
    check "Database tables present ($TABLE_COUNT tables)" "pass"
  else
    check "Database tables present ($TABLE_COUNT — expected 7+)" "fail"
    echo "         Run: supabase db reset"
  fi

  # Check test users
  USER_COUNT=$(docker exec "$DB_CONTAINER" \
    psql -U postgres -d postgres -t -c \
    "SELECT count(*) FROM auth.users;" \
    2>/dev/null | tr -d ' ')

  if [ "$USER_COUNT" -ge 5 ]; then
    check "Test users seeded ($USER_COUNT users)" "pass"
  else
    check "Test users seeded ($USER_COUNT — expected 5)" "warn"
    echo "         Run: supabase db reset"
  fi
else
  check "Database container running" "fail"
fi

# --- 5. Studio ---
echo ""
echo "Supabase Studio:"

STUDIO_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  "http://127.0.0.1:54323" \
  --max-time 5 2>/dev/null || echo "000")

if [ "$STUDIO_CODE" = "200" ] || [ "$STUDIO_CODE" = "302" ]; then
  check "Studio accessible (127.0.0.1:54323)" "pass"
else
  check "Studio accessible (HTTP $STUDIO_CODE)" "warn"
fi

# --- 6. App config ---
echo ""
echo "App Configuration:"

SUPABASE_FILE="$PROJECT_DIR/app/src/lib/supabase.ts"
if [ -f "$SUPABASE_FILE" ]; then
  CONFIGURED_IP=$(grep 'const LOCAL_IP' "$SUPABASE_FILE" | grep -oP '"\K[^"]+')
  SERVER_IP=$(hostname -I | awk '{print $1}')

  if [ "$CONFIGURED_IP" = "$SERVER_IP" ]; then
    check "LOCAL_IP matches server ($SERVER_IP)" "pass"
  else
    check "LOCAL_IP ($CONFIGURED_IP) != server IP ($SERVER_IP)" "warn"
    echo "         Update LOCAL_IP in app/src/lib/supabase.ts"
  fi
else
  check "supabase.ts found" "fail"
fi

# --- 7. Expo ---
echo ""
echo "Expo Dev Server:"

if lsof -ti:8081 &>/dev/null; then
  check "Expo running on port 8081" "pass"
else
  check "Expo not running on port 8081" "warn"
  echo "         Run: bash 04-start-expo.sh"
fi

# --- 8. Disk & Memory ---
echo ""
echo "System Resources:"

DISK_AVAIL=$(df -BG / | tail -1 | awk '{print $4}' | tr -d 'G')
if [ "$DISK_AVAIL" -ge 5 ]; then
  check "Disk space: ${DISK_AVAIL}GB available" "pass"
else
  check "Disk space: ${DISK_AVAIL}GB available (low!)" "warn"
fi

MEM_AVAIL=$(free -m | awk '/Mem:/{print $7}')
if [ "$MEM_AVAIL" -ge 1024 ]; then
  check "Memory: ${MEM_AVAIL}MB available" "pass"
else
  check "Memory: ${MEM_AVAIL}MB available (low!)" "warn"
fi

# --- Summary ---
echo ""
echo "========================================="
echo " Results: $(green "$PASS passed"), $(red "$FAIL failed"), $(yellow "$WARN warnings")"
echo "========================================="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
