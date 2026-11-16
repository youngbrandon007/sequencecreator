# Sequence Creator

Vue client for [sequencecreator.com](https://sequencecreator.com), plus a NestJS live-collaboration server (Yjs + join codes).

## Client (Vue)

```sh
npm install
npm run dev
```

## Server (NestJS)

```sh
cd apps/server
npm install
npx prisma migrate dev
npm run start:dev
```

See [apps/server/README.md](apps/server/README.md) for the HTTP/Yjs API.

## Contributions

Please run `npm run build` (client) before committing or merging to main.
