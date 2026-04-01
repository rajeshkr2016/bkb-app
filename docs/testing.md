# BKB Community App - Testing Guide

## Prerequisites

| Requirement | Command to verify |
|-------------|------------------|
| Node.js v20+ | `node -v` (must be >= 20, required by React Native 0.81+) |
| Docker Desktop | `docker --version` (must be running) |
| Supabase CLI | `supabase --version` |
| Expo Go app | Install from App Store / Play Store |

---

## 1. Start Local Environment

```bash
# Start Docker Desktop (if not running)
open -a Docker

# Start Supabase (from project root)
supabase start

# Reset database with seed data
supabase db reset

# Start Expo dev server (from app/ directory)
cd app
npx expo start
```

### Verify services are running

| Service | URL | Expected |
|---------|-----|----------|
| Supabase Studio | http://127.0.0.1:54323 | Dashboard loads |
| Supabase API | http://127.0.0.1:54321 | JSON response |
| Mailpit (email) | http://127.0.0.1:54324 | Inbox UI loads |
| App (web) | http://localhost:8081 | Landing page (community hub) |
| App (Expo Go) | `exp://<your-lan-ip>:8081` | Landing page on phone |

---

## 2. Test Accounts

| Email | Password | Name | Gender |
|-------|----------|------|--------|
| alice@test.com | See `.env.local` | Alice | Female |
| bob@test.com | See `.env.local` | Bob | Male |
| charlie@test.com | See `.env.local` | Charlie | Male |
| dana@test.com | See `.env.local` | Dana | Female |
| eve@test.com | See `.env.local` | Eve | Non-binary |

---

## 3. Test Cases

### Landing Page & Community Nav

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| L1 | Landing page loads | Open app (not logged in) | Community hub with sub-app cards shown |
| L2 | Active apps clickable | Tap Events, Dating, or Hiking cards | Navigates to the respective page |
| L3 | Coming Soon apps | Tap a Coming Soon card (e.g., BKB Career) | Nothing happens, card shows "Coming Soon" badge |
| L4 | Community nav visible | Navigate to Events, Dating tabs, or Hiking | Horizontal CommunityNav bar visible at bottom |
| L5 | Community nav switching | Tap different apps in CommunityNav | Navigates to the selected sub-app |
| L6 | Active indicator | Open Events page | "Events" highlighted in CommunityNav |

### Events Page

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| EV1 | Events load | Navigate to Events page | Event cards displayed with title, date, location |
| EV2 | Filter by tag | Tap a tag filter (e.g., "Social") | Only events matching that tag shown |
| EV3 | All filter | Tap "All" tag | All events shown |
| EV4 | Event details | View an event card | Shows attendees, capacity, fee, description, tags |
| EV5 | Meetup link | Tap "Meetup" button in header | Opens Meetup group page |
| EV6 | Back button | Tap back arrow | Returns to landing page |

### Hiking Page

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| HK1 | Hiking page loads | Navigate to Hiking page | Two tabs visible: "Hiking Events" and "Meetup Page" |
| HK2 | Upcoming hikes | View Hiking Events tab | Upcoming hikes shown with full details |
| HK3 | Past hikes | Scroll down in Hiking Events tab | Past hikes shown with reduced opacity |
| HK4 | Meetup webview | Tap "Meetup Page" tab | Embedded Meetup page loads in webview |
| HK5 | Back button | Tap back arrow | Returns to landing page |

### Authentication

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| A1 | Sign up | Enter new email + password (6+ chars) on sign up screen | Account created, redirected to profile |
| A2 | Sign up - weak password | Enter password less than 6 chars | Error: "Password must be at least 6 characters" |
| A3 | Sign up - password mismatch | Enter different passwords in both fields | Error: "Passwords don't match" |
| A4 | Sign up - empty fields | Leave email or password blank | Error: "Please fill in all fields" |
| A5 | Log in | Enter test account email + password | Redirected to Discover tab |
| A6 | Log in - wrong password | Enter wrong password | Error message shown |
| A7 | Log out | Go to Profile tab, tap "Log Out" | Redirected to login screen |

### Profile

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| P1 | Create profile | Fill in name, DOB, gender, bio, preference. Tap "Create Profile" | Success alert, profile saved |
| P2 | Edit profile | Change bio or preferences. Tap "Update Profile" | Success alert, changes saved |
| P3 | Required fields | Leave name or DOB empty, tap save | Error: "Name and date of birth are required" |
| P4 | Gender selection | Tap different gender chips | Only one chip active at a time |
| P5 | Preference selection | Tap different "Interested In" chips | Only one chip active at a time |

### Discovery / Swipe

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| D1 | View profiles | Open Discover tab after login | Profile card shown with name, age, gender, bio |
| D2 | Like | Tap the heart button | Next profile shown, like recorded |
| D3 | Pass | Tap the X button | Next profile shown, pass recorded |
| D4 | No more profiles | Like/pass all available profiles | "No more profiles nearby" message + Refresh button |
| D5 | Refresh | Tap Refresh when no profiles left | Reloads feed (may be empty if all swiped) |
| D6 | Already swiped hidden | Like all profiles, refresh | Already-swiped profiles don't reappear |

### Matching

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| M1 | Mutual like = match | Log in as Alice, like Bob. Log in as Bob, like Alice | "It's a Match!" overlay appears for Bob. Match appears in both users' Matches tab |
| M2 | One-way like = no match | Log in as Alice, like Charlie. Don't like back as Charlie | No match created |
| M3 | Match list | Go to Matches tab | All active matches listed with name and date |
| M4 | Tap match opens chat | Tap a match in the list | Chat conversation screen opens |

### Chat

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| C1 | Send message | Type message, tap Send | Message appears in chat as sent (right side, red) |
| C2 | Receive message (realtime) | Send message from another account | Message appears instantly (left side, white) without refresh |
| C3 | Empty chat | Open chat with no messages | "Say hi!" placeholder shown |
| C4 | Scroll | Send many messages | Messages are scrollable, auto-scrolls to latest |
| C5 | Keyboard handling | Tap input field | Keyboard opens, input stays visible above keyboard |
| C6 | Send on enter | Type message, press Return/Enter | Message sent |
| C7 | Empty send blocked | Tap Send with empty input | Button disabled, nothing sent |
| C8 | Back button | Tap "Back" in chat header | Returns to previous screen |
| C9 | Community nav in chat | CommunityNav visible at bottom of chat | Can switch to Events or Hiking from chat |

### Unmatch & Block

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| U1 | Open menu | Tap "..." in chat header | Bottom sheet with Unmatch, Block, Cancel |
| U2 | Cancel menu | Tap Cancel or tap outside | Menu closes |
| U3 | Unmatch - confirm | Tap Unmatch, tap "Unmatch" in alert | Match deactivated, redirected to Matches tab, match no longer listed |
| U4 | Unmatch - cancel | Tap Unmatch, tap "Cancel" in alert | Nothing happens, menu closes |
| U5 | Block - confirm | Tap Block, tap "Block" in alert | Match deactivated + user blocked, redirected to Matches tab |
| U6 | Blocked user hidden | Block a user, go to Discover tab | Blocked user never appears in discovery feed |
| U7 | Blocked both ways | User A blocks User B. Log in as User B | User A does not appear in User B's discovery feed either |

---

## 4. Multi-Device Testing (Realtime)

This tests the real-time features by using two browser tabs or two devices simultaneously.

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| R1 | Real-time match | Tab 1: Alice likes Bob. Tab 2: Bob likes Alice | Both tabs show "It's a Match!" overlay |
| R2 | Real-time chat | Tab 1: Alice sends "hello". Tab 2: Bob's chat | Message appears instantly on Bob's screen |

### How to test with two users
1. Open **two browser tabs** at http://localhost:8081
2. Log in as **alice@test.com** in Tab 1
3. Log in as **bob@test.com** in Tab 2
4. Or use one browser + one phone via Expo Go

---

## 5. Database Verification

Use Supabase Studio (http://127.0.0.1:54323) or run queries directly:

```bash
# Check profiles exist
docker exec -i $(docker ps --filter "name=supabase_db" -q) \
  psql -U postgres -c "SELECT name, gender FROM public.profiles;"

# Check swipes recorded
docker exec -i $(docker ps --filter "name=supabase_db" -q) \
  psql -U postgres -c "SELECT swiper_id, swiped_id, action FROM public.swipes;"

# Check matches created
docker exec -i $(docker ps --filter "name=supabase_db" -q) \
  psql -U postgres -c "SELECT user_a, user_b, active FROM public.matches;"

# Check messages sent
docker exec -i $(docker ps --filter "name=supabase_db" -q) \
  psql -U postgres -c "SELECT sender_id, content, sent_at FROM public.messages;"

# Check blocks
docker exec -i $(docker ps --filter "name=supabase_db" -q) \
  psql -U postgres -c "SELECT blocker_id, blocked_id FROM public.blocks;"

# Check interests seeded
docker exec -i $(docker ps --filter "name=supabase_db" -q) \
  psql -U postgres -c "SELECT name FROM public.interests;"
```

---

## 6. Reset & Clean Up

```bash
# Reset database (wipes all data, re-applies migrations + seed)
supabase db reset

# Stop Supabase
supabase stop

# Stop Expo
# Press Ctrl+C in the terminal running Expo
```

---

## 7. Known Limitations

| Issue | Notes |
|-------|-------|
| No photo upload | Profile photos not implemented yet, shows initials instead |
| No push notifications | Real-time works in-app only, no background push |
| No distance/age filtering | Discovery shows all unswiped profiles ranked by shared interests |
| No typing indicators | Chat shows messages only, no "typing..." status |
| Events are static | Event data is hardcoded in the app, not from a database |
| Hiking events static | Hike data is hardcoded, Meetup webview requires internet |
| Node.js 20+ required | React Native 0.81+ and Supabase JS 2.100+ require Node >= 20 |
| Most community apps | Helpline, Women, Career, Stocks, etc. are Coming Soon placeholders |
