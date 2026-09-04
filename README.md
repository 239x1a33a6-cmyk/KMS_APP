# KnowledgeVault

A secure knowledge management platform built with the MERN stack and designed for private, categorized, searchable personal knowledge storage.

## Features

- Secure authentication with JWT in HTTP-only cookies
- Create, view, edit, and delete resources
- Favorites, archive, trash, and restore workflows
- Resource visibility controls for private and public sharing
- Search, filtering, tags, and sorting across stored resources
- Dashboard with counts and recent activity
- Bootstrap-based user interface and protected routes

## Stack

- Backend: Node.js, Express.js, MongoDB, Mongoose
- Frontend: React, Vite, React Router, Bootstrap

## Local setup

1. Start MongoDB locally on `mongodb://localhost:27017`
2. Create a `.env` file in `backend` with:

```env
PORT=8000
JWT_SECRET=your_secure_jwt_secret
MONGO_URI=mongodb://localhost:27017/knowledgevault
CLIENT_URL=http://localhost:5173
```

3. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

4. Start the backend:

```bash
cd backend && npm run dev
```

5. Start the frontend:

```bash
cd frontend && npm run dev
```

### One-command demo startup (recommended)

If you are running locally on macOS and the app keeps complaining about port conflicts, use the included script:

```bash
chmod +x start-demo.sh
./start-demo.sh
```

This script clears stale listeners from ports 5000, 5173, and 8000, starts MongoDB in `/tmp/kvdb`, and launches the backend and frontend in demo mode.

## Demo mode

For a quick local preview with seeded users and sample resources, use the built-in demo seed:

```bash
mkdir -p /tmp/kvdb
mongod --dbpath /tmp/kvdb --logpath /tmp/kvdb.log --port 27017
cd backend && npm run demo
```

Demo accounts:

- Email: `demo@knowledgevault.app`
- Password: `Demo123!`
- Email: `aisha@knowledgevault.app`
- Password: `Demo123!`
- Email: `rahul@knowledgevault.app`
- Password: `Demo123!`

The backend will auto-create public/private sample resources for these users when `DEMO_MODE=true` is enabled.

## Production build

```bash
cd frontend && npm run build
```

## Main routes

- `/dashboard`
- `/resources`
- `/resources/new`
- `/resources/:id`
- `/favorites`
- `/archived`
- `/trash`
- `/profile`
- `/public/:id`

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/dashboard`
- `GET /api/resources`
- `POST /api/resources`
- `GET /api/resources/:id`
- `PUT /api/resources/:id`
- `DELETE /api/resources/:id`
- `POST /api/resources/:id/favorite`
- `POST /api/resources/:id/archive`
- `POST /api/resources/:id/restore`
- `DELETE /api/resources/:id/permanent`
- `GET /api/public/resources/:id`

## Notes

This project is structured to keep the security model on the backend, with ownership checks and server-side filtering, which is important for a knowledge repository intended to preserve private user data.
