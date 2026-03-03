# Data & Schema

InstantDB for real-time sync. Reference docs:
- https://www.instantdb.com/docs/modeling-data
- https://www.instantdb.com/docs/instaql

## Schema

```ts
// ideas
id, userId, displayName, content, createdAt, x: i.number(), y: i.number()

// reactions
id, ideaId, userId, emoji
```

`x` and `y` store the canvas position and sync across all users in real time.

## Querying

Use `db.useQuery` to subscribe to ideas and reactions — no manual refresh needed.

## Reactions: unique constraint

Before adding a reaction, check whether one already exists for the same `userId + ideaId + emoji` combination. Skip the write if it does.

## Features

- Each idea card shows: content, author display name, relative timestamp ("2 min ago")
- Emoji reactions: 👍 💡 🔥 ❤️ 😂 🤔 👀 🚀
- Multiple emojis per idea, each with a count
- Users can toggle their own reactions on/off
- New ideas and reactions appear instantly for all connected users
