# Multi Connection WebRTC ✅

simple multi connection WEBRTC sample project with Express + Socket.IO backend and Nuxt 3 frontend. Demonstrates room-based signaling, peer connection management, and media streaming.

---

## Overview 🔧

- **Backend:** Express server that exposes a Socket.IO namespace `/signaling` for WebRTC signaling and basic middlewares (rate limiter, CORS, request logging, error handler).
- **Frontend:** Nuxt 3 app that uses `RtcConnectionHandler` to manage RTCPeerConnections and connect to the backend signaling namespace.

---

## Features ✨

- Room-based multi-peer WebRTC signaling (join, offer, answer, ICE candidate exchange)
- Simple participant management and media grid in the frontend
- STUN/TURN servers configured in `Participant` model
- Light request logging and rate limiting on backend

---

## Quick Start 🚀

Prerequisites:

- Node.js (v18+ recommended)
- Yarn or npm

Backend (development):

```bash
cd Backend
yarn install
# Start in watch/dev mode
yarn dev
```

Backend (build):

```bash
# compile and minify
yarn build
```

Frontend (development):

```bash
cd Frontend
yarn install
# Start Nuxt dev server
yarn dev
```

Notes:

- Backend server default port: `3000` (constant in `Backend/src/services/shared/constants/index.ts`).
- Frontend default `API_BASE_URL` is `http://localhost:3000` (see `Frontend/core/constants/index.ts`). If port conflict occurs, run Nuxt on another port (e.g. `NUXT_PORT=3001` or `nuxt dev --port 3001`) and update `API_BASE_URL` accordingly.

---

## Socket.IO Signaling Protocol 📡

Namespace: `/signaling`

Client connects using auth object:

```js
io("http://backend-host/signaling", {auth: {userId, roomId}});
```

Server emits:

- `setup` — after successful handshake
- `join` — broadcast when a new user joins; payload: `{ userId, roomId, userName }`
- `offer` — relayed to target with `{ from, userId, sdp, roomId, userName }`
- `answer` — relayed answer with `{ from, userId, sdp, roomId }`
- `candidate` — relayed ICE candidate `{ from, userId, candidate, roomId }`
- `left` — when someone leaves `{ userId, roomId }`

Client should emit:

- `join` — when receives `setup`
- `offer` / `answer` / `candidate` — as needed during WebRTC negotiation

Implementation notes:

- Backend maps `userId -> socket` to route messages to target users.
- Frontend `RtcConnectionHandler` creates PeerConnections per participant (`Participant` model).

---

## Project Structure 📁

- `Backend/` — Express + Socket.IO server
  - `src/app.ts` — main Express + Socket.IO bootstrap
  - `src/services/socket/` — Socket namespaces and handlers
  - `src/libs/limiter` — rate limiter helper
  - `src/gears` — logger & error handler
- `Frontend/` — Nuxt 3 app + RTC client
  - `core/models/rtc.model.ts` — client-side signaling & PeerConnection management
  - `pages/index.client.vue` — demo UI and media grid

---

## Development Tips 💡

- For local testing, open multiple browser windows/tabs and join the same `roomId` (generate a random `userId` for each tab — the example UI uses `crypto.randomUUID()`).
- Tweak STUN/TURN servers in `Frontend/core/models/participant.model.ts` if you need better connectivity.
- CORS and rate limiting are intentionally permissive for development (`origin: "*"`). Harden these for production.

---

## Contributing & License 📝

- Contributions welcome — open an issue or submit a PR.
- License: ISC (see `package.json` files).
