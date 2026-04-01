# BKB Community App - Minimal Requirements for Publishing & Hosting

## 1. App (Expo / React Native)

### To Develop
- Node.js (v20+) — required by React Native 0.81+ and Supabase JS 2.100+
- Expo CLI (`npx expo start`)
- Expo Go app on your phone (for testing)
- Code editor (VS Code)
- Docker Desktop (for local Supabase)

### To Publish on App Store (iOS)
| Requirement | Details | Cost |
|-------------|---------|------|
| Apple Developer Account | Required for App Store submission | $99/year |
| Mac | Required for EAS Build iOS signing | Any Mac or use EAS cloud |
| App Store listing | App name, description, screenshots, privacy policy | Free |
| Privacy Policy URL | Legally required — can host on a free site | Free |
| App Review | Apple reviews before publishing (~1-3 days) | Free |

### To Publish on Play Store (Android)
| Requirement | Details | Cost |
|-------------|---------|------|
| Google Play Developer Account | Required for Play Store submission | $25 one-time |
| App Store listing | App name, description, screenshots, content rating | Free |
| Privacy Policy URL | Required by Google | Free |
| App Review | Google reviews before publishing (~1-2 days) | Free |

### Build & Deploy
| Tool | Purpose | Cost |
|------|---------|------|
| EAS Build | Builds iOS and Android binaries in the cloud | Free tier: 30 builds/month |
| EAS Submit | Submits to App Store and Play Store | Free |
| EAS Update | Over-the-air updates (bug fixes without store review) | Free tier: 1000 updates/month |

---

## 2. Backend (Supabase)

### To Set Up
| Requirement | Details | Cost |
|-------------|---------|------|
| Supabase account | Sign up at supabase.com | Free |
| Project creation | One click — gives you DB, Auth, Storage, API | Free |
| PostGIS extension | Enable in Supabase dashboard for location queries | Free (included) |

### Free Tier Covers
- 500 MB database
- 1 GB storage
- 5 GB bandwidth/month
- 200 concurrent Realtime connections
- 500K Edge Function invocations/month
- Unlimited API requests (rate-limited)

### When to Upgrade
| Trigger | Action | Cost |
|---------|--------|------|
| Storage > 1 GB (photos) | Upgrade to Pro | $25/month |
| Bandwidth > 5 GB | Upgrade to Pro | $25/month |
| > 200 concurrent users online | Upgrade to Pro | $25/month |

---

## 3. Domain & Hosting

| Requirement | Purpose | Cost |
|-------------|---------|------|
| Domain name | For privacy policy page, deep links, email | ~$12/year |
| Privacy policy page | Host on GitHub Pages, Vercel, or Netlify | Free |
| Deep link config | `yourapp.com/.well-known/` for app links | Free (same host) |

---

## 4. Third-Party Services

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Expo EAS | Build, submit, update | 30 builds/month |
| Supabase | Backend, DB, Auth, Storage | Generous (see above) |
| Firebase Cloud Messaging | Android push notifications | Free |
| Apple Push Notification Service | iOS push notifications | Free (with developer account) |

### Optional (not needed for launch)
| Service | Purpose | Cost |
|---------|---------|------|
| Sentry | Error tracking | Free tier |
| Analytics (PostHog / Mixpanel) | Usage tracking | Free tier |
| Image moderation API | Content safety | Pay per use |

---

## 5. Total Cost to Launch

| Item | Cost |
|------|------|
| Apple Developer Account | $99/year |
| Google Play Developer Account | $25 one-time |
| Domain name | ~$12/year |
| Supabase (Free tier) | $0 |
| Expo EAS (Free tier) | $0 |
| Push notifications | $0 |
| **Total to launch** | **~$136 first year** |
| **Monthly ongoing** | **$0 (until you outgrow free tiers)** |

---

## 6. Checklist Before Publishing

### App Ready
- [x] Landing page with community hub cards
- [x] Community navigation bar across all screens
- [x] Auth flow works (sign up, log in, email confirmation, log out)
- [x] Profile creation (name, DOB, gender, bio, interests)
- [x] Interest-based discovery with shared interests ranking
- [x] Swipe / like / pass functionality
- [x] Mutual-like matching with notification
- [x] Real-time chat with Supabase Realtime
- [x] Report / block / unmatch
- [x] Events page with tag filtering and Meetup integration
- [x] Hiking page with events and embedded Meetup webview
- [ ] Profile photo upload
- [ ] Push notifications

### Store Requirements
- [ ] App icon (1024x1024)
- [ ] Screenshots for App Store (6.7" and 5.5" iPhone)
- [ ] Screenshots for Play Store (phone)
- [ ] App description and keywords
- [ ] Privacy policy URL live
- [ ] Age rating questionnaire completed
- [ ] Content rating (Play Store)

### Supabase Ready
- [ ] Database tables created with RLS policies
- [ ] Auth providers configured (email, phone, social)
- [ ] Storage buckets with upload policies
- [ ] Edge Functions deployed (matching, notifications)
- [ ] PostGIS enabled for location queries

### Accounts Ready
- [ ] Apple Developer Account ($99/year)
- [ ] Google Play Developer Account ($25)
- [ ] Supabase project created
- [ ] Domain registered
- [ ] Privacy policy page hosted
