# SocialApp — Reddit-Inspired Social Media Platform

A full-stack social media application inspired by Reddit. Users can create posts, interact with the community, and follow each other — all secured with JWT-based authentication.

## Features

- **Authentication** — signup, login, and JWT access + refresh token flow
- **User profiles** — customizable avatars and bios
- **Posts** — create posts with image support, edit and delete your own
- **Interactions** — like posts, leave comments, and reply to threads
- **Follow system** — follow users and get a personalized feed
- **Responsive design** — card-based layout optimized for mobile and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Context API |
| Backend | Node.js, Express, TypeScript |
| Database | MySQL 8 |
| Auth | JWT (access + refresh tokens), bcrypt |
| Security | Parameterized SQL queries |

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Clone & set up the database

```bash
git clone https://github.com/Hmmzza12/SOCIALMEDIA-APP.git
cd SOCIALMEDIA-APP
```

Create the database in MySQL:
```sql
CREATE DATABASE socialmedia;
```

### 2. Start the backend

```bash
cd backend
npm install
cp .env.example .env   # fill in values (see below)
npm run dev            # runs on http://localhost:3000
```

**`backend/.env`**
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=socialmedia
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev            # runs on http://localhost:5173
```

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET/PUT | `/api/users/:id` | View / update profile |
| POST/DELETE | `/api/users/:id/follow` | Follow / unfollow |
| GET/POST | `/api/posts` | List / create posts |
| PUT/DELETE | `/api/posts/:id` | Edit / delete post |
| POST/DELETE | `/api/posts/:id/like` | Like / unlike |
| GET/POST | `/api/posts/:id/comments` | List / add comments |

## Roadmap

- [ ] Real-time notifications
- [ ] Direct messaging
- [ ] Image upload (S3 / Cloudinary)
- [ ] Full-text search
- [ ] Dark mode
- [ ] Infinite scroll

## License

MIT
