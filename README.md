# Pulse — Reddit-Inspired Social Media Platform

A full-stack social media application inspired by Reddit. Users can create posts, join communities, chat in real time, and follow each other — all secured with JWT-based authentication.

## Features

- **Authentication** — signup, login, and JWT access + refresh token flow
- **User profiles** — customizable avatars and bios
- **Posts** — create posts with image support, edit and delete your own
- **Interactions** — like, bookmark, comment, and react with emoji
- **Communities** — join/leave communities, community-scoped feeds
- **Follow system** — follow users and get a personalized "Following" feed
- **Real-time chat** — direct messages via Socket.IO
- **Notifications** — likes, comments, follows, and @mentions
- **Dark/light theme** — persisted per user
- **Responsive layout** — 3-column desktop layout, mobile bottom nav

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express 5, TypeScript, Socket.IO |
| Database | Turso (libSQL / SQLite-compatible, edge-hosted) |
| Auth | JWT (access + refresh tokens), bcrypt |
| Security | Parameterized SQL queries |

## Getting Started (local dev)

### Prerequisites
- Node.js 18+
- A free [Turso](https://turso.tech) database (or omit the env vars to fall back to a local SQLite file)

### 1. Clone

```bash
git clone https://github.com/Hmmzza12/SOCIALMEDIA-APP.git
cd SOCIALMEDIA-APP
```

### 2. Start the backend

```bash
cd backend
npm install
cp .env.example .env   # fill in values (see below)
npm run dev            # runs on http://localhost:3010
```

**`backend/.env`**
```env
# Leave both Turso vars blank to use a local ./database.sqlite file instead
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

PORT=3010
FRONTEND_URL=http://localhost:5173
```

### 3. Start the frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL if backend isn't on localhost:3010
npm run dev            # runs on http://localhost:5173
```

## Deployment

This app deploys as three pieces:

| Piece | Where | Why |
|---|---|---|
| Database | [Turso](https://turso.tech) | Managed, edge-hosted libSQL (SQLite-compatible) |
| Backend | [Railway](https://railway.app) | Persistent Node process for Express + Socket.IO |
| Frontend | [Netlify](https://netlify.com) | Static hosting for the Vite build |

### Database (Turso)
1. Create a database in the Turso dashboard or CLI (`turso db create pulse`).
2. Grab the database URL (`turso db show pulse --url`) and an auth token (`turso db tokens create pulse`).

### Backend (Railway)
1. Create a new Railway project from the `backend/` directory of this repo (root directory = `backend`).
2. Set environment variables: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL` (your Netlify URL, comma-separate if you need more than one origin).
3. Railway auto-detects the Node app via Nixpacks and runs `npm run build` then `npm start` (see `backend/railway.json`).
4. Note: uploaded images are stored on local disk (`backend/uploads`), which is **ephemeral** on Railway's default filesystem — attach a Railway volume mounted at `backend/uploads` if you need uploads to survive redeploys.

### Frontend (Netlify)
1. Create a new Netlify site from the `frontend/` directory of this repo (base directory = `frontend`).
2. Build command: `npm run build`, publish directory: `dist` (already configured in `frontend/netlify.toml`).
3. Set environment variable `VITE_API_URL` to your Railway backend URL + `/api` (e.g. `https://your-app.up.railway.app/api`).

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET/PUT | `/api/users/:id` | View / update profile |
| POST/DELETE | `/api/users/:id/follow` | Follow / unfollow |
| GET/POST | `/api/posts` | List / create posts |
| GET | `/api/posts/feed/following` | Following feed |
| DELETE | `/api/posts/:id` | Delete post |
| POST/DELETE | `/api/posts/:id/like` | Like / unlike |
| POST/DELETE | `/api/posts/:id/bookmark` | Save / unsave |
| POST | `/api/posts/:id/react` | Toggle emoji reaction |
| GET/POST | `/api/comments/:postId/comments` | List / add comments |
| GET/POST/DELETE | `/api/communities/:name/join` | Community info / join / leave |
| GET | `/api/notifications` | List notifications |
| POST | `/api/upload` | Upload an image |
| GET/POST | `/api/chat/conversations` | List / start conversations |

## License

MIT
