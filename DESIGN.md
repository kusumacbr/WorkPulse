# DESIGN.md — WorkPulse Design System & Tokens

## Visual Direction

WorkPulse delivers an executive enterprise dashboard aesthetic: sleek dark/light mode surface elevations, vibrant status indicators, crisp typography, and purposeful micro-interactions.

---

## Design System Tokens

### 1. Color Palette & Roles

#### Brand & Primary Colors
- **Primary**: Slate / Indigo spectrum (`#4f46e5`, `#6366f1`) for main actions, active navigation, and primary buttons.
- **Surface Dark**: Deep slate (`#0f172a`, `#1e293b`) with tinted elevation layers (`#334155`).
- **Surface Light**: Clean off-white (`#f8fafc`, `#ffffff`) with subtle slate borders (`#e2e8f0`).

#### Semantic Status Tokens
- **Success / Approved**: Emerald (`#10b981`, `#059669`) with 10% opacity background tinting.
- **Warning / Pending**: Amber (`#f59e0b`, `#d97706`) with warm background fills.
- **Danger / Rejected**: Rose / Red (`#f43f5e`, `#e11d48`) with clear contrast borders.
- **Info / Neutral**: Cyan / Blue (`#06b6d4`, `#0284c7`).

---

### 2. Typography Hierarchy

- **Headings**: Modern sans-serif (Inter / Outfit style) with bold/semibold weights (`font-semibold`, `font-bold`), crisp tracking (`tracking-tight`).
- **Body & Data**: High legibility body text (`text-slate-700` dark: `text-slate-300`).
- **Numeric & Code**: Monospaced font variants for timestamps, employee IDs, and financial metrics.

---

### 3. Surface & Component Elevation Rules

- **No Gray-on-Gray Slop**: Never place pure gray text on colored badge backgrounds.
- **Card Nesting Limit**: Max 1 layer of card container. Avoid cards inside cards inside cards.
- **Borders & Dividers**: Use semi-transparent slate borders (`border-slate-200 dark:border-slate-800`) instead of heavy black lines.
- **Glassmorphism**: Backdrop blur utility (`backdrop-blur-md bg-slate-900/80`) for modal overlays and sticky action bars.

---

### 4. Animation & Interactivity (`Framer Motion`)

- **Transitions**: 150ms – 250ms duration with `easeOut` curves for hover states and modal entrances.
- **Interactive Feedback**: Scale transforms on click (`active:scale-[0.98]`), dynamic glow borders on input focus.
- **Delighters**: Confetti triggers on major milestone completions (e.g., goal achievements, review sign-offs).

---

### 5. Impeccable Anti-Pattern Guardrails

- 🚫 **No default Inter / Arial plainness**: Apply refined line-height (`leading-relaxed`) and letter spacing (`tracking-tight`).
- 🚫 **No flat un-hoverable buttons**: All interactive triggers must have hover, focus-visible, and active states.
- 🚫 **No ambiguous error states**: Form inputs must render error strings in red with inline icon indicators.
- 🚫 **No empty container screens**: All tables and lists must feature dedicated empty-state illustrations or helpful micro-copy.
