# BKB Community App — Ubuntu Server Setup & Testing Guide

This guide covers setting up the BKB Community app backend (Supabase) on an Ubuntu server and connecting the Expo mobile app to it for testing.

---

## Prerequisites

| Component | Minimum Version |
|-----------|----------------|
| Ubuntu | 22.04 LTS or later |
| Docker | 24.0+ |
| Docker Compose | v2.20+ |
| Node.js | 18 LTS or later |
| npm | 9+ |
| Git | 2.34+ |

---

## 1. Server Setup

### 1.1 Update the system

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to the docker group (avoids needing sudo)
sudo usermod -aG docker $USER

# Apply group change (or log out and back in)
newgrp docker

# Verify
docker --version
docker compose version
```

### 1.3 Install Node.js (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
node --version
npm --version
```

### 1.4 Install Supabase CLI

```bash
npm install -g supabase
supabase --version
```

### 1.5 Install Expo CLI

```bash
npm install -g expo-cli
```

---

## 2. Clone and Configure the Project

### 2.1 Clone the repo

```bash
git clone <your-repo-url> ~/bkb-app
cd ~/bkb-app
```

### 2.2 Install app dependencies

```bash
cd app
npm install
cd ..
```

---

## 3. Start Supabase (Backend)

### 3.1 Start Supabase services

```bash
cd ~/bkb-app
supabase start
```

This pulls Docker images and starts all services. First run takes a few minutes. Once complete, you'll see output like:

```
         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-...
        anon key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
service_role key: ...
```

**Save the `anon key`** — you'll need it if it differs from the one in the code.

### 3.2 Apply migrations and seed data

```bash
supabase db reset
```

This runs all migrations in `supabase/migrations/` and then `supabase/seed.sql`, creating:
- All tables (profiles, matches, messages, swipes, blocks, etc.)
- RLS policies
- Discovery feed function
- 5 test users (alice@test.com through eve@test.com)

### 3.3 Verify the database

```bash
# Connect to the database
docker exec -it $(docker ps --filter "name=supabase_db" -q) \
  psql -U postgres -d postgres

# Check tables exist
\dt public.*

# Check test users
SELECT id, email FROM auth.users;

# Check profiles
SELECT id, name, gender FROM profiles;

# Exit psql
\q
```

---

## 4. Configure Networking

The mobile app must reach the Ubuntu server over the network. There are two scenarios:

### 4.1 Same LAN (phone and server on same WiFi/network)

Get the server's LAN IP:

```bash
hostname -I | awk '{print $1}'
```

Example output: `192.168.1.50`

### 4.2 Remote server (cloud VPS / different network)

Use the server's public IP:

```bash
curl -4 ifconfig.me
```

### 4.3 Open the required port

Supabase API listens on port **54321**. Make sure it's accessible:

```bash
# UFW firewall (if active)
sudo ufw allow 54321/tcp
sudo ufw allow 8081/tcp   # Expo dev server (if running on server)
sudo ufw status

# Or if using iptables
sudo iptables -A INPUT -p tcp --dport 54321 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8081 -j ACCEPT
```

For cloud VPSs (AWS, DigitalOcean, etc.), also open these ports in the security group / firewall dashboard.

### 4.4 Bind Supabase to all interfaces

By default Supabase binds to `127.0.0.1`. To accept external connections, edit `supabase/config.toml`:

```toml
[api]
enabled = true
port = 54321
# Add this line:
extra_search_path = ["public", "extensions"]
```

Then update the Docker Compose override to expose the port on all interfaces. Create or edit `supabase/docker-compose.override.yml`:

```yaml
services:
  kong:
    ports:
      - "0.0.0.0:54321:8000"
```

Restart Supabase after changes:

```bash
supabase stop
supabase start
```

### 4.5 Verify external access

From another machine (or your phone's browser):

```bash
curl http://<SERVER_IP>:54321/rest/v1/ \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
```

You should get an empty JSON response `[]` or similar — not a connection error.

---

## 5. Update the App to Point to the Server

Edit `app/src/lib/supabase.ts` — replace the `LOCAL_IP` with your Ubuntu server IP:

```typescript
// Replace with your Ubuntu server's IP address
const LOCAL_IP = "192.168.1.50";  // <-- your server IP here

const SUPABASE_URL =
  Platform.OS === "web"
    ? "http://127.0.0.1:54321"
    : `http://${LOCAL_IP}:54321`;

const SUPABASE_ANON_KEY = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";
```

> **Note:** If your `supabase start` output showed a different anon key, update `SUPABASE_ANON_KEY` too.

---

## 6. Run the Expo App

### Option A: Run Expo on the Ubuntu server (headless)

```bash
cd ~/bkb-app/app

# Start Expo in tunnel mode (accessible from any network)
npx expo start --tunnel

# Or LAN mode (same network only)
npx expo start --lan
```

Scan the QR code with Expo Go on your phone.

### Option B: Run Expo on your local machine (Mac/Windows)

Keep Supabase running on the Ubuntu server, but run Expo locally:

```bash
cd app
npx expo start
```

The app connects to the Ubuntu server's Supabase via the IP you set in step 5.

---

## 7. Test Users

All test accounts use the same password: `password123`

| Email | Name | Gender |
|-------|------|--------|
| alice@test.com | Alice | Female |
| bob@test.com | Bob | Male |
| charlie@test.com | Charlie | Male |
| dana@test.com | Dana | Female |
| eve@test.com | Eve | Non-binary |

---

## 8. Testing Checklist

### Authentication
- [ ] Sign up with a new email
- [ ] Log in with a test account (alice@test.com / password123)
- [ ] Log out and verify redirect to login screen
- [ ] Enter key chains: email → password → submit

### Discovery
- [ ] Swipe feed loads profiles
- [ ] Like (right) records a swipe
- [ ] Pass (left) records a swipe
- [ ] Already-swiped profiles don't reappear
- [ ] Blocked users don't appear

### Matching
- [ ] Mutual like triggers "It's a Match!" overlay
- [ ] New match appears in Matches tab (New Matches section)
- [ ] Shared interests shown on match cards

### Chat
- [ ] Tapping a match opens the chat screen
- [ ] Messages send and appear in real-time
- [ ] Other user sees messages via realtime subscription
- [ ] Enter key sends message and keeps input focused
- [ ] Back button returns to Matches screen
- [ ] Conversations section shows last message preview

### Block / Unmatch
- [ ] "..." menu shows Unmatch and Block options
- [ ] Unmatch removes the match from both users
- [ ] Block removes match and prevents future discovery

### Profile
- [ ] Profile screen shows current user info
- [ ] Can update bio and preferences

---

## 9. Useful Commands

| Command | Description |
|---------|-------------|
| `supabase start` | Start all Supabase services |
| `supabase stop` | Stop all Supabase services |
| `supabase db reset` | Drop DB, re-run migrations + seed |
| `supabase status` | Show running service URLs and keys |
| `supabase db diff` | Show pending schema changes |
| `docker ps` | List running containers |
| `docker logs <container>` | View container logs |

### Check Supabase logs

```bash
# Auth service logs (login/signup issues)
docker logs $(docker ps --filter "name=supabase_auth" -q) --tail 50

# API gateway logs
docker logs $(docker ps --filter "name=supabase_kong" -q) --tail 50

# Database logs
docker logs $(docker ps --filter "name=supabase_db" -q) --tail 50
```

### Database queries via CLI

```bash
docker exec -it $(docker ps --filter "name=supabase_db" -q) \
  psql -U postgres -d postgres -c "SELECT * FROM profiles;"
```

---

## 10. Troubleshooting

### "Connection refused" from phone

1. Verify Supabase is running: `supabase status`
2. Check the IP is correct: `hostname -I`
3. Test from server itself: `curl http://127.0.0.1:54321/rest/v1/`
4. Check firewall: `sudo ufw status`
5. Ensure port 54321 is bound to `0.0.0.0`, not just `127.0.0.1`: `ss -tlnp | grep 54321`

### "Database error querying schema" (500 on login)

The `auth.users` seed data may be missing required columns. Re-run:

```bash
supabase db reset
```

This re-applies the seed file which includes all required `auth.users` columns (`confirmation_token`, `recovery_token`, etc.).

### Supabase containers won't start

```bash
# Check Docker is running
sudo systemctl status docker

# Check available disk space (Supabase needs ~2GB)
df -h

# Check available memory (needs ~2GB RAM)
free -h

# Remove old containers and retry
supabase stop --no-backup
docker system prune -f
supabase start
```

### Expo "Network response timed out"

- Ensure phone and server are on the same network (if using LAN mode)
- Try tunnel mode: `npx expo start --tunnel`
- Check that `LOCAL_IP` in `supabase.ts` matches the server IP

### Port 54321 already in use

```bash
# Find what's using the port
sudo lsof -i :54321

# Stop Supabase cleanly
supabase stop
```

---

## 11. Supabase Service Ports Reference

| Service | Port | URL |
|---------|------|-----|
| API (Kong) | 54321 | http://SERVER_IP:54321 |
| Database (Postgres) | 54322 | postgresql://postgres:postgres@SERVER_IP:54322/postgres |
| Studio (Dashboard) | 54323 | http://SERVER_IP:54323 |
| Inbucket (Email) | 54324 | http://SERVER_IP:54324 |
| Analytics | 54327 | http://SERVER_IP:54327 |

> **Security note:** For production, do NOT expose ports 54322 (DB), 54323 (Studio), or 54324 (Inbucket) to the internet. Only port 54321 (API) should be publicly accessible, and ideally behind HTTPS via a reverse proxy (nginx/caddy).
