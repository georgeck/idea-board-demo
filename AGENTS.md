# Idea Board

A real-time collaborative sticky-note canvas built with Next.js, InstantDB, and tldraw. The app uses InstantDB auth, persisted realtime data, cursor presence, and an online avatar stack.

## Package manager

Use `pnpm`. Never use `npm` or `yarn`.

## Key commands

| Command                 | Purpose                          |
|-------------------------|----------------------------------|
| `pnpm dev`              | Start dev server (Turbopack)     |
| `pnpm build`            | Production build                 |
| `pnpx instant-cli push` | Push schema changes to InstantDB |

Run `pnpx instant-cli push` after changing `src/instant.schema.ts`, including room presence fields.

## File structure

```
src/
  app/               # Next.js app router — keep pages thin
  components/        # All UI components
  lib/               # InstantDB client (db.ts), context, utilities
  types/             # Shared TypeScript types
  instant.schema.ts  # InstantDB schema
  instant.perms.ts   # InstantDB permissions
```

## Presence

- The shared board room is `db.room("ideaBoard", "main")`.
- Room presence includes `displayName`, `email`, and `color`.
- `IdeaBoard` publishes presence with `db.rooms.usePresence` so the app can render both the current user and peers.
- `Cursors` renders live multiplayer cursors with display names.
- The top-right avatar stack renders currently present users, limited to 6 visible avatars with `+N` overflow.
- Avatars use Gravatar when available and fall back to a colored initial when email is missing or the image fails to load.
- Presence data is ephemeral; do not persist online-user state to entities.

## Detailed guides

- [Code conventions](agents/docs/conventions.md) — components, TypeScript, styling
- [Auth](agents/docs/auth.md) — magic link flow, display name
- [Data & schema](agents/docs/data.md) — InstantDB schema, queries, reactions
- [Canvas](agents/docs/canvas.md) — tldraw setup, custom ideaCard shape
