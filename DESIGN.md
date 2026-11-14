---
name: Shelfspace
description: One person's library of games, books, films and music across every place they keep them, with a wheel for picking what's next.
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
  amber-fill-hover: "oklch(0.84 0.14 74)"
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
  cover-vermilion: "oklch(0.52 0.17 32)"
  cover-oxblood: "oklch(0.38 0.12 22)"
  cover-coral: "oklch(0.8 0.1 30)"
  cover-ochre: "oklch(0.66 0.13 70)"
  cover-mustard: "oklch(0.82 0.14 90)"
  cover-sage: "oklch(0.78 0.06 140)"
  cover-bottle: "oklch(0.4 0.09 160)"
  cover-teal: "oklch(0.46 0.075 200)"
  cover-cobalt: "oklch(0.45 0.15 262)"
  cover-slate: "oklch(0.42 0.04 245)"
  cover-plum: "oklch(0.4 0.12 340)"
  cover-walnut: "oklch(0.42 0.07 55)"
  cover-ink-light: "oklch(0.96 0.02 85)"
  cover-ink-dark: "oklch(0.22 0.03 55)"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.052rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.488rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  place:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.074rem"
    fontWeight: 750
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.44rem"
    fontWeight: 700
    lineHeight: 1.15
  object-title:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.25
    fontVariation: "'wdth' 92"
  spine:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(0.75rem, 44cqw, 1.2rem)"
    fontWeight: 720
    lineHeight: 1
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
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.amber-fill}"
    textColor: "{colors.on-amber}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.amber-fill-hover}"
    textColor: "{colors.on-amber}"
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
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.parchment-muted}"
    typography: "{typography.label}"
    padding: "0 16px"
    height: "48px"
  tab-selected:
    textColor: "{colors.parchment-ink}"
  tag:
    backgroundColor: "{colors.walnut-raised}"
    textColor: "{colors.parchment-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  dialog:
    backgroundColor: "{colors.walnut-surface}"
    textColor: "{colors.parchment-ink}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    width: "min(34rem, calc(100vw - 2rem))"
  detail-sheet:
    backgroundColor: "{colors.walnut-surface}"
    textColor: "{colors.parchment-ink}"
    rounded: "{rounded.lg}"
    padding: "28px"
    width: "min(30rem, 100vw)"
  toast:
    backgroundColor: "{colors.walnut-raised}"
    textColor: "{colors.parchment-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "6px 6px 6px 16px"
    width: "28rem"
---

# Design System: Shelfspace

## Overview

**Creative North Star: "The Wall of Shelves"**

The library looks like a wall of real shelves in the owner's home: walnut boards, things standing on them as the objects they are, a warm light falling from above onto faintly grained paper. Books show bookcloth spines with head and tail bands, board games stand as lidded boxes, video games and films sit in keep-cases behind a clear sleeve, records lean in their sleeves with the disc peeking out. You recognise the kind of thing before you read its title.

It is still a working tool. Navigation, tabs, chips, inputs, menus and dialogs are plain, flat web controls on a neutral walnut (or linen) ramp. The world lends four things: lettering, palette, density and one signature move, the **spine pull-out**: hovering or focusing a spine tips it forward off the board, pressing pulls it further, and it travels into the detail sheet as the full cover.

Two themes, never mixed: **Stacks** (dark, the default; the couch at night) and **Reading Room** (light; daytime at the laptop). The theme is set on `<html data-theme>` before first paint.

**Key Characteristics:**
- Chrome stays flat (surface panels, hairlines, 6px corners); only objects and things that float carry shadows.
- Colour lives in the objects: twelve bookcloth, jacket and sleeve hues across the whole spectrum.
- Bricolage Grotesque sets names and numbers (heavy in headings, condensed on spines); Figtree sets everything you operate and read.
- One accent, amber, for the primary action, the selected state and the focus ring.
- Motion is physical on objects (springs, a lift that overshoots a hair) and brief everywhere else; reduced motion keeps the fades and drops the travel.
- Undo toasts instead of confirm dialogs.

## Colors

Restrained chrome, vivid objects. Every chrome colour is a semantic token (`--bg`, `--surface`, `--raised`, `--line`, `--line-strong`, `--ink`, `--muted`, `--accent`, `--accent-fill`, `--on-accent`, `--danger`, `--ok`) that each theme redefines, so components never name a theme.

### Primary
- **Amber** (amber in Stacks, deep-amber in Reading Room): accent text and links, icons that mark the current thing, the selected-tab underline, the selected chip border, the focus ring, the caret.
- **Amber Fill + On Amber** (the same fill in both themes, with dark ink): the primary button, the wheel pointer, the lent marker on objects, the active-filter count, text selection, native checkbox and radio accents. Hover lifts the fill slightly lighter (amber-fill-hover).

### Neutral
- **Ground** (walnut-ground / linen-ground): the page.
- **Surface** (walnut-surface / linen-surface): dialogs, the detail sheet, the filter panel, inputs.
- **Raised** (walnut-raised / linen-raised): hover fills, selected chips and view-switch segments, tags, the toast, the locked-pick card.
- **Hairline** (walnut-hairline / linen-hairline): decorative dividers, list rules, idle chip borders.
- **Control Line** (walnut-control-line / linen-control-line): input, secondary-button, dialog and toast borders; at least 3:1 against the ground.
- **Ink / Muted** (parchment-ink, parchment-muted / walnut-ink, walnut-muted): primary and secondary text.
- **Light Falloff** (walnut-light-falloff / linen-light-falloff): a wide radial gradient from above the top centre of the page into the ground, so the upper shelves feel lit. Felt, not seen.
- **Paper grain**: a fixed fractal-noise layer over the whole page at 7% (Stacks) or 5% (Reading Room) opacity, below content.

### Semantic
- **Oxblood** (oxblood / oxblood-deep): danger hovers, validation errors, dropped status.
- **Moss** (moss / moss-deep): done status, success confirmations.
- Status colour stays on this ramp: amber for in progress, moss for done, oxblood for dropped, muted for backlog and wishlist (an outlined or dashed dot).

### Wood
- **Board** (wood-*-top, wood-*-face, wood-*-edge): every shelf board is 1.125rem thick: a three-stop band (3px lit top lip, face, 3px shadowed underside) with a soft shadow falling below it, and wood grain on the face (procedural fractal-noise SVG stretched along the board, dark streaks only, one strength per theme, one layer per wrapped row). The wheel rim uses the same three stops as a radial gradient.

### Object palette (covers)
Twelve hues (cover-*), picked from the title's hash unless the owner chose one. Mustard, coral, ochre and sage are light covers with dark ink (cover-ink-dark); the rest carry light ink (cover-ink-light). Each pairing holds 4.5:1. From the base each cover derives a darker spine (L −0.08), a band colour (hue +18°, lighter on dark covers and darker on light ones) and a small per-title lightness shift that only ever moves away from the ink. Retired v2 colour ids map to the nearest hue (brick→vermilion, amber→ochre, olive→sage, moss→bottle, verdigris→teal, heather→plum).

### Named Rules
**The Objects Carry Color Rule.** Saturated colour belongs to covers, spines, wheel slices and confetti. Chrome stays on the neutral ramp plus amber, oxblood and moss. No new UI hues, no Tailwind palette utilities.

**The One Amber Rule.** Within one area amber marks one thing: the primary action, the selected option, or the focused control. One amber-filled button per area.

**The Wood Is Material Rule.** Wood appears only on shelf boards and the wheel rim. It is never a panel, button or background colour.

## Typography

**Display Font:** Bricolage Grotesque Variable (standard axes: weight, width 75–100, optical size)
**Body Font:** Figtree Variable

**Character:** Bricolage has the ink traps and slight irregularity of printed spine and box lettering, and its width axis lets one face run condensed up a 28px spine and heavy across a heading. Figtree keeps the controls quiet.

The scale is fixed rem at a ratio of about 1.2 (0.75 / 0.875 / 1 / 1.2 / 1.44 / 1.728 / 2.074 / 2.488rem), plus one 3.052rem step for the detail-sheet title on wide screens.

### Hierarchy
- **Display** (800, 2.488rem rising to 3.052rem from 768px, line-height 1, tight tracking): the item title in the detail sheet.
- **Headline** (800, 2.074rem rising to 2.488rem from 640px): tab headings (Library, Now, Log, Can't decide?, a game night's date) and the wheel winner and locked pick (line-height 1.05). A quiet Figtree count or summary may sit on the same baseline.
- **Place** (750, 1.728rem rising to 2.074rem): place names above each shelf, with a muted icon and item count beside.
- **Title** (700, 1.44rem): dialog titles, panel headings, month headings in the log. Smaller panel headings and log entries step down to 1.2rem.
- **Object title** (700, 1rem, width 92): item names under covers in the grid, Now row and list rows; turns amber on hover.
- **Spine** (720, width 75, set vertically reading bottom to top): the title is fitted to the spine's length (`titleFit` in `Spine.jsx`): its size steps down with the title length to a 0.6rem floor (max 1.2rem), spines 2.125rem or wider then take two balanced lines, and only then does an ellipsis cut it. The foot line (author surname) runs at 500, width 80. The full title is always in the accessible name.
- **Body** (Figtree 400, 1rem, line-height 1.5): paragraphs, input text (1rem so phones never zoom).
- **Label** (Figtree 600, 0.875rem): buttons, tabs (1rem from 640px), chips, field labels, toasts.
- **Caption** (Figtree 600, 0.75rem): status, tags, badges, Now-row metadata.

### Named Rules
**The Lettered Names Rule.** Bricolage sets names and numbers worth reading: the wordmark, a place, an item, a month, a date. It never sets a button, a field label or a paragraph; Figtree never sets a heading.

**The Tabular Rule.** Dates, times, counts, durations, page counts and stats use tabular numerals.

**The No Eyebrow Rule.** No small label stacked above a heading. Counts and context sit on the heading's baseline or below it.

## Layout

One centred container (max 80rem) with a 16px gutter on phones and 24px from 640px. A header on the ground with the wordmark, Backup menu and theme toggle, then the tabs **Library · Pick · Log** over a hairline. The URL hash follows the tab.

- **Library:** the Now row of face-out covers (7rem objects that scroll sideways with snap on phones, 9rem and wrapping from 640px), the Library heading with item and place counts, the toolbar, then the view. Toolbar from 640px: search, view switch, Places, Add item, then kind chips and a Filters disclosure. On phones it is two rows (search and Add; view switch, Places and Filters) and the kind chips move into the Filters panel, so the first shelf reaches the first screen. Chip rows wrap at every width; nothing clips.
  - **Shelf:** one section per place, 48px between places. From 1024px small places (8 items or fewer) pair up two to a row; larger ones span the full width. Objects stand on wooden boards; spines stand shoulder to shoulder (2px apart), boxes and records stand face-out with 8px of air. Rows wrap onto new boards on wider screens; on phones each place is a single board that scrolls sideways edge to edge with snap, its far edge fading out (3rem mask) until scrolled to the end.
  - **Grid:** 2 / 3 (640px) / 4 (768px) / 6 (1280px) columns; each cover stands on the floor of a fixed 5:6 stage so mixed aspect ratios align on one baseline.
  - **List:** dense rows between hairlines: a small cover, title and byline, then kind, place and status in columns from 768px, with Edit and Remove always visible.
- **Pick:** one centred column (max 36rem): heading, the filters folded to a one-line summary ("What goes on the wheel · Not started · Every kind · Any length · Every place") that opens in place, then the wheel. The wheel card states the pool once ("16 of 27 on the wheel" with Reshuffle beside it). After a spin the Spin button steps down to a secondary "Spin again", so the result's action is the only amber. Game night switches to two columns from 1024px: night panel and filters left (5fr), wheel right (6fr).
- **Log:** the activity list first at every width (logging happens on the phone); stats follow it on phones and sit right (4fr) of the list (7fr) from 1024px. The stats open with the year as one sentence ("So far in 2026 you finished 1 thing, read 304 pages…") that leaves out anything at zero; no big-number tiles. A game night is a date with a board-game session that lists at least one other player (the host is never listed). Stat bars are drawn in Muted, not amber (One Amber Rule). Empty, the Log offers the Now items as covers to log first.

Spacing runs on the 4px step. Touch targets are 36–48px (40px buttons and inputs, 36px chips, 48px tabs); spines are at least 28px wide.

## Elevation & Depth

Two regimes. **Chrome is flat**: the header, tabs, chips, inputs and panels use tonal layering (ground, surface, raised) and hairlines only. **Objects are physical**: every cover and spine casts a `drop-shadow` that follows its silhouette (record discs, box lids, case hinges), and lifting it swaps the contact shadow for a longer pulled one. Things that float (dialogs, the detail sheet, toasts, menus) carry soft, warm-tinted downward shadows. Reading Room uses the same recipes in a lighter warm brown at roughly 60% strength.

### Shadow Vocabulary
- **Contact** (`--obj-contact`): every object at rest on a board or the page.
- **Pulled** (`--obj-pulled`): an object hovered or focused in the shelf, grid, list or Now row.
- **Board** (`--board-shadow`): the soft fall-off below each shelf board.
- **Sheet / Dialog** (`--sheet-shadow`, `0 24px 64px -24px`): the detail sheet and modal dialogs, over a 60% walnut backdrop with no blur.
- **Popover** (`0 12px 32px -12px`): menus such as Backup.
- **Toast** (`0 8px 24px -8px`): the undo toast.

### Named Rules
**The Physical-Only Shadow Rule.** Only real objects and things that float have shadows. No glass, no backdrop blur, no glow halos on chrome. Light on objects (a sleeve's glare, a lid's sheen) is part of drawing the object, not a UI effect.

## Shapes

- Chrome: gently rounded 6px corners on buttons, inputs, chips, toasts, panels and modal dialogs; 4px on tags and small badges; 8px on the detail sheet's open edges (top on phones, left on desktop); full pills only for switches, status dots and the lent marker.
- Objects follow their real shapes and scale their corners with their own width (container units), so an object reads the same at 40px in a list row and at 320px in the sheet: books with a page block and a hinge crease, boxes with a lid lip (card games a tuck box with a flap), keep-cases with a hinge and platform banner, cartridges with a grip and label, ebooks in a bezel, audiobooks over a waveform, records with the disc peeking out, digital items as launcher tiles. Spines are nearly square-cornered (1.5–3px).
- Front aspect ratios come from the real objects: print book 2:3, board box 1:1, card game 3:4, game and DVD case 5:7, Blu-ray 4:5, vinyl 29:25 and CD 8:7 (disc included), audiobook 1:1.

## Components

### Navigation
Plain and quiet. Tabs Library · Pick · Log, 48px tall, each with a 16px icon. Muted idle, ink on hover and when selected; a 2px amber underline slides between tabs on the indicator spring. Arrow keys, Home and End move between tabs (automatic activation). Inactive panels stay mounted but hidden; an arriving panel rises 6px and fades in over 240ms.

### Buttons
- **Shape:** 6px corners, 40px tall, Figtree label weight, 16px icon with an 8px gap.
- **Primary:** amber fill with dark ink; hover lightens the fill. One per area.
- **Secondary:** transparent with a control-line border; hover fills raised.
- **Ghost / Icon:** muted text on transparent, ink plus raised fill on hover; destructive icon buttons hover to oxblood. Icon buttons are 40px square.
- **Press:** a 1px drop (only with motion allowed). Disabled at half opacity.
- **Focus:** the global ring, 2px amber outline at 2px offset, keyboard only.

### Chips
Radio and checkbox groups drawn as 36px chips over a visually hidden input. Idle: hairline border, muted text; hover strengthens the border and the text. Selected: amber border, raised fill, ink text. The keyboard ring follows the hidden input. The view switch is a segmented variant inside a hairline frame, selected segment raised.

### Inputs / Fields
40px, 6px corners, surface fill, control-line border that strengthens on hover; 1rem text; muted placeholders; `aria-invalid` turns the border oxblood. Labels sit above in label weight; hints are muted 0.875rem.

### Dialogs
Native modal `<dialog>`: 6px corners, control-line border, surface fill, sheet shadow, up to 34rem wide. A title row and an action row, each separated by a hairline. It arrives with a 200ms fade, a 12px rise and a scale from 0.98 (320ms), and closes instantly.

### Toast
Bottom centre, up to 28rem, raised fill with a control-line border. Message, an amber Undo action and a dismiss button; the timer pauses while pointer or focus is inside. Rises 16px in, drops 8px out faster than it came.

### Cover (signature)
One renderer per kind and format draws the item as its object from a recipe (base, spine, band, ink, monogram, ornament) through four CSS properties. Ornaments vary per title (bands, frame, corner, sun, stripes); covers too small to letter a title show the monogram. An uploaded image or image URL sits inside the object's frame so it still reads as a book or case, and the generated art shows if it fails. Every renderer has a spine view. Covers are decorative; the title is always present as text or as the control's accessible name.

### Shelf
A place heading, then a board. Objects are buttons in one roving-tabindex row per place: arrow keys move along the board across wrapped rows, Home and End jump, Enter opens the item. Objects drop onto the board 8px with a short left-to-right stagger. **The spine pull-out:** hover (on hover-capable devices) or keyboard focus lifts the object 6px with the pulled shadow on the overshooting pull curve (280ms); pressing pulls it to 10px and 1.03 scale in 120ms; release opens the sheet and the object travels into it through a shared layout, leaving a ghost of its size in the slot until it returns. A lent item carries a small amber hand marker at its foot.

### Detail sheet
A side sheet from the right on desktop (up to 30rem), a bottom sheet from 6% below the top on phones. Large cover in a top slot, title in Display, byline and kind line in muted, then status chips, rating, a facts list (place, length or pages, players, platform, use count, added) on hairlines, tags, notes, and actions (Log, Edit, Remove with undo). The rest of the app is inert; Esc and the backdrop close it, and focus returns to the object that opened it.

### Wheel
Slices in each item's cover base with a spine-colour rim band and cover ink, separated by ground-coloured strokes, inside a wooden rim with pegs; an amber hub ring and an amber-fill pointer that flicks back on each peg. The spin decelerates over 4.4s. The winner's cover flies out of its slice on a loose spring that overshoots once, into a raised, amber-bordered result card; confetti in amber and object hues follows. Under reduced motion the wheel lands at once with no confetti.

## Do's and Don'ts

### Do:
- **Do** put every chrome colour on the semantic tokens so both themes follow.
- **Do** show an item as its object (cover or spine) wherever it appears, sized from its real aspect ratio.
- **Do** keep Edit and Remove always visible, and undo instead of confirm.
- **Do** give every moving thing a reduced-motion form: keep the opacity fade (about 150ms), drop the travel, the stagger and the confetti.
- **Do** write object lift with `translate` and `scale` so it never fights the transform the shared-layout move writes.
- **Do** make arrivals confident (ease-out-expo, 200–320ms) and exits faster than arrivals; dialogs close instantly.
- **Do** give every spine an accessible name with the full title, kind and place.

### Don't:
- **Don't** make a poster-thumbnail grid the default view; the shelf is home.
- **Don't** put shadows on chrome, or glass, backdrop blur or glow anywhere in the interface.
- **Don't** use Tailwind palette utilities (indigo, gray, slate) or hues outside the token ramp and the object palette.
- **Don't** set buttons, labels or paragraphs in Bricolage, or headings in Figtree.
- **Don't** stack a small label above a heading.
- **Don't** use tavern, pub or fantasy vocabulary in copy.
- **Don't** use `window.confirm`, hover-only actions, or emoji as icons.
