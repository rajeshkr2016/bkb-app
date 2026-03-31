#!/usr/bin/env bash
#
# 06-stop-all.sh — Stop Supabase and Expo dev server
#
# Usage: bash 06-stop-all.sh
#

set -euo pipefail

PROJECT_DIR="$HOME/bkb-app"

echo "========================================="
echo " BKB Community — Stop All Services"
echo "========================================="

# --- Stop Expo ---
echo ""
echo "[1/2] Stopping Expo dev server..."
if lsof -ti:8081 &>/dev/null; then
  lsof -ti:8081 | xargs kill -9 2>/dev/null || true
  echo "  Expo stopped."
else
  echo "  Expo was not running."
fi

# --- Stop Supabase ---
echo ""
echo "[2/2] Stopping Supabase..."
cd "$PROJECT_DIR"

if supabase status &>/dev/null; then
  supabase stop
  echo "  Supabase stopped."
else
  echo "  Supabase was not running."
fi

echo ""
echo "========================================="
echo " All services stopped."
echo "========================================="
