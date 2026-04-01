# BKB Community App - Use Cases

## Community Hub

The app serves as a hub for multiple community features. The landing page displays all sub-apps with a horizontal CommunityNav bar visible across all screens.

| Feature | Status | Route |
|---------|--------|-------|
| BKB Events | Active | `/events` |
| BKB Dating | Active | `/(auth)/login` → `/(tabs)/` |
| BKB Hiking | Active | `/hiking` |
| BKB Helpline | Coming Soon | — |
| BKB Women | Coming Soon | — |
| BKB Career | Coming Soon | — |
| BKB Stocks | Coming Soon | — |
| BKB Sports | Coming Soon | — |
| BKB Health | Coming Soon | — |
| BKB Divorce Support | Coming Soon | — |
| BKB Forums | Coming Soon | — |
| BKB Marketplace | Coming Soon | — |

---

## Use Case Diagram

```mermaid
graph LR
    User((User))

    subgraph "Community Hub"
        UC0[Landing Page]
        UCN[Community Nav]
    end

    subgraph "Events"
        UCE1[Browse Events]
        UCE2[Filter by Tag]
        UCE3[View on Meetup]
    end

    subgraph "Hiking"
        UCH1[Browse Hikes]
        UCH2[View Meetup Page]
    end

    subgraph "Dating"
        UC1[Sign Up / Log In]
        UC2[Create Profile]
        UC3[Browse Profiles]
        UC4[Like / Pass]
        UC5[Match]
        UC6[Chat]
        UC7[Report / Block]
        UC8[Edit Profile]
        UC9[Manage Settings]
    end

    User --> UC0
    UC0 --> UCE1 & UC1 & UCH1
    UCN --> UC0

    User --> UCE1 & UCE2 & UCE3
    User --> UCH1 & UCH2
    User --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7 & UC8 & UC9
```

---

## Use Case Details

### Community Hub

#### Landing Page
- View all community sub-apps as cards
- Tap active apps to navigate (Events, Dating, Hiking)
- Coming Soon badge on unreleased features

#### Community Navigation Bar
- Persistent horizontal nav at bottom of all screens
- Highlights the currently active sub-app
- Quick switch between Events, Dating, Hiking

### Events

#### Browse Events
- View 20+ BKB community events with title, date, time, location
- See attendee count, capacity, fee, and description
- Event types: Social, Family, Nightlife, Adventure, Cultural, Online, Hiking, Food

#### Filter Events by Tag
- Filter events by category tags
- "All" filter shows everything

#### View on Meetup
- Link to the BKB Meetup group page
- Group info: member count, rating, location (Fremont, CA)

### Hiking

#### Browse Hikes
- View upcoming and past hiking events
- See date, time, location, attendees, description
- Upcoming vs past hike distinction (past shown with reduced opacity)

#### View Meetup Page
- Embedded Meetup webview for the BKB hiking events page

### Dating

#### 1. Sign Up / Log In
- Register with email
- Log in with credentials
- Email confirmation flow

#### 2. Create Profile
- Add name, age, gender
- Write a short bio
- Select interests from a list

#### 3. Browse Profiles
- View one profile at a time (card stack)
- Profiles ranked by shared interests

#### 4. Like / Pass
- Tap heart to like
- Tap X to pass

#### 5. Match
- Both users like each other = match
- Both get a notification
- Chat is unlocked

#### 6. Chat
- Send text messages to matches
- Real-time message delivery via Supabase Realtime
- See online/last active status

#### 7. Report / Block
- Report inappropriate users
- Block a user to prevent contact
- Unmatch to remove a connection

#### 8. Edit Profile
- Update bio, interests
- Change preferences (age, distance, gender)

#### 9. Manage Settings
- Notification preferences
- Privacy settings (hide profile)
- Delete account

---

## User Flow

```mermaid
flowchart TD
    A[Open App] --> L[Landing Page]
    L --> E[Events]
    L --> H[Hiking]
    L --> B{Has Account?}

    B -- No --> C[Sign Up]
    B -- Yes --> D[Log In]
    C --> CF[Confirm Email]
    CF --> D
    D --> F[Browse Profiles]
    C --> EP[Create Profile]
    EP --> F

    F --> G{Swipe}
    G -- Like --> MU{Mutual Like?}
    G -- Pass --> F

    MU -- Yes --> I[Match!]
    MU -- No --> F

    I --> J[Chat]

    E --> EF[Filter by Tag]
    E --> EM[View on Meetup]

    H --> HE[Browse Hikes]
    H --> HM[Meetup Webview]
```
