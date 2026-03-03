# Canvas

tldraw 3.9.0 for the infinite canvas. Reference: https://tldraw.dev/llms.txt

## Setup

Load tldraw **client-side only** — it uses browser APIs:

```ts
const IdeaBoard = dynamic(() => import('@/components/IdeaBoard'), { ssr: false })
```

## Custom shape: `ideaCard`

Each idea is a custom tldraw shape that renders as a post-it note:
- Pastel background
- Content text
- Author display name
- Relative timestamp
- Emoji reactions

Shape position (`x`, `y`) is stored in InstantDB and syncs across all users.

## Hide all tldraw UI

This is a post-it board, not a drawing app. Set these to `null` in the `components` prop:

```tsx
<Tldraw
  components={{
    Toolbar: null,
    MainMenu: null,
    PageMenu: null,
    ActionsMenu: null,
    StylePanel: null,
  }}
/>
```

tldraw v3.x requires no license. The "Made with tldraw" watermark is expected — leave it.
