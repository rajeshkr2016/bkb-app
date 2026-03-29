# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a dating app ("bkb-app") currently in the **design/planning phase** — no source code has been written yet. The project consists of architecture docs and use case specifications.

## Architecture Decisions

- **Mobile App**: React Native (iOS/Android)
- **Backend**: Node.js / Express — single server (no microservices for initial ~2000 user scale)
- **Database**: PostgreSQL for all data (users, profiles, matches, chats, payments)
- **Media Storage**: S3 or Cloudinary for profile photos
- **Real-time Chat**: Polling or Firebase (no dedicated WebSocket server at initial scale)
- **Payments**: Stripe integration planned

The `docs/old/component-architecture.md` contains a more detailed microservices design that was superseded by the simpler single-server approach in `architecture.md`. The current plan intentionally avoids microservices, CDN, Redis, and message queues at initial scale.

## Key Documents

- `architecture.md` — Current system architecture (single-server, small scale)
- `docs/use-cases.md` — Feature requirements and user flows
- `docs/old/` — Earlier, more complex architecture designs (kept for reference)

## Core Features

Auth (email/phone), profile creation (photos, bio, interests), swipe-based discovery with filters, mutual-like matching, text/photo chat, report/block/unmatch, notification preferences, account management.
