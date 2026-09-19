# 🎵 Orphia Documentation Suite

> **Welcome to the official technical and product documentation for Orphia** — the AI-powered music generation platform designed and engineered by **Gulamgous Khan**.

This documentation suite is organized for rapid understanding by engineers, contributors, designers, and stakeholders.

---

## 📚 Documentation Index

| File | Document Name | Purpose & Contents |
| :--- | :--- | :--- |
| [**`PRD.md`**](./PRD.md) | **Product Requirements Document** | Vision, target audience, problem statements, core features, user journeys, KPIs, and scope. |
| [**`TRD.md`**](./TRD.md) | **Technical Requirements Document** | System architecture, tech stack (Next.js 15, React 19, Convex, Clerk), audio engines, APIs, and performance. |
| [**`APP_FLOW.md`**](./APP_FLOW.md) | **Application & User Flow** | Visual sequence diagrams, state machines, route guards, generation lifecycle, and feedback flow. |
| [**`DESIGN_SYSTEM.md`**](./DESIGN_SYSTEM.md) | **Design System & Tokens** | Color palette (HSL), dark/light theme, typography, glassmorphism, morphing blobs, and animations. |
| [**`SCHEMA.md`**](./SCHEMA.md) | **Database & Data Models** | Convex tables, TypeScript interfaces, API schemas (`/api/generate`, `/api/sample`, `/api/feedback`). |
| [**`IMPLEMENTATION_PLAN.md`**](./IMPLEMENTATION_PLAN.md) | **Implementation & Roadmap** | Engineering milestones (MVP, Procedural Fallback Engine, Audio Waveform Visualizers, Multi-track export). |
| [**`TRACKER_RULES.md`**](./TRACKER_RULES.md) | **Tracker & Engineering Rules** | Git workflow, Conventional Commits, PR checklist, TypeScript standards, and CI/CD rules. |
| [**`COMPONENT_LIBRARY.md`**](./COMPONENT_LIBRARY.md) | **UI Component Library** | Catalog of layout, MagicUI, and Radix/Shadcn UI components with props, variants, and code snippets. |
| [**`DECISIONS.md`**](./DECISIONS.md) | **Architecture Decision Records (ADRs)**| Record of critical architectural decisions (Next.js 15, Convex, Dual-Engine Audio, Telegram Webhooks, Solo Creator Transition). |

---

## ⚡ Quick Architecture Summary

```
                       ┌─────────────────────────┐
                       │   Client (Next.js 15)   │
                       │   React 19 / Tailwind   │
                       └────────────┬────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
│   Authentication   │   │  Real-Time Backend │   │   Audio Pipelines  │
│   (Clerk + Convex) │   │    (Convex DB)     │   │ Next.js API Routes │
└────────────────────┘   └────────────────────┘   └─────────┬──────────┘
                                                            │
                                  ┌─────────────────────────┴───────────────┐
                                  ▼                                         ▼
                     ┌─────────────────────────┐               ┌─────────────────────────┐
                     │   Hugging Face MusicGen │               │   Harmonic Synthesis    │
                     │  (Inference Endpoint)   │  (Fallback)   │   Procedural Engine     │
                     │    Dedicated GPU / Cloud│ ────────────> │  100% Reliable In-Node  │
                     └─────────────────────────┘               └─────────────────────────┘
```

---

## 🚀 Key Repository Paths

- **Source Code (`/app`)**: Next.js App Router root containing page views and route handlers.
- **Audio Synthesis Engine (`/lib/audio-synth.ts`)**: In-memory procedural harmonic synthesizer and WAV binary encoder.
- **Backend Queries & Mutations (`/convex`)**: Convex real-time reactive functions and Clerk authentication bindings.
- **Component Primitives (`/components`)**: Modular Shadcn UI and MagicUI visual primitives.
- **Constants & Navigation (`/constants`)**: Global navigation items, header menus, and creator profile specifications.
