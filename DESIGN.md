---
name: Local Tavern
description: One person's library of games, books, films and music across every place they keep them, with a wheel for picking what's next.
status: direction (written before the v3 build; refreshed from the shipped build in Phase 7)
colors:
  walnut-ground: "oklch(0.19 0.018 55)"
  walnut-surface: "oklch(0.235 0.022 55)"
  walnut-raised: "oklch(0.28 0.026 55)"
  walnut-hairline: "oklch(0.36 0.026 60)"
  walnut-control-line: "oklch(0.56 0.03 65)"
  walnut-light-falloff: "oklch(0.27 0.035 68)"
  parchment-ink: "oklch(0.93 0.02 80)"
  parchment-muted: "oklch(0.75 0.025 75)"
  amber: "oklch(0.8 0.145 72)"
  amber-fill: "oklch(0.8 0.145 72)"
  on-amber: "oklch(0.22 0.03 55)"
  oxblood: "oklch(0.68 0.15 25)"
  moss: "oklch(0.76 0.11 135)"
  linen-ground: "oklch(0.95 0.022 82)"
  linen-surface: "oklch(0.985 0.01 85)"
  linen-raised: "oklch(0.92 0.026 78)"
  linen-hairline: "oklch(0.84 0.025 72)"
  linen-control-line: "oklch(0.6 0.035 60)"
  linen-light-falloff: "oklch(0.985 0.03 88)"
  walnut-ink: "oklch(0.25 0.035 50)"
  walnut-muted: "oklch(0.47 0.035 55)"
  deep-amber: "oklch(0.51 0.125 56)"
  oxblood-deep: "oklch(0.49 0.16 25)"
  moss-deep: "oklch(0.5 0.11 138)"
  wood-dark-top: "oklch(0.47 0.075 60)"
  wood-dark-face: "oklch(0.37 0.062 52)"
  wood-dark-edge: "oklch(0.25 0.04 48)"
  wood-light-top: "oklch(0.8 0.07 72)"
  wood-light-face: "oklch(0.69 0.078 63)"
  wood-light-edge: "oklch(0.54 0.07 55)"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.052rem"
    fontWeight: 800
    lineHeight: 1.0
    fontVariation: "'wdth' 100, 'opsz' 96"
  headline:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.953rem"
    fontWeight: 750
    lineHeight: 1.05
    fontVariation: "'wdth' 100, 'opsz' 48"
  title:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.15
    fontVariation: "'wdth' 92, 'opsz' 24"
  spine:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.0
    fontVariation: "'wdth' 75, 'opsz' 14"
  body:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.43
  caption:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
    fontFeature: "tnum"
rounded:
  object-book: "2px"
  object-box: "3px"
  object-case: "6px"
  sm: "4px"
  md: "6px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
motion:
  ease-out-expo: "cubic-bezier(0.16, 1, 0.3, 1)"
  spring-settle: "stiffness 380, damping 30"
  spring-pull: "stiffness 520, damping 34"
  spring-sheet: "stiffness 300, damping 32"
  stagger: "24ms per object, capped at 320ms total"
  duration-fast: "120ms"
  duration-base: "200ms"
  duration-slow: "320ms"
components:
  button-primary:
    backgroundColor: "{colors.amber-fill}"
    textColor: "{colors.on-amber}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.parchment-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.parchment-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  chip-selected:
    backgroundColor: "{colors.walnut-raised}"
    textColor: "{colors.parchment-ink}"
  input:
    backgroundColor: "{colors.walnut-surface}"
    textColor: "{colors.parchment-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  panel:
    backgroundColor: "{colors.walnut-surface}"
    rounded: "{rounded.md}"
    padding: "20px"
  sheet:
    backgroundColor: "{colors.walnut-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Local Tavern

> Direction document for the v3 library redesign, written before the build. The shipped build is the final authority; Phase 7 refreshes this file from it.

## Overview

**Creative North Star: "The Wall of Shelves"**

The library looks like a wall of real shelves in the owner's home: walnut boards, things standing on them as the objects they are, a soft light from above. Books show spines with page edges, board games stand as boxes, video games and films sit in keep-cases, records lean in their sleeves. You recognise the kind of thing before you read its title.

It is still a working tool (Operate mode). Navigation, tabs, chips, inputs, menus and dialogs are plain, standard web controls. The world lends exactly four things: type, palette, density and one signature move, the **spine pull-out**: pressing a spine slides it forward off the board and it grows into the full cover in the detail sheet.

Two themes, never mixed: **Stacks** (dark, the default; the couch at night) and **Reading Room** (light; daytime at the laptop). "Cozy Tavern" and "Sunlit Porch" are retired.

**Key Characteristics:**
- Chrome stays flat (walnut or linen panels, hairlines, 6px corners); the objects carry depth and color.
- Colour lives in the objects: saturated bookcloth, jacket and sleeve hues across the whole spectrum, not just earth tones.
- Bricolage Grotesque for names and numbers (heavy and wide in headings, condensed on spines); Figtree for everything you operate.
- One accent, amber, for the primary action, the selected state and the focus ring.
- Motion is physical: springs, settling, pulling. Under reduced motion it becomes short fades.
- Undo toasts instead of confirm dialogs.

## Colors

Restrained chrome, vivid objects. The neutral walnut/linen ramp is unchanged from v2 (its contrast is already verified); what changes is where colour is allowed.

### Chrome
- **Ground / Surface / Raised** (walnut-* dark, linen-* light): page, panels and dialogs, hover and selected fills.
- **Hairline** (decorative dividers) and **Control Line** (input and secondary-button borders, at least 3:1 against the ground).
- **Ink / Muted**: primary and secondary text (muted at least 5.4:1 on Raised).
- **Light falloff** (walnut-light-falloff / linen-light-falloff): a large radial gradient from the top centre of the page into the ground, so the upper shelves feel lit. Never a visible glow; it is felt, not seen.

### Accent
- **Amber** (amber dark, deep-amber light): accent text, icons, selected tab underline, focus ring.
- **Amber Fill + On Amber**: the primary button, the wheel pointer, text selection.

### Semantic
- **Oxblood**: danger, validation errors, "Out" RSVP, dropped status.
- **Moss**: success confirmations, "Going" RSVP, done status.

### Wood
- **Board** (wood-*-top, wood-*-face, wood-*-edge): every shelf board is a three-stop vertical gradient (lit top lip, face, shadowed underside) with a faint grain texture. Wood is a material, not a UI colour: it appears only on shelf boards and the wheel rim.

### Object palette (covers)
Twelve hues, picked from the title hash unless the owner chose one. Dark-ink hues are light covers; the rest carry light ink. Each pairing holds 4.5:1.

| id | OKLCH (base) | ink |
|---|---|---|
| vermilion | 0.52 0.17 32 | light |
| oxblood | 0.38 0.12 22 | light |
| coral | 0.80 0.10 30 | dark |
| ochre | 0.66 0.13 70 | dark |
| mustard | 0.82 0.14 90 | dark |
| sage | 0.78 0.06 140 | dark |
| bottle | 0.40 0.09 160 | light |
| teal | 0.46 0.075 200 | light |
| cobalt | 0.45 0.15 262 | light |
| slate | 0.42 0.04 245 | light |
| plum | 0.40 0.12 340 | light |
| walnut | 0.42 0.07 55 | light |

Each cover derives a darker spine (L −0.08), a band or label colour (hue +18°, lighter) and its ink from the base.

### Named Rules
**The Objects Carry Color Rule.** Saturated colour belongs to covers, spines and the wheel slices. Chrome stays on the neutral ramp plus amber. No new UI hues, no indigo, no gray utilities.

**The One Amber Rule.** Amber marks exactly one thing per area: the primary action, the selected option, or the focused control.

## Typography

**Display Font:** Bricolage Grotesque Variable (`@fontsource-variable/bricolage-grotesque/standard.css`: weight 200–800, width 75–100, optical size 12–96)
**Body Font:** Figtree Variable

**Character:** Bricolage has the ink traps and slightly irregular warmth of printed spine and box lettering, and its width axis lets one face run condensed up a 28px spine and wide and heavy across a heading. Figtree keeps the controls quiet. Alegreya is retired.

Scale, ratio 1.25: 0.75 / 0.875 / 1 / 1.25 / 1.563 / 1.953 / 2.441 / 3.052rem.

### Hierarchy
- **Display** (Bricolage 800, 3.052rem on desktop, 2.441rem on phones, line-height 1.0): the detail sheet title, the wheel winner, big stat figures.
- **Headline** (Bricolage 750, 1.953rem): place names above each shelf, tab headings, the wordmark.
- **Title** (Bricolage 700, 1.25rem, width 92): item titles in grid and list, dialog titles, month headings.
- **Spine** (Bricolage 700, 0.8125rem, width 75, set vertically bottom-to-top): titles on spines. Truncated with an ellipsis; the full title is always in the accessible name.
- **Body / Label / Caption** (Figtree): as before. Captions use tabular numerals.

### Named Rules
**The Lettered Names Rule.** Bricolage sets names (the app, a place, an item, a month, a number worth reading). It never sets a button, a label or a paragraph.

**The Tabular Rule.** Dates, durations, page counts and stats use tabular numerals.

**No eyebrows.** No small uppercase label above a heading.

## Layout

One centred container (max 80rem) with a 16px gutter on phones and 24px from 640px. Sticky header on the ground with a hairline under it: wordmark, Backup menu, theme toggle, then tabs **Library · Pick · Log**.

- **Library:** "Now" row of face-out covers (horizontal scroll on phones), the toolbar (search, kind chips, view switch, sort, "Add item"), then one shelf per place. Shelf view: each place is a headline plus one or more boards; spines stand on the board, boxes and records stand face-out at shelf height. Rows wrap to new boards, never scroll sideways on desktop; on phones each board scrolls horizontally with scroll snapping. Grid: covers in 2 / 4 (768px) / 6 (1280px) columns. List: dense rows with a small cover, title, kind, place and status.
- **Pick:** wheel first on phones; from 1024px filters left, wheel right. Game night mode adds the night panel on the left.
- **Log:** stats first on phones; from 1024px activity left (7fr), stats right (4fr).

Spacing is the 4px step; 48px between places on the shelf. Touch targets 40–48px; spines are at least 28px wide and at least 44px tall in their hit area.

## Elevation & Depth

Two regimes:

1. **Chrome is flat.** Panels, chips, inputs, the header and tabs use tonal layering and hairlines only.
2. **Objects are physical.** Covers, spines, boxes and records sit on boards and cast shadows downward and back.

### Shadow Vocabulary
- **Contact** (`0 1px 0 oklch(0.1 0.02 55 / 0.5), 0 6px 10px -4px oklch(0.1 0.02 55 / 0.45)`): every object resting on a board or the page.
- **Pulled** (`0 18px 28px -12px oklch(0.08 0.02 55 / 0.6)`): a spine pulled forward, a cover hovered in the grid, the wheel winner.
- **Popover / Toast / Dialog**: as in v2 (soft, warm-tinted, downward).
- In Reading Room every shadow uses the same recipe at about 60% opacity.

### Named Rules
**The Physical-Only Shadow Rule.** Only real objects and things that float (menus, toasts, dialogs, sheets) have shadows. No glass, no backdrop blur, no glow halos.

## Shapes

- Chrome: 6px corners for buttons, inputs, chips, panels; 4px for tags; 12px for the detail sheet and dialogs.
- Objects follow their real shapes: books 2px with a rounded spine crease; boxes 3px with a lid edge; keep-cases and jewel cases 6px; records square sleeves with a round disc peeking out; ebooks a device bezel; digital items a launcher tile.
- Aspect ratios: book 2:3, board box 1:1 or 4:3 (card games 3:4), keep-case 5:7, Blu-ray 4:5, record 1:1.

## Components

### Navigation
Tabs Library · Pick · Log with a 16px icon each. Muted idle, ink selected, 2px amber underline that slides between tabs. Arrow keys, Home and End move between tabs; the URL hash follows.

### Buttons, chips, inputs, toasts
Unchanged from v2 in shape and behaviour (6px corners, 40px buttons, 36px chips over hidden radios or checkboxes, 40px inputs at 1rem, undo toast bottom-centre). Primary is amber fill; one per area.

### Cover (signature)
`components/covers/Cover.jsx` picks a renderer by kind and format: BoardBox, Book, GameCase, FilmCase, Record. Each draws the object from `coverFor()` (base, spine, band, ink, monogram, ornament) and the kind's details (page edges, hinge strip, platform banner, disc). An uploaded image or image URL sits inside the object's frame so it still reads as a book or case; if the image fails, the generated cover shows. Every renderer has a **Spine** variant. Covers are decorative (`aria-hidden`); the title is always present as text or as the control's accessible name.

### Shelf
A place headline, then boards. Spines are buttons in a roving-tabindex row: arrow keys move along a board, Enter opens the item. Hover or focus lifts a spine 6px with the Pulled shadow; press slides it out and morphs it into the detail sheet's cover (`layoutId`).

### Detail sheet
A side sheet from the right on desktop, bottom sheet on phones, 12px corners, Dialog shadow. Large cover at the top left, title in Display, then kind-specific facts, status, rating, place, lent-to, notes, and actions (Log, Edit, Remove with undo).

### Wheel
Slices in each item's cover colours, a wood rim, an amber pointer that ticks on each slice edge. The winner's real cover flies out of its slice on a spring. Confetti only without reduced motion.

## Motion

Tokens live in `src/lib/motion.js`, framer-motion only.
- **Springs:** settle (380/30) for objects landing, pull (520/34) for spine lift and pull-out, sheet (300/32) for sheets and dialogs.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` for fades and reveals, 120 / 200 / 320ms.
- **Shelf entrance:** objects drop onto the board 8px with settle, staggered 24ms left to right, capped at 320ms per board.
- **Reduced motion:** no movement, no stagger, no confetti; opacity fades of at most 150ms; the wheel lands instantly.

## Do's and Don'ts

### Do:
- **Do** put colours on the semantic tokens so both themes follow.
- **Do** show an item as its object (cover or spine) wherever it appears.
- **Do** keep edit and remove always visible; undo instead of confirm.
- **Do** gate every animation on `useReducedMotion`.
- **Do** give every spine an accessible name with the full title, kind and place.

### Don't:
- **Don't** use a poster-thumbnail grid as the default view; the shelf is the home.
- **Don't** add shadows to chrome, or glass, blur or glow anywhere.
- **Don't** use indigo, gray or slate utilities, or hues outside the token ramp and the object palette.
- **Don't** set buttons, labels or paragraphs in Bricolage, or headings in Figtree.
- **Don't** use tavern, pub or fantasy vocabulary in copy.
- **Don't** use `window.confirm`, hover-only actions, or emoji as icons.
