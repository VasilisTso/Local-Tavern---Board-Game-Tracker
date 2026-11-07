---
name: Local Tavern
description: A host's own board game shelf, guest list, Fate Wheel and play ledger, kept in the browser.
colors:
  walnut-ground: "oklch(0.19 0.018 55)"
  walnut-surface: "oklch(0.235 0.022 55)"
  walnut-raised: "oklch(0.28 0.026 55)"
  walnut-hairline: "oklch(0.36 0.026 60)"
  walnut-control-line: "oklch(0.56 0.03 65)"
  parchment-ink: "oklch(0.93 0.02 80)"
  parchment-muted: "oklch(0.75 0.025 75)"
  candle-amber: "oklch(0.8 0.145 72)"
  amber-fill: "oklch(0.8 0.145 72)"
  on-amber: "oklch(0.22 0.03 55)"
  oxblood: "oklch(0.68 0.15 25)"
  moss: "oklch(0.76 0.11 135)"
  linen-ground: "oklch(0.95 0.022 82)"
  linen-surface: "oklch(0.985 0.01 85)"
  linen-raised: "oklch(0.92 0.026 78)"
  linen-hairline: "oklch(0.84 0.025 72)"
  linen-control-line: "oklch(0.6 0.035 60)"
  walnut-ink: "oklch(0.25 0.035 50)"
  walnut-muted: "oklch(0.47 0.035 55)"
  deep-amber: "oklch(0.51 0.125 56)"
  oxblood-deep: "oklch(0.49 0.16 25)"
  moss-deep: "oklch(0.5 0.11 138)"
typography:
  display:
    fontFamily: "Alegreya Variable, Iowan Old Style, Georgia, serif"
    fontSize: "2.074rem"
    fontWeight: 700
    lineHeight: 1.15
  headline:
    fontFamily: "Alegreya Variable, Iowan Old Style, Georgia, serif"
    fontSize: "1.728rem"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "Alegreya Variable, Iowan Old Style, Georgia, serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.15
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
  sm: "4px"
  md: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
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
  button-secondary-hover:
    backgroundColor: "{colors.walnut-raised}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.parchment-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.parchment-muted}"
    rounded: "{rounded.md}"
    size: "40px"
  input:
    backgroundColor: "{colors.walnut-surface}"
    textColor: "{colors.parchment-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
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
  panel:
    backgroundColor: "{colors.walnut-surface}"
    rounded: "{rounded.md}"
    padding: "20px"
  tag:
    backgroundColor: "{colors.walnut-raised}"
    textColor: "{colors.parchment-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
---

# Design System: Local Tavern

## Overview

**Creative North Star: "The Host's Ledger"**

Local Tavern looks like the book a good host keeps behind the bar: ink on walnut by candlelight, or ink on sun-warmed linen by day. It is a working tool for one person who plans on a laptop and picks the game on a phone at the table, so the controls are plain and familiar: standard tabs, inputs, dialogs, chips. The world comes from three things only: a real display serif, a warm palette with one candle-amber accent, and the game boxes.

The game boxes are the signature. Every game gets a generated cover (a curated warm hue from its title or the host's chosen color, a darker spine, a light band or frame, an Alegreya monogram). The same cover appears on the shelf card, on its slice of the Fate Wheel, in the wheel result, in the locked pick, in the ledger and in the dust list. They are the only large areas of saturated color in the app.

Density is comfortable, not airy: flat panels separated by hairlines, generous space between groups, tight space inside them. Two themes, never mixed: **Cozy Tavern** (dark, the default and the at-the-table theme) and **Sunlit Porch** (light).

**Key Characteristics:**
- Flat walnut or linen panels with hairline borders, 4–6px corners, faint paper grain over the page.
- Alegreya for anything you would letter by hand (wordmark, headings, game titles, big numbers); Figtree for everything you operate.
- One accent, candle amber, for the primary action, the selected state and the focus ring.
- Generated game-box covers carry the color; the interface around them stays neutral.
- Every destructive action is undone from a toast, not confirmed in a dialog.

## Colors

A warm, low-chroma neutral ramp (walnut in the dark, linen in the light) with one candle-amber accent and two semantic colors.

### Primary
- **Candle Amber** (candle-amber, dark; deep-amber, light): accent text, icons, links, selected tab underline, focus ring, bars in the stats. Light mode drops to Deep Amber so text stays at least 4.5:1 on linen.
- **Amber Fill** (amber-fill, both themes) with **On Amber** text (on-amber): the primary button and the wheel pointer. The fill stays bright in both themes; the text on it is always dark walnut (9.1:1).

### Neutral
- **Walnut Ground / Linen Ground** (walnut-ground / linen-ground): page background, under the grain.
- **Walnut Surface / Linen Surface** (walnut-surface / linen-surface): panels, dialogs, inputs, menus.
- **Walnut Raised / Linen Raised** (walnut-raised / linen-raised): header-level emphasis, hover fills, selected chips, tags, toasts.
- **Hairline** (walnut-hairline / linen-hairline): decorative dividers and panel borders only.
- **Control Line** (walnut-control-line / linen-control-line): input, select and secondary-button borders (at least 3:1 against the ground).
- **Parchment Ink / Walnut Ink** (parchment-ink / walnut-ink): primary text.
- **Parchment Muted / Walnut Muted** (parchment-muted / walnut-muted): secondary text, metadata, idle icons (at least 5.4:1 on raised).

### Semantic
- **Oxblood** (oxblood / oxblood-deep): danger hover on remove buttons, validation errors, "Out" RSVP, vetoed games, the "House rule:" label.
- **Moss** (moss / moss-deep): "Going" RSVP, "Logged in the ledger" confirmation.

### Named Rules
**The One Candle Rule.** Amber marks exactly one thing per area: the primary action, the selected option, or the focused control. Never use it as a background wash or a decorative stroke.

**The Covers Carry Color Rule.** Saturated hues belong to the game covers. Interface chrome stays on the neutral ramp; no new brand hues, no indigo, no gray utilities.

## Typography

**Display Font:** Alegreya Variable (with Iowan Old Style, Georgia)
**Body Font:** Figtree Variable (with system-ui)

**Character:** A bookish, calligraphic serif for the names of things, paired with a clear geometric sans for the controls. The serif says "ledger"; the sans keeps it a tool.

Fixed rem scale, ratio about 1.2: 0.75 / 0.875 / 1 / 1.2 / 1.44 / 1.728 / 2.074 / 2.488rem.

### Hierarchy
- **Display** (Alegreya 700, 2.074rem, 1.15): the night's date on Tonight, the locked pick's title, big stat figures.
- **Headline** (Alegreya 700, 1.728rem, 1.15): tab headings ("The shelf", "The ledger") and the wordmark.
- **Title** (Alegreya 700, 1.2–1.44rem, 1.15): panel headings, dialog titles, game titles on cards, month headings.
- **Body** (Figtree 400, 1rem, 1.5): descriptions, empty states, form values. Prose capped at about 65ch.
- **Label** (Figtree 600, 0.875rem): buttons, field labels, chips, tabs.
- **Caption** (Figtree 600, 0.75rem, tabular numerals): legend labels, play counts, tags.

### Named Rules
**The Lettered Names Rule.** Alegreya is for names (the app, the night, a game, a month, a number worth reading). It never sets a button, a label or a paragraph.

**The Tabular Rule.** Dates, times, counts and stats use tabular numerals so columns and changing values never jitter.

**No eyebrows.** No small uppercase label above a heading. Status or flavor text goes beside or below the title in the same line as its metadata.

## Layout

One centered container (max 72rem) with a 16px gutter on phones and 24px from 640px up. The header (wordmark, Backup menu, theme toggle, then the tab row) is sticky on the ground color with a hairline under it.

- **Tonight:** stacked on phones with the Fate Wheel (or the locked pick) first; from 1024px two columns, the table (date, guests, house rule) left at 5fr and the wheel right at 6fr.
- **Shelf:** heading row with the primary "Add game", the toolbar (search, sort, chip groups, tag picker), then cards in 1 / 2 (768px) / 3 (1280px) columns with a 12px gap. On phones the chip groups scroll sideways instead of wrapping.
- **Ledger:** stats first on phones; from 1024px the play list left at 7fr and stats right at 4fr.

Spacing follows the 4px Tailwind step: 4–8px inside a group, 16–24px between groups, 20px panel padding (16px on phones). Touch targets are 36–48px; nothing interactive is smaller than 32px.

## Elevation & Depth

Flat by default. Depth comes from tonal layering (ground, surface, raised) and hairline borders, not shadows. Shadows exist only on things that float above the page, and every one has a downward offset and a soft, warm-tinted blur.

### Shadow Vocabulary
- **Cover lift** (`box-shadow: 0 1px 2px oklch(0.1 0.02 55 / 0.35)`): game covers, so the box sits on the page.
- **Popover** (`box-shadow: 0 12px 32px -12px oklch(0.1 0.02 55 / 0.55)`): Backup menu, tag picker.
- **Toast** (`box-shadow: 0 8px 24px -8px oklch(0.1 0.02 55 / 0.5)`): the undo toast.
- **Dialog** (`box-shadow: 0 24px 64px -24px oklch(0.08 0.02 55 / 0.7)`): native dialogs, over a warm 60% walnut backdrop.

### Named Rules
**The Floating-Only Shadow Rule.** If it does not float over other content, it has no shadow. No glass, no blur, no glow halos.

## Shapes

Gently squared corners: 6px for panels, buttons, inputs, chips and dialogs; 4px for tags, covers and small fills; full round only for the wheel, its hub and the color swatches. Borders are 1px everywhere. Dashed 1px Control Line borders mark empty states ("The shelf is bare"). Game covers are 3:4 portrait boxes with a spine on the left 14%.

## Components

Plain and well-made: standard controls built carefully, no custom styling for its own sake.

### Buttons
- **Shape:** 6px corners, 40px tall (the Spin button is 48px), Figtree 600 at 0.875rem, icon left at 16px.
- **Primary:** Amber Fill with On Amber text. One per area: Add game, Spin the wheel, Lock in for tonight, Log this play, Save.
- **Secondary:** transparent with a Control Line border and ink text; hover fills Raised.
- **Ghost:** muted text, no border; hover goes to ink on Raised. Used for "Change pick".
- **Icon buttons:** 40px square, muted icon; edit/remove are always visible (never hover-only). Remove hovers to Oxblood.
- **Press:** 1px downward nudge. **Disabled:** 50% opacity, no pointer events.

### Chips
- **Style:** 36px tall, 6px corners, Hairline border, muted text; backed by a visually hidden radio or checkbox.
- **Selected:** Candle Amber border, Raised fill, ink text. RSVP segments use Moss (Going), Amber (Maybe) and Oxblood (Out) for the selected border and text.

### Cards / Containers
- **Panels:** Surface fill, 1px Hairline border, 6px corners, 20px padding (16px on phones). Never nested.
- **Game card:** a panel with the cover at 64–72px wide, title in Alegreya, players and playtime with 14px icons, tags, then play count and last played pinned to the bottom. Border goes to Control Line on hover.
- **Highlighted panels** (wheel result, locked pick): Candle Amber 1px border, no fill change beyond Raised for the result.

### Inputs / Fields
- **Style:** 40px tall, Surface fill, Control Line border, 6px corners, 1rem text so phones never zoom.
- **Focus:** the global 2px Candle Amber outline at 2px offset. **Error:** Oxblood border plus an Oxblood message under the field naming the problem.
- **Inline edits** (guest notes, house rule) keep a draft and save on blur or Enter; Escape reverts.

### Navigation
- **Tabs:** Tonight · Shelf · Ledger, each with a 16px icon and an optional count badge (Raised, caption). Muted when idle, ink when selected, with a 2px Candle Amber underline that slides between tabs. Arrow keys, Home and End move between tabs; the URL hash follows.

### Game Cover (signature)
Generated from the title: an FNV hash picks one of eleven curated warm hues (oxblood, brick, walnut, amber, ochre, olive, moss, verdigris, slate, heather, plum) unless the host picked one, lightness 0.40–0.50 so the parchment monogram stays at least 4.5:1, a spine 0.1 darker, and one of three ornaments (bands, frame, corner). Always decorative (`aria-hidden`); the title is always rendered as text beside it.

### Fate Wheel (signature)
An SVG wheel of up to 16 slices in each game's cover colors with a spine-colored rim and radial labels. A static hub with the die mark and an amber pointer that flicks as each slice edge passes. The spin is a 4.4s ease-out (`cubic-bezier(0.12, 0.72, 0.1, 1)`); the result is read from the final angle, revealed in an amber-bordered card and celebrated with a small confetti burst. Reduced motion lands instantly with no confetti.

### Toast
Bottom-centered, Raised fill, Control Line border, toast shadow. Carries the message, an optional amber "Undo" action and a dismiss button; the timer pauses on hover and focus.

## Do's and Don'ts

### Do:
- **Do** put new colors on the semantic tokens (bg, surface, raised, line, line-strong, ink, muted, accent, accent-fill, on-accent, danger, ok) so both themes follow.
- **Do** show a game as its generated cover wherever it appears, passing the game's chosen color.
- **Do** use undo toasts for removals and replacements; keep edit and remove buttons always visible.
- **Do** gate every animation on reduced motion: fade instead of move, instant spin, no confetti.
- **Do** ease out with `cubic-bezier(0.16, 1, 0.3, 1)` for entrances and reveals, 160–420ms.
- **Do** theme the browser surfaces: selection in Amber Fill, caret in Candle Amber, scrollbars in Control Line.

### Don't:
- **Don't** use indigo, gray or slate utilities, or any hue outside the palette and the cover set.
- **Don't** add glass, backdrop blur, glow halos or large drop shadows on resting panels.
- **Don't** put a small uppercase label above a heading.
- **Don't** use a colored side border thicker than 1px on callouts, cards or list rows.
- **Don't** set buttons, labels or paragraphs in Alegreya, or headings in Figtree.
- **Don't** use `window.confirm` or hover-only actions.
- **Don't** use emoji or text glyphs as icons; use lucide icons at a consistent stroke.
