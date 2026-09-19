# Application Flow & Architecture Workflows — Orphia

This document details the user journeys, state machines, and system execution sequences across the Orphia web application.

---

## 1. Application Navigation Map

```mermaid
graph TD
    Landing["Landing Page (/)"] --> AuthCheck{"Authenticated?"}
    
    AuthCheck -- No --> SignInModal["Clerk Sign In / Sign Up"]
    SignInModal --> AuthCheck
    
    AuthCheck -- Yes --> MainApp["Main Application Dashboard"]
    
    MainApp --> PromptGen["Create with Prompt (/create/prompt)"]
    MainApp --> SampleGen["Upload Sample (/create/sample)"]
    MainApp --> AboutMe["About Me (/about)"]
    MainApp --> ModelExpl["Our Model (/model)"]
    MainApp --> Contribute["Contribute & Feedback (/contribute)"]
    
    MainApp --> FAQ["FAQ (/faq)"]
    MainApp --> Privacy["Privacy Policy (/privacy-policy)"]
    MainApp --> Terms["Terms of Service (/terms-of-service)"]

    TeamLegacy["Legacy /team route"] -->|Redirect 307/308| AboutMe
```

---

## 2. Text-to-Music Generation Flow

The diagram below details the entire generation lifecycle from user input to binary audio playback:

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant Client as Next.js React 19 UI
    participant API as /api/generate
    participant HF as Hugging Face Endpoint
    participant Synth as Local Audio Synth (/lib/audio-synth.ts)
    participant Player as HTML5 Audio Player

    User->>Client: Enters prompt & adjusts sliders (Duration, Creativity, Complexity)
    User->>Client: Clicks "Generate Music"
    Client->>Client: Validates prompt (length > 0)
    Client->>Client: Sets isGenerating = true, clears previous audio URL
    Client->>API: POST /api/generate (JSON payload)
    
    alt Hugging Face Endpoint Configured & Available
        API->>HF: POST Inference Request (inputs: prompt)
        alt Inference Success
            HF-->>API: 200 OK (WAV binary stream)
        else Inference Fails or Times Out
            HF-->>API: Error / Timeout
            API->>Synth: generateProceduralMusic(params)
            Synth-->>API: 16-bit PCM WAV ArrayBuffer
        end
    else Default / Fast Mode
        API->>Synth: generateProceduralMusic(params)
        Synth-->>API: 16-bit PCM WAV ArrayBuffer
    end

    API-->>Client: 200 OK (audio/wav Binary Response)
    Client->>Client: Converts response to Blob & URL.createObjectURL(blob)
    Client->>Client: Sets isGenerating = false, generatedMusic = true
    Client->>Player: Loads audio object URL
    Player-->>User: Visual waveform & Play/Pause controls active
    User->>Client: Clicks "Download Track"
    Client-->>User: Downloads "orphia-generated-[timestamp].wav"
```

---

## 3. Authentication & Authorization Flow

Orphia integrates **Clerk** for user identity management and **Convex** for real-time backend services:

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Clerk as Clerk Auth
    participant Provider as ConvexProviderWithClerk
    participant Convex as Convex Backend
    participant Route as Protected Route

    User->>Route: Navigates to /create/prompt
    Route->>Provider: useConvexAuth()
    alt Session is Loading
        Provider-->>Route: isLoading = true
        Route-->>User: Display centered Spinner component
    else User is Unauthenticated
        Provider-->>Route: isAuthenticated = false
        Route-->>User: redirect("/") + Show Sonner toast notice
    else User is Authenticated
        Provider->>Clerk: Retrieve JWT Token
        Clerk-->>Provider: Valid JWT Token
        Provider->>Convex: Authenticate WebSocket connection with Bearer JWT
        Convex-->>Provider: Connection Authenticated
        Provider-->>Route: isAuthenticated = true, isLoading = false
        Route-->>User: Render full interactive application
    end
```

---

## 4. Real-Time Feedback & Bug Report Pipeline

When users submit bugs or suggestions on `/contribute`, the report is routed instantly to the developer's Telegram account:

```mermaid
sequenceDiagram
    autonumber
    actor Contributor as User / Contributor
    participant Page as /contribute Page
    participant API as /api/feedback Route Handler
    participant Telegram as Telegram Bot API
    actor Dev as Gulamgous Khan (Admin)

    Contributor->>Page: Selects type ("bug" or "feature")
    Contributor->>Page: Fills Title, Description, and Contact info
    Contributor->>Page: Clicks "Submit Feedback"
    Page->>API: POST /api/feedback (JSON payload)
    API->>API: Validates fields & formats Markdown message
    API->>Telegram: POST https://api.telegram.org/bot<TOKEN>/sendMessage
    Telegram-->>Dev: Instant Push Notification with report details
    Telegram-->>API: 200 OK (Message dispatched)
    API-->>Page: 200 OK { success: true }
    Page-->>Contributor: Show success toast notification
```

---

## 5. UI State Transition Matrix (Generation Page)

| State | `isGenerating` | `generatedMusic` | `audioURL` | UI Elements Visible |
| :--- | :--- | :--- | :--- | :--- |
| **Idle** | `false` | `false` | `""` | Prompt textarea enabled, Sliders enabled, "Generate" button active. |
| **Generating** | `true` | `false` | `""` | Inputs disabled, "Generating..." button with spinner, loader overlay. |
| **Completed** | `false` | `true` | `"blob:..."` | Play/Pause audio controls, progress bar, "Download WAV" button active. |
| **Error** | `false` | `false` | `""` | Sonner error toast displayed, inputs re-enabled for revision. |
