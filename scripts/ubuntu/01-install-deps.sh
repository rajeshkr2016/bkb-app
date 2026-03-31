#!/usr/bin/env bash
#
# 01-install-deps.sh — Install Docker, Node.js, Supabase CLI, and Expo CLI on Ubuntu
#
# Usage: sudo bash 01-install-deps.sh
#
# Installs everything under /opt:
#   /opt/nvm       — nvm (Node Version Manager)
#   /opt/node      — Node.js 18 (symlinked to /usr/local/bin)
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

REAL_USER="${SUDO_USER:-$USER}"
if ! groups "$REAL_USER" | grep -q docker; then
  usermod -aG docker "$REAL_USER"
  echo "  Added $REAL_USER to docker group (re-login required)"
fi

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

# --- Node.js via nvm in /opt ---
echo ""
echo "[3/4] Installing Node.js 18 via nvm (into /opt/nvm)..."

export NVM_DIR="/opt/nvm"
mkdir -p "$NVM_DIR"

if [ -s "$NVM_DIR/nvm.sh" ]; then
  echo "  nvm already installed at $NVM_DIR"
else
  echo "  Installing nvm to $NVM_DIR..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | NVM_DIR="$NVM_DIR" bash
fi

# Verify nvm installed
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "  ERROR: nvm not found at $NVM_DIR/nvm.sh"
  exit 1
fi

# Install Node.js 18
source "$NVM_DIR/nvm.sh"
nvm install 18
nvm alias default 18

echo "  Node.js: $(node --version)"
echo "  npm:     $(npm --version)"

# Make nvm-installed node/npm available system-wide via /usr/local/bin
NODE_BIN="$(dirname "$(nvm which 18)")"
for bin in node npm npx; do
  ln -sf "$NODE_BIN/$bin" "/usr/local/bin/$bin"
done
echo "  Symlinked node/npm/npx to /usr/local/bin"

# Make nvm available for all users — add to /etc/profile.d
cat > /etc/profile.d/nvm.sh << 'EOF'
export NVM_DIR="/opt/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
EOF
chmod +r /etc/profile.d/nvm.sh
echo "  Added /etc/profile.d/nvm.sh for all users"

# Make /opt/nvm accessible to all users
chmod -R 755 "$NVM_DIR"

# --- Supabase CLI (binary to /opt/supabase) ---
echo ""
echo "[4/5] Installing Supabase CLI (to /opt/supabase)..."

if command -v supabase &>/dev/null; then
  echo "  Supabase CLI already installed: $(supabase --version)"
else
  ARCH=$(dpkg --print-architecture)  # amd64 or arm64

  # Get latest version from the redirect URL of /releases/latest
  LATEST_URL=$(curl -fsSL -o /dev/null -w '%{url_effective}' https://github.com/supabase/cli/releases/latest)
  SUPABASE_VERSION=$(basename "$LATEST_URL" | sed 's/^v//')

  if [ -z "$SUPABASE_VERSION" ] || echo "$SUPABASE_VERSION" | grep -q '/'; then
    SUPABASE_VERSION="2.84.2"
    echo "  Could not detect latest version, using fallback v${SUPABASE_VERSION}"
  fi

  echo "  Installing Supabase CLI v${SUPABASE_VERSION} (${ARCH})..."
  DEB_URL="https://github.com/supabase/cli/releases/download/v${SUPABASE_VERSION}/supabase_${SUPABASE_VERSION}_linux_${ARCH}.deb"
  echo "  URL: $DEB_URL"
  curl -fsSL -o /tmp/supabase.deb "$DEB_URL"
  dpkg -i /tmp/supabase.deb
  rm -f /tmp/supabase.deb
  echo "  Supabase CLI: $(supabase --version)"
fi

# --- Expo CLI ---
echo ""
echo "[5/5] Installing Expo CLI..."

npm install -g expo-cli
echo "  Expo CLI: $(npx expo --version 2>/dev/null || echo 'installed')"

echo ""
echo "========================================="
echo " Dependencies installed successfully!"
echo "========================================="
echo ""
echo "Installed to:"
echo "  nvm:     /opt/nvm"
echo "  node:    $NODE_BIN/node -> /usr/local/bin/node"
echo "  npm:     $NODE_BIN/npm  -> /usr/local/bin/npm"
echo ""
echo "IMPORTANT: Log out and back in (or run 'newgrp docker')"
echo "           so Docker works without sudo."
echo ""
echo "To verify in a new shell:"
echo "  node --version && npm --version && docker --version"
echo ""
echo "Next: Run 02-setup-supabase.sh"
