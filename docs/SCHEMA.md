# Database Schema & Data Models — Orphia

This document defines the database schemas, TypeScript data contracts, and API payload structures used throughout the Orphia ecosystem.

---

## 1. Convex Real-Time Database Schema

Orphia utilizes **Convex** for serverless, reactive data persistence.

```
┌────────────────────────────────────────────────────────┐
│                      CONVEX SCHEMA                     │
├──────────────────────────┬─────────────────────────────┤
│ messages                 │ Real-time chat & notifications│
│ generated_tracks (v0.2)  │ User saved music & metadata │
│ feedback_submissions     │ Bug reports & feature ideas │
└──────────────────────────┴─────────────────────────────┘
```

### 1.1. `messages` Collection
Used for user-to-agent communications and reactive notification queues.

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.string(),     // User email / identifier from Clerk JWT
    body: v.string(),       // Message content / body
    timestamp: v.optional(v.number()), // Epoch millis
  }).index("by_author", ["author"]),

  // Planned for v0.2.0 Track Persistence:
  generated_tracks: defineTable({
    userId: v.string(),
    prompt: v.string(),
    duration: v.number(),
    creativity: v.number(),
    complexity: v.number(),
    audioStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
```

---

## 2. Core TypeScript Interfaces

### 2.1. Creator & Profile Models (`constants/team-members.ts`)

```typescript
export interface SkillCategory {
  category: string;
  items: string[];
}

export interface CreatorProfile {
  name: string;
  role: string;
  title?: string;
  education: string;
  college: string;
  description: string;
  image: string;
  github: string;
  linkedin: string;
  mail: string;
  skills: SkillCategory[];
}

// Backwards-compatible alias
export type TeamMember = CreatorProfile;
```

### 2.2. Navigation & UI Schema (`constants/nav-values.tsx`)

```typescript
export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export interface HeaderNavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}
```

### 2.3. Music Generation Parameter Schema

```typescript
export interface GenerationParams {
  prompt: string;         // Non-empty descriptive prompt
  duration?: number;      // Seconds (Clamped: 5 <= duration <= 60)
  creativity?: number;    // Normalized float: 0.0 <= creativity <= 1.0
  complexity?: number;    // Normalized float: 0.0 <= complexity <= 1.0
}
```

### 2.4. Feedback & Bug Report Schema

```typescript
export interface FeedbackPayload {
  type: "bug" | "feature";
  title: string;
  description: string;
  userEmail?: string;
  appVersion?: string;
  browserInfo?: string;
}
```

---

## 3. API Contract Specifications

### 3.1. `/api/generate`

#### Request Payload
```json
{
  "prompt": "Cyberpunk synthwave bassline with punchy 80s drums",
  "duration": 30,
  "creativity": 0.5,
  "complexity": 0.3
}
```

#### Response (Success)
- **Status:** `200 OK`
- **Content-Type:** `audio/wav`
- **Body:** Binary WAV audio buffer (`ArrayBuffer` / `Buffer`).

#### Response (Validation Error)
```json
{
  "error": "Invalid prompt",
  "details": "Prompt must be a non-empty string"
}
```

---

### 3.2. `/api/feedback`

#### Request Payload
```json
{
  "type": "feature",
  "title": "Add MIDI keyboard support",
  "description": "It would be great to connect a USB MIDI keyboard to audition notes before generation.",
  "userEmail": "musician@example.com"
}
```

#### Response (Success)
```json
{
  "success": true,
  "message": "Thank you! Your feature suggestion has been forwarded directly to Gulamgous Khan via Telegram."
}
```
