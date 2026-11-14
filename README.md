<div align="center">

# 🚌 Bus Booking App

### Online Bus Ticket Booking System

A simple, responsive bus ticket booking platform built as a collaborative college project using the **MERN stack**.

[![Status](https://img.shields.io/badge/status-in%20development-orange?style=for-the-badge)](#-project-roadmap)
[![Team](https://img.shields.io/badge/team-8%20contributors-blue?style=for-the-badge)](#-contributors)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

**Search buses · Choose seats · Book tickets · Manage journeys**

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Project Goals](#-project-goals)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Application Flow](#-application-flow)
- [User Roles](#-user-roles)
- [Contributors](#-contributors)
- [Git & Contribution Guidelines](#-git--contribution-guidelines)
- [Project Roadmap](#-project-roadmap)
- [Documentation](#-documentation)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## ✨ About the Project

**Bus Booking App** is a web-based Online Bus Ticket Booking System developed as a college team project. It makes booking straightforward: users can search for buses, view journey details, select seats, add passenger information and manage their bookings.

The project also includes an administration area where authorised administrators can manage bus information and view bookings.

> 🎓 This project is developed for academic and learning purposes. The initial release focuses on a reliable Minimum Viable Product (MVP), with optional enhancements planned after the core booking flow is stable.

## 🎯 Project Goals

- Build a responsive and easy-to-use bus booking website.
- Practise full-stack development using the MERN stack.
- Learn collaborative Git and GitHub workflows.
- Implement authentication, role-based access and database operations.
- Prevent duplicate seat bookings through database-level constraints.
- Deliver a working end-to-end project that every team member can understand and demonstrate.

## 🚀 Features

### MVP Features

- 🔐 User registration and login.
- 🔎 Search buses by origin, destination and journey date.
- 🚌 View bus details, timings, type and fare.
- 💺 Interactive seat selection with available, selected and booked states.
- 👥 Passenger details and saved travellers.
- 🎫 Booking confirmation and ticket details.
- 📚 View personal booking history.
- 🛠️ Admin login and bus management (add, edit and delete).
- 📋 Admin view of all bookings.
- 📱 Responsive layouts for mobile, tablet and desktop.

### Planned Enhancements

- Booking cancellation.
- Mock payment flow (test-only; no real payment processing).
- Printable ticket.
- Admin dashboard statistics.
- Search filters and sorting.
- Optional Redis caching after the MVP is stable.

### Out of Scope for the Initial Release

- Real payment gateway.
- SMS or email notifications.
- Native mobile application.
- Live seat locking.
- Multi-language support.

## 🧰 Technology Stack

| Area            | Technology                         |
| --------------- | ---------------------------------- |
| Frontend        | React + Vite                       |
| Styling         | Bootstrap 5 / CSS                  |
| Routing         | React Router                       |
| HTTP Client     | Axios                              |
| Backend         | Node.js + Express.js               |
| Database        | MongoDB + Mongoose                 |
| Authentication  | JWT + bcryptjs                     |
| Validation      | express-validator                  |
| Optional Cache  | Redis + ioredis                    |
| Version Control | Git + GitHub                       |
| API Testing     | Postman                            |
| Deployment      | Vercel (frontend) + Render (backend) |

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

Create `backend/.env` (see template below), then populate seed trips:

```bash
# Seed database with buses, physical layouts, routes, trips, pricing & tickets
npm run seed

# Or run migration on existing data:
node src/scripts/migrate-to-trips.js
```

### 4. Start the backend

```bash
npm run dev
```

### 5. Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 7. Run Test Suites

Run all tests across backend and frontend:

```bash
# Backend Test Suite (32 tests covering models, transactions, concurrency, customer & admin APIs)
cd backend && npm test

# Frontend Test Suite & Build Verification
cd frontend && npm test && npm run build
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
```

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
