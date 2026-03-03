## Idea Board Application

Use InstantDB to create a shared Idea Board application where multiple users can post ideas in real time and react to each other's ideas with emojis. Ideas appear on a canvas (use tldraw@3.9.0 for the canvas API).
Users post ideas and react with emojis. The code should be easy to read and follow along, not clever or over-engineered.
The name of the app is 'Idea Board'

## Tech Stack
- Next.js with Tailwind 4 (already installed) 
- tldraw@3.9.0 - ldraw v3.x requires no license (not even Hobby). It shows a "Made with tldraw" watermark — that's fine.
- InstantDB for auth + real-time sync

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
- InstantDB client and schema in `src/lib/instant.ts`
- Types in `src/types/`
- Keep pages thin — logic lives in components or hooks


## FEATURES

* Users can post ideas as cards (text + submit)
* Each idea shows author name and relative timestamp ("2 min ago")
* Emoji reactions on each card: at least 8 options (👍 💡 🔥 ❤️ 😂 🤔 👀 🚀)
* Multiple emojis can be selected per idea, each showing a count
* Users can toggle their own reactions on/off

## AUTH

* Use InstantDB magic link auth (sendMagicCode / verifyMagicCode)
* On first visit show a modal: enter email → receive code → enter code → done
* After auth, ask for a display name if not already set, store in InstantDB user profile
* Display name modal only appears if not already stored in InstantDB profile

## DATA

* Store ideas and reactions to InstantDB
* Use db.useQuery to subscribe to ideas and reactions in real time
* Schema: ideas (id, userId, displayName, content, createdAt), reactions (id, ideaId, userId, emoji)
* Unique constraint: before adding a reaction, check if one already exists for this userId+ideaId+emoji combination and skip if so
* Add x: i.number() and y: i.number() to the ideas entity - These store the canvas position of each note and sync across all users

## CANVAS

* Replace the grid layout with a full-screen <Tldraw> canvas (load client-side only via Next.js dynamic() with ssr: false — tldraw uses browser APIs)
* Each idea is a custom tldraw shape (ideaCard) that renders as a post-it note: pastel background, content text, author name, relative timestamp, emoji reactions
* Hide all tldraw drawing tools — this is a post-it board not a drawing app: set Toolbar, MainMenu, PageMenu, ActionsMenu, and StylePanel to null in the tldraw components prop
* Before writing any canvas code, fetch and read: https://tldraw.dev/llms.txt

## REALTIME

* New ideas and reactions appear instantly for all connected users
* No page refresh needed
* Keep all existing UI, layout, dark mode, and animation behavior identical.

## INSTANT DB DOCS Before writing any auth or data code, fetch and read these pages:

- https://www.instantdb.com/docs/auth
- https://www.instantdb.com/docs/modeling-data
- https://www.instantdb.com/docs/instaql

Come up with a phased approach for implementing this app.