---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: ["src/components/library","src/components/covers"]
---

# Shelfspace app shell and Library (Library / Pick / Log)

Mode: Operate. Single-page app, tabs synced to URL hash. One owner curates on a laptop and picks or logs on a phone, often on the couch in dim light.

Library job: see everything owned or wanted, wherever it lives, and find one thing fast. Opens on the "Now" strip (status active) above the shelf, grouped by place. Realistic range 50–200 items over 3–8 places; a place may hold 0 or 60 items. Key states: empty library (first run, seed offered), empty place, filter with no results, item with uploaded image vs generated cover, image URL that fails to load, very long titles on narrow spines, undo after deleting an item or a place.

Pick and Log inherit this world; Game night mode is a toggle inside Pick.

## Direction contract

THESIS: A personal shelf of real objects, not a media database. Refuses the poster-thumbnail grid every tracker ships; items stand as spines, boxes, cases and sleeves on wooden boards, and the controls around them stay plain web tabs, chips, inputs and dialogs.

OWN-WORLD: Walnut-dark "Stacks" and linen-light "Reading Room" neutrals; one amber accent for action, selection and focus. Colour lives in the objects: saturated bookcloth, jacket and sleeve hues (vermilion, cobalt, mustard, bottle green, plum, oxblood), wood-grain shelf boards with contact shadows, a soft light falloff from the top of the page. Bricolage Grotesque (variable width: condensed on spines, wide and heavy for headings) + Figtree for UI. Physical objects may cast shadows; chrome stays flat.

STORY: The owner sees what they are into now, scans their places like a real wall of shelves, pulls a spine to open it, and filters down when they want something specific.

FIRST VIEWPORT: Sticky header: wordmark left, backup and theme right, tabs Library · Pick · Log. Then a "Now" row of face-out covers, then a toolbar (search, kind chips, view switch Shelf/Grid/List, primary "Add item"), then the first place's shelf: place name in heavy Bricolage, a board of spines and face-out boxes.

FORM: Pinned by the user in PLAN.md ("modern warm library: a real shelf with spines and boxes, depth, physics-like motion, bolder type, no tavern cosplay"), Operate mode. Signature move: the spine pull-out, a spine slides forward off the board and turns into the full cover in the detail sheet (`layoutId`). seed: none (pinned) — "modern warm library. A real shelf with spines and boxes, depth, physics-like motion and bolder type. No tavern cosplay."

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
