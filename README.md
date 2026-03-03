# Idea Board

A real-time collaborative idea board built with Next.js, InstantDB, and tldraw. Users post ideas as sticky notes on a shared canvas and react with emojis — all synced live across every connected browser.

## Tech Stack

- **Next.js 15** with Tailwind v4
- **InstantDB** — auth (magic link) + real-time sync
- **tldraw 3.9.0** — infinite canvas

## Prerequisites

- [GitHub account](https://github.com) 
- An InstantDB account (free tier available) - https://www.instantdb.com/ 
- [Vercel.com](https://vercel.com) account for deployment (optional, but recommended for easy hosting)
- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 10+

## Setup

### 1. Create an InstantDB app

Log in to the InstantDB CLI and scaffold a new app:

```bash
pnpx instant-cli login
pnpx create-instant-app
```

This creates an app in your InstantDB dashboard and writes a `.env.local` file containing your `NEXT_PUBLIC_INSTANT_APP_ID`.

#### IDE Setup
Configure MCP for InstantDB in your IDE.

```json
{
  "mcpServers": {
    "InstantDB": {
      "url": "https://mcp.instantdb.com/mcp",
      "headers": {}
    }
  }
}
```

### 2. Clone this repo into the scaffolded directory

Replace the generated source files with this project's source, or clone directly:

```bash
git clone <repo-url> idea-board-demo
cd idea-board-demo
```

### 3. Set your InstantDB App ID

If `.env.local` was not created automatically, create it manually:

```bash
# .env.local
NEXT_PUBLIC_INSTANT_APP_ID=your-app-id-here
```

Find your App ID in the [InstantDB dashboard](https://www.instantdb.com/dash).

### 4. Install dependencies

```bash
pnpm install
```

### 5. Push the schema to InstantDB

```bash
pnpx instant-cli push
```

This pushes `src/instant.schema.ts` to your InstantDB app.

### 6. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it works

1. On first visit, enter your email to receive a magic link code.
2. Enter the code to authenticate.
3. Set a display name (stored in your InstantDB profile).
4. Post ideas — they appear as sticky notes on the shared canvas.
5. Drag notes around; positions sync in real time for all users.
6. React to ideas with emoji (👍 👎 🔥 ❤️ 🤔).

## Project structure

```
src/
  app/               # Next.js app router (thin pages)
  components/        # UI components (Auth, Canvas, IdeaBoard, etc.)
  lib/               # InstantDB client, context, utilities
  types/             # Shared TypeScript types
  instant.schema.ts  # InstantDB schema definition
  instant.perms.ts   # InstantDB permissions
agents/
  spec.md            # Original spec given to the coding agent
```

## Useful commands

| Command                 | Description                        |
|-------------------------|------------------------------------|
| `pnpm dev`              | Start dev server                   |
| `pnpm build`            | Production build                   |
| `pnpx instant-cli push` | Push schema changes to InstantDB   |
| `pnpx instant-cli pull` | Pull schema changes from InstantDB |
