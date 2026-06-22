# Animalia

A "Tinder-style" cat adoption platform built for Animalia Welfare and More, a local vet clinic. Prospective adopters swipe through available cats, like the ones they're interested in, and book an in-person visit. Visits are automatically synced to Google Calendar for both the adopter and clinic staff. Staff manage cats, clients, orders, and visit requests through an admin portal that doubles as a lightweight LIMS.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript, Vite, Ant Design, React Router 7, Zustand, Axios |
| Backend | Python 3.11, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2 |
| Database | PostgreSQL |
| Auth | JWT (python-jose) + bcrypt, OAuth2 password flow |
| Integrations | Google Calendar API (visit booking), SMTP (staff notifications) |
| Hosting | Render (`render.yaml`) — static frontend, Python API, managed Postgres |
| Mobile | Capacitor iOS wrapper (scaffolded) |

## Project Structure

```
Animalia/
├── backend/            # FastAPI app
│   └── app/
│       ├── main.py     # app, middleware, static mounts, lifespan startup
│       ├── core/       # config, security (JWT/bcrypt), calendar, email, startup
│       ├── models/     # SQLAlchemy ORM tables
│       ├── schemas/    # Pydantic request/response models
│       ├── crud/       # DB access helpers
│       ├── db/         # engine + session
│       └── api/api_v1/ # routers grouped by domain
├── frontend/           # React + Vite SPA
│   └── src/
│       ├── pages/      # Home, Apply, Login, Dashboard, VisitRequests, Clients, Orders
│       ├── components/ # CatCarousel, CatHeartButton, layout, auth
│       ├── store/      # Zustand stores (auth, liked cats)
│       └── config/     # axios client, role permissions
└── render.yaml         # Render Blueprint (db + api + web)
```

## Features

### Adopter (public)
- Swipeable cat carousel with like/heart selection (persisted client-side).
- Visit-scheduling form (name, email, phone, date, time slot) carrying liked cats.
- On submit, the backend emails staff and auto-creates a Google Calendar event inviting both the adopter and clinic team.

### Staff portal (JWT-protected)
- Dashboard with stats (clients, orders, pending orders, completed-this-month, new visit requests).
- Cat profile manager: upload/delete cat photos (JPEG/PNG/WebP, 5 MB max).
- Visit Requests: triage incoming requests, change status, book/cancel calendar visits.
- Clients and Orders CRUD (LIMS).
- Roles: `super_admin`, `staff`, `admin`.

## API

REST, prefixed with `/api/v1`:

| Router | Purpose |
|--------|---------|
| `auth` | `POST /auth/login`, `GET /auth/me` |
| `cats` | public `GET /cats/` (available); protected `GET /cats/all`, `POST /cats/`, `DELETE /cats/{id}` |
| `applications` | public `POST /applications/`; protected list / update / `book` / delete |
| `clients` | client CRUD |
| `products` (orders) | order CRUD |
| `dashboard` | `GET /dashboard/stats` |
| `users` | staff account management |

## Data Model (PostgreSQL)

- **users** — staff accounts: credentials, role, lockout tracking, password history.
- **cats** — name, image path, status, display order.
- **adoption_applications** — visit requests: applicant info, date/time, liked cat IDs, status, `calendar_event_id`.
- **clients** — adopter/contact records.
- **products** — inventory/order items.

## Local Development

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in values
uvicorn app.main:app --reload
```

API runs at `http://localhost:8000` (docs at `/docs`). On first run with an empty users table, a default `super_admin` is bootstrapped from the `ADMIN_*` env vars.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`. Set `VITE_API_URL` (defaults to `http://localhost:8000/api/v1`).

## Configuration

Key backend environment variables (see `backend/.env.example`):

- `DATABASE_URL` — PostgreSQL connection string.
- `SECRET_KEY` — JWT signing secret.
- `CORS_ORIGINS` — comma-separated allowed origins.
- `UPLOADS_DIR` — persistent path for cat images.
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_EMAIL` — first-run admin bootstrap.
- `SMTP_*` and `VISIT_REQUEST_NOTIFY_EMAIL` — staff email notifications (optional).
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REFRESH_TOKEN` / `GOOGLE_CALENDAR_ID` — Google Calendar booking (optional).
- `VISIT_TIMEZONE`, `VISIT_DURATION_MINUTES`, `VISIT_STAFF_ATTENDEES` — visit event settings.

Both the SMTP and Google Calendar integrations are optional and gracefully no-op when their credentials are not set.

## Deployment

Deployed on Render via `render.yaml`, which provisions:

1. **animalia-db** — managed PostgreSQL.
2. **animalia-api** — FastAPI service with a persistent disk for uploaded cat images.
3. **animalia-web** — static build of the frontend (`npm run build` → `dist/`) with SPA rewrites.

## User Flow

1. Browse available cats on the home page.
2. Like the cats of interest.
3. Fill out the visit form and submit.
4. Backend emails staff and creates a Google Calendar invite for adopter + clinic.
5. Staff manage requests, cats, clients, and orders from the portal.
