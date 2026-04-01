# BKB Community App - Use Cases & Architecture Diagrams

## 1. Use Case Diagram

```mermaid
graph TB
    subgraph "BKB Community App Use Cases"
        subgraph "Authentication"
            UC1[Sign Up]
            UC2[Log In / Log Out]
            UC3[Social Login - Google/Apple]
            UC4[Phone Verification]
        end

        subgraph "Profile Management"
            UC5[Create Profile]
            UC6[Upload Photos]
            UC7[Edit Bio & Details]
            UC8[Set Preferences - Age, Distance, Gender]
            UC9[Verify Profile - Selfie Check]
            UC10[Manage Prompts & Icebreakers]
        end

        subgraph "Discovery & Matching"
            UC11[Browse Profiles - Swipe]
            UC12[Like / Super Like]
            UC13[Dislike / Pass]
            UC14[Rewind Last Action]
            UC15[View Who Liked You]
            UC16[Receive Match Notification]
            UC17[Explore by Filters]
        end

        subgraph "Messaging"
            UC18[Send Text Message]
            UC19[Send GIF / Emoji]
            UC20[Send Voice Note]
            UC21[Send Photo in Chat]
            UC22[Video Call]
            UC23[Icebreaker / First Move]
        end

        subgraph "Safety & Moderation"
            UC24[Report User]
            UC25[Block User]
            UC26[Unmatch]
            UC27[Hide Profile]
            UC28[Share Date Details - Safety Check-in]
        end

        subgraph "Premium Features"
            UC29[Subscribe to Premium]
            UC30[Boost Profile]
            UC31[See Who Liked You]
            UC32[Unlimited Likes]
            UC33[Passport - Change Location]
        end

        subgraph "Settings"
            UC34[Push Notification Preferences]
            UC35[Privacy Settings]
            UC36[Delete Account]
            UC37[Manage Subscription]
        end
    end

    User((User)) --> UC1 & UC2 & UC3
    User --> UC5 & UC6 & UC7 & UC8 & UC9 & UC10
    User --> UC11 & UC12 & UC13 & UC14 & UC15 & UC17
    User --> UC18 & UC19 & UC20 & UC21 & UC22 & UC23
    User --> UC24 & UC25 & UC26 & UC27 & UC28
    User --> UC29 & UC30 & UC31 & UC32 & UC33
    User --> UC34 & UC35 & UC36 & UC37

    Admin((Admin)) --> UC24
    Admin --> ModReview[Review Reports]
    Admin --> ModBan[Ban Users]
    Admin --> ModContent[Content Moderation]

    System((System)) --> UC16
    System --> MatchEngine[Run Matching Algorithm]
    System --> FraudDetect[Fraud Detection]
```

---

## 2. Profile Matching Flow

```mermaid
flowchart TD
    A[User Opens App] --> B[Fetch Discovery Queue]
    B --> C{Location Services Enabled?}
    C -- Yes --> D[Get Current Location]
    C -- No --> D2[Use Last Known Location]
    D --> E[Query Candidate Profiles]
    D2 --> E

    E --> F[Apply Filters]
    F --> F1[Age Range Filter]
    F --> F2[Distance Filter]
    F --> F3[Gender Preference Filter]
    F --> F4[Already Seen Filter]
    F --> F5[Blocked Users Filter]

    F1 & F2 & F3 & F4 & F5 --> G[Matching Algorithm Scoring]

    G --> G1[Compatibility Score]
    G --> G2[Activity Score - Recent Active]
    G --> G3[Profile Completeness Score]
    G --> G4[Common Interests Score]
    G --> G5[ELO / Desirability Score]

    G1 & G2 & G3 & G4 & G5 --> H[Rank & Sort Candidates]

    H --> I[Present Profile Card to User]
    I --> J{User Action}

    J -- Swipe Right / Like --> K[Record Like]
    J -- Swipe Left / Pass --> L[Record Pass]
    J -- Super Like --> M[Record Super Like]

    K & M --> N{Did Other User Already Like?}
    N -- Yes --> O[Create Match!]
    N -- No --> P[Store in Pending Likes]

    O --> Q[Send Match Notification to Both Users]
    Q --> R[Open Chat Window]

    L --> S[Next Profile Card]
    P --> S
    R --> S

    S --> I
```

---

## 3. Matching Algorithm Detail

```mermaid
flowchart LR
    subgraph "Input Signals"
        S1[User Preferences]
        S2[Location & Distance]
        S3[Shared Interests]
        S4[Behavioral Data]
        S5[Profile Quality]
    end

    subgraph "Scoring Engine"
        SE1[Preference Match<br/>Weight: 30%]
        SE2[Proximity Score<br/>Weight: 20%]
        SE3[Interest Overlap<br/>Weight: 20%]
        SE4[Engagement Score<br/>Weight: 15%]
        SE5[Profile Score<br/>Weight: 15%]
    end

    subgraph "Output"
        OUT1[Composite Match Score<br/>0 - 100]
        OUT2[Ranked Profile Queue]
    end

    S1 --> SE1
    S2 --> SE2
    S3 --> SE3
    S4 --> SE4
    S5 --> SE5

    SE1 & SE2 & SE3 & SE4 & SE5 --> OUT1 --> OUT2
```

---

## 4. System Architecture Overview

```mermaid
flowchart TB
    subgraph "Client Layer"
        iOS[iOS App]
        Android[Android App]
        Web[Web App]
    end

    subgraph "API Gateway"
        GW[API Gateway / Load Balancer]
    end

    subgraph "Core Services"
        AuthSvc[Auth Service]
        ProfileSvc[Profile Service]
        MatchSvc[Matching Service]
        ChatSvc[Chat Service]
        NotifSvc[Notification Service]
        ModerationSvc[Moderation Service]
        PaymentSvc[Payment Service]
        LocationSvc[Location Service]
    end

    subgraph "Data Layer"
        UserDB[(User DB<br/>PostgreSQL)]
        MatchDB[(Match DB<br/>Redis + PostgreSQL)]
        ChatDB[(Chat DB<br/>Cassandra)]
        MediaStore[(Media Store<br/>S3 / CDN)]
        SearchIndex[(Search Index<br/>Elasticsearch)]
        Cache[(Cache<br/>Redis)]
        GeoIndex[(Geo Index<br/>PostGIS / Redis Geo)]
    end

    subgraph "External Services"
        Push[Push Notifications<br/>APNs / FCM]
        SMS[SMS Gateway<br/>Twilio]
        Payment[Payment Provider<br/>Stripe]
        ML[ML Pipeline<br/>Matching & Moderation]
        CDN[CDN<br/>CloudFront]
    end

    iOS & Android & Web --> GW
    GW --> AuthSvc & ProfileSvc & MatchSvc & ChatSvc & NotifSvc & ModerationSvc & PaymentSvc & LocationSvc

    AuthSvc --> UserDB & Cache
    ProfileSvc --> UserDB & MediaStore & SearchIndex
    MatchSvc --> MatchDB & GeoIndex & ML
    ChatSvc --> ChatDB & Cache
    NotifSvc --> Push & SMS
    ModerationSvc --> ML & UserDB
    PaymentSvc --> Payment & UserDB
    LocationSvc --> GeoIndex & Cache

    MediaStore --> CDN
```

---

## 5. User Journey - Swipe to Date

```mermaid
sequenceDiagram
    actor User A
    participant App
    participant API
    participant MatchEngine
    participant NotifService
    actor User B

    User A->>App: Open app & browse
    App->>API: GET /discovery/feed
    API->>MatchEngine: Get ranked candidates
    MatchEngine-->>API: Sorted profile list
    API-->>App: Profile cards

    User A->>App: Swipe right on User B
    App->>API: POST /likes {target: UserB}
    API->>MatchEngine: Check mutual like

    alt Mutual Like Exists
        MatchEngine-->>API: Match found!
        API->>NotifService: Notify both users
        NotifService-->>User A: "It's a Match!"
        NotifService-->>User B: "It's a Match!"
        API-->>App: Match confirmation + chat created

        User A->>App: Send first message
        App->>API: POST /chat/{matchId}/messages
        API-->>User B: Push notification: new message
    else No Mutual Like Yet
        MatchEngine-->>API: Like recorded
        API-->>App: Like confirmed
    end
```

---

## 6. Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        uuid id PK
        string email
        string phone
        string password_hash
        boolean is_verified
        boolean is_premium
        timestamp created_at
        timestamp last_active
    }

    PROFILE {
        uuid id PK
        uuid user_id FK
        string display_name
        date date_of_birth
        string gender
        string bio
        string occupation
        string education
        float latitude
        float longitude
        int max_distance_km
        int age_min_pref
        int age_max_pref
        string gender_pref
    }

    PHOTO {
        uuid id PK
        uuid profile_id FK
        string url
        int position
        boolean is_primary
        timestamp uploaded_at
    }

    INTEREST {
        uuid id PK
        string name
        string category
    }

    SWIPE {
        uuid id PK
        uuid swiper_id FK
        uuid swiped_id FK
        string action "like, pass, super_like"
        timestamp created_at
    }

    MATCH {
        uuid id PK
        uuid user_a_id FK
        uuid user_b_id FK
        timestamp matched_at
        boolean is_active
    }

    MESSAGE {
        uuid id PK
        uuid match_id FK
        uuid sender_id FK
        string content
        string message_type "text, image, gif, voice"
        timestamp sent_at
        boolean is_read
    }

    REPORT {
        uuid id PK
        uuid reporter_id FK
        uuid reported_id FK
        string reason
        string status "pending, reviewed, resolved"
        timestamp created_at
    }

    SUBSCRIPTION {
        uuid id PK
        uuid user_id FK
        string plan "free, gold, platinum"
        timestamp starts_at
        timestamp expires_at
        boolean auto_renew
    }

    USER ||--|| PROFILE : has
    PROFILE ||--|{ PHOTO : contains
    PROFILE }|--|{ INTEREST : tagged_with
    USER ||--|{ SWIPE : makes
    USER ||--|{ MATCH : participates_in
    MATCH ||--|{ MESSAGE : contains
    USER ||--|{ REPORT : files
    USER ||--o| SUBSCRIPTION : subscribes
```

---

## 7. State Diagram - User Relationship Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Strangers

    Strangers --> LikedByA: User A likes User B
    Strangers --> LikedByB: User B likes User A
    Strangers --> PassedByA: User A passes User B

    LikedByA --> Matched: User B likes User A back
    LikedByA --> PassedByB: User B passes User A

    LikedByB --> Matched: User A likes User B back
    LikedByB --> PassedByA: User A passes User B

    Matched --> Chatting: First message sent
    Matched --> Unmatched: Either user unmatches

    Chatting --> DateScheduled: Users plan a date
    Chatting --> Unmatched: Either user unmatches
    Chatting --> Blocked: User reports/blocks

    DateScheduled --> Chatting: Continue chatting
    DateScheduled --> Unmatched: Either user unmatches

    Unmatched --> [*]
    Blocked --> [*]
    PassedByA --> [*]
    PassedByB --> [*]
```
