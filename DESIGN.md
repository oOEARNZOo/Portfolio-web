---
name: Chanatip Tonngern Portfolio
description: A calm, product-minded front-end developer portfolio for junior role applications.
colors:
  light-bg: "#edf5fb"
  light-bg-soft: "#dfeaf3"
  light-surface: "#fbfdff"
  light-text: "#132232"
  light-text-soft: "#5b6c7b"
  light-muted: "#5f7080"
  accent: "#2f6f96"
  accent-strong: "#164b68"
  accent-soft: "#d9ecf7"
  dark-bg: "#071423"
  dark-bg-soft: "#0d1f31"
  dark-surface: "#102033"
  dark-text: "#edf7ff"
  dark-text-soft: "#b7c8d8"
  dark-muted: "#8398aa"
typography:
  display:
    fontFamily: "Manrope, Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(2.35rem, 4.2vw, 3.85rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "0"
  headline:
    fontFamily: "Manrope, Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.4rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0"
  body:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(1rem, 1.5vw, 1.2rem)"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  label:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0"
rounded:
  sm: "12px"
  md: "20px"
  lg: "30px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "34px"
  section: "clamp(54px, 7vw, 96px)"
components:
  button-primary:
    backgroundColor: "{colors.light-text}"
    textColor: "{colors.light-bg}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
  button-secondary:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
  card:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.lg}"
---

# Design System: Chanatip Tonngern Portfolio

## 1. Overview

**Creative North Star: "The Calm Engineering Portfolio"**

The portfolio uses a cool, professional product-site language: structured grids, clear cards, strong whitespace, and restrained animation. It should feel recruiter-friendly first, with enough polish to show UI taste without becoming ornamental.

The system rejects crowded beginner portfolio patterns, excessive neon, heavy gradients, and hover-only disclosure. Visual decisions should make the work easier to inspect, especially project cards, contact links, and the hero's role statement.

**Key Characteristics:**
- Cool blue-neutral palette with soft surfaces and deep dark mode.
- Large but controlled typography for confident hierarchy.
- Product-style cards with screenshots, concise copy, and direct actions.
- Subtle movement only when it improves perceived quality.

## 2. Colors

The palette is a cool professional system built around blue-gray surfaces, clean text contrast, and a measured blue accent.

### Primary
- **Clear Interface Blue** (`#2f6f96`): Used for emphasis, active states, focus treatment, and small brand signals.
- **Deep Action Blue** (`#164b68`): Used when stronger contrast or active navigation emphasis is needed.

### Neutral
- **Cool Light Canvas** (`#edf5fb`): Main light-mode page background.
- **Soft Light Layer** (`#dfeaf3`): Secondary light-mode background and tonal depth.
- **Clean Surface** (`#fbfdff`): Cards, navigation, buttons, and elevated containers.
- **Ink Text** (`#132232`): Primary text in light mode.
- **Deep Night Canvas** (`#071423`): Main dark-mode background.
- **Night Surface** (`#102033`): Dark-mode cards and containers.
- **Ice Text** (`#edf7ff`): Primary text in dark mode.

### Named Rules

**The Cool Professional Rule.** Keep the portfolio in the blue-neutral family, but use contrast, spacing, imagery, and hierarchy so it does not become flat or monotonous.

## 3. Typography

**Display Font:** Manrope with Inter and system fallbacks.
**Body Font:** Inter with system fallbacks.
**Label/Mono Font:** No separate mono family.

**Character:** The type system is direct, readable, and hiring-context friendly. Manrope gives headings a slightly more distinct product-brand voice, while Inter keeps body copy familiar and easy to scan.

### Hierarchy
- **Display** (800, `clamp(2.35rem, 4.2vw, 3.85rem)`, 0.98): Hero headline and major section headlines.
- **Headline** (800, `clamp(2rem, 4vw, 3.4rem)`, 1): Secondary large headings such as About and Contact.
- **Title** (700-800, 1.02rem-1.5rem, 1.2): Project titles, skill group titles, timeline labels.
- **Body** (400-650, `clamp(1rem, 1.5vw, 1.2rem)`, 1.7): Descriptions and supporting copy, kept concise and scannable.
- **Label** (700-800, 0.78rem-0.92rem, 1.2): Status badges, project types, tags, and navigation.

### Named Rules

**The Recruiter Scan Rule.** If a heading or paragraph slows scanning on mobile, reduce size or line length before adding more decoration.

## 4. Elevation

The system uses a hybrid of tonal layering, borders, blur, and soft shadows. Shadows should be ambient and subtle, mostly supporting navigation, cards, and hover states rather than creating dramatic depth.

### Shadow Vocabulary
- **Small Ambient** (`0 10px 30px rgba(31, 67, 99, 0.08)`): Sticky navigation and light resting elevation.
- **Medium Lift** (`0 22px 60px rgba(31, 67, 99, 0.14)`): Hovered cards and important surfaces.
- **Large Presentation** (`0 32px 90px rgba(31, 67, 99, 0.18)`): Hero imagery or prominent visual containers.

### Named Rules

**The Soft Lift Rule.** Components may lift slightly on hover, but layout should never jump or require hover to reveal core information.

## 5. Components

### Buttons
- **Shape:** Fully rounded pill (`999px`) for primary actions.
- **Primary:** High-contrast filled button for the most important action, usually View Projects.
- **Secondary:** Quiet bordered/surface button for Contact and Resume.
- **Hover / Focus:** Small transform, color shift, and visible focus ring. Keep states keyboard-visible.

### Chips
- **Style:** Rounded pills with subtle borders and cool surface backgrounds.
- **Use:** Tech stack tags and skill labels. Tags should stay short enough to wrap cleanly on mobile.

### Cards / Containers
- **Corner Style:** Large but professional radius (`20px` to `30px`).
- **Background:** Light or dark surface token with border contrast.
- **Shadow Strategy:** Resting cards stay quiet; hover uses medium lift and slight image zoom.
- **Internal Padding:** Responsive padding using the section and component spacing scale.

### Inputs / Fields
- This portfolio currently has no form fields. If a contact form is added later, use the same surface, border, focus, and radius rules as cards and buttons.

### Navigation
- Sticky pill navigation with brand identity, section links, and dark mode toggle.
- Active states should remain visible without relying only on color.
- On small screens, nav must wrap without covering content or causing horizontal overflow.

## 6. Do's and Don'ts

**Do**
- Keep project screenshots prominent and real.
- Keep descriptions concise, specific, and tied to what was built.
- Preserve accessible focus states, semantic sections, and alt text.
- Test desktop and mobile after changes to hero, nav, cards, or contact links.

**Don't**
- Add heavy animations, neon gradients, or game-like effects.
- Hide project buttons behind hover states on mobile.
- Let hero typography or images crowd the first screen.
- Change the cool professional palette without a clear reason.
