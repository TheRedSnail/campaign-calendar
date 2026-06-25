# Visual Design Guide

This document defines the visual system for this app. It is intentionally scoped to UI and brand presentation only.

Update this file when the app's brand or design language diverges from the defaults. All agents defer to this file for visual decisions.

## Scope and Authority

- Use [DESIGN.md](DESIGN.md) for visual guidance: colors, typography, spacing, radii, and component styling.
- Use [specs/app/main.spec.md](specs/app/main.spec.md) (architecture section) for system architecture and technical design.
- Use [AGENTS.md](AGENTS.md) as the source of truth for process, requirements rules, and non-negotiable project rules.

## Design Tokens

```yaml
---
version: "2.0"
name: "Project Design System"
description: "Brand design tokens. Clean, structured, primary-color-anchored. Replace font and primary color to match the app's brand."
colors:
  # Core
  primary: "#E1000F"
  black: "#3B3B3B"
  gray: "#696969"
  lighterGray: "#E5E5E5"
  surface: "#FFFFFF"
  neutral: "#FBF9F9"
  text: "#3B3B3B"
  textMuted: "#696969"
  border: "#E5E5E5"
  # Substantial palette — sections, backgrounds, accents
  warmGrey: "#DED7D6"
  warmGreyLight: "#F2EFEF"
  warmGreyDark: "#4D3938"
  softBlue: "#BDCDDA"
  softBlueLight: "#DDE7ED"
  softBlueDark: "#343B55"
  sageGreen: "#BFCFBE"
  sageGreenLight: "#E5ECE5"
  sageGreenDark: "#1D4941"
  # Expressive palette — highlights, data-viz, accents
  deepGreen: "#175641"
  freshYellow: "#F6E67D"
  freshBlue: "#318096"
  softMint: "#DFEBC2"
  deepViolet: "#871964"
  softPeach: "#F4C59E"
  darkLilac: "#69008C"
  brightAqua: "#005FBE"
  brightMint: "#A2ECBA"
  brightOrange: "#FBA700"
  darkBlue: "#28325A"
  electricYellow: "#E8E200"
  electricPink: "#FFE2FD"
  sky: "#DCE8FF"
  apple: "#DCF8CD"
  # Semantic
  error: "#E1000F"
  success: "#175641"
  warning: "#FBA700"
  priorityLow: "#318096"
  priorityMedium: "#FBA700"
  priorityHigh: "#E1000F"
typography:
  fontFace:
    family: "HenkelGTFlexa"
    src: "https://aihub.az.henkelgroup.io/assets/fonts/HenkelGTFlexa-Md_4244971728.otf"
    format: "opentype"
    weight: "500"
  h1:
    fontFamily: "'HenkelGTFlexa', 'Segoe UI', Helvetica, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: "1.0"
    textTransform: "uppercase"
  h2:
    fontFamily: "'HenkelGTFlexa', 'Segoe UI', Helvetica, sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: "1.1"
    textTransform: "uppercase"
  h3:
    fontFamily: "'HenkelGTFlexa', 'Segoe UI', Helvetica, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "1.2"
  body:
    fontFamily: "'Segoe UI', Helvetica, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: "1.5"
  bodyMedium:
    fontFamily: "'Segoe UI', Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.556"
  bodySmall:
    fontFamily: "'Segoe UI', Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5"
  label:
    fontFamily: "'HenkelGTFlexa', 'Segoe UI', Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: "1.3"
    textTransform: "uppercase"
  caption:
    fontFamily: "'Segoe UI', Helvetica, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1.4"
fontWeights:
  bolder: 700
  bold: 600
  lightBold: 500
  normal: 400
  light: 300
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
shadows:
  card: "0 2px 12px rgba(0, 0, 0, 0.08)"
  cardHover: "0 4px 20px rgba(0, 0, 0, 0.12)"
  modal: "0 8px 40px rgba(0, 0, 0, 0.18)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
    hoverBackgroundColor: "#C9000D"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    border: "1.5px solid {colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  card-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    shadow: "{shadows.card}"
    hoverShadow: "{shadows.cardHover}"
  badge-type:
    backgroundColor: "{colors.warmGreyLight}"
    textColor: "{colors.textMuted}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "2px {spacing.sm}"
  badge-priority-low:
    backgroundColor: "{colors.softBlueLight}"
    textColor: "{colors.freshBlue}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "2px {spacing.sm}"
  badge-priority-medium:
    backgroundColor: "#FFF5E0"
    textColor: "#9A6800"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "2px {spacing.sm}"
  badge-priority-high:
    backgroundColor: "#FDEAEA"
    textColor: "{colors.primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "2px {spacing.sm}"
  tag-category:
    backgroundColor: "{colors.sageGreenLight}"
    textColor: "{colors.deepGreen}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "2px {spacing.sm}"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
    focusBorder: "{colors.primary}"
  toast-error:
    backgroundColor: "{colors.error}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
  toast-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
---
```

## Overview

The visual direction is clean, structured, and primary-color-anchored.

- Primary Red (`#E1000F`) as the accent color for CTAs, buttons, and interactive focus — replace with brand primary if needed
- Multicolor substantial palette (warm grey, soft blue, sage green) for section backgrounds and content structure
- Expressive palette available for data visualization, highlights, and category differentiation
- Generous white space with warm grey tones for subtle depth
- Dual typeface system: HenkelGTFlexa for headlines (uppercase), Segoe UI for body text — loaded from `https://aihub.az.henkelgroup.io/assets/fonts/HenkelGTFlexa-Md_4244971728.otf`
- Accessible contrast on all text/background combinations

## Colors

### Core Colors
- **Primary Red** (`#E1000F`): Primary buttons, key CTAs, brand anchor — always include at least one primary-color element
- **Black** (`#3B3B3B`): Primary text, headings
- **Gray** (`#696969`): Secondary text, metadata, placeholders
- **Lighter Gray** (`#E5E5E5`): Borders, dividers, input outlines
- **Surface** (`#FFFFFF`): Cards, modals, form panels
- **Neutral** (`#FBF9F9`): Page background, subtle section separators

### Substantial Colors (sections and backgrounds)
- **Warm Grey** (`#DED7D6` / light `#F2EFEF` / dark `#4D3938`): Neutral warmth for content sections
- **Soft Blue** (`#BDCDDA` / light `#DDE7ED` / dark `#343B55`): Information sections, calm accents
- **Sage Green** (`#BFCFBE` / light `#E5ECE5` / dark `#1D4941`): Natural, sustainable themes

### Expressive Colors (highlights and data)
- **Deep Green** (`#175641`), **Fresh Blue** (`#318096`), **Bright Aqua** (`#005FBE`): Cool tones
- **Fresh Yellow** (`#F6E67D`), **Bright Orange** (`#FBA700`), **Electric Yellow** (`#E8E200`): Warm highlights
- **Deep Violet** (`#871964`), **Dark Lilac** (`#69008C`): Bold accent tones
- **Soft Mint** (`#DFEBC2`), **Soft Peach** (`#F4C59E`), **Sky** (`#DCE8FF`): Pastel tones for badges/tags

### Semantic Colors
- **Error**: Primary Red `#E1000F`
- **Success**: Deep Green `#175641`
- **Warning**: Bright Orange `#FBA700`
- **Priority Low / Medium / High**: Fresh Blue / Bright Orange / Primary Red

## Typography

- **Headlines:** HenkelGTFlexa — bold, dynamic, always uppercase for h1/h2. Falls back to Segoe UI. Load via `@font-face` from `https://aihub.az.henkelgroup.io/assets/fonts/HenkelGTFlexa-Md_4244971728.otf`.
- **Body text:** Segoe UI — clear, readable, system-available. Minimum `1rem` for readability.
- **Labels/buttons:** HenkelGTFlexa in uppercase at `label` size.
- **Captions/metadata:** Segoe UI at `caption` size.
- Available weights: light (300), normal (400), light-bold (500), bold (600), bolder (700).
- **CSP requirement:** Every project using HenkelGTFlexa must add `https://aihub.az.henkelgroup.io` to its `font-src` Content Security Policy directive (see [Content Security Policy](#content-security-policy) section below).

## Layout and Spacing

- Use tokenized spacing (`xs` through `2xl`) only — no arbitrary values
- Card layouts use `lg` (24px) padding
- Stack vertical content with `md` (16px) gaps
- Touch targets minimum 44×44px for mobile compliance
- Maintain generous white space between colored sections

## Components

### Primary Button (`button-primary`)
- Primary Red background; white uppercase text
- Hover: darken to `#C9000D`
- WCAG AA contrast required

### Secondary Button (`button-secondary`)
- Transparent with red border and red text
- Hover: subtle warm tint background

### Default Card (`card-default`)
- White surface, subtle shadow (`0 2px 12px rgba(0,0,0,0.08)`)
- Shadow lifts on hover for interactivity signal

### Priority Badges
- Low: fresh blue on soft blue light (`#DDE7ED`)
- Medium: amber on pale yellow (`#FFF5E0`)
- High: red on pale red (`#FDEAEA`)

### Category Tags (`tag-category`)
- Deep green text on sage green light background
- Pill shape (`rounded.full`)

## Content Security Policy

The HenkelGTFlexa font is served from an external origin. Every project that uses this design system **must** configure its Content Security Policy to allow this origin.

### Required `font-src` origin

```
https://aihub.az.henkelgroup.io
```

### Implementation — bundle the font locally (required)

The font server at `aihub.az.henkelgroup.io` does not return `Access-Control-Allow-Origin` headers. Loading it via `@font-face` from a cross-origin will be blocked by the browser's CORS policy even when the CSP allows the origin.

**Every project must bundle the font file locally:**

1. Download `HenkelGTFlexa-Md_4244971728.otf` from `https://aihub.az.henkelgroup.io/assets/fonts/HenkelGTFlexa-Md_4244971728.otf` and place it at `public/fonts/HenkelGTFlexa-Md.otf` inside the app directory.
2. Reference it with a root-relative path in the `@font-face` declaration:

```css
@font-face {
  font-family: "HenkelGTFlexa";
  src: url("/fonts/HenkelGTFlexa-Md.otf") format("opentype");
  font-weight: 500;
  font-display: swap;
}
```

3. With the font served from `'self'`, the CSP `font-src 'self' data:` directive is sufficient — no external origin needed.
4. **Dockerfile:** ensure `COPY public ./public` appears in the builder stage **before** `RUN npm run build` so Vite includes the font in `dist/`. Without this, the container serves a 404 HTML page for the font URL — browsers report this as an OTS `sfntVersion` parse error.

> **Agents:** When scaffolding a new project, download the font and place it at `public/fonts/HenkelGTFlexa-Md.otf`. Use the local path in `@font-face`. Do not reference the external URL directly.

## Do and Do Not

Do:

- Always include at least one element in the primary color
- Use substantial palette colors for section backgrounds — they create warmth and structure
- Reuse tokens instead of introducing one-off values
- Use inverted color combinations (e.g., primary bg with white text) when appropriate
- Validate contrast for text on every custom background (WCAG AA minimum)
- Use card shadows sparingly to create depth

Do Not:

- Mix color combinations outside the defined pairings
- Assign fixed colors to categories or organizational units without a semantic reason
- Introduce color values not in the token set without updating this file
- Use additional colors beyond the selected combination for a given view
- Use `primary` color for non-interactive text
- Mix uppercase and lowercase in the same headline element
- Deploy a project without adding `https://aihub.az.henkelgroup.io` to `font-src` in the CSP — the font will be blocked

## Accessibility Baseline

- Text contrast ratio must meet WCAG AA minimum (4.5:1 for body, 3:1 for large text)
- Interactive elements must have visible focus states (2px primary-color outline)
- Form error messages must be distinguishable beyond color (icon + text)
- Priority badges must not rely on color alone — include text label
- Touch targets minimum 44×44px

## Dark Mode Tokens

Dark mode is activated via `[data-theme="dark"]` on the `<html>` element. All color and shadow tokens are overridden; typography, spacing, and radius tokens remain unchanged.

**Source:** `specs/features/002-dark-mode.spec.md`

| Token | Dark value | Notes |
|---|---|---|
| `colors.primary` | `#FF4D55` | Lighter red for contrast on dark surface |
| `colors.neutral` | `#121212` | Page background |
| `colors.surface` | `#1E1E1E` | Cards, modals, form panels |
| `colors.border` | `#2E2E2E` | Borders and dividers |
| `colors.text` | `#E8E8E8` | Primary body text |
| `colors.textMuted` | `#A0A0A0` | Secondary text, metadata |
| `colors.warmGreyLight` | `#2A2424` | Warm grey sections |
| `colors.softBlueLight` | `#1A2230` | Soft blue sections |
| `colors.sageGreenLight` | `#1A231A` | Sage green sections |
| `colors.error` | `#FF4D55` | Validation errors |
| `colors.success` | `#A2ECBA` | Bright mint for visibility |
| `colors.warning` | `#F6E67D` | Fresh yellow for visibility |
| `colors.priorityLow` | `#4FA5B5` | Lighter fresh blue |
| `colors.priorityMedium` | `#F6E67D` | Fresh yellow |
| `colors.priorityHigh` | `#FF4D55` | Same as primary |
| `shadows.card` | `0 2px 16px rgba(0,0,0,0.40)` | Deeper shadow on dark |
| `shadows.cardHover` | `0 4px 24px rgba(0,0,0,0.55)` | |
| `shadows.modal` | `0 8px 40px rgba(0,0,0,0.65)` | |

### Semantic Component Colors (Dark)

| Token | Light value | Dark value | Used by |
|---|---|---|---|
| `btnPrimaryHover` | `#C9000D` | `#CC2020` | Primary button hover |
| `btnSecondaryHoverBg` | `#FFF0EE` | `#2A1A18` | Secondary button hover |
| `badgePriorityLowBg` | `#DDE7ED` | `#1A2230` | Priority low badge |
| `badgePriorityMediumBg` | `#FFF5E0` | `#271F08` | Priority medium badge |
| `badgePriorityHighBg` | `#FDEAEA` | `#2A0E0E` | Priority high badge |
| `tagCategoryBg` | `#E5ECE5` | `#1A231A` | Category tag |
| `overdueBg` | `#FDEAEA` | `#2A0E0E` | Overdue due date |

## Change Management

- The user can update this file at any time; user edits are authoritative.
- Agents may propose updates, but must ask for confirmation before changing design-system direction.
- Any visual changes must be reflected in token updates here first.
- Feature specs should reference relevant token names (not raw hex values) when UI is constrained.
- If a design choice affects behavior or data flow, document it in [specs/app/main.spec.md](specs/app/main.spec.md) (architecture section) too.

## App-Local Token Layers

- App-specific UI may materialize approved tokens in a shared token source inside the app when no repository-wide compiled token package exists.
- That token source must be imported before feature styles and treated as the single origin for color, typography, spacing, radius, elevation, and layout constants used by the app.
- Feature stylesheets should consume those shared variables only; they should not redefine token values locally.
- If an app needs extra layout or motion tokens not listed above, add them here first, then consume them from the app-local token layer.

### Hackathon Dashboard Token Extension

Approved for `apps/hackathon-dashboard`:

- Shared token source: `src/design-tokens.css`
- Layout max width: `70rem`
- Body copy max width: `44rem`
- Empty-state copy max width: `38rem`
- Catalog card minimum width: `13.75rem`
- Compact layout breakpoint: `40rem`
- Hero padding range: `2.5rem` to `5rem`
- Surface blur: `0.5rem`
- Focus outline: `0.1875rem` width with `0.25rem` offset
- Card lift distance: `-0.1875rem`

## Related Documents

- [specs/app/main.spec.md](specs/app/main.spec.md) (architecture section) - System architecture and technical design
- [specs/features/001-first-todo-app.spec.md](specs/features/001-first-todo-app.spec.md) - Feature that uses this design system
- [AGENTS.md](AGENTS.md) - Process and non-negotiable project rules
- [README.md](README.md) - Project overview and workflow

---

Next Step: Reference [DESIGN.md](DESIGN.md) in UI-related specs and prompts, and [specs/app/main.spec.md](specs/app/main.spec.md) (architecture section) in system-level decisions.
