## Idea Board Application

Use InstantDB to create a shared Idea Board application where multiple users can post ideas in real time, react to each other's ideas with emojis, see multiplayer cursors, and see who is currently online. Ideas appear on a canvas using tldraw@3.9.0.
Users post ideas and react with emojis. The code should be easy to read and follow along, not clever or over-engineered.
The name of the app is 'Idea Board'

## Tech Stack
- Next.js with Tailwind 4 (already installed) 
- tldraw@3.9.0 - ldraw v3.x requires no license (not even Hobby). It shows a "Made with tldraw" watermark — that's fine.
- InstantDB for auth, real-time sync, room presence, and cursors

## Code Conventions
- Functional components only, no class components
- Co-locate component files with their logic — no barrel exports
- Use `const` arrow functions for components: `const MyComponent = () =>`
- No `any` types — use `unknown` and narrow properly
- Prefer explicit return types on all functions

## Styling
- Tailwind v4 only — no inline styles, no CSS modules
- Dark mode via `dark:` classes (class strategy, not media query)
- Mobile-first: design for small screens, enhance for large

## File Structure
- Components go in `src/components/`
- InstantDB client in `src/lib/db.ts`
- InstantDB schema in `src/instant.schema.ts`
- InstantDB permissions in `src/instant.perms.ts`
- Types in `src/types/`
- Keep pages thin — logic lives in components or hooks


## FEATURES

* Users can post ideas as cards (text + submit)
* Each idea shows author name and relative timestamp ("2 min ago")
* Emoji reactions on each card: 👍 👎 🔥 ❤️ 🤔
* Multiple emojis can be selected per idea, each showing a count
* Users can toggle their own reactions on/off
* Users currently present in the app are shown as overlapping circular avatars at the top right
* Show at most 6 avatars and use a `+N` overflow indicator for additional users
* Use Gravatar images when available; fall back to colored initials when email is missing or the image fails

## AUTH

* Use InstantDB magic link auth (sendMagicCode / verifyMagicCode)
* On first visit show a modal: enter email → receive code → enter code → done
* After auth, ask for a display name if not already set, store in InstantDB user profile
* Display name modal only appears if not already stored in InstantDB profile

## DATA

* Store profiles, ideas, and reactions to InstantDB
* Use db.useQuery to subscribe to ideas and reactions in real time
* Schema: profiles (displayName), ideas (title, content, createdAt, x, y), reactions (emoji)
* Links: profileUser, ideaCreator, reactionIdea, reactionUser
* Reaction toggling is based on the current profile's existing reaction for a given emoji
* Ideas store `x: i.number()` and `y: i.number()` for canvas position sync across all users
* Room presence schema for `ideaBoard` includes `displayName`, `email`, and `color`

## CANVAS

* Replace the grid layout with a full-screen <Tldraw> canvas (load client-side only via Next.js dynamic() with ssr: false — tldraw uses browser APIs)
* Each idea is a custom tldraw shape (ideaCard) that renders as a post-it note: pastel background, content text, author name, relative timestamp, emoji reactions
* Hide all tldraw drawing tools — this is a post-it board not a drawing app: set Toolbar, MainMenu, PageMenu, ActionsMenu, StylePanel, MenuPanel, Minimap, NavigationPanel, HelpMenu, QuickActions, HelperButtons, DebugPanel, DebugMenu, KeyboardShortcutsDialog, and ZoomMenu to null in the tldraw components prop
* Before writing any canvas code, fetch and read: https://tldraw.dev/llms.txt

## REALTIME

* New ideas and reactions appear instantly for all connected users
* Dragging an idea card updates its persisted `x` and `y` position in InstantDB
* Deleting an idea card deletes its persisted idea
* Duplicating an idea card creates a new persisted idea linked to the original creator profile
* `Cursors` renders live cursor presence with display names
* `db.rooms.usePresence` publishes current user presence and reads online peers
* The top-right avatar stack renders current presence only; do not persist online status
* No page refresh needed
* Keep all existing UI, layout, dark mode, and animation behavior identical.

## INSTANT DB DOCS Before writing any auth or data code, fetch and read these pages:

- https://www.instantdb.com/docs/auth
- https://www.instantdb.com/docs/modeling-data
- https://www.instantdb.com/docs/instaql

Come up with a phased approach for implementing this app.
