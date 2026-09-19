# Tracker & Engineering Rules — Orphia

This document establishes the code quality standards, Git conventions, issue tracking protocols, and contribution guidelines for the Orphia codebase.

---

## 1. Git Workflow & Branch Strategy

Orphia follows a streamlined feature-branch workflow rooted on the `main` branch:

```
main (Production)
 ├── feat/audio-waveform-visualizer
 ├── fix/safari-audio-context-unlock
 ├── docs/architecture-specification
 └── refactor/about-me-creator-migration
```

### 1.1. Branch Naming Conventions
Every branch name must adhere to the following prefix pattern:

| Prefix | Description | Example |
| :--- | :--- | :--- |
| `feat/` | New user-facing feature or API capability | `feat/midi-keyboard-input` |
| `fix/` | Bug resolution or defect correction | `fix/clerk-jwt-token-refresh` |
| `docs/` | Documentation additions or edits | `docs/design-system-tokens` |
| `refactor/` | Code structure change without altering functionality | `refactor/creator-profile-constants` |
| `perf/` | Performance optimization | `perf/audio-buffer-synthesis-loop` |
| `chore/` | Tooling, dependencies, or configuration updates | `chore/upgrade-next-15` |

---

## 2. Commit Message Standards (Conventional Commits)

Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Allowed Types
- **`feat`**: A new feature (e.g., `feat(synth): add pentatonic chord progression modes`)
- **`fix`**: A bug fix (e.g., `fix(audio): clamp duration parameter between 5 and 60s`)
- **`docs`**: Documentation changes (e.g., `docs(readme): add documentation index and links`)
- **`refactor`**: Code refactoring (e.g., `refactor(nav): replace Our Team with About Me`)
- **`style`**: Formatting, whitespace, or visual polish (e.g., `style(about): enhance card hover micro-interaction`)
- **`perf`**: Code performance improvement (e.g., `perf(synth): pre-allocate Float32Array buffers`)
- **`test`**: Adding or updating tests
- **`chore`**: Maintenance, build configs, package updates

---

## 3. TypeScript & Code Quality Rules

1. **No Implicit or Explicit `any`:** All function signatures, props, and API payloads must declare explicit types or interfaces.
2. **Server vs. Client Component Discipline:**
   - Keep components Server Components by default.
   - Only add `"use client"` when using React hooks (`useState`, `useEffect`), browser APIs (`window`, `AudioContext`), or Framer Motion.
3. **Environment Variable Guarding:** Always access environment variables with fallback handling or validate them at runtime.
4. **Clean Import Paths:** Use Next.js path aliases (`@/...`) rather than relative traversal (`../../../`).

---

## 4. Pull Request (PR) & Review Checklist

Before opening or merging a Pull Request, verify each item:

- [ ] **Typecheck Passed:** `npx tsc --noEmit` completes with 0 errors.
- [ ] **Linter Clean:** `npm run lint` passes without warnings.
- [ ] **Build Verified:** `npm run build` generates production bundles successfully.
- [ ] **Audio Generation Tested:** Generated `.wav` file downloads and plays cleanly.
- [ ] **Cross-Browser Verification:** Tested in Chromium, Firefox, and WebKit (Safari).
- [ ] **Responsive Test:** Tested on mobile viewport (`< 640px`) and desktop (`>= 1024px`).
- [ ] **Backwards Compatibility:** No existing URLs broken (redirects in place if routes shifted).

---

## 5. Issue Tracking & Feedback Management

- **Bug Reports via `/contribute`:** Automatically trigger a webhook to Gulamgous Khan's private Telegram bot. Each incoming alert contains the issue type, summary, detailed description, and reporter email.
- **GitHub Issues:** Used for long-term tracking, public discussion, and milestone grouping.
- **Triage Priority Matrix:**
  - **P0 (Blocker):** Audio generation produces 500 error or silent audio file.
  - **P1 (Critical):** Authentication failure preventing dashboard access.
  - **P2 (Normal):** UI layout glitch on specific screen sizes.
  - **P3 (Low):** Minor copy or typography enhancement.
