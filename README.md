# BKB Community App

A community mobile app built with Expo (React Native) + Supabase. The app serves as a hub for multiple community features, with **BKB Dating** as the first active module.

**Live Web:** https://rajeshkr2016.github.io/bkb-app/

## Community Features

| Feature | Status | Description |
|---------|--------|-------------|
| BKB Dating | Active | Interest-based discovery, matching, and real-time chat |
| BKB Events | Active | Local community events and meetups |
| BKB Hiking | Active | Trail exploration and group hikes |
| BKB Helpline | Coming Soon | 24/7 support and resources |
| BKB Women | Coming Soon | Safe space for women to connect and empower |
| BKB Career | Coming Soon | Job listings, mentorship, and career growth |
| BKB Stocks | Coming Soon | Market insights and investment discussions |
| BKB Sports | Coming Soon | Teams, leagues, and pickup games |
| BKB Health | Coming Soon | Wellness tips, fitness groups, and health resources |
| BKB Divorce Support | Coming Soon | Guidance, community, and resources for a fresh start |
| BKB Forums | Coming Soon | Conversations and idea sharing |
| BKB Marketplace | Coming Soon | Buy, sell, and trade within the community |

## Active Pages

| Route | Description |
|-------|-------------|
| `/` | Landing — community hub with cards for all sub-apps |
| `/login` | Email login |
| `/signup` | New account registration |
| `/confirm` | Email confirmation |
| `/discover` | Interest-based profile discovery |
| `/matches` | Mutual matches and conversations |
| `/profile` | Profile management |
| `/chat/[id]` | Real-time chat with a match |
| `/events` | Community events and meetups |
| `/hiking` | Group hikes and trail info |

## Tech Stack

- **Frontend**: Expo SDK 54, React Native, TypeScript, expo-router
- **Backend**: Supabase Cloud (Auth, PostgreSQL, Realtime, Storage)
- **Database**: PostgreSQL with RLS + PostGIS
- **Hosting**: GitHub Pages (web), EAS Build (mobile)
- **CI/CD**: GitHub Actions with self-hosted runner
- **Bundle ID**: `com.bkb.community`

## Quick Start

```bash
# Install dependencies
cd app && npm install

# Start Expo dev server
npx expo start

# Run on web
npx expo start --web

# Build Android APK
npx eas-cli build --platform android --profile preview

# Export static web build
npx expo export --platform web
```

## Supabase

```bash
# Local development
supabase start
supabase db reset

# Deploy migrations to cloud
supabase link --project-ref <PROJECT_ID>
supabase db push --linked
```

## Deployment

- **Web**: Auto-deploys to GitHub Pages on push to `master` or `supabase-cloud`
- **Database**: Auto-deploys migrations via GitHub Actions on push
- **Mobile**: Build via EAS (`npx eas-cli build --platform android --profile preview`)

## Documentation

- [architecture-supabase.md](architecture-supabase.md) — Supabase architecture, comparison, and resource limits
- [docs/use-cases.md](docs/use-cases.md) — Feature requirements and user flows
- [docs/tech-stack.md](docs/tech-stack.md) — Tech stack decision, key libraries, and project structure
- [docs/requirements.md](docs/requirements.md) — Publishing costs and checklist
- [docs/changelog.md](docs/changelog.md) — All fixes, security patches, and feature additions
- [docs/testing.md](docs/testing.md) — Testing guide with test cases and DB verification
- [docs/ubuntu-server-setup.md](docs/ubuntu-server-setup.md) — Ubuntu server deployment guide
- [scripts/ubuntu/](scripts/ubuntu/) — Setup scripts for Ubuntu server deployment
