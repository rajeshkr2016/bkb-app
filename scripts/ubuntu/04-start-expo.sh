#!/usr/bin/env bash
#
# 04-start-expo.sh — Start the Expo dev server
#
# Usage: bash 04-start-expo.sh [--tunnel|--lan|--localhost]
#
# Modes:
#   --tunnel    Accessible from any network (uses Expo tunnel, needs @expo/ngrok)
#   --lan       Accessible on same network (default)
#   --localhost  Local only (web browser testing)
#

set -euo pipefail

MODE="${1:---lan}"
PROJECT_DIR="/opt/projects/bkb-app"

echo "========================================="
echo " BKB Community — Start Expo Dev Server"
echo "========================================="

# --- Load nvm ---
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# --- Verify Supabase is running ---
echo ""
echo "[1/3] Checking Supabase..."
cd "$PROJECT_DIR"

if supabase status &>/dev/null; then
  echo "  Supabase is running."
else
  echo "  Supabase is not running. Starting..."
  supabase start
fi

# --- Update supabase.ts with server IP ---
echo ""
echo "[2/3] Checking app config..."

SERVER_IP=$(hostname -I | awk '{print $1}')
SUPABASE_FILE="$PROJECT_DIR/app/src/lib/supabase.ts"

CURRENT_IP=$(grep 'const LOCAL_IP' "$SUPABASE_FILE" | grep -oP '"\K[^"]+')

if [ "$CURRENT_IP" != "$SERVER_IP" ]; then
  echo "  WARNING: supabase.ts has LOCAL_IP=\"$CURRENT_IP\""
  echo "           Server LAN IP is: $SERVER_IP"
  echo ""
  read -p "  Update LOCAL_IP to $SERVER_IP? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    sed -i "s|const LOCAL_IP = \".*\"|const LOCAL_IP = \"$SERVER_IP\"|" "$SUPABASE_FILE"
    echo "  Updated LOCAL_IP to $SERVER_IP"
  fi
else
  echo "  LOCAL_IP matches server IP: $SERVER_IP"
fi

# --- Kill existing Expo process ---
if lsof -ti:8081 &>/dev/null; then
  echo "  Killing existing process on port 8081..."
  lsof -ti:8081 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# --- Install tunnel dependency if needed ---
if [ "$MODE" = "--tunnel" ]; then
  echo "  Installing @expo/ngrok for tunnel mode..."
  cd "$PROJECT_DIR/app"
  npx expo install @expo/ngrok
fi

# --- Start Expo ---
echo ""
echo "[3/3] Starting Expo dev server ($MODE)..."
echo ""

cd "$PROJECT_DIR/app"

case "$MODE" in
  --tunnel)
    echo "Starting in TUNNEL mode (accessible from any network)."
    echo "Scan the QR code with Expo Go on your phone."
    echo ""
    npx expo start --tunnel
    ;;
  --lan)
    echo "Starting in LAN mode (same network only)."
    echo "Scan the QR code with Expo Go on your phone."
    echo "Make sure your phone is on the same WiFi as this server."
    echo ""
    npx expo start --lan
    ;;
  --localhost)
    echo "Starting in LOCALHOST mode (web browser only)."
    echo "Open http://localhost:8081 in your browser."
    echo ""
    npx expo start --localhost
    ;;
  *)
    echo "Unknown mode: $MODE"
    echo "Usage: bash 04-start-expo.sh [--tunnel|--lan|--localhost]"
    exit 1
    ;;
esac
