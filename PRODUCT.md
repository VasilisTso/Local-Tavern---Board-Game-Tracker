# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
One person keeping their own media library: board and card games, video games, books, films, series and music, physical and digital, spread across several real and virtual places (a living-room shelf, a bedroom, Steam, a Switch, a Kindle, Audible). They curate on a laptop (add items, fix details, upload covers, reorganise places) and use a phone in the moment: on the couch deciding what to play, read or watch next, at a friend's table, or when logging that they started or finished something. Occasionally they host a game night and want the old guest/RSVP flow back for that evening. Nobody else uses the app.

## Product Purpose
Gives one person a single, good-looking picture of everything they own or want, wherever it lives, and ends "I can't decide what to do next" with a fair, fun picker wheel that favors what they have been neglecting. It also keeps a light memory: what was started, played or finished, when, and (for board games) who won. Success: finding or picking something takes under a minute on a phone, and the library feels like looking at a real shelf of one's own things rather than at a database.

## Positioning
A private, zero-setup personal library for every kind of media at once, kept entirely in the browser. Each item is shown as the physical object it is (a book, a game box, a disc case, a record sleeve), and the picker works across the whole collection. Not a catalogue service, social network, store, or tracker tied to one media type; no accounts, no imports from online databases.

## Operating Context
- Planning and upkeep happen on a laptop; picking and logging happen on a phone, held in one hand, often in dim light.
- Items live in named **places** (physical or digital). Lending is noted by hand ("lent to" a name).
- **Game night mode** (optional): set a date, enter guests and RSVP from messages received elsewhere, note a house rule, filter by player count, lock in a pick, then log the session with winners.
- Sharing happens only by exporting/importing a JSON backup (optionally with cover images) or copying a plain-text summary.

## Capabilities and Constraints
- Vite + React 19 + Tailwind v4 + framer-motion + lucide-react. Single-page app, no router library (tabs synced to the URL hash).
- Strictly local-only, single-device: data in `localStorage`, uploaded cover images in IndexedDB. No backend, accounts or sync, now or later. JSON backup is the only transfer path.
- Media kinds and formats: board (box, card), video (disc, cartridge, digital), book (print, ebook, audio), film (Blu-ray, DVD, digital, series), music (vinyl, CD, digital).
- Item status: backlog, active, done, dropped, wishlist. Rating 0–5. Length in minutes, or pages for print books. Player counts for board and video games only.
- Three areas: **Library** (shelf, grid and list views; filters; a "Now" strip of active items; item detail; places manager), **Pick** (the wheel over a filtered pool, plus game night mode), **Log** (activity by month and stats per kind).
- Covers are generated per kind and format from the title and an optional chosen color; an uploaded image or image URL sits inside the object's frame. No remote catalogue APIs.
- Existing users have v2 data (`tavern:v2:*`) and older v1 keys; everything must migrate without loss, and v2 backups must still import.
- Product name: **Shelfspace** (renamed from Local Tavern in Phase 7). Storage keys and the backup `app` id keep their old `tavern`/`local-tavern` values so existing data and backups still load.

## Brand Commitments
- Product name: **Shelfspace** (wordmark, `<title>`, favicon, README).
- Voice: warm, plain library. Clear labels with a light personal touch ("Now", "Gathering dust"); no tavern, fantasy or pub vocabulary. The wheel is simply the picker, not the "Fate Wheel".
- The theme names "Cozy Tavern" and "Sunlit Porch" are retired; new library-fitting names (or plain Dark/Light) are chosen with the new visual direction.

## Evidence on Hand
- 20 seed board games in `src/data/games.json` (real titles, player counts, playtimes, tags). Seed data will add a few real books, video games, films and records.
- No real activity history, users, testimonials or screenshots of the new design exist; do not fabricate any.

## Product Principles
1. Deciding comes first: picking the next thing must be fast, fair and fun on a phone.
2. Things look like things: every item reads as its real physical (or digital) object, so the library feels owned, not catalogued.
3. The owner's data is theirs: local, private, exportable, never lost on upgrade.
4. Every action is reversible: undo over confirm dialogs.
5. Memory is light: logging takes one tap from the pick or the item, and the history gives something back worth reading.

## Accessibility & Inclusion
WCAG 2.2 AA in both themes. Fully usable by touch and keyboard (no hover-only actions, arrow keys across shelf spines); respects `prefers-reduced-motion` and `prefers-color-scheme`.
