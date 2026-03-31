#!/usr/bin/env bash
#
# 01-install-deps.sh — Install Docker, Node.js, Supabase CLI, and Expo CLI on Ubuntu
#
# Usage: sudo bash 01-install-deps.sh
#

set -euo pipefail

echo "========================================="
echo " BKB Community — Install Dependencies"
echo "========================================="

# --- Check Ubuntu ---
if ! grep -qi "ubuntu" /etc/os-release 2>/dev/null; then
  echo "WARNING: This script is designed for Ubuntu. Proceed at your own risk."
fi

# --- Docker ---
echo ""
echo "[1/4] Installing Docker..."
if command -v docker &>/dev/null; then
  echo "  Docker already installed: $(docker --version)"
else
  curl -fsSL https://get.docker.com | sh
  echo "  Docker installed: $(docker --version)"
fi

# Add current user to docker group
REAL_USER="${SUDO_USER:-$USER}"
if ! groups "$REAL_USER" | grep -q docker; then
  usermod -aG docker "$REAL_USER"
  echo "  Added $REAL_USER to docker group (re-login required)"
fi

# Ensure Docker is running
systemctl enable docker
systemctl start docker
echo "  Docker service is running."

# --- Docker Compose ---
echo ""
echo "[2/4] Checking Docker Compose..."
if docker compose version &>/dev/null; then
  echo "  Docker Compose available: $(docker compose version --short)"
else
  echo "  ERROR: Docker Compose plugin not found. Install it:"
  echo "    sudo apt install docker-compose-plugin"
  exit 1
fi

# --- Node.js via nvm ---
echo ""
echo "[3/4] Installing Node.js 18 via nvm..."
export NVM_DIR="/home/$REAL_USER/.nvm"

if [ -s "$NVM_DIR/nvm.sh" ]; then
  echo "  nvm already installed."
else
  sudo -u "$REAL_USER" bash -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash'
fi

# Load nvm and install node
sudo -u "$REAL_USER" bash -c "
  export NVM_DIR=\"$NVM_DIR\"
  [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"
  nvm install 18
  nvm alias default 18
  echo \"  Node.js: \$(node --version)\"
  echo \"  npm:     \$(npm --version)\"
"

# --- Supabase CLI + Expo CLI ---
echo ""
echo "[4/4] Installing Supabase CLI and Expo CLI..."
sudo -u "$REAL_USER" bash -c "
  export NVM_DIR=\"$NVM_DIR\"
  [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"
  npm install -g supabase expo-cli
  echo \"  Supabase CLI: \$(supabase --version 2>/dev/null || echo 'installed')\"
"

echo ""
echo "========================================="
echo " Dependencies installed successfully!"
echo "========================================="
echo ""
echo "IMPORTANT: Log out and back in (or run 'newgrp docker')"
echo "           so Docker works without sudo."
echo ""
echo "Next: Run 02-setup-supabase.sh"
