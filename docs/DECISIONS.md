# Architecture Decision Records (ADR) — Orphia

This document records the foundational architectural decisions made in the engineering and product design of Orphia, detailing the context, options considered, decisions taken, and resulting consequences.

---

## Index of Decisions

- [ADR-001: Next.js 15 App Router & React 19](#adr-001-nextjs-15-app-router--react-19)
- [ADR-002: Convex for Real-Time Reactive Backend](#adr-002-convex-for-real-time-reactive-backend)
- [ADR-003: Clerk for Authentication & User Identity](#adr-003-clerk-for-authentication--user-identity)
- [ADR-004: Dual-Tier Audio Generation Engine (Cloud Neural + Local Procedural Fallback)](#adr-004-dual-tier-audio-generation-engine)
- [ADR-005: Telegram Bot Webhook for Instant Feedback Alerts](#adr-005-telegram-bot-webhook-for-instant-feedback-alerts)
- [ADR-006: Transition from "Our Team" to "About Me" Solo Creator Profile](#adr-006-transition-from-our-team-to-about-me)
- [ADR-007: HSL Triad Color Palette & Glassmorphism Aesthetic](#adr-007-hsl-triad-color-palette--glassmorphism-aesthetic)
- [ADR-008: In-Memory RIFF WAV Binary Encoding](#adr-008-in-memory-riff-wav-binary-encoding)

---

### ADR-001: Next.js 15 App Router & React 19
- **Status:** Accepted
- **Context:** The application requires fast initial page load, modern SEO metadata generation (`sitemap.ts`, `robots.ts`), server route handlers for binary audio streaming, and high-performance client interactivity.
- **Decision:** Use Next.js 15 with the App Router architecture and React 19.
- **Consequences:**
  - Positive: First-class server components, built-in route handlers (`/api/generate`), automatic bundle optimization, and seamless deployment on Vercel.
  - Negative: Must strictly maintain `"use client"` boundaries for stateful audio and animation hooks.

---

### ADR-002: Convex for Real-Time Reactive Backend
- **Status:** Accepted
- **Context:** Traditional relational databases require separate ORMs, polling mechanisms, or external WebSocket setups for real-time state synchronization.
- **Decision:** Implement Convex as the primary backend database.
- **Consequences:**
  - Positive: Reactive queries update the UI automatically without manual cache invalidation; automatic TypeScript end-to-end type safety; zero server maintenance.
  - Negative: Vendor lock-in to Convex serverless infrastructure.

---

### ADR-003: Clerk for Authentication & User Identity
- **Status:** Accepted
- **Context:** User accounts are needed to gate access to the generation suite and persist user audio tracks securely.
- **Decision:** Use Clerk combined with the `ConvexProviderWithClerk` adapter.
- **Consequences:**
  - Positive: Turnkey login UI, social OAuth support, passwordless flows, and zero credential management risks.
  - Negative: External authentication dependency.

---

### ADR-004: Dual-Tier Audio Generation Engine
- **Status:** Accepted
- **Context:** External AI model inference (e.g., Hugging Face MusicGen) can experience cold starts, rate limits, or transient 503 gateway outages. A pure cloud dependency would lead to frequent failed user requests.
- **Decision:** Implement a dual-tier generation pipeline:
  1. Primary tier: Dedicated Hugging Face MusicGen endpoint if configured and available.
  2. Fallback tier: Custom in-memory procedural harmonic synthesis engine (`lib/audio-synth.ts`).
- **Consequences:**
  - Positive: **100% uptime guarantee.** Audio is always returned within 1–2 seconds, regardless of cloud API status or network congestion.
  - Negative: Procedural audio synthesis is algorithmic rather than deep-learning based when falling back.

---

### ADR-005: Telegram Bot Webhook for Instant Feedback Alerts
- **Status:** Accepted
- **Context:** Gulamgous Khan needs instant awareness when users report bugs or suggest features on `/contribute`, without setting up costly third-party ticketing platforms (e.g., Zendesk, Jira).
- **Decision:** Dispatch submissions via Telegram Bot API directly to the developer's private Telegram chat.
- **Consequences:**
  - Positive: Sub-second push notification delivery to the developer's mobile device with zero infrastructure cost.
  - Negative: Requires Telegram bot token and chat ID secret configuration.

---

### ADR-006: Transition from "Our Team" to "About Me"
- **Status:** Accepted
- **Context:** Orphia is conceived, architected, and built entirely by solo engineer **Gulamgous Khan**. Calling the creator page "Our Team" and `/team` presented an inaccurate multi-person facade and diminished personal creator authority.
- **Decision:**
  - Replace "Our Team" with "About Me" across all navigation bars, mobile drawers, and footers.
  - Update route to `/about`.
  - Implement an automatic redirect in `/team` to `/about` to ensure backwards compatibility with existing bookmarks and links.
- **Consequences:**
  - Positive: Authentic personal branding, direct credibility for the engineer's dual full-stack and AI capabilities, and a genuine connection with visitors and recruiters.
  - Negative: Slight URL migration handled seamlessly by the redirect.

---

### ADR-007: HSL Triad Color Palette & Glassmorphism Aesthetic
- **Status:** Accepted
- **Context:** Audio creation tools should feel inspiring, vibrant, and alive rather than dull or corporate.
- **Decision:** Establish a distinct triad palette of Vibrant Gold (`hsl(47, 100%, 59%)`), Neon Fuchsia (`hsl(326, 100%, 60%)`), and Deep Purple (`hsl(262, 83%, 58%)`), complemented with frosted glass panels (`.glass-effect`).
- **Consequences:**
  - Positive: Eye-catching first impression, distinct visual identity from generic dark-mode apps.
  - Negative: Must ensure high-contrast foreground text tokens for accessibility.

---

### ADR-008: In-Memory RIFF WAV Binary Encoding
- **Status:** Accepted
- **Context:** Generating and streaming audio on serverless runtimes requires low memory overhead without spawning external shell processes like FFmpeg.
- **Decision:** Generate raw 44.1kHz 16-bit PCM samples directly into a Node.js `Buffer` and prepend a compliant 44-byte RIFF WAV header in memory.
- **Consequences:**
  - Positive: Zero external native dependencies; executes in < 200ms on serverless Node.js runtimes; supported natively by all HTML5 audio elements.
  - Negative: WAV files are uncompressed and larger than MP3/AAC (mitigated by capping maximum track duration to 60 seconds).
