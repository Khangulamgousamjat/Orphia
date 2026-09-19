# Component Library Catalog — Orphia

This document provides a comprehensive catalog of the UI components, primitives, and animations used throughout Orphia, including their locations, props, variants, and code examples.

---

## 1. Navigation & Layout Components

### 1.1. `TopNav` (`components/nav/TopNav.tsx`)
Primary sidebar navigation component displaying top-level links (Home, Create with Prompt, Upload Sample, About Me, Our Model, Contribute).
- **Props:**
  - `isExpandedValue: boolean` — Controls whether text labels are visible or hidden in collapsed icon mode.
  - `pathnameValue: string` — Current route pathname for active highlighting.
- **Features:**
  - Integrated with `useConvexAuth()` to guard protected links with toast alerts.
  - Wrapped with Radix `Tooltip` to show titles when sidebar is collapsed.

```tsx
import { TopNav } from "@/components/nav/TopNav";

<TopNav isExpandedValue={isExpanded} pathnameValue={pathname} />
```

---

### 1.2. `BottomNav` (`components/nav/ButtomNav.tsx`)
Secondary sidebar navigation displaying informational links (FAQ, Privacy Policy, Terms of Service).
- **Props:**
  - `isExpandedValue: boolean`
  - `pathnameValue: string`

---

### 1.3. `SiteFooter` (`components/footer/index.tsx`)
Universal application footer containing copyright, legal links, and social channels (GitHub, LinkedIn, Email).
- **Styling:** Glassmorphism backdrop blur `bg-background/95 backdrop-blur`.

```tsx
import { SiteFooter } from "@/components/footer";

<SiteFooter />
```

---

### 1.4. `LayoutWrapper` (`components/layout-wrapper.tsx`)
Application shell that orchestrates responsive layout, collapsible sidebar, header trigger, and child route rendering.

---

## 2. MagicUI Visual Primitives

### 2.1. `MagicCard` (`components/magicui/magic-card.tsx`)
Interactive card with mouse-tracking radial spotlight border.
- **Props:**
  - `gradientColor: string` — Spotlight color (defaults to primary gold or fuchsia).
  - `gradientOpacity: number` — Alpha opacity of the radial gradient (0 to 1).
  - `className?: string`

```tsx
import { MagicCard } from "@/components/magicui/magic-card";

<MagicCard gradientColor="hsl(var(--primary))" gradientOpacity={0.25} className="p-6 rounded-2xl">
  <h3>Interactive AI Spotlight</h3>
</MagicCard>
```

---

### 2.2. `Particles` (`components/magicui/particles.tsx`)
Canvas-rendered interactive particle background simulating drifting audio dust and cosmic atmosphere.
- **Props:**
  - `quantity?: number` — Number of rendered particles (default: 50).
  - `color?: string` — Particle hex color (default: `#ffffff`).
  - `staticity?: number` — Mouse interaction resistance.
  - `ease?: number` — Animation smoothing.

```tsx
import { Particles } from "@/components/magicui/particles";

<Particles quantity={60} color="#FFD700" className="absolute inset-0 z-0" />
```

---

### 2.3. `TypingAnimation` (`components/magicui/typing-animation.tsx`)
Typewriter effect for headline banners and generative prompts.
- **Props:**
  - `text: string` — Text string to type out.
  - `duration?: number` — Milliseconds per character step.

---

### 2.4. `HyperText` (`components/magicui/hyper-text.tsx`)
Cyberpunk scramble text effect that randomly cycles through glyphs before resolving to the target text.
- **Props:**
  - `text: string`
  - `duration?: number`

---

## 3. UI Primitives (Radix / Shadcn)

| Component | Path | Key Variants & Usage |
| :--- | :--- | :--- |
| **`Button`** | `components/ui/button.tsx` | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Rounded full or md. |
| **`Card`** | `components/ui/card.tsx` | `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. Glassmorphism borders. |
| **`Slider`** | `components/ui/slider.tsx` | Used for track duration (5–60s), creativity (0–100%), complexity (0–100%). |
| **`Textarea`** | `components/ui/textarea.tsx` | Auto-resizing multi-line text input for prompt entry. |
| **`Tooltip`** | `components/ui/tooltip.tsx` | `TooltipProvider`, `TooltipTrigger`, `TooltipContent` with zero delay duration. |
| **`Dialog`** | `components/ui/dialog.tsx` | Modals for login prompt, terms, and export previews. |
| **`Spinner`** | `components/spinner.tsx` | Loading indicator with `size: "default" \| "sm" \| "lg" \| "icon"`. |

---

## 4. State & Utility Components

### 4.1. `UserAvatar` (`components/user-avatar.tsx`)
Displays Clerk user profile picture with fallback initials and border styling.

### 4.2. `ThemeProvider` (`components/theme-provider.tsx`)
Wraps Next-Themes provider for system/light/dark theme switching.

### 4.3. `ConvexClientProvider` (`components/provider/convex-client-provider.tsx`)
Initializes `ConvexReactClient` connected to Clerk authentication token bridge.
