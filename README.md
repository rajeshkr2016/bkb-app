# BKB Community App

A community mobile app built with Expo (React Native) + Supabase. The app serves as a hub for multiple community features, with **BKB Dating** as the first active module.

## Community Features

| Feature | Status |
|---------|--------|
| BKB Dating | Active |
| BKB Hiking | Coming Soon |
| BKB Helpline | Coming Soon |
| BKB Women | Coming Soon |
| BKB Career | Coming Soon |
| BKB Stocks | Coming Soon |
| BKB Sports | Coming Soon |
| BKB Health | Coming Soon |
| BKB Divorce Support | Coming Soon |
| BKB Events | Coming Soon |
| BKB Forums | Coming Soon |
| BKB Marketplace | Coming Soon |

## Tech Stack

- **Frontend**: Expo SDK 54, React Native, TypeScript, expo-router
- **Backend**: Supabase (Auth, PostgreSQL, Realtime, Storage)
- **Database**: PostgreSQL with RLS + PostGIS
- **Bundle ID**: `com.bkb.community`

## Quick Start

```bash
# Start Supabase backend
supabase start
supabase db reset

# Start Expo dev server
cd app
npm install
npx expo start
```

Test with Expo Go on your phone. Update `LOCAL_IP` in `app/src/lib/supabase.ts` to your machine's LAN IP.

## Documentation

- [architecture-supabase.md](architecture-supabase.md) — Supabase architecture, comparison, and resource limits
- [docs/use-cases.md](docs/use-cases.md) — Feature requirements and user flows
- [docs/tech-stack.md](docs/tech-stack.md) — Tech stack decision, key libraries, and project structure
- [docs/requirements.md](docs/requirements.md) — Publishing costs and checklist
- [docs/changelog.md](docs/changelog.md) — All fixes, security patches, and feature additions
- [docs/testing.md](docs/testing.md) — Testing guide with test cases and DB verification
- [docs/ubuntu-server-setup.md](docs/ubuntu-server-setup.md) — Ubuntu server deployment guide
- [scripts/ubuntu/](scripts/ubuntu/) — Setup scripts for Ubuntu server deployment


eas init --id xxx
eas.json is not valid.
- "submit.production.ios.appleId" is not allowed to be empty
- "submit.production.ios.ascAppId" is not allowed to be empty
- "submit.production.ios.appleTeamId" is not allowed to be empty
    Error: project:init command failed.