# Technical Requirements Document (TRD) — Orphia

**Platform Architecture:** Full-Stack Reactive Web Application  
**Primary Language:** TypeScript (v5.x)  
**Framework:** Next.js 15 (App Router, Server Components & Route Handlers)  
**UI Engine:** React 19, Tailwind CSS 3.4, Framer Motion  
**Backend:** Convex (Real-Time Reactive Database)  
**Identity & Auth:** Clerk  

---

## 1. System Topology & Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                            │
│  - React 19 Interactive Components                                     │
│  - Framer Motion Micro-interactions                                    │
│  - HTML5 Audio Player & Blob Stream Handlers                           │
│  - Clerk Client Provider + Convex Auth Bridge                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP/REST & WebSocket
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 15 RUNTIME (VERCEL)                     │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │   App Router Pages    │  │       Server Route Handlers            │ │
│  │   - /create/prompt    │  │       - POST /api/generate             │ │
│  │   - /create/sample    │  │       - POST /api/sample               │ │
│  │   - /about            │  │       - POST /api/feedback             │ │
│  │   - /model, /faq      │  │                                        │ │
│  └───────────────────────┘  └───────────────────┬────────────────────┘ │
└─────────────────────────────────────────────────┼──────────────────────┘
                                                  │
                ┌─────────────────────────────────┼────────────────────────┐
                ▼                                 ▼                        ▼
┌───────────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐
│      CONVEX REAL-TIME DB      │ │  PROCEDURAL SYNTHESIS  │ │ HUGGING FACE INFERENCE │
│  - Reactive sync via WS       │ │  - /lib/audio-synth.ts │ │ - MusicGen Small/Large │
│  - User data & messages       │ │  - 44.1kHz 16-bit PCM  │ │ - Dedicated Endpoint   │
│  - Query/Mutation execution   │ │  - Zero external deps  │ │ - Fallback gracefully  │
└───────────────────────────────┘ └────────────────────────┘ └────────────────────────┘
```

---

## 2. Technology Stack & Specifications

### 2.1. Frontend Tier
- **Framework:** Next.js 15.5+ (App Router architecture).
- **Core Runtime:** React 19 with Server & Client components (`"use client"` boundary isolation).
- **Styling & Design System:** Tailwind CSS v3.4+ with custom HSL token mapping, `tailwindcss-animate`, and Radix UI primitives.
- **Micro-Animations:** Framer Motion (`motion/react`) for layout transitions, hero hover effects, and animated gradients.
- **Toast Notifications:** Sonner.

### 2.2. Audio Engineering Engine (`/lib/audio-synth.ts`)
Orphia utilizes a custom procedural harmonic synthesis engine designed for sub-second, zero-dependency audio generation:
- **Audio Output Format:** Linear PCM, 16-bit, Single/Dual Channel, 44,100 Hz sampling rate.
- **Container Structure:** Standard Resource Interchange File Format (RIFF) WAV container.
  - Header: 44 bytes (`RIFF`, chunk size, `WAVE`, `fmt `, subchunk size, audio format `1`, channels, byte rate, block align, bits per sample, `data`).
- **Synthesis Techniques:**
  - Chord Progression Synthesizer: Maps musical mood keywords (e.g., "chill", "epic", "cyberpunk", "happy", "dark") to harmonic scales (Minor, Major, Dorian, Pentatonic).
  - Multi-oscillator synthesis: Sine, Triangle, and Sawtooth waveforms combined with low-pass filters and envelope modulation (ADSR).
  - Algorithmic Percussion: Noise bursts for snares/hi-hats and frequency-swept sine generators for kick drums.

### 2.3. External AI Model Integration
- **Hugging Face Inference API / Dedicated Endpoint:**
  - Model: `facebook/musicgen-small` / `facebook/musicgen-medium`.
  - Conditioned by text prompt.
  - If the dedicated endpoint (`HF_ENDPOINT_URL`) is configured and healthy, the route handler streams high-fidelity neural audio.
  - If the external API times out or throws an error, the system automatically falls back to `generateProceduralMusic` with zero disruption to the client.

### 2.4. Backend & Real-time State (Convex)
- **Convex Client Provider:** Configured in `components/provider/convex-client-provider.tsx`.
- **Clerk Integration:** Validates session JWTs with `ConvexProviderWithClerk`.
- **Reactive Queries:** Queries update the UI instantly over persistent WebSockets.

---

## 3. API Route Specifications

### 3.1. `POST /api/generate`
Generates a new audio track based on textual parameters.

- **Request Body:**
  ```json
  {
    "prompt": "Retro synthwave 80s neon highway drive",
    "duration": 30,
    "creativity": 0.6,
    "complexity": 0.4
  }
  ```
- **Validation Rules:**
  - `prompt`: String, non-empty, max 500 characters.
  - `duration`: Integer, clamped between 5 and 60 seconds.
  - `creativity`: Float between 0.0 and 1.0.
  - `complexity`: Float between 0.0 and 1.0.
- **Success Response:**
  - **Status:** `200 OK`
  - **Headers:**
    - `Content-Type: audio/wav`
    - `Content-Disposition: attachment; filename="orphia-generated-[timestamp].wav"`
    - `Cache-Control: no-store, no-cache, must-revalidate`
  - **Body:** Binary WAV audio buffer.
- **Error Response:**
  - **Status:** `400 Bad Request` or `500 Internal Server Error`
  - **Body:** `{ "error": "Reason", "details": "Specific failure message" }`

### 3.2. `POST /api/sample`
Accepts an uploaded audio sample, processes structural characteristics, and returns conditioned musical extensions.

### 3.3. `POST /api/feedback`
Dispatches bug reports and user feature requests directly to Telegram.

- **Request Body:**
  ```json
  {
    "type": "bug" | "feature",
    "title": "Audio playback issue on iOS Safari",
    "description": "Audio buffer fails to decode when low power mode is active.",
    "userEmail": "creator@example.com"
  }
  ```
- **Execution:** Dispatches formatted markdown payload to Telegram Bot API:
  `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/sendMessage`

---

## 4. Environment Variables Specification

| Variable | Required | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL for client synchronization |
| `CONVEX_DEPLOYMENT` | Yes | Convex cloud deployment identifier |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk client publishable authentication key |
| `CLERK_SECRET_KEY` | Yes | Clerk server secret for backend session verification |
| `HF_API_TOKEN` / `HF_TOKEN` | Optional | Hugging Face user access token for neural generation |
| `HF_ENDPOINT_URL` | Optional | Custom dedicated Hugging Face inference endpoint |
| `TELEGRAM_BOT_TOKEN` | Optional | Telegram Bot API token for dispatching feedback |
| `TELEGRAM_CHAT_ID` | Optional | Target Telegram chat ID for admin alerts |

---

## 5. Security & Authentication Model

1. **Route Protection:** Handled at client layout and page levels using `useConvexAuth()`. Unauthenticated users are redirected to `/` or prompted with a login modal.
2. **Input Sanitization:** All textual prompts are trimmed, type-checked, and length-capped in route handlers prior to synthesis.
3. **Audio Stream Security:** Binary audio streams are generated on-demand with `Cache-Control: no-store` headers to prevent cross-user caching.
