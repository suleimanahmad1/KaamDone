# KaamDone

Full-stack **MERN** task manager — secure login, tasks with deadlines, file attachments, activity history, and email reminders before due dates.

**Repo:** [github.com/suleiman-code/KaamDone](https://github.com/suleiman-code/KaamDone)

| | |
|---|---|
| **Frontend** | React 19 · Vite · Tailwind · React Router |
| **Backend** | Node.js · Express · JWT · Multer |
| **Database** | MongoDB Atlas · GridFS (files) |

---

## What you can do

**Tasks**
- Create, edit, and delete tasks
- Status: Pending · In Progress · Completed
- Priority: Low · Medium · High
- Due date and time, with overdue highlighting
- Search, filter by status/priority
- Grid or list view (saved in browser)

**Files & history**
- Attach up to 5 files per task (10 MB each) — images, PDF, Word
- Open or download files from the dashboard
- View per-task activity log

**Account**
- Register, login, JWT sessions
- Forgot / reset password by email
- Profile page with avatar crop
- Your tasks stay private to your account

**Email** (optional, needs SMTP in `.env`)
- Password reset link
- Reminder ~30 minutes before a task deadline

---

## Quick start

**You need:** Node.js 18+, MongoDB Atlas URI, and optionally Gmail SMTP for emails.

### 1. Clone and install

```bash
git clone https://github.com/suleiman-code/KaamDone.git
cd KaamDone

cd server && npm install
cd ../frontend && npm install
```

### 2. Configure backend

```bash
cd server
copy .env.example .env    # Windows
# cp .env.example .env    # Mac/Linux
```

Edit `server/.env` — at minimum set:

- `MONGO_URI` — from MongoDB Atlas
- `DB_NAME` — e.g. `taskManagerDB`
- `JWT_SECRET` — run: `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`
- `CLIENT_URL` — `http://localhost:5173`

For email (reset + reminders), add `SMTP_*` variables. See `server/.env.example` for all options.

### 3. Run (two terminals)

**Terminal 1 — API**
```bash
cd server
npm run dev
```
→ [http://localhost:5000](http://localhost:5000)

**Terminal 2 — App**
```bash
cd frontend
npm run dev
```
→ [http://localhost:5173](http://localhost:5173)

When the server starts, you should see `MongoDB Atlas connected` and `Deadline reminders: ...` if email is enabled.

---

## Project layout

```
KaamDone/
├── frontend/src/     pages, components, API services
├── server/
│   ├── controllers/  auth & tasks
│   ├── models/       User, Task, TaskActivity
│   ├── routes/       REST API
│   ├── utils/        email, GridFS, reminders
│   └── .env.example
└── README.md
```

---

## Environment variables

Copy `server/.env.example` → `server/.env`. **Do not commit `.env`.**

| Variable | Notes |
|----------|--------|
| `MONGO_URI`, `DB_NAME` | Required |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Required for auth |
| `CLIENT_URL` | Frontend URL for CORS & reset links |
| `SMTP_*` | Optional — password reset & reminders |
| `DEADLINE_REMINDER_*` | Optional — defaults: 30 min before, check every 60s |

**Frontend (deploy only):** `VITE_API_URL` — e.g. `https://your-api.com/api`

---

## API (base: `/api`)

**Auth**
- `POST /auth/register` · `POST /auth/login`
- `POST /auth/forgot-password` · `POST /auth/reset-password`
- `GET /auth/me` · `PUT /auth/profile` *(JWT required)*

**Tasks** *(JWT required)*
- `GET /tasks` — query: `search`, `status`, `priority`, `sort`
- `POST /tasks` · `GET/PUT/DELETE /tasks/:id`
- `GET /tasks/:id/activity`

---

## App routes

| URL | Who can open |
|-----|----------------|
| `/` | Everyone (landing) |
| `/login`, `/register`, `/forgot-password` | Guests |
| `/reset-password/:token` | Anyone with email link |
| `/dashboard`, `/profile` | Logged-in users |

---

## Deadline reminders

- Server must be running (`npm run dev` or `npm start`)
- Email goes out **before** the due time (default: 30 minutes early)
- Completed tasks are skipped; one email per deadline

Check what will be sent soon:

```bash
cd server
node scripts/check-reminders.js
```

---

## Commands

| Where | Command | What it does |
|-------|---------|--------------|
| `server/` | `npm run dev` | API + auto-reload |
| `server/` | `npm start` | API (production) |
| `frontend/` | `npm run dev` | Dev app on port 5173 |
| `frontend/` | `npm run build` | Production build |
| `frontend/` | `npm run lint` | ESLint |

**Deploy frontend:** `VITE_API_URL=https://your-api.com/api npm run build`

---

## Security tips

- Keep secrets in `server/.env` only
- Use a strong `JWT_SECRET` and Gmail **app passwords** (not your main password)
- Auth routes are rate-limited; CORS uses `CLIENT_URL`

---

## License

Free to use for learning and portfolio. Add a `LICENSE` file if you distribute it formally.
