---
name: mehdiyev.dev
description: Dark ledger portfolio whose one raised object is a live credit-decision engine.
colors:
  ledger-ink: "#0d0f0c"
  ledger-raised: "#141712"
  ledger-hover: "#1b1f19"
  ledger-pressed: "#262b23"
  bone: "#e7eae2"
  lichen: "#a6ad9f"
  moss: "#858d80"
  brass: "#e3b55b"
  hairline: "rgb(231 234 226 / 0.1)"
  hairline-strong: "rgb(231 234 226 / 0.17)"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(3.25rem, 1.4rem + 7.4vw, 6rem)"
    fontWeight: 560
    lineHeight: 0.92
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 1.3rem + 2.4vw, 3rem)"
    fontWeight: 560
    lineHeight: 1.05
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 118"
  title:
    fontFamily: "Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.2rem + 1.2vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 112"
  lead:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 1.05rem + 0.5vw, 1.375rem)"
    fontWeight: 450
    lineHeight: 1.45
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum' 1"
rounded:
  control: "6px"
  button: "8px"
  window: "12px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
  "9": "96px"
  "10": "128px"
components:
  button-primary:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ledger-ink}"
    rounded: "{rounded.button}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "#ffffff"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    rounded: "{rounded.button}"
    padding: "0 18px"
    height: "44px"
  button-quiet-hover:
    backgroundColor: "{colors.ledger-hover}"
  demo-window:
    backgroundColor: "{colors.ledger-raised}"
    rounded: "{rounded.window}"
  stack-tag:
    textColor: "{colors.lichen}"
    rounded: "{rounded.control}"
    padding: "3px 9px"
---

# Design System: mehdiyev.dev

## Overview

**Creative North Star: "The Working Ledger."** A quiet, dark, precise frame in which the work runs. The page reads like a well-kept ledger: hairline rules, tabular figures, one ink, one brass mark. The only raised object is a window onto a real, running credit-decision engine; everything else stays flat so that window carries the page.

The audience is recruiters and ML leads deciding in under a minute. Identity, proof and the live demo all land in the first one and a half screens. The page refuses the category defaults: stat tiles in the hero, project card grids, eyebrow labels, monospace as decoration, gradient text, glass.

## Colors

Restrained strategy: tinted ledger neutrals plus a single brass accent.

### Primary
- **Brass** (#e3b55b): the only accent. Used for live state (status dot, demo URL dot, architecture nodes), the active nav underline, focus rings, text selection and link underlines on hover. Never a fill for large areas, never on body text. 10.1:1 on the page.

### Neutral
- **Ledger Ink** (#0d0f0c): page background, a green-black tinted toward the brass.
- **Ledger Raised** (#141712): the demo window and the mobile menu: surfaces that sit above the page.
- **Ledger Hover / Pressed** (#1b1f19 / #262b23): hover fills, selected segmented-control item.
- **Bone** (#e7eae2): primary text, primary button fill. 16.2:1.
- **Lichen** (#a6ad9f): secondary text: intros, descriptions, list items. 8.4:1.
- **Moss** (#858d80): tertiary text: durations, captions, table headers. 5.4:1.
- **Hairlines** (bone at 10% and 17%): every divider and border.

**The One Brass Rule.** Brass marks what is live, active or focused. If it's on screen for any other reason, remove it.

## Typography

**Display Font:** Archivo variable (width 62–125%, weight 100–900), with Arial Narrow fallback
**Body Font:** Geist variable, with system UI fallback

**Character:** Archivo set wide (112–125%) gives headings an engineered, instrument-like stance; Geist keeps reading quiet and exact. The contrast is width, not style.

### Hierarchy
- **Display** (560, 52–96px, 0.92, width 125%): the name in the hero only.
- **Headline** (560, 30–48px, 1.05, width 118%): section headings; the closing heading uses the same face at 40–72px.
- **Title** (600, 24–32px, 1.1, width 112%): project names; job titles at 19–22px with width 108%.
- **Lead** (450, 19–22px / hero statement 22–30px): one sentence that frames a block. Max 34–46ch.
- **Body** (400, 17px, 1.6): prose and lists, max 56–66ch.
- **Label** (400–600, 13–15px): meta, captions, table headers. Sentence case, never tracked caps. Numbers always tabular.

**The Wide-Is-Loud Rule.** Only headings get the expanded width. Body text never goes wide, and nothing gets all caps.

## Layout

A 12-column logic expressed as a 4 : 8 split (`minmax(0,4fr) minmax(0,8fr)`) inside a 1240px container with fluid gutters (`clamp(20px, 4vw, 48px)`). Section headings sit in the 4-column rail (sticky on desktop) and content in the 8. The featured case study breaks the split and runs full width; its body is a 3 : 4 : 5 row of problem, approach and results. Section padding is `clamp(80px, 6rem + 4vw, 160px)`, with more space above a heading than below it.

Breakpoints: 1080px (case body goes to two columns), 860px (split collapses, nav becomes a menu, the hero reorders to role, statement, actions), 640px (single column everywhere, architecture turns vertical, demo poster goes 4 : 5). Verified with no horizontal overflow at 390 and 1440.

## Elevation & Depth

Flat by default, separated by hairlines and tonal steps. One shadow exists, on the demo window, because it is the one physical object:

- **Window** (`0 1px 0 rgb(255 255 255 / .04) inset, 0 2px 6px rgb(0 0 0 / .35), 0 32px 64px -32px rgb(0 0 0 / .7)`): the live demo only. The mobile menu uses a single soft drop below it.

**The One Object Rule.** If a second element needs a shadow to stand out, the hierarchy is wrong.

## Shapes

Small, consistent radii: 6px for controls and tags, 8px for buttons and contact links, 12px for the demo window. Dots (status, live, architecture nodes) are the only circles. No pills except those dots, and no one-sided accent borders.

## Components

### Buttons
- **Shape:** 8px radius, 44px tall (36px small on desktop nav, 40px small on touch, 52px large).
- **Primary:** bone fill, ink text. Hover goes to white.
- **Quiet:** transparent with a 17% hairline; hover fills ledger-hover.
- **Press:** `scale(0.97)` over 140ms with a strong ease-out. Hover effects are gated to `(hover: hover) and (pointer: fine)`.

### Links
Bone text, 1px underline at 30% bone offset 5px. On hover the underline turns brass and any leading icon follows.

### Stack tags
Hairline border, 6px radius, 13px lichen text. Only for tools and technologies, never for categories.

### Navigation
Sticky 64px bar, ink at 92%; a hairline appears after the first 8px of scroll. Links are lichen and turn bone; the current section gets a brass underline that draws from the left. Below 860px: name plus a "Menu / Close" toggle opening a raised sheet with 22px wide-set links and a full-width CV button. Escape closes it and returns focus.

### Live demo window (signature component)
`<project-demo>`: a raised window with a segmented view switcher, the live URL with a brass dot, and fullscreen and new-tab controls. At rest it shows a real screenshot of the chosen view with a solid control strip ("This is a screenshot. The app itself is running." + Run it here). Running swaps in a sandboxed iframe with a loading state; a timeout gives an error card with Try again and Open in new tab. Without JavaScript every control is a plain link. It never bypasses X-Frame-Options or CSP.

### Architecture pipeline
An ordered list drawn as a rail: a hairline with an outlined brass node per step and a filled node on the last. It is numbered because it is a sequence. It goes vertical on phones.

## Do's and Don'ts

- **Do** show the working thing before describing it.
- **Do** put numbers in sentences or honest tables with tabular figures.
- **Do** keep one orchestrated motion moment (the hero entrance) and let everything else respond only to input.
- **Don't** add stat tiles, eyebrow labels, section numbers, gradient text, glass, or a second accent colour.
- **Don't** use monospace for anything that isn't code.
- **Don't** invent metrics, employers or demos. Missing facts stay empty in `src/data/portfolio.ts`.
