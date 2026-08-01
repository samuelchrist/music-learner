# 🎹 Music Learner

Music Learner is a web app for practicing piano, guitar, bass and drums against
real lessons. It listens to a MIDI keyboard (or a computer-keyboard fallback),
scores your timing/accuracy in real time, and shows the music as animated
staff notation and a Synthesia-style falling-notes view.

This is a **monorepo** (npm workspaces + Turborepo) with a React web client,
an Express/Prisma API, and two small shared packages.

For a deep dive into folder-by-folder responsibilities, data flow, and known
issues, see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

---

## Tech stack

| Layer          | Technology |
|----------------|------------|
| Web client     | React 18, TypeScript, Vite, Tailwind CSS, Zustand (state), TanStack Query (server cache), React Router 7, Framer Motion, Recharts |
| Audio / MIDI   | Tone.js (synth + samples), Web MIDI API, VexFlow (sheet music rendering) |
| Realtime       | Socket.IO client |
| API server     | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL |
| Auth           | JWT (access + refresh tokens), bcrypt |
| Realtime (API) | Socket.IO server |
| Validation     | Zod |
| Logging        | Winston + morgan |
| Monorepo tooling | npm workspaces, Turborepo, TypeScript project references |

## Repository layout

```
music-learner/
├── apps/
│   ├── web/        React + Vite single-page app (the app users interact with)
│   └── api/         Express + Prisma REST API and Socket.IO server
├── packages/
│   ├── shared/      Types, constants and utils shared by web + api
│   └── midi-core/   Placeholder MIDI helper package (mostly unused, see ARCHITECTURE.md)
├── docker/          Dockerfiles for api / web / postgres
├── docker-compose.yml, docker-compose.prod.yml
├── scripts/         One-off helper scripts (e.g. downloading drum samples)
└── turbo.json       Turborepo pipeline definition
```

## Getting started

### Prerequisites
- Node.js **>= 20** (the `web` app's Vite/Rolldown toolchain requires it — Node 16 will fail to build)
- PostgreSQL database (or use `docker-compose up postgres`)
- npm 10+

### Install
```bash
npm install
```

### Configure environment
```bash
cp .env.example .env                     # root
cp apps/api/.env.example apps/api/.env    # DATABASE_URL, JWT secrets, etc.
cp apps/web/.env.example apps/web/.env    # VITE_API_URL, etc.
```

### Database
```bash
npm run db:migrate   # applies Prisma migrations (apps/api)
npm run db:seed       # seeds sample lessons
```

### Run everything in dev mode
```bash
npm run dev
```
This uses Turborepo to run `apps/api` (`tsx watch`, default port 5000) and
`apps/web` (Vite dev server, default port 5173) together.

### Other useful scripts
```bash
npm run build   # builds all workspaces (api -> dist/, web -> dist/)
npm run lint    # eslint across all workspaces
npm run test    # runs tests (where defined)
```

### Docker
```bash
docker-compose up        # postgres + api + web
```

## Key features
- 🎧 MIDI keyboard input (Web MIDI API) with a computer-keyboard fallback
- 🎼 Animated staff notation (VexFlow) and a falling-notes "Synthesia" view
- 🎯 Real-time scoring: note accuracy, timing accuracy, rhythm, overall grade
- 📈 XP, levels, streaks, leaderboard
- 🔐 JWT auth with refresh tokens
- 🎸 Multi-instrument support: piano, guitar, bass (4/5 string), drums
- 🏷️ Lesson catalog organized by category (ABRSM, classical, jazz, pop, exercises)

## Known limitations
See "Known issues / drift" in [ARCHITECTURE.md](./ARCHITECTURE.md) — notably
Prisma schema vs. live-DB drift, several stub/empty files, and a Node-version
requirement for building the web app.
