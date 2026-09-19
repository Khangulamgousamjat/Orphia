# Product Requirements Document (PRD) — Orphia

**Project Name:** Orphia — AI Music Generator  
**Author & Lead Engineer:** Gulamgous Khan  
**Status:** Live Production / Active Iteration  
**Target URL:** [orphia.vercel.app](https://orphia.vercel.app)  

---

## 1. Executive Summary & Vision

Inspired by **Orpheus**—the legendary musician and poet of Greek mythology whose music could charm all living things—**Orphia** transforms natural language descriptions into expressive, original music tracks. 

Music production traditionally requires expensive software (DAWs), hardware synthesizers, and years of music theory training. Orphia democratizes music composition by combining deep neural networks and algorithmic synthesis within an intuitive, modern web experience.

---

## 2. Target Audience & Personas

| Persona | Description | Needs & Pain Points |
| :--- | :--- | :--- |
| **Content Creators** | YouTubers, Podcasters, Video Editors, TikTokers | Needs royalty-free, tailored background scores that match the exact emotion and pacing of their video content without DMCA risks. |
| **Indie Game Developers** | Solo or small game development studios | Needs ambient loops, battle themes, or soundscapes on tight budgets and tight schedules. |
| **Music Producers & Songwriters** | Musicians looking for melodic sparks | Needs rapid prototyping of motifs, chord progressions, and stylistic starting points for further DAW refinement. |
| **Curious Explorers & Students** | General enthusiasts exploring AI capabilities | Needs a frictionless, zero-barrier UI to turn imagination ("Cyberpunk lo-fi rainy beats") into audio. |

---

## 3. Problem Statement & Value Proposition

### The Problem
1. **High Barrier to Entry:** Composing unique music requires specialized music theory and costly digital audio workstation licenses.
2. **Copyright & Royalties:** Traditional stock music libraries are expensive, heavily recycled, and risk automated copyright strikes.
3. **AI Music Latency & Fragility:** Most cloud AI music APIs have high cold-start latencies, strict rate limits, and frequent 503 gateway timeouts.

### Orphia's Value Proposition
1. **Instant, Zero-Cost Composition:** Generates full-length original audio in seconds directly from a browser prompt.
2. **100% Availability Architecture:** Employs a dual-tier generation strategy: high-fidelity neural models (Hugging Face MusicGen) backed by an instant in-memory harmonic synthesis engine that guarantees zero failed audio requests.
3. **No Setup Required:** Clean, authenticated interface with reactive real-time state, custom parameter sliders (duration, creativity, complexity), and instant WAV download.

---

## 4. Feature Specifications

### 4.1. Text-to-Music Generation (`/create/prompt`)
- **Input:**
  - Prompt text area (supports natural language descriptions, e.g., *"Upbeat synthwave with retro bassline and punchy drums"*).
  - Duration Slider: 5 to 60 seconds (default: 30s).
  - Creativity Slider: 0% to 100% (temperature & harmonic variation control).
  - Complexity Slider: 0% to 100% (layer density, polyphony, arpeggiator rates).
- **Output:**
  - Audio waveform player with Play/Pause, progress tracking, and current time/duration display.
  - One-click `.wav` download button with timestamped filename.
  - Toast notifications for generation lifecycle states (generating, completed, errors).

### 4.2. Sample Upload & Conditioning (`/create/sample`)
- **Input:**
  - Drag-and-drop or file picker for audio files (`.wav`, `.mp3`, `.ogg`, `.flac`).
  - Max upload size: 10 MB.
  - Prompt modifier: Conditioning prompt describing desired transformation or accompaniment.
- **Output:**
  - Dual audio player comparing source audio with the transformed output.
  - Export functionality for the rendered result.

### 4.3. AI Model Exploration (`/model`)
- **Purpose:** Educational breakdown of the underlying deep learning architecture.
- **Contents:**
  - Neural audio synthesis explanations (transformer architectures, spectrogram encodings, conditioning vectors).
  - Audio generation parameter definitions and best practices for prompt engineering.

### 4.4. Creator Portfolio & Engineering Vision (`/about`)
- **Purpose:** Showcases lead engineer Gulamgous Khan and the technical craft powering Orphia.
- **Contents:**
  - Professional biography, education (B.Tech CSE at MPGI SOE Nanded), and research focus.
  - Categorized technical competencies: Full-Stack (Next.js 15, React 19, Convex), AI/ML (PyTorch, Transformers), Cloud & DevOps.
  - Direct contact links: GitHub, LinkedIn, and Email.
  - Engineering philosophy and architectural highlights.

### 4.5. Contribution & Real-Time Feedback Hub (`/contribute`)
- **Features:**
  - Dual submission modes: Bug Report or Feature Suggestion.
  - Instant dispatch to Gulamgous Khan's private Telegram bot webhook, notifying the developer within milliseconds.
  - Open-source repository links to encourage community collaboration under the MIT License.

---

## 5. Non-Functional Requirements (NFRs)

| Category | Requirement | Target |
| :--- | :--- | :--- |
| **Availability** | Seamless generation without 500/503 errors | 99.9% uptime (guaranteed by procedural fallback) |
| **Generation Latency** | Procedural harmonic audio generation | < 1.5 seconds for a 30-second track |
| **Security** | Authentication & Route Protection | Clerk JWT verification on protected routes |
| **Responsiveness** | Mobile, Tablet, Desktop support | Responsive flex/grid with fluid collapsible sidebar |
| **SEO & Discoverability** | Meta tags, Open Graph, Sitemap | Dynamic `sitemap.ts` and `robots.ts` configured |

---

## 6. Success Metrics (KPIs)

1. **Generation Completion Rate:** > 99% of initiated requests successfully produce playable audio.
2. **Time to First Track (TTFT):** Under 5 seconds from page load to first generated audio track.
3. **Session Engagement:** Average session duration > 4 minutes with >= 2 tracks generated per active session.
4. **Community Feedback:** Tracked bug reports resolved via the Telegram webhook dispatch system.

---

## 7. Scope & Future Roadmap

- **In Scope (Current v0.1):** Text-to-audio synthesis, audio sample conditioning, Clerk auth, Convex real-time state, Telegram webhook notifications, About Me creator page.
- **Next Phase (v0.2):** Visual interactive canvas waveform visualizer, saved tracks history in Convex database, public track showcase gallery.
- **Future Vision (v0.3):** Multi-track STEM stems export (Drums, Bass, Melody, Chords), WebAudio MIDI keyboard live prompt input.
