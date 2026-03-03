# Code Conventions

## Components

- Functional components only — no class components
- `const` arrow functions: `const MyComponent = () =>`
- Co-locate component files with their logic — no barrel exports
- Components live in `src/components/`

## TypeScript

- No `any` types — use `unknown` and narrow properly
- Explicit return types on all functions

## Styling

- Tailwind v4 only — no inline styles, no CSS modules
- Dark mode via `dark:` classes (class strategy, not media query)
- Mobile-first: design for small screens, enhance for large
