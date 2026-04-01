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

# --- Load nvm (installed to /opt/nvm by 01-install-deps.sh) ---
export NVM_DIR="/opt/nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  nvm use 20 --silent 2>/dev/null || true
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  . "$NVM_DIR/nvm.sh"
  nvm use 20 --silent 2>/dev/null || true
fi

# --- Verify Node.js >= 20 (required by React Native 0.81+ and metro) ---
NODE_MAJOR=$(node --version 2>/dev/null | sed 's/v\([0-9]*\).*/\1/')
if [ -z "$NODE_MAJOR" ]; then
  echo "ERROR: Node.js is not installed. Run 01-install-deps.sh first."
  exit 1
elif [ "$NODE_MAJOR" -lt 20 ]; then
  echo "ERROR: Node.js $(node --version) is too old. Need >= 20."
  echo "  Run: source /opt/nvm/nvm.sh && nvm install 20 && nvm alias default 20"
  exit 1
fi
echo "  Node.js: $(node --version)"

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
