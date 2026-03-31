#!/usr/bin/env bash
#
# 02-setup-supabase.sh — Clone repo, start Supabase, apply migrations & seed data
#
# Usage: bash 02-setup-supabase.sh [repo-url]
#
# If repo-url is not provided, assumes the project is already at ~/bkb-app
#

set -euo pipefail

REPO_URL="${1:-}"
PROJECT_DIR="$HOME/bkb-app"

echo "========================================="
echo " BKB Community — Setup Supabase Backend"
echo "========================================="

# --- Load nvm ---
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# --- Verify prerequisites ---
echo ""
echo "[1/5] Checking prerequisites..."

for cmd in docker node npm supabase; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "  ERROR: $cmd not found. Run 01-install-deps.sh first."
    exit 1
  fi
done

if ! docker info &>/dev/null; then
  echo "  ERROR: Docker is not running or current user lacks permissions."
  echo "  Try: sudo systemctl start docker && newgrp docker"
  exit 1
fi

echo "  Docker:   $(docker --version | awk '{print $3}')"
echo "  Node.js:  $(node --version)"
echo "  Supabase: $(supabase --version 2>/dev/null || echo 'OK')"

# --- Clone or verify repo ---
echo ""
echo "[2/5] Setting up project..."

if [ -n "$REPO_URL" ]; then
  if [ -d "$PROJECT_DIR" ]; then
    echo "  $PROJECT_DIR already exists. Pulling latest..."
    cd "$PROJECT_DIR"
    git pull
  else
    echo "  Cloning $REPO_URL..."
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
  fi
else
  if [ -d "$PROJECT_DIR" ]; then
    echo "  Using existing project at $PROJECT_DIR"
    cd "$PROJECT_DIR"
  else
    echo "  ERROR: $PROJECT_DIR not found. Provide a repo URL:"
    echo "    bash 02-setup-supabase.sh https://github.com/user/bkb-app.git"
    exit 1
  fi
fi

# --- Install app dependencies ---
echo ""
echo "[3/5] Installing app dependencies..."
cd "$PROJECT_DIR/app"
npm install
cd "$PROJECT_DIR"

# --- Start Supabase ---
echo ""
echo "[4/5] Starting Supabase..."

if supabase status &>/dev/null; then
  echo "  Supabase is already running."
else
  supabase start
fi

echo ""
supabase status

# --- Apply migrations and seed data ---
echo ""
echo "[5/5] Applying migrations and seed data..."
supabase db reset

echo ""
echo "========================================="
echo " Supabase backend is ready!"
echo "========================================="
echo ""
echo "Services:"
echo "  API:     http://127.0.0.1:54321"
echo "  Studio:  http://127.0.0.1:54323"
echo "  DB:      postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo ""
echo "Next: Run 03-configure-network.sh to allow external connections."
