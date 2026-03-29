# Dating App - Changelog & Fixes

## Security Fixes

### Removed plaintext password from seed file
- **File**: `supabase/seed.sql`
- **Issue**: Test password `password123` was visible as plaintext in the SQL seed file
- **Fix**: Replaced with a pre-computed bcrypt hash (`$2a$06$Rb9b...`)
- **Added**: `.env.local` (gitignored) stores the actual test password for developer reference
- **Added**: `.env.local` and `.env` to `.gitignore`

### Security audit — no exposed secrets
- No plaintext passwords anywhere in the codebase
- Supabase config secrets use `env(...)` placeholders
- Supabase publishable key in `supabase.ts` is safe (client-side key, protected by RLS)

---

## UI / UX Fixes

### Added app name to all page headers
- **Files**: `app/(tabs)/_layout.tsx`, `app/(auth)/login.tsx`, `app/(auth)/signup.tsx`, `app/chat/[id].tsx`
- **Fix**: All page headers now show "BKB Dating - {Page Name}"
- Tab bar labels remain short: "Discover", "Matches", "Chat", "Profile"
- Uses `headerTitle` for the header and `tabBarLabel` for the tab bar

### Fixed chat scroll on iOS
- **File**: `app/chat/[id].tsx`
- **Issue**: Messages were not scrollable on iOS in Expo Go
- **Fix**: Added `style={{ flex: 1 }}` on FlatList, `flexGrow: 1` on content container, and `onLayout` scroll-to-end. Wrapped in `SafeAreaView`

### Fixed missing tab bar on chat conversation screen
- **File**: `app/chat/[id].tsx`
- **Issue**: Chat conversation page (`chat/[id]`) is outside the `(tabs)` route group, so the bottom tab bar was not visible
- **Fix**: Added a custom bottom tab bar with navigation to Discover, Matches, Chat, and Profile tabs

### Added root index route
- **File**: `app/index.tsx`
- **Issue**: App showed "Unmatched Route" on first load
- **Fix**: Created `index.tsx` that redirects to `/(tabs)/discover` if logged in, or `/(auth)/login` if not

---

## Features Added

### Unmatch and Block options in chat
- **Files**: `app/chat/[id].tsx`, `supabase/migrations/20260329203427_add_blocks_table.sql`
- **Unmatch**: Deactivates the match and removes the conversation. Confirmation alert before action
- **Block User**: Unmatches AND creates a block record. Blocked users are excluded from the discovery feed in both directions
- **UI**: "..." menu button in chat header opens a bottom sheet with Unmatch, Block, and Cancel options
- **Database**: New `blocks` table with RLS policies. Updated `get_discovery_feed` function to filter out blocked users

### Expo Go / mobile device support
- **File**: `app/src/lib/supabase.ts`
- **Fix**: Supabase URL uses `127.0.0.1` for web and LAN IP (`192.168.68.69`) for mobile devices, so the app works in Expo Go on a real phone

---

## Database Migrations

| Migration | Description |
|-----------|-------------|
| `20260329070544_init_schema.sql` | Initial schema: profiles, photos, interests, swipes, matches, messages, reports + RLS + matching trigger + discovery feed function |
| `20260329203427_add_blocks_table.sql` | Blocks table + RLS policies + updated discovery feed to exclude blocked users |
