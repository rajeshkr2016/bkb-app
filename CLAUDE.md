# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BKB Community is a mobile app built with Expo (React Native) + Supabase. "BKB Dating" is the first active feature within the community hub. Other community features (Hiking, Events, Forums, etc.) are listed on the landing page as "Coming Soon".

## App Structure

- **Landing page** (`app/(landing)/`) — BKB Community hub with cards for all sub-apps
- **Dating feature** (`app/(auth)/`, `app/(tabs)/`, `app/chat/`) — Auth, discover, matches+chat, profile
- **3 tabs** in dating: Discover, Matches (includes conversations), Profile
- **Chat tab** is hidden (`href: null`) — conversations are shown inside the Matches screen

## Architecture Decisions

- **Mobile App**: Expo / React Native (iOS/Android)
- **Backend**: Supabase (Auth, PostgreSQL, Realtime, Storage)
- **Database**: PostgreSQL with RLS policies, PostGIS for location
- **Real-time Chat**: Supabase Realtime subscriptions
- **Media Storage**: Supabase Storage (S3-compatible)

The `docs/old/` folder contains earlier, more complex architecture designs (microservices, CDN, Redis) kept for reference. The current plan intentionally uses a single Supabase project at initial ~2000 user scale.

## Key Documents

- `architecture-supabase.md` — Current Supabase architecture with comparison and resource limits
- `docs/use-cases.md` — Feature requirements and user flows
- `docs/tech-stack.md` — Tech stack decision and project structure
- `docs/requirements.md` — Publishing costs and pre-publish checklist
- `docs/changelog.md` — All fixes, security patches, and feature additions
- `docs/testing.md` — Testing guide with test cases and DB verification
- `docs/ubuntu-server-setup.md` — Ubuntu server deployment guide
- `scripts/ubuntu/` — Setup scripts for Ubuntu server
- `docs/old/` — Earlier architecture designs (kept for reference)

## Core Features (Dating)

Auth (email), profile creation (bio, interests), interest-based discovery with shared interests, mutual-like matching, text chat with realtime, report/block/unmatch, profile management.

## Development

- Local Supabase: `supabase start` / `supabase db reset`
- Expo dev: `cd app && npx expo start`
- Mobile testing: Expo Go app (update `LOCAL_IP` in `app/src/lib/supabase.ts`)
- Bundle ID: `com.bkb.community`
