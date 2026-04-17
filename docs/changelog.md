# Changelog

## 2026-04-16

### Scheduled Endpoint Test Utility

- **Change:** Added a schedulable test utility that fetches bkb-app endpoints and validates their responses. Designed to run under cron or macOS launchd.
- **Files created:**
  - `scripts/test-utils/fetch-and-test.sh` — bash runner with `check_endpoint` (JSON) and `check_html_endpoint` (HTML) helpers; logs PASS/FAIL with URL, timing, and payload summary; exits non-zero on any failure.
  - `scripts/test-utils/com.bkb.fetchtest.plist` — launchd agent plist with 15-minute `StartInterval` and install/uninstall instructions in the header.

#### Endpoints checked

- `https://ywleqlcyxtalbxejniov.supabase.co/functions/v1/meetup-events` — validates HTTP 200, valid JSON, `events` is an array, no `error` field; logs event count and group name.
- `https://rajeshkr2016.github.io/bkb-app/` — validates HTTP 200, body size ≥ 100 bytes, contains `expo-reset` sentinel string.

#### Behavior

- Auto-sources `.env.local` at repo root (falls back to the baked-in Supabase URL and empty anon key).
- Writes to `scripts/test-utils/logs/fetch-and-test.log` with UTC timestamps.
- Cron example in the script header; launchd plist writes stdout/stderr to `logs/launchd.out` and `logs/launchd.err`.
- Requires `curl` and `jq`.

## 2026-04-03

### Live Meetup Integration for Events and Hiking Pages

- **Change:** Replaced hardcoded event data with live data fetched from Meetup on page load via a Supabase Edge Function proxy
- **Files created:**
  - `supabase/functions/meetup-events/index.ts` — Supabase Edge Function that proxies Meetup data
  - `app/src/lib/meetup.ts` — shared client utility for fetching events from the edge function
- **Files updated:**
  - `app/app/events/index.tsx` — Events page now fetches live data
  - `app/app/hiking/index.tsx` — Hiking page now fetches live data

#### Supabase Edge Function: `meetup-events`

- **Why needed:** Browsers block direct requests to `meetup.com` due to CORS (no `Access-Control-Allow-Origin` header). Mobile apps (React Native) don't have this restriction, but web does. A server-side proxy solves this for all platforms.
- **How it works:**
  1. Edge function receives GET request from the app
  2. Fetches the public Meetup group page HTML server-side (`https://www.meetup.com/break-ke-baad-bkb-divorced-indians/events/`)
  3. Extracts `__NEXT_DATA__` JSON embedded in the page (Apollo cache from Meetup's Next.js SSR)
  4. Parses all `Event:` entries from Apollo state — extracts id, title, dateTime, endTime, going count, maxTickets, eventType, eventUrl, fee, status
  5. Extracts live `Group:` data — member count, average rating, total ratings
  6. Returns parsed JSON with CORS headers (`Access-Control-Allow-Origin: *`)
- **Endpoint:** `https://ywleqlcyxtalbxejniov.supabase.co/functions/v1/meetup-events`
- **Auth:** Uses Supabase anon key in `Authorization` header. JWT verification disabled (`--no-verify-jwt`) since this is public data.
- **Deployment:** `supabase functions deploy meetup-events --project-ref ywleqlcyxtalbxejniov --no-verify-jwt`
- **Verified:** Returns 30 live events with group info (2,282 members, 4.78 rating)

#### Client: `app/src/lib/meetup.ts`

- Calls the edge function endpoint instead of Meetup directly
- Reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` for the request
- Exports types: `MeetupEvent`, `MeetupGroup`, `FetchResult`
- Exports helpers: `formatEventDate()`, `formatEventTime()`, `isHikingEvent()`
- No HTML parsing on client — edge function handles all parsing server-side

#### Events page features

- Fetches ~30 live events on page load with loading spinner
- **Refresh button** in header + **pull-to-refresh** gesture
- Error state with retry button if fetch fails
- Auto-infers tags from event title/description (Hiking, Food, Nightlife, Cultural, Adventure, Family, Online, Social)
- Tag filter chips still work, now filtering live data
- Each event card links to its specific Meetup event URL (not just the group page)
- Live group stats (member count, rating) in header

#### Hiking page features

- Fetches all events, filters to hiking-related using `isHikingEvent()` — matches "hike", "hiking", "trail", "trek" in title or description
- Splits into upcoming/past sections based on current date
- **Refresh button** in header + **pull-to-refresh** gesture
  - Error state with retry button
  - Past hikes shown with reduced opacity
- **No API key required:** Uses public page scraping of Meetup's SSR data, no OAuth or Pro subscription needed

### Supabase Cloud Deployment

- **Change:** Migrated from local Supabase to Supabase Cloud
- **Project:** `ywleqlcyxtalbxejniov` (West US Oregon)
- **Steps:**
  1. Logged in to Supabase CLI: `supabase login`
  2. Verified project exists: `supabase projects list`
  3. Linked local project: `supabase link --project-ref ywleqlcyxtalbxejniov`
  4. Checked pending migrations: `supabase migration list --linked` — showed 3 local, 0 remote
  5. Pushed all migrations: `supabase db push --linked`
  6. Verified sync: `supabase migration list --linked` — all 3 matched (local = remote)
- **Migrations applied:**
  - `20260329070544_init_schema.sql` — profiles, photos, interests, swipes, matches, messages, reports tables + RLS + PostGIS
  - `20260329203427_add_blocks_table.sql` — blocks table + RLS
  - `20260330000000_interest_based_discovery.sql` — interest-based discovery logic
- **Dashboard config:**
  - Authentication → URL Configuration → Site URL: `https://rajeshkr2016.github.io/bkb-app`
  - Authentication → URL Configuration → Redirect URLs: `https://rajeshkr2016.github.io/bkb-app/**`

### GitHub Actions CI/CD Pipeline

- **Change:** Added two CI/CD workflows running on a self-hosted runner
- **Files created:**
  - `.github/workflows/supabase-deploy.yml` — Supabase migration deployment
  - `.github/workflows/deploy-web.yml` — GitHub Pages web deployment
- **`supabase-deploy.yml` details:**
  - Triggers on push to `master`/`supabase-cloud` when `supabase/migrations/**`, `config.toml`, or `seed.sql` change
  - Job 1 (`lint`): validates migration files exist, checks naming convention (`YYYYMMDDHHMMSS_description.sql`), rejects `DROP DATABASE`, warns on `TRUNCATE CASCADE`
  - Job 2 (`deploy`): runs `supabase link`, `supabase db push --linked`, `supabase migration list --linked`, writes GitHub step summary
  - Job 3 (`notify-failure`): reports errors on failure
  - Required secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`
- **`deploy-web.yml` details:**
  - Triggers on push to `master`/`supabase-cloud` or manual `workflow_dispatch`
  - Job 1 (`build`): checkout → setup Node 20 → `npm ci` → write `.env.local` from secrets → clear Metro cache → `npx expo export --platform web --clear` → upload pages artifact
  - Job 2 (`deploy`): `actions/deploy-pages@v4` to GitHub Pages environment
  - Permissions: `contents: read`, `pages: write`, `id-token: write`
  - Concurrency group `"pages"` with `cancel-in-progress: true`
- **GitHub repo settings required:**
  - Settings → Pages → Source: **GitHub Actions**
  - Settings → Environments → `github-pages` → Deployment branches: added `supabase-cloud`
  - Settings → Secrets → Actions: `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SITE_URL`

### Ansible Role: GitHub Actions Runner

- **Change:** Added Ansible role to provision a self-hosted GitHub Actions runner on Ubuntu
- **Files created:**
  - `ansible/roles/github_runner/defaults/main.yml` — configurable defaults (runner version `2.322.0`, arch `x64`, labels, user, install dir, Supabase CLI version, Node.js version)
  - `ansible/roles/github_runner/tasks/main.yml` — full provisioning:
    1. Validates `github_runner_token` is provided (fail with helpful URL if not)
    2. Installs dependencies: `curl`, `tar`, `jq`, `git`, `unzip`, `libicu-dev`, `libssl-dev`
    3. Adds NodeSource GPG key and repo, installs Node.js 20
    4. Downloads and installs Supabase CLI `.deb` package
    5. Creates `github-runner` system user with home directory
    6. Creates `/opt/actions-runner` directory owned by runner user
    7. Downloads GitHub Actions runner tarball from `actions/runner` releases
    8. Extracts to install directory
    9. Checks if already configured (`.runner` file exists)
    10. Runs `config.sh --unattended --replace` with token, name, labels, work dir
    11. Installs systemd service from template
    12. Enables and starts the service
    13. Cleans up downloaded archive
  - `ansible/roles/github_runner/handlers/main.yml` — restart handler for systemd service
  - `ansible/roles/github_runner/templates/github-runner.service.j2` — systemd unit with hardening (`NoNewPrivileges`, `ProtectSystem=strict`, `PrivateTmp`, `ReadWritePaths`)
  - `ansible/playbooks/github-runner.yml` — playbook targeting `metro_bundlers` host group
  - `ansible/group_vars/github_runner.yml` — runner-specific variables
- **Usage:**
  1. Generate token at `https://github.com/rajeshkr2016/bkb-app/settings/actions/runners/new`
  2. Run: `cd ansible && ansible-playbook playbooks/github-runner.yml --extra-vars "github_runner_token=YOUR_TOKEN" --become --ask-become-pass`

### GitHub Pages Web Deployment

- **Change:** Deployed Expo web build to GitHub Pages
- **Live URL:** `https://rajeshkr2016.github.io/bkb-app/`
- **Steps:**
  1. Added `"bundler": "metro"` and `"output": "static"` to `web` section of `app/app.json` — required for static export with expo-router
  2. Added `"experiments": { "baseUrl": "/bkb-app" }` to `app/app.json` — GitHub Pages serves from `/bkb-app/` subpath, without this all JS/CSS/asset paths resolve to `/` and 404
  3. Tested locally: `npx expo export --platform web` — produced `app/dist/` with 21 static HTML pages (1.8MB total)
  4. Verified with `npx serve app/dist` on localhost
  5. Installed `gnu-tar` on macOS runner (`brew install gnu-tar`) — `actions/upload-pages-artifact` requires `gtar` which macOS doesn't have by default
  6. Enabled GitHub Pages source as "GitHub Actions" in repo settings
  7. Added `supabase-cloud` to allowed deployment branches in `github-pages` environment protection rules

### Fix: Web static rendering crash (`window is not defined`)

- **Problem:** `npx expo export --platform web` failed with `ReferenceError: window is not defined` at `AsyncStorage.js:63`
- **Root cause:** Expo static export runs server-side rendering (SSR) to generate HTML. `AsyncStorage` accesses `window` at import time. The Supabase client was created at module scope (`export const supabase = createClient(...)`) which triggered `AsyncStorage` import during SSR where `window` doesn't exist.
- **Fix in `app/src/lib/supabase.ts`:**
  1. Removed top-level `import AsyncStorage` — replaced with lazy `require()` inside a function
  2. Changed from direct `createClient()` export to a `getSupabase()` factory function that creates the client on first access
  3. Wrapped in a `Proxy` so existing code using `supabase.auth`, `supabase.from()` etc. works without changes — the Proxy forwards property access to `getSupabase()` which only initializes when actually called at runtime (not during SSR)
  4. Used `let _supabase: SupabaseClient | null = null` singleton pattern so the client is created only once

### Fix: Metro cache causing stale builds in CI

- **Problem:** After changing env vars or code, the GitHub Pages build produced the same JS bundle hash (`entry-281e104bb38affce72d38a48158d47d8.js`). Env vars were confirmed loaded in build logs (`env: export EXPO_PUBLIC_SUPABASE_URL EXPO_PUBLIC_SUPABASE_ANON_KEY`) but the key was missing from the deployed bundle.
- **Root cause:** Self-hosted runner persists between runs. Metro bundler caches transformed modules in `node_modules/.cache` and `/tmp/metro-*`. The cached bundle had the old (empty) env var values baked in, and Metro reused it without re-evaluating `process.env.*` replacements.
- **Fix in `.github/workflows/deploy-web.yml`:**
  1. Added cache cleanup step before build: `rm -rf node_modules/.cache /tmp/metro-* /tmp/haste-map-*`
  2. Added `--clear` flag to export command: `npx expo export --platform web --clear` — tells Metro to ignore all caches and rebuild from scratch
- **Verification:** After fix, new bundle hash generated with env vars correctly inlined

### Fix: Supabase anon key missing in CI builds

- **Problem:** `Uncaught Error: supabaseKey is required` on GitHub Pages. The `EXPO_PUBLIC_SUPABASE_ANON_KEY` was not embedded in the JS bundle.
- **Root cause:** `.env.local` is gitignored (correctly — it contains secrets). The CI runner checks out the repo fresh, so no `.env.local` exists. Workflow `env:` block sets shell environment variables, but Expo/Metro reads `EXPO_PUBLIC_*` vars from `.env` files at bundle time, not from shell environment.
- **Fix in `.github/workflows/deploy-web.yml`:**
  1. Added "Create .env for Expo build" step before the export step
  2. Uses `printf` to write each line to `app/.env.local` from GitHub secrets
  3. Debug output: prints line count and key length (first 10 chars only) to verify without exposing secrets
  4. Required GitHub secret: `EXPO_PUBLIC_SUPABASE_ANON_KEY` set in repo Settings → Secrets → Actions
- **Initial attempt that failed:** Used heredoc (`cat <<EOF`) with indented lines — added leading whitespace to values, breaking them. Fixed by switching to `printf` per line.

### Fix: Confirmation email redirect URL

- **Problem:** Supabase confirmation emails contained redirect URL `https://rajeshkr2016.github.io/` instead of `https://rajeshkr2016.github.io/bkb-app`, resulting in `{"error":"requested path is invalid"}` after clicking the link
- **Root cause:** Site URL in Supabase Dashboard was set to `https://rajeshkr2016.github.io/` without the `/bkb-app` subpath. Supabase uses Site URL as the base for constructing email confirmation redirect links.
- **Fix:**
  1. Updated Supabase Dashboard → Authentication → URL Configuration → Site URL to `https://rajeshkr2016.github.io/bkb-app`
  2. Added redirect URL `https://rajeshkr2016.github.io/bkb-app/**` to allowed redirects
  3. Added `EXPO_PUBLIC_SITE_URL` env variable to `app/.env.local`
  4. Updated `app/src/hooks/useAuth.ts` to pass `emailRedirectTo` using the env variable in `signUp` call
  5. Updated `.github/workflows/deploy-web.yml` to inject `EXPO_PUBLIC_SITE_URL` from GitHub Actions secrets
  6. Added `EXPO_PUBLIC_SITE_URL` secret in GitHub repo settings

### EAS Build Configuration

- **Change:** Configured EAS for Android APK builds pointing to Supabase Cloud
- **Steps:**
  1. Installed EAS CLI: `npm install --global eas-cli` (required `sudo rm -rf` of stale directory first)
  2. Logged in: `npx eas-cli login`
  3. Initialized project: `npx eas-cli init --id ea48b504-8848-427e-8ca3-7a1d4c5f815f`
  4. Hit error: `eas.json is not valid` — empty `submit.production.ios.appleId/ascAppId/appleTeamId` fields. Removed entire `submit` section from `eas.json` since iOS submission isn't needed yet.
  5. Updated `eas.json` preview profile: added `"android": { "buildType": "apk" }` — without this, EAS builds AAB (only installable via Play Store), APK allows direct sideload
  6. Added Supabase Cloud env vars to preview and production profiles in `eas.json`
- **Build command:** `cd app && npx eas-cli build --platform android --profile preview`
- **Result:** APK download link provided after build completes on EAS cloud (~10-15 min)

### Env Cleanup

- **Change:** Cleaned up `.env.local` — reorganized for cloud-first workflow
- **Steps:**
  1. Removed obsolete `METRO_DOMAIN` and `METRO_UPSTREAM` vars — no longer needed with Supabase Cloud (were for Ubuntu nginx/Metro setup)
  2. Removed stray `eas init --id ...` command that was accidentally pasted into the file
  3. Updated `SUPABASE_SITE_URL` to cloud URL `https://ywleqlcyxtalbxejniov.supabase.co`
  4. Organized into sections: Local dev, Supabase Cloud, Expo app
  5. Removed `SUPABASE_SMTP_PASS` — SMTP is now configured in Supabase Dashboard, not in local env

### README Update

- **Change:** Updated `README.md` with live web URL, active pages, and current deployment info
- **Steps:**
  1. Added live web URL at top: `https://rajeshkr2016.github.io/bkb-app/`
  2. Added description column to Community Features table
  3. Changed BKB Events and BKB Hiking status from "Coming Soon" to **Active** (both have working pages with routes and components)
  4. Added Active Pages table with all 10 routes and descriptions
  5. Updated Tech Stack to include Supabase Cloud, GitHub Pages, EAS Build, GitHub Actions
  6. Added Supabase cloud deployment commands
  7. Added deployment section documenting auto-deploy triggers
  8. Removed stray EAS error output that was accidentally at bottom of file
