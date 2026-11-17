<div align="center">

# 🚌 YatraBus — Online Bus Ticket Booking System (OBTBS)

### Enterprise-Grade, Trip-Centric Bus Transit & Tour Platform

A responsive, data-driven bus ticket reservation and tour booking platform built using the **MERN Stack** (MongoDB, Express, React, Node.js) with Tailwind CSS, Redis caching, and ACID transaction safety.

[![Status](https://img.shields.io/badge/status-active%20%26%20production%20ready-brightgreen?style=for-the-badge)](#-features)
[![Backend Tests](https://img.shields.io/badge/backend%20tests-72%20passing-success?style=for-the-badge)](#-running-test-suites)
[![Frontend Tests](https://img.shields.io/badge/frontend%20tests-35%20passing-success?style=for-the-badge)](#-running-test-suites)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

**Search trips · Choose seats · Book tickets · Short-trip circuits · Full admin fleet control**

</div>

---

## 🔑 Demo & Admin Seed Credentials

After seeding the database, log in with the pre-configured credentials:

| Role | Email | Password | Access Level & Features |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@yatrabus.com` | `admin123` | Full Admin Dashboard, Fleet CRUD, Visual Seat Designer, Pricing Multipliers, Recurrence Generator, Audit Logs |
| **Customer** | `user@yatrabus.com` | `user123` | Seat Booking, Pre-loaded ₹500 Wallet, Saved Passengers, Travel Journal, Digital & PDF Tickets |

*(In production, custom passwords can be specified via `ADMIN_SEED_PASSWORD` in `backend/.env`).*

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Project Architecture & Goals](#-project-goals)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Quick Start Commands (Root)](#-quick-start-commands-root)
- [Running Test Suites](#-running-test-suites)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Deploy](#-deploy)
- [Application Flow](#-application-flow)
- [User Roles](#-user-roles)
- [Documentation](#-documentation)
- [License](#-license)

---

## ✨ About the Project

**YatraBus (OBTBS)** is a full-featured, database-driven Online Bus Ticket Booking System. The platform satisfies two primary modules:
1. **Customer Portal**: Search scheduled trips across origin and destination hubs, inspect real-time seat occupancy maps, hold seats under an 8-minute atomic lock, apply validated promotional offers, complete online payments, and download official server-rendered PDF tickets.
2. **Admin Command Center**: Visual interactive seat layout designer, batch recurring trip schedule generator, multi-tier dynamic pricing with live simulation, passenger wallet balance adjustments, booking seat reassignments, system audit logs, and analytics.

**Core Principle**: The database is the single source of truth. No customer-facing view renders hardcoded or mock content; all buses, schedules, routes, destinations, tour packages, coupons, and metrics are served dynamically from MongoDB and optimized with Redis.

## 🎯 Project Goals

- Build a responsive and easy-to-use bus booking website.
- Practise full-stack development using the MERN stack.
- Learn collaborative Git and GitHub workflows.
- Implement authentication, role-based access and database operations.
- Prevent duplicate seat bookings through database-level constraints.
- Deliver a working end-to-end project that every team member can understand and demonstrate.

## 🚀 Platform Features

### Customer Experience (End User)
- 🔐 **Secure Authentication**: JWT-based authentication, user profile management, pre-loaded digital wallet.
- 🔎 **Real-Time Bus & Trip Search**: Search scheduled trips across interstate corridors; filter by departure time, bus type, and operator.
- 💺 **Interactive Seating Layout**: Lower and upper deck visual rendering, live 8-minute temporary seat hold countdown, ladies-only reserved seating indicators.
- 👥 **Passenger Rostering**: Single-booking multi-passenger entry with saved frequent travellers.
- 🏷️ **Dynamic Coupons & Discounts**: Real-time server validation of promotional codes (e.g., `YATRAFIRST`, `FESTIVE50`) with instant savings deduction.
- 💳 **Online Payment Gateway**: Integrated simulated / Razorpay checkout with idempotent signature verification.
- 📄 **Official PDF Ticket Generation**: Instant browser download of server-generated digital tickets using PDFKit.
- 📧 **Email Notifications**: Welcome email after account registration and a PDF ticket attachment after successful payment.
- 🔔 **Customer Notifications**: Account-scoped notifications cover booking, payment, cancellation, ticket, and schedule events; they load from the backend, persist across sessions, and support read/unread actions.
- 🎟️ **Booking History Downloads**: Confirmed and completed tickets can be regenerated from owned booking records when a saved ticket snapshot is unavailable.
- 🗺️ **Short Trips & Weekend Circuits**: Browse authentic curated travel packages (`/short-trips`) with day-by-day itineraries and inclusions.
- 🧭 **Curated Destination Guides**: Interactive showcase of top Indian destinations with highlights and regional pickup points.
- 📔 **Personal Travel Dashboard**: Booking history, saved passenger roster management, and travel memory journal entries.

### Admin Fleet & Operations Center
- 📊 **Executive Analytics Dashboard**: Real-time KPI summaries for total fleet, active routes, bookings, and revenue metrics.
- 🚌 **Fleet Management & Visual Seat Layout Designer**: Full bus CRUD with visual brush editor for seat types (regular, sleeper, ladies-only, blocked) and deck assignments.
- 🛡️ **Safety Guard Locks**: Automatic protection preventing vehicle deletion or seat layout changes if future confirmed passenger bookings exist.
- 📅 **Batch Trip Recurrence Generator**: Rapid automated scheduling of recurring daily/weekly bus departures with vehicle conflict prevention.
- 📈 **Multi-Tier Dynamic Pricing**: Configuration of base fares with weekend, festive, last-minute, and berth location multipliers, featuring a live price simulator.
- 🔄 **Operational Controls**: Live passenger seat reassignment with atomic lock transfer, booking cancellation, and manual passenger wallet balance adjustments.
- 📋 **System Audit Logs**: Comprehensive chronological event logging tracking administrative modifications with before/after diffs and IP addresses.
- 📁 **Media Asset Manager**: Secure multipart image uploads for buses, destinations, and circuit packages.

## 🧰 Technology Stack

| Area | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite 6 | High-speed Single Page Application (SPA) |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Responsive, modern utility-first interface |
| **Routing & State** | React Router 6 + Context API | Client-side routing and global auth/booking state |
| **Backend Framework** | Node.js 20 + Express 4 | High-throughput REST API architecture |
| **Database & ODM** | MongoDB 7 + Mongoose 8 | Document persistence with ACID transactions |
| **Caching Layer** | Redis 7 + ioredis | Resilient read caching with auto-invalidation & graceful fallback |
| **Concurrency Engine** | MongoDB Sessions + Unique Indexes | Guarantees zero duplicate seat locks under parallel load |
| **Document Generation**| PDFKit | Server-side official PDF ticket rendering |
| **Validation** | Zod | Strict request payload schema validation |
| **Testing** | Node Test Runner / Supertest / Vitest | 72 backend tests & 35 frontend component tests |

## 📁 Project Structure

```text
bus-booking-app/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── pages/
│       │   └── admin/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   └── server.js
│
├── docs/
│   ├── PRD.md
│   ├── TRD.md
│   ├── UI_UX.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DOCUMENTATION.md
│   └── APPLICATION_FLOWS.md
│
├── .gitignore
├── LICENSE
└── README.md
```

> The structure may evolve as implementation progresses. Keep this section updated when folders or important files are added or renamed.

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ LTS recommended)
- npm (included with Node.js)
- [Git](https://git-scm.com/)
- A **MongoDB database with Replica Set support** (for atomic transactions):
  - **Option 1 (Recommended Cloud)**: Free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (Replica Sets are enabled by default).
  - **Option 2 (Local Docker Replica Set)**:
    ```bash
    docker run -d --name mongo-rs -p 27017:27017 mongo:7 --replSet rs0
    # Initialize the replica set once:
    docker exec -it mongo-rs mongosh --eval "rs.initiate({_id:'rs0', members:[{_id:0, host:'127.0.0.1:27017'}]})"
    ```
    Set `MONGO_URI=mongodb://127.0.0.1:27017/busbooking?replicaSet=rs0&directConnection=true` in `backend/.env`.
  - **Option 3 (Local Standalone MongoDB)**: Standard MongoDB works out of the box; the application automatically detects standalone mode and falls back to atomic compound unique index locking.

### 1. Clone the repository

```bash
git clone https://github.com/dip91314-coder/bus-booking-app.git
cd bus-booking-app
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment & Seed Database

Create `backend/.env` (see template below), then populate seed data:

```bash
# Seed database with 8 buses, visual layouts, 5 routes, 15+ trips, multi-tier pricing, 8+ promo coupons, 8 tour circuits & 6 destinations
npm run seed --prefix backend
```

### 4. Quick Start Commands (From Repository Root)

Run backend and frontend concurrently or in separate terminal tabs from the project root:

```bash
# Terminal 1: Start Express API server (port 5000)
npm run dev --prefix backend

# Terminal 2: Start Vite development server (port 5173)
npm run dev --prefix frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Running Test Suites

Run the complete backend and frontend test suites and verify production builds:

```bash
# 1. Run all backend tests
npm test --prefix backend

# 2. Run all frontend unit/component tests
npm test --prefix frontend

# 3. Verify clean production Vite bundle compilation
npm run build --prefix frontend
```

## 🔑 Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173

# Optional: configure only when Redis is enabled
REDIS_URL=

# Optional SMTP delivery (Gmail users should create an App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

Configure these SMTP values in the backend environment (never in `frontend/.env`) to enable welcome emails and ticket delivery. If SMTP is missing or unavailable, account registration and confirmed bookings still succeed; the registration response indicates whether its email was sent, and delivery failures are logged.

If the frontend needs a separate API base URL, create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Security reminders:**

- Never commit `.env` files, passwords, tokens or API keys.
- Keep `.env` in `.gitignore`.
- Commit `.env.example` with placeholder values only.
- Never store plaintext passwords.
- Do not put server secrets in frontend environment variables. Variables prefixed with `VITE_` are exposed to the browser.

## 📜 Available Scripts

Confirm these exist in the relevant `package.json` before using them.

### Backend

| Command       | Purpose                                              |
| ------------- | ---------------------------------------------------- |
| `npm run dev` | Start backend in development mode (Nodemon).         |
| `npm start`   | Start backend in production mode.                    |
| `npm run seed`| Insert sample data (if a seed script is configured). |

### Frontend

| Command           | Purpose                              |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Vite development server.       |
| `npm run build`   | Build frontend for production.       |
| `npm run preview` | Preview the production build locally.|

## 🚀 Deploy

### Option 1: Docker Compose (Full Stack with 1 Command)

The project includes production-ready Dockerfiles (`backend/Dockerfile`, `frontend/Dockerfile` with multi-stage Nginx) and a `docker-compose.yml` that provisions:
- **MongoDB 7.0** with single-node replica set (`rs0`) for ACID transactions support
- **Redis 7.0 Alpine** for caching and concurrency lock gates
- **Backend Node.js API** (port 5000)
- **Frontend Nginx SPA** (port 80)

```bash
# 1. Build and start all services in detached mode
docker compose up -d --build

# 2. Check health status of all running containers
docker compose ps

# 3. Seed demo routes, buses, schedules, and promo coupons once
docker compose exec backend npm run seed
```

- **Frontend App**: [http://localhost](http://localhost)
- **Backend API & Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

To shut down containers and preserve data volumes:
```bash
docker compose down
```

---

### Option 2: Production Hosted Cloud Deployment

You can deploy the stack across managed cloud services with zero server maintenance:

#### 1. Database: MongoDB Atlas
1. Create a free shared cluster (M0) on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow your API's IP address (or `0.0.0.0/0`).
3. Obtain the connection URI (e.g. `mongodb+srv://<user>:<password>@cluster0.mongodb.net/busbooking?retryWrites=true&w=majority`).
> [!NOTE]
> MongoDB Atlas clusters run as replica sets by default, supporting atomic multi-document transactions seamlessly.

#### 2. Cache: Upstash Redis or Redis Cloud
1. Create a database on [Upstash](https://upstash.com/) or [Redis Cloud](https://redis.io/try-free/).
2. Copy the connection URL (`rediss://default:<password>@<host>:<port>`).

#### 3. Backend API: Render or Railway
1. Connect your GitHub repository to [Render](https://render.com/) or [Railway](https://railway.app/).
2. Set root directory to `backend`, Build Command `npm install`, Start Command `node src/server.js`.
3. Configure Environment Variables:

| Variable | Description | Example / Recommended Value |
|---|---|---|
| `PORT` | API listen port | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `MONGO_URI` | MongoDB Atlas URI | `mongodb+srv://...` |
| `REDIS_URL` | Upstash / Redis Cloud URL | `rediss://...` |
| `REDIS_ENABLED` | Enable Redis optimization | `true` |
| `JWT_SECRET` | 32+ char secret for JWT access tokens | `generate-secure-random-key` |
| `JWT_REFRESH_SECRET` | 32+ char secret for refresh tokens | `generate-secure-random-key` |
| `CLIENT_URL` | Hosted frontend origin URL | `https://yatrabus.vercel.app` |
| `CORS_ORIGIN` | Allowed CORS origin | `https://yatrabus.vercel.app` |
| `LOCK_MINUTES` | Hold expiration time in minutes | `8` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use implicit TLS (typically true for port 465) | `false` |
| `SMTP_USER` | SMTP account username | Your mail account |
| `SMTP_PASS` | SMTP password or provider app password | Secret environment value |
| `EMAIL_FROM` | Optional verified sender address | `YatraBus <you@example.com>` |
| `ADMIN_SEED_PASSWORD` | Strong password for admin in production | `CustomStrongPassword#2026` |

#### 4. Frontend Web App: Vercel or Netlify
1. Connect your repository to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
2. Root directory: `frontend`. Build command: `npm run build`. Output directory: `dist`.
3. Configure Environment Variables:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Public backend URL | `https://api-yatrabus.onrender.com/api` |
| `VITE_API_URL` | Public backend URL alias | `https://api-yatrabus.onrender.com/api` |
| `VITE_USE_MOCKS` | Use local mock data fallback | `false` |

> [!TIP]
> In production, the admin password is never seeded with the default password: if `ADMIN_SEED_PASSWORD` is not explicitly set in the environment, a cryptographically secure random password is generated to prevent unauthorized access.

## 🔄 Application Flow

```text
Guest
  │
  ▼
Home Page
  │
  ▼
Search Buses ───────► Bus Results
                          │
                          ▼
                     Bus Details
                          │
                          ▼
                    Book Now / Login
                          │
                          ▼
                    Select Seats
                          │
                          ▼
                  Passenger Details
                          │
                          ▼
                   Booking Summary
                          │
                          ▼
                    Confirm Booking
                          │
                          ▼
                  Ticket / My Bookings
```

### Admin Flow

```text
Admin Login
    │
    ▼
Admin Dashboard
    │
    ├── Manage Buses
    │     ├── Add Bus
    │     ├── Edit Bus
    │     └── Delete Bus
    │
    └── View All Bookings
```

## 👤 User Roles

| Role            | Main permissions                                             |
| --------------- | ------------------------------------------------------------ |
| Guest           | View home page, search buses and view bus details.           |
| Registered User | Book seats, manage own bookings, profile and saved travellers. |
| Admin           | Manage buses and view all bookings.                          |

## 👥 Contributors

This project is planned and developed by an **8-member team**, including the team lead.

| #   | Contributor        | Responsibility                                          | GitHub                                              |
| --- | ------------------ | ------------------------------------------------------- | --------------------------------------------------- |
| 1   | **Dip Bhattacharjee** | Team Lead, project setup, architecture and integration | [@dip91314-coder](https://github.com/dip91314-coder) |
| 2   | Contributor 2      | Authentication backend and profile API                  | [@USERNAME](https://github.com/USERNAME)            |
| 3   | Contributor 3      | Bus model, bus CRUD and search API                      | [@USERNAME](https://github.com/USERNAME)            |
| 4   | Contributor 4      | Seat selection and booking UI                           | [@USERNAME](https://github.com/USERNAME)            |
| 5   | Contributor 5      | Home page, search form and bus cards                    | [@USERNAME](https://github.com/USERNAME)            |
| 6   | Contributor 6      | Login, registration and protected UI routes             | [@USERNAME](https://github.com/USERNAME)            |
| 7   | Contributor 7      | My Bookings and ticket page                             | [@USERNAME](https://github.com/USERNAME)            |
| 8   | Contributor 8      | Admin UI, testing and documentation                     | [@USERNAME](https://github.com/USERNAME)            |

> Replace the placeholder names and GitHub links with the real team members. GitHub's Contributors section is generated from commit history; this table is the manually maintained team list.

## 🤝 Git & Contribution Guidelines

### Branch Naming

```text
main
feature/auth
feature/bus-search
feature/seat-booking
feature/admin-dashboard
fix/booking-validation
docs/update-readme
```

### Development Workflow

1. Clone the repository.
2. Pull the latest `main` branch.
3. Create your own feature branch.
4. Work only on your assigned task.
5. Test your changes locally.
6. Commit with a meaningful message.
7. Push your feature branch.
8. Open a Pull Request targeting `main`.
9. Respond to review feedback and update the same PR.
10. Merge only after approval and required checks.

### Commit Message Convention

| Prefix      | Use                           |
| ----------- | ----------------------------- |
| `feat:`     | New feature                   |
| `fix:`      | Bug fix                       |
| `docs:`     | Documentation changes         |
| `style:`    | Formatting or styling changes |
| `refactor:` | Code restructuring            |
| `test:`     | Adding or updating tests      |
| `chore:`    | Setup and maintenance         |

```bash
git commit -m "feat: add bus search form"
git commit -m "fix: prevent duplicate seat booking"
git commit -m "docs: update project readme"
```

### Pull Request Checklist

- [ ] The feature works locally.
- [ ] No unrelated files were changed.
- [ ] No `.env` files, secrets or credentials are included.
- [ ] No unnecessary debug logs remain.
- [ ] Relevant tests or manual testing steps are provided.
- [ ] UI changes include screenshots.
- [ ] The PR title and description explain the changes.

**Important:** The `main` branch is protected. Do not push directly to `main`; open a Pull Request.

## 🗺️ Project Roadmap

| Phase   | Planned work                                                        | Target |
| ------- | ------------------------------------------------------------------- | ------ |
| Phase 1 | Repository, project structure, database connection, API foundation  | Week 1 |
| Phase 2 | Authentication, bus search, home page, profile/traveller features   | Week 2 |
| Phase 3 | Seat selection, booking, My Bookings, admin bus management          | Week 3 |
| Phase 4 | Integration, testing, responsive polish and deployment              | Week 4 |

The team will prioritise a stable MVP. Optional features are added only after the core booking flow works reliably.

## 📚 Documentation

Project documentation lives in the `docs/` directory.

| Document               | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `PRD.md`               | Product requirements, goals and scope.           |
| `TRD.md`               | Technical architecture and implementation.       |
| `UI_UX.md`             | Screen specifications and design guidelines.     |
| `DATABASE_SCHEMA.md`   | Collections, fields, relationships and indexes.  |
| `API_DOCUMENTATION.md` | Backend API endpoints and request/response formats. |
| `APPLICATION_FLOWS.md` | User, booking and admin workflows.               |

## 📄 License

This project is distributed under the [MIT License](LICENSE).

## 🙌 Acknowledgements

- Our faculty and institution for the academic project opportunity.
- All eight team members for their collaboration and contributions.
- The open-source communities behind React, Node.js, Express and MongoDB.

---

<div align="center">

**Made with ❤️ by the Bus Booking App Team**

*Built to learn. Built together. Built step by step.* 🚌

</div>
