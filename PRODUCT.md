# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
One host who runs a recurring board game night for a small group of friends. They plan during the week on a laptop (curate the shelf, set the date, track who is coming) and use a phone at the table on the night itself (spin for the game, lock it in, log the result). Guests do not use the app directly.

## Product Purpose
Ends the "what do we play tonight?" argument and keeps a memory of game nights. It holds the host's game collection, filters it to what fits tonight's group, picks a game with a fair and fun random draw, and records what was played and who won so the group's history and stats build up over time. Success: the pick takes under a minute at the table, and the ledger becomes something the group enjoys looking back at.

## Positioning
A personal, zero-setup tavern ledger for one group. No accounts, no server, no catalogue import: the host's own shelf, guests, and history, kept entirely in the browser. Not a BoardGameGeek-style database or social network.

## Operating Context
- Weekly or occasional game nights at someone's home.
- Planning happens on a laptop; at the table the phone is held in one hand, often in dim light, with people watching the wheel.
- Guest RSVP is entered by the host from messages received elsewhere (chat, in person).
- Sharing happens by exporting/importing a JSON backup or copying a plain-text night summary into a group chat.

## Capabilities and Constraints
- Vite + React 19 + Tailwind v4 + framer-motion + lucide-react. Single-page app, no router library (tabs synced to the URL hash).
- Strictly local-only, single-device: all data in `localStorage`. No backend, accounts or sync, now or later. JSON export/import is the only transfer path.
- Core areas: **Tonight** (date, guests with going/maybe/not-going status and notes, house rule, Fate Wheel, locked pick), **Shelf** (game collection with search, player-count/playtime/tag filters, add/edit/delete with undo), **Ledger** (play log and stats).
- Existing users have data under the old keys `tavern_games` and `tavern_rsvp`; it must migrate without loss.
- No external images or remote APIs; game covers are generated from the title.

## Brand Commitments
- Product name: **Local Tavern** (used for the wordmark, `<title>`, and README). "The Ultimate Tavern" is retired.
- Theme names "Cozy Tavern" (dark) and "Sunlit Porch" (light) stay.
- Voice: warm, lightly playful tavern flavour ("Fate Wheel", "Shelf", "Ledger", "house rule") without fantasy cosplay; labels stay plain and clear.

## Evidence on Hand
- 20 seed games in `src/data/games.json` (real titles, player counts, playtimes, tags).
- No real play history, users, testimonials or screenshots of the new design exist; do not fabricate any.

## Product Principles
1. The night comes first: picking tonight's game must be fast, fair and fun on a phone.
2. The host's data is theirs: local, private, exportable, never lost on upgrade.
3. Every action is reversible: undo over confirm dialogs.
4. Memory matters: logging a play is one tap from the pick, and history gives back something worth reading.

## Accessibility & Inclusion
WCAG 2.2 AA in both themes. Fully usable by touch and keyboard (no hover-only actions); respects `prefers-reduced-motion` and `prefers-color-scheme`.
