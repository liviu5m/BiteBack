# BiteBack

BiteBack is a full-stack food-waste-reduction platform that helps people track what is in their kitchen, discover recipes for ingredients before they expire, and share surplus food with neighbors. The project is composed of a FastAPI backend service and a React (Vite) frontend client, backed by PostgreSQL, Redis, and third-party integrations for authentication, AI recipe generation, and transactional email.

Live deployment: https://bitebackfood.vercel.app/

## Overview

BiteBack combines inventory tracking with community food-sharing and AI-assisted cooking suggestions. The system is split into two independently deployable applications:

- **Backend** — a FastAPI service exposing REST endpoints and a WebSocket channel, backed by PostgreSQL (via SQLModel/SQLAlchemy) and Redis (for background job status tracking).
- **Frontend** — a React + TypeScript single-page application built with Vite, Tailwind CSS, and shadcn/ui components.

### Core capabilities

- **Authentication** — email/password signup with 6-digit email verification codes, Google OAuth login, JWT-based sessions delivered via HTTP-only cookies.
- **Item management** — CRUD operations for a user's personal food inventory, including expiry dates, weight, and category, plus a "mark as cooked" workflow and a saved-percentage metric for waste reduction tracking.
- **Recipe management** — AI-generated recipe suggestions based on inventory contents (using Groq's LLaMA models, with a Google Gemini fallback path), enriched with a Pixabay-sourced recipe image, and persisted per user.
- **Job queues** — Redis-backed background job tracking so long-running AI recipe generation runs asynchronously while the client polls for job status.
- **Item sharing** — users can list surplus food for neighbors, with geolocation-based distance filtering (haversine formula) and text search across name and notes.
- **Product requests** — a request/approval workflow (pending, accepted, completed) between the owner of a shared item and a requester, with transactional email notifications at each status change.
- **Chat rooms and messaging** — one-to-one chat rooms between users automatically created when a product request is initiated, with real-time messaging over WebSockets, message history pagination, and unread-message counts.
- **User profile operations** — authenticated user lookup from a JWT session cookie.

## Architecture & Directory Structure

```
BiteBack/
├── backend/
│   ├── routes/
│   │   ├── auth.py             # Signup, login, email verification, Google OAuth, sessions
│   │   ├── chat_room.py        # Chat room lookup, message history, WebSocket chat
│   │   ├── item.py             # Personal inventory CRUD, cook/save actions, AI job trigger
│   │   ├── job.py               # Redis-backed background job status polling
│   │   ├── message.py           # Reserved module for message-related routes
│   │   ├── product_request.py  # Request lifecycle between item owners and requesters
│   │   ├── recipe.py            # Persisted AI-generated recipes per user
│   │   ├── share_item.py       # Community food-sharing listings and discovery
│   │   └── user.py              # Authenticated user profile lookup
│   ├── main.py                  # FastAPI app factory, middleware, router registration
│   ├── models.py                 # SQLModel ORM entities and enums
│   ├── database.py               # Engine configuration, session dependency, schema init
│   ├── redis_client.py           # Redis connection factory
│   ├── ai.py                     # Groq / Gemini recipe generation and Pixabay image lookup
│   ├── brevo_email.py            # HTML email templates and Brevo transactional email client
│   ├── utils.py                   # Password hashing, JWT issuance/verification, auth dependencies
│   ├── run.py                     # Local development entry point (uvicorn)
│   ├── seed_items.py               # Faker-based inventory item seeding script
│   ├── seed_share_item.py          # Faker-based shared-listing seeding script
│   ├── Dockerfile                  # Container image definition for the backend service
│   ├── vercel.json                 # Serverless deployment configuration
│   └── requirements.txt            # Python dependencies
└── frontend/
    ├── src/
    │   ├── api/                    # Axios-based API clients per domain (item, recipe, chat, etc.)
    │   ├── components/
    │   │   ├── elements/           # Reusable UI building blocks (cards, forms, sidebar, loaders)
    │   │   ├── layouts/            # Page layout wrappers
    │   │   ├── middlewares/         # Route guards (auth required / non-auth required)
    │   │   ├── pages/               # Route-level views (Dashboard, Chat, Cook, Login, Signup, etc.)
    │   │   └── ui/                   # shadcn/ui-based primitives (button, select, input-otp)
    │   ├── lib/                      # App-wide context/provider, shared types, utility helpers
    │   ├── App.tsx / main.tsx        # Application root and entry point
    │   └── App.css                   # Global styles
    ├── package.json                  # Frontend dependencies and scripts
    ├── vite.config.ts                # Vite build configuration
    └── vercel.json                   # Frontend serverless deployment configuration
```

## Backend Component Specifications

### Core modules

| Module | Responsibility |
|---|---|
| `main.py` | Initializes the FastAPI application, applies `SessionMiddleware` and CORS middleware, registers all route modules, and mounts a small Gradio-based status console at `/dashboard` for platform health visibility. |
| `models.py` | Defines the SQLModel ORM entities: `User`, `Item`, `Recipe`, `ShareItem`, `ProductRequest`, `ChatRoom`, and `Message`, along with the `ItemCategory`, `RecipeDifficulty`, and `RequestStatus` enums and their relationships. |
| `database.py` | Configures the SQLAlchemy engine from the `DATABASE_URL` environment variable, exposes `init_db()` to create tables on startup, and provides the `SessionDep` dependency used across route modules. |
| `redis_client.py` | Instantiates a shared Redis client from the `REDIS_URL` environment variable, used for tracking asynchronous job state. |
| `ai.py` | Builds structured prompts from a user's inventory and calls the Groq chat completions API (with a Google Gemini code path available) to generate recipe suggestions as JSON, repairing malformed JSON output and enriching each recipe with an image sourced from Pixabay. |
| `brevo_email.py` | Builds branded HTML email templates for product-request status changes (pending, accepted, completed, declined) and sends them through the Brevo transactional email API. |
| `utils.py` | Provides password hashing/verification, verification code and JWT helpers (`createAccessToken`, `decodeToken`), and the `verifyUserTokenSession` / `verify_websocket_token` FastAPI dependencies used to protect HTTP and WebSocket routes via the `jwt` cookie. |
| `seed_items.py` / `seed_share_item.py` | Standalone scripts that populate the database with realistic fake inventory items and shared-food listings for local development and demos, using Faker and the `faker_food` provider. |

### Route modules (`backend/routes/`)

| Route module | Prefix | Responsibility |
|---|---|---|
| `auth.py` | `/auth` | User signup with email verification codes, code verification and resend, credential login/logout with JWT cookie sessions, Google OAuth login and callback, and session bootstrapping (`/set-session`) for cross-origin OAuth redirects. |
| `chat_room.py` | `/api/chat-room` | Lists a user's chat rooms with unread counts, paginated message history, a WebSocket endpoint for real-time messaging, chat room creation/lookup between two users, and marking messages as read. |
| `item.py` | `/api/item` | Full CRUD for a user's personal inventory, retrieval by ID list, triggering asynchronous AI recipe matching per inventory tab (`missing`, `saved`, default), marking items as cooked, and computing a saved-items percentage. |
| `job.py` | `/api/job` | Polls the status of a background job (e.g., AI recipe generation) stored in Redis by job ID. |
| `message.py` | — | Reserved module for message-specific routes; currently unimplemented. |
| `product_request.py` | `/api/product-request` | Creates a request for a shared item (auto-creating a chat room between requester and owner), lists requests between two users, updates request status with email notifications, and deletes/declines requests with notification support. |
| `recipe.py` | `/api/recipe` | Persists AI-generated recipes selected by the user, deletes saved recipes, and lists a user's saved recipes. |
| `share_item.py` | `/api/share-item` | Creates community food-sharing listings, discovers nearby listings using a haversine distance calculation with search-term filtering, lists a user's own listings and their requested listings, and supports partial updates and deletion of listings. |
| `user.py` | `/api/user` | Resolves the authenticated user's profile from the JWT session cookie. |

## Installation & Setup Instructions

### Prerequisites

- Python 3.9 or later
- Node.js 18 or later (with npm)
- Redis (local instance or hosted, e.g., Redis Cloud/Upstash)
- PostgreSQL (SQLite is not used by this project; `DATABASE_URL` must point to a PostgreSQL instance)

### Backend setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate      # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in `backend/` with the required environment variables:
   ```bash
   DATABASE_URL=postgresql://user:password@host:port/dbname
   REDIS_URL=redis://host:port
   SECRET_KEY=your-session-secret
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
   BACKEND_URL=http://localhost:8000
   REACT_DASHBOARD_URL=http://localhost:5173/dashboard
   BREVO_API_KEY=your-brevo-api-key
   GROQ_API_KEY=your-groq-api-key
   PIXABAY_KEY=your-pixabay-api-key
   ```
5. (Optional) Seed the database with sample data once at least one user exists:
   ```bash
   python seed_items.py
   python seed_share_item.py
   ```
6. Run the development server, either via the provided entry point:
   ```bash
   python run.py
   ```
   or directly with uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the backend API URL and any required map/OAuth keys used by the client.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Build for production:
   ```bash
   npm run build
   ```

## Deployment & Containerization

### Docker (backend)

The backend includes a `Dockerfile` for containerized deployment.

Build the image:
```bash
docker build -t biteback-backend ./backend
```

Run the container:
```bash
docker run -d \
  --name biteback-backend \
  -p 7860:7860 \
  --env-file backend/.env \
  biteback-backend
```

The container runs `uvicorn main:app` on port `7860`, matching the platform's expected default port for hosted container environments.

### Serverless deployment (Vercel)

Both the backend and frontend include a `vercel.json` for serverless deployment.

The backend's `vercel.json` builds `main.py` using the `@vercel/python` runtime and routes all incoming traffic to it:
```json
{
  "builds": [
    { "src": "main.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "main.py" }
  ]
}
```

To deploy:
1. Install the Vercel CLI and authenticate: `npm i -g vercel && vercel login`
2. From the `backend/` directory, run `vercel` to deploy the API as a serverless function, configuring the environment variables listed above in the Vercel project settings.
3. From the `frontend/` directory, run `vercel` to deploy the static Vite build, setting the API base URL to point at the deployed backend.

The production frontend is live at https://bitebackfood.vercel.app/, with CORS on the backend configured to allow requests from this origin as well as `http://localhost:5173` for local development.
