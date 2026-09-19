# Design System & UI Tokens — Orphia

Orphia's visual identity blends mythology with futuristic audio-technology aesthetics. The interface utilizes vibrant neon hues, fluid glassmorphism, dynamic gradients, and organic micro-animations.

---

## 1. Color Palette & HSL Tokens

The application design is built on a high-energy triad palette representing creativity, rhythm, and artificial intelligence:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│     Primary     │      │    Secondary    │      │     Accent      │
│  Vibrant Gold   │      │   Neon Fuchsia  │      │   Deep Purple   │
│ hsl(47, 100%, 59%)│    │ hsl(326, 100%, 60%)│   │ hsl(262, 83%, 58%)│
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### 1.1. Core Color Tokens (`globals.css`)

| Token Variable | HSL Value | Hex Equivalent | Role & Application |
| :--- | :--- | :--- | :--- |
| `--primary` | `46.98 100% 59%` | `#FFD52E` | Brand highlights, main action buttons, primary badges |
| `--primary-foreground` | `240 5.9% 10%` | `#18181B` | High-contrast dark text on gold elements |
| `--secondary` | `326 100% 60%` | `#FF3399` | Secondary badges, accents, interactive hover states |
| `--secondary-foreground` | `0 0% 100%` | `#FFFFFF` | Text on secondary elements |
| `--accent` | `262 83% 58%` | `#8B3DED` | Focus rings, gradient end-stops, subtle icons |
| `--accent-foreground` | `0 0% 100%` | `#FFFFFF` | Text on accent elements |
| `--background` | `0 0% 100%` | `#FFFFFF` | Default page background |
| `--foreground` | `240 10% 3.9%` | `#09090B` | Default typography color |
| `--muted` | `210 40% 96.1%` | `#F1F5F9` | Subtle pill tags, inactive track backgrounds |
| `--muted-foreground` | `240 3.8% 46.1%` | `#71717A` | Subtitles, helper text, timestamps |
| `--border` | `240 5.9% 90%` | `#E4E4E7` | Card borders, dividers, inputs |
| `--ring` | `47 95% 57%` | `#FBC627` | Keyboard focus indicator ring |

---

## 2. Typography & Hierarchy

The application leverages system-optimized sans-serif typography paired with responsive clamp scaling:

| Level | Size (Desktop) | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display / H1** | `2.5rem` – `3.25rem` (40–52px) | Extrabold (800) | `1.1` | Landing hero, major section titles (`.gradient-text`) |
| **H2** | `1.875rem` (30px) | Bold (700) | `1.2` | Creator name, page sub-headers, card headings |
| **H3** | `1.25rem` (20px) | Semibold (600) | `1.3` | Card section titles, feature blocks |
| **Body Large** | `1.125rem` (18px) | Normal (400) / Medium (500) | `1.6` | Hero descriptive paragraphs, lead quotes |
| **Body Base** | `0.875rem` – `1rem` (14–16px) | Normal (400) | `1.5` | Narrative bios, input fields, button labels |
| **Caption / Badge**| `0.75rem` (12px) | Semibold (600) | `1.4` | Skill chips, education badges, status tags |

---

## 3. Elevation, Radius & Glassmorphism

### 3.1. Corner Radii
- Base Radius: `--radius = 1rem` (16px)
- `rounded-lg`: `16px` (Cards, Modals, Audio Player Container)
- `rounded-md`: `14px` (Buttons, Sliders, Dropdowns)
- `rounded-sm`: `12px` (Pills, Chips, Small Badges)
- `rounded-full`: `9999px` (Action buttons, Avatars, Pill tags)

### 3.2. Glassmorphism Utilities
```css
/* Translucent frosted glass effect for modern floating panels */
.glass-effect {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

---

## 4. Special Gradient Utilities

### 4.1. Gradient Text (`.gradient-text`)
Transforms standard typography into a vibrant three-stop visual gradient:
```css
.gradient-text {
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  background-image: linear-gradient(
    to right,
    hsl(var(--primary)),
    hsl(var(--secondary)),
    hsl(var(--accent))
  );
}
```

### 4.2. Animated Gradient Background (`.animated-gradient-bg`)
Used on hero intros and dynamic showcase cards:
```css
.animated-gradient-bg {
  background: linear-gradient(
    -45deg,
    hsl(var(--primary)),
    hsl(var(--secondary)),
    hsl(var(--accent)),
    hsl(var(--primary))
  );
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}
```

### 4.3. Morphing Blobs (`.blob`)
Creates smooth organic liquid animations in the background:
```css
.blob {
  border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
  animation: morph 15s linear infinite;
}
```

---

## 5. Layout & Navigation Sizing

- **Sidebar (Expanded):** `240px` fixed width with text labels and icons.
- **Sidebar (Collapsed):** `70px` compact width with tooltips on hover.
- **Container Max-Width:** `1400px` (`2xl`), padded with `2rem` on desktop and `1rem` on mobile.
- **Mobile Breakpoint:** `< 768px` automatically transitions sidebar to sheet overlay drawer.
