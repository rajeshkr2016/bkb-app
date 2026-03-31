# Ubuntu Server Setup Scripts

Scripts to deploy and run the BKB Community app backend on an Ubuntu server.

## Quick Start

```bash
# 1. Install Docker, Node.js, Supabase CLI
sudo bash 01-install-deps.sh

# Log out and back in (for Docker group), then:

# 2. Clone repo, start Supabase, apply migrations + seed
bash 02-setup-supabase.sh https://github.com/user/bkb-app.git

# 3. Open firewall ports, bind Supabase to 0.0.0.0
sudo bash 03-configure-network.sh

# 4. Start Expo dev server (choose one mode)
bash 04-start-expo.sh --lan      # same network
bash 04-start-expo.sh --tunnel   # any network

# 5. Verify everything is working
bash 05-health-check.sh

# 6. Stop all services
bash 06-stop-all.sh
```

## Script Details

| Script | Needs sudo | Description |
|--------|-----------|-------------|
| `01-install-deps.sh` | Yes | Docker, Node.js 18, Supabase CLI, Expo CLI |
| `02-setup-supabase.sh` | No | Clone repo, `supabase start`, `db reset` |
| `03-configure-network.sh` | Yes | UFW/iptables rules, Docker Compose override |
| `04-start-expo.sh` | No | Start Expo in tunnel/LAN/localhost mode |
| `05-health-check.sh` | No | Verify all services, DB, network, resources |
| `06-stop-all.sh` | No | Stop Supabase and Expo cleanly |

## Test Accounts

All passwords: `password123`

| Email | Name |
|-------|------|
| alice@test.com | Alice |
| bob@test.com | Bob |
| charlie@test.com | Charlie |
| dana@test.com | Dana |
| eve@test.com | Eve |
