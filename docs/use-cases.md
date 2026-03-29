# Dating App - Use Cases

## Use Case Diagram

```mermaid
graph LR
    User((User))

    User --> UC1[Sign Up / Log In]
    User --> UC2[Create Profile]
    User --> UC3[Browse Profiles]
    User --> UC4[Like / Pass]
    User --> UC5[Match]
    User --> UC6[Chat]
    User --> UC7[Report / Block]
    User --> UC8[Edit Profile]
    User --> UC9[Manage Settings]
```

---

## Use Case Details

### 1. Sign Up / Log In
- Register with email or phone number
- Log in with credentials
- Reset password

### 2. Create Profile
- Add name, age, gender
- Write a short bio
- Upload up to 6 photos
- Select interests from a list

### 3. Browse Profiles
- View one profile at a time (card stack)
- Filter by age range, distance, gender

### 4. Like / Pass
- Swipe right to like
- Swipe left to pass

### 5. Match
- Both users like each other = match
- Both get a notification
- Chat is unlocked

### 6. Chat
- Send text messages to matches
- Send photos in chat
- See online/last active status

### 7. Report / Block
- Report inappropriate users
- Block a user to prevent contact
- Unmatch to remove a connection

### 8. Edit Profile
- Update photos, bio, interests
- Change preferences (age, distance, gender)

### 9. Manage Settings
- Notification preferences
- Privacy settings (hide profile)
- Delete account

---

## User Flow

```mermaid
flowchart TD
    A[Open App] --> B{Has Account?}
    B -- No --> C[Sign Up]
    B -- Yes --> D[Log In]
    C --> E[Create Profile]
    D --> F[Browse Profiles]
    E --> F

    F --> G{Swipe}
    G -- Like --> H{Mutual Like?}
    G -- Pass --> F

    H -- Yes --> I[Match!]
    H -- No --> F

    I --> J[Chat]
    J --> K[Plan a Date]
```
