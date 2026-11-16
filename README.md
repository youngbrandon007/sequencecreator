# Sequence Creator

Original Vue SPA for [sequencecreator.com](https://sequencecreator.com), plus a collaborative stack:

- `apps/server` — NestJS + Yjs (join-code sessions)
- `apps/web` — multi-tab collaborative UI (Entries / Show / Analysis)

## Collaborative app (recommended)

```sh
# terminal 1
cd apps/server && npm install && npx prisma migrate dev && npm run start:dev

# terminal 2
cd apps/web && npm install && npm run dev
```

Open http://localhost:5173 — create a session, share the code, edit together.

Plan: see agent canvas *Multi-tab Collaborative App Plan*. Server docs: [apps/server/README.md](apps/server/README.md). Web docs: [apps/web/README.md](apps/web/README.md).

## Legacy static client (root)

```sh
npm install
npm run dev
```

## Contributions

For the legacy GitHub Pages client, run `npm run build` before merging to main.
