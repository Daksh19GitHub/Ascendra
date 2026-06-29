# Ascendra

A full-stack professional networking platform for students and recruiters. Connect with peers, share posts, discover job openings matched to your profile, chat in real time, and track your growth with analytics — powered by a personalized feed and Gemini AI.

**Live app:** [ascendra-gamma.vercel.app](https://ascendra-gamma.vercel.app)

---

## Features

- **Authentication** — Sign up, log in, JWT-based sessions
- **Personalized feed** — Ranked posts from friends and your network
- **Posts & engagement** — Create posts and job listings, react, comment, repost
- **Friends** — Send requests, accept/reject, manage connections
- **Real-time chat** — Socket.io messaging between friends
- **Jobs for You** — Semantic job recommendations from profile + skills
- **Profiles** — Rich profiles with skills, education, work experience, photo upload
- **Analytics** — Engagement charts, profile completion, post performance
- **AI assistant** — Gemini-powered help for drafting posts and profile tips
- **Notifications** — Real-time alerts for likes, comments, reposts, and more

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 19, Vite, React Router, Framer Motion, Recharts, Socket.io Client |
| **Backend** | Node.js, Express 5, Socket.io, Mongoose |
| **Database** | MongoDB Atlas |
| **Auth** | JWT, bcrypt |
| **Media** | Cloudinary |
| **AI** | Google Gemini, Xenova Transformers (embeddings) |
| **Deploy** | Vercel (frontend), Railway (backend) |

---

## Project structure

```
Ascendra/
├── backend/          # Express API + Socket.io
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       └── socket/
└── frontend/         # React SPA
    └── src/
        ├── landing_page/   # Marketing site
        ├── ourWebApp/      # Authenticated app
        ├── context/
        └── routes/
```

---

## Local development

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Cloudinary account (profile photos)
- Google Gemini API key (AI assistant)

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ascendra?retryWrites=true&w=majority
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

```bash
npm install
npm run dev
```

API runs at `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

The Vite dev server proxies `/api` and `/socket.io` to the backend. For a custom API URL, set `VITE_API_URL` and `VITE_SOCKET_URL` in `frontend/.env`.

### 3. Seed demo data (optional)

From `backend/`:

```bash
npm run seed              # Demo student users (ad1–ad100)
npm run seed:recruiters   # Recruiter users (ad101–ad200)
npm run seed:job-embeddings
```

Demo login example: `ad1@gmail.com` / `ad1@ascendra`

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string (include `/ascendra` database name) |
| `JWT_SECRET` | Secret for signing tokens |
| `JWT_EXPIRES_IN` | Token expiry (default `7d`) |
| `CLIENT_URL` | Frontend origin for CORS and Socket.io |
| `CLOUDINARY_*` | Cloudinary credentials for image uploads |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model name |

### Frontend (production)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL + `/api` (e.g. `https://your-api.railway.app/api`) |
| `VITE_SOCKET_URL` | Backend URL for WebSockets (no `/api` suffix) |

---

## Deployment

This repo is a monorepo. Deploy each folder separately:

| Service | Platform | Root directory | Start / build |
|---------|----------|----------------|---------------|
| Frontend | [Vercel](https://vercel.com) | `frontend` | `npm run build` → `dist` |
| Backend | [Railway](https://railway.app) | `backend` | `npm start` |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) | — | — |

1. Deploy backend on Railway and generate a public domain.
2. Set all backend env vars; use your Vercel URL for `CLIENT_URL`.
3. Deploy frontend on Vercel with `VITE_API_URL` and `VITE_SOCKET_URL` pointing at Railway (**include `https://`**).
4. Redeploy Railway after `CLIENT_URL` is set.

Push to `main` on GitHub to trigger automatic redeploys on both platforms.

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user (Bearer token) |
| GET | `/api/health` | Health check |

Authenticated app routes live under `/api/app/` (feed, posts, friends, chat, jobs, analytics, notifications).

---

## Theme

Ascendra uses an **indigo + teal** design system (`#4F46E5` + `#14B8A6`) across the landing page and web app.

---

## License

Private / educational project. All rights reserved.
