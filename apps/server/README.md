# Sequence Creator server

NestJS backend for live collaborative show sessions.

- **HTTP** — create / lookup / delete sessions by join code (no auth)
- **WebSocket** — Yjs sync at `ws://<host>/yjs/:code`
- **DB** — SQLite via Prisma (`Session`, `YUpdate`, `YSnapshot`)

## Quick start

```sh
cd apps/server
npm install
cp .env.example .env   # if needed
npx prisma migrate dev
npm run start:dev
```

Server defaults to `http://localhost:3001`.

Open the live demo UI (two browser windows to try sync):

```text
http://localhost:3001/
```

Against a running server:

```sh
npm run smoke
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/sessions` | Create session → `{ code, title, createdAt, lastActiveAt }` |
| `GET` | `/api/sessions/:code` | Lookup session (404 if missing) |
| `DELETE` | `/api/sessions/:code` | Delete session + persisted Yjs data |
| `GET` | `/health` | Liveness + DB check |

Body for create (optional):

```json
{ "title": "Friday show" }
```

## Yjs client

Use `y-websocket` against the Nest process. Create the session over HTTP first, then connect:

```ts
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const doc = new Y.Doc()
const provider = new WebsocketProvider(
  'ws://localhost:3001/yjs',
  'K7M2QX', // join code from POST /api/sessions
  doc,
)
```

Knowing the join code grants full read/write access.

## Config

See `.env.example`:

- `PORT` — HTTP + WS port (default `3001`)
- `CORS_ORIGIN` — Vue app origin
- `JOIN_CODE_LENGTH` — default `6`
- `IDLE_TTL_DAYS` — daily cron deletes idle sessions
- `COMPACT_EVERY_N_UPDATES` — merge updates into a snapshot
- `DATABASE_URL` — Prisma SQLite (or Postgres later)

## Layout

```
src/
  sessions/         # join-code HTTP API
  collaboration/    # Yjs rooms + WS upgrade /yjs/:code
  persistence/      # Prisma, snapshots, compaction, TTL cleanup
  health/
  config/
  common/
scripts/
  smoke.mjs         # HTTP + multi-client Yjs + persistence checks
```

## Notes

- The WebSocket handshake waits until the in-memory room is loaded, so the
  client's first sync frames are not dropped on cold start / reconnect.
- Persist writes are chained per session; unload flushes before snapshotting.
- `DELETE /api/sessions/:code` closes any live room sockets, then removes DB rows.
