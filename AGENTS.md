# Idea Board

A real-time collaborative sticky-note canvas built with Next.js, InstantDB, and tldraw.

## Package manager

Use `pnpm`. Never use `npm` or `yarn`.

## Key commands

| Command                 | Purpose                          |
|-------------------------|----------------------------------|
| `pnpm dev`              | Start dev server (Turbopack)     |
| `pnpm build`            | Production build                 |
| `pnpx instant-cli push` | Push schema changes to InstantDB |

## File structure

```
src/
  app/               # Next.js app router — keep pages thin
  components/        # All UI components
  lib/               # InstantDB client (instant.ts), context, utilities
  types/             # Shared TypeScript types
  instant.schema.ts  # InstantDB schema
  instant.perms.ts   # InstantDB permissions
```

## Detailed guides

- [Code conventions](agents/docs/conventions.md) — components, TypeScript, styling
- [Auth](agents/docs/auth.md) — magic link flow, display name
- [Data & schema](agents/docs/data.md) — InstantDB schema, queries, reactions
- [Canvas](agents/docs/canvas.md) — tldraw setup, custom ideaCard shape
