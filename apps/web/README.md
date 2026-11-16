# Sequence Creator web client

Vue 3 + Vite UI for collaborative show sequencing against `apps/server`.

## Develop

Terminal 1 — Nest API / Yjs:

```sh
cd apps/server
npm run start:dev
```

Terminal 2 — web:

```sh
cd apps/web
npm install
npm run dev
```

Open http://localhost:5173 — Vite proxies `/api` and `/yjs` to `:3001`.

## Tabs

1. **Entries** — flat list or by-event sections; people separated by `,` / `;` / newlines; `Tab` autocomplete
2. **Show** — unused pool ↔ ordered lineup (drag or Add/Remove)
3. **Analysis** — entries between each person’s appearances

## Build

```sh
npm run build
```
