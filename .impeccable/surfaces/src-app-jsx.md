---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: []
---

# Local Tavern app shell (Tonight / Shelf / Ledger)

Mode: Operate. Single-page app, tabs synced to URL hash. Host plans on laptop, picks the game on a phone at the table in dim light.

Task per tab: Tonight = who is coming + Fate Wheel pick + lock in; Shelf = find/curate games; Ledger = log plays, read stats. Key states: empty shelf, no guests, wheel with 0 / 1 / 20 games, no plays yet, undo after delete.

## Direction contract

THESIS: A host's own game shelf and night ledger, not a SaaS dashboard. Refuses the default indigo card grid with glass header; standard tabs, inputs and dialogs, with the world carried by type, palette and the game-box covers.

OWN-WORLD: Dark "Cozy Tavern": walnut ground (oklch .19 .018 55), raised walnut panels, candle-amber accent (oklch .80 .145 72), oxblood danger, moss ok, warm parchment ink. Light "Sunlit Porch": sun-warmed linen ground, near-white surfaces, walnut ink, deeper amber for text accents. Flat panels, hairline rules, 4–6px radii, faint paper grain, no glass, no big shadows. Alegreya (display: headings, wordmark, game titles, stat numbers) + Figtree (all UI and body), tabular numerals.

STORY: The host sees tonight at a glance (date, who is coming, the pick), filters the shelf to what fits, spins, locks in, and logs the result in one tap; over weeks the Ledger becomes the group's memory.

FIRST VIEWPORT: Header bar with Local Tavern wordmark left, theme toggle and backup menu right; tab row (Tonight · Shelf · Ledger) with amber underline. Tonight: night summary line ("Fri 14 Nov, 19:30 · 4 coming · 1 maybe") over two columns on desktop: guests + house rule left, Fate Wheel right with Spin as the primary amber button; stacked on phone with the wheel first.

FORM: Pinned by the user's brief (warm tactile tavern; tabs layout), Operate mode. Signature move: games shown as generated box covers (title-hashed warm hue, spine stripe, monogram) on the shelf, on wheel slices and in the locked pick. seed: none (direction pinned by brief; no roll run)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
