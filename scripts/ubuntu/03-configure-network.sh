#!/usr/bin/env bash
#
# 03-configure-network.sh — Open firewall ports and configure Supabase for external access
#
# Usage: sudo bash 03-configure-network.sh
#

set -euo pipefail

echo "========================================="
echo " BKB Community — Configure Network Access"
echo "========================================="

# --- Detect server IP ---
echo ""
echo "[1/3] Detecting server IP addresses..."

LAN_IP=$(hostname -I | awk '{print $1}')
PUBLIC_IP=$(curl -4 -s --max-time 5 ifconfig.me 2>/dev/null || echo "N/A")

echo "  LAN IP:    $LAN_IP"
echo "  Public IP: $PUBLIC_IP"

# --- Open firewall ports ---
echo ""
echo "[2/3] Configuring firewall..."

PORTS=(54321 54323 8081)
PORT_NAMES=("Supabase API" "Supabase Studio" "Expo Dev Server")

if command -v ufw &>/dev/null && ufw status | grep -q "active"; then
  echo "  UFW firewall detected."
  for i in "${!PORTS[@]}"; do
    if ufw status | grep -q "${PORTS[$i]}"; then
      echo "  Port ${PORTS[$i]} (${PORT_NAMES[$i]}) — already open"
    else
      ufw allow "${PORTS[$i]}/tcp" comment "${PORT_NAMES[$i]}"
      echo "  Port ${PORTS[$i]} (${PORT_NAMES[$i]}) — opened"
    fi
  done
  ufw reload
elif command -v iptables &>/dev/null; then
  echo "  Using iptables."
  for i in "${!PORTS[@]}"; do
    iptables -C INPUT -p tcp --dport "${PORTS[$i]}" -j ACCEPT 2>/dev/null || {
      iptables -A INPUT -p tcp --dport "${PORTS[$i]}" -j ACCEPT
      echo "  Port ${PORTS[$i]} (${PORT_NAMES[$i]}) — opened"
    }
  done
else
  echo "  No firewall detected (ufw/iptables). Ports should be accessible."
  echo "  If using a cloud provider, check security groups manually."
fi

# --- Create Docker Compose override for external binding ---
echo ""
echo "[3/3] Binding Supabase API to all interfaces..."

PROJECT_DIR="/opt/projects/bkb-app"

OVERRIDE_FILE="$PROJECT_DIR/supabase/docker-compose.override.yml"

if [ -f "$OVERRIDE_FILE" ]; then
  echo "  Override file already exists: $OVERRIDE_FILE"
  echo "  Skipping. Edit manually if needed."
else
  cat > "$OVERRIDE_FILE" << 'EOF'
# Override to expose Supabase API on all interfaces (0.0.0.0)
# This allows mobile devices on the same network to connect.
services:
  kong:
    ports:
      - "0.0.0.0:54321:8000"
  studio:
    ports:
      - "0.0.0.0:54323:3000"
EOF
  echo "  Created: $OVERRIDE_FILE"
fi

echo ""
echo "========================================="
echo " Network configured!"
echo "========================================="
echo ""
echo "Restart Supabase to apply the override:"
echo "  cd $PROJECT_DIR && supabase stop && supabase start"
echo ""
echo "Then update app/src/lib/supabase.ts on your dev machine:"
echo "  const LOCAL_IP = \"$LAN_IP\";"
echo ""
echo "Verify from your phone/laptop:"
echo "  curl http://$LAN_IP:54321/rest/v1/ -H 'apikey: <your-anon-key>'"
echo ""
if [ "$PUBLIC_IP" != "N/A" ]; then
  echo "For access outside your network, use the public IP:"
  echo "  const LOCAL_IP = \"$PUBLIC_IP\";"
  echo ""
fi
echo "SECURITY: Do NOT expose ports 54322 (DB) or 54324 (Email) publicly."
