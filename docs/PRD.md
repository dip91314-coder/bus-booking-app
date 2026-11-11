# Product Requirements Document (PRD)

## Bus Booking App — Online Bus Ticket Booking System

| Document Version | Status | Target Release | Team Lead | Target Audience |
| :--- | :--- | :--- | :--- | :--- |
| 1.0.0 | Ready for Review | 4-Week Academic MVP | Dip Bhattacharjee | 8-Member Engineering Team & Faculty Evaluators |

---

## 1. Executive Summary & Overview

The **Bus Booking App** is a responsive, web-based Online Bus Ticket Booking System built with the **MERN stack** (MongoDB, Express.js, React, Node.js). It provides an intuitive, reliable self-service platform for passengers to discover bus routes, view transparent fare and timetable information, select preferred seats on an interactive layout, manage passenger records, and receive verifiable digital tickets.

Additionally, the system equips bus fleet operators and system administrators with a secure portal to manage routes, schedules, fares, and view passenger bookings.

This project is developed as an academic team project over a structured **4-week timeline** by an **8-member student engineering team**, emphasizing production-grade engineering practices: strict separation of concerns, role-based access control, comprehensive input validation, and database-level concurrency protection against duplicate seat reservations.

---

## 2. Problem Statement

Intercity bus travel booking in localized transit hubs frequently suffers from:
1. **Inefficient Offline Ticketing**: Passengers must stand in manual queues or call travel agencies to check seat availability and fares.
2. **Double Booking Disasters**: Poorly engineered booking portals frequently sell the same seat to multiple passengers during high-traffic booking windows due to application-level race conditions.
3. **Friction in Checkout**: Commuters repeatedly enter identical passenger details for frequent family travels.
4. **Opaque Fleet Management**: Bus operators lack unified web tools to adjust bus timings, add capacity, or audit ticket sales in real time.

The **Bus Booking App** resolves these challenges by providing a synchronized, real-time-consistent, and mobile-friendly ticketing portal with deterministic database-level seat locking.

---

## 3. Goals & Non-Goals

### 3.1 Project Goals
- **Core User Journey**: Enable guests to search buses by origin, destination, and journey date, view real-time seat availability, register/login, and book tickets in under 2 minutes.
- **Concurrency Invariant**: Eliminate double-seat booking race conditions at the database engine level via MongoDB compound unique indexes.
- **Responsive Experience**: Deliver a responsive user interface styled with Bootstrap 5 that adapts seamlessly to desktop, tablet, and mobile displays.
- **Role-Based Access Control (RBAC)**: Enforce strict separation between public guest routes, authenticated passenger features, and restricted administrative operations using JSON Web Tokens (JWT).
- **Reusable Passenger Profiles**: Allow registered users to maintain saved traveller profiles for fast checkout.
- **Academic Rigor**: Provide fully documented APIs, clean architecture, and modular code ownership distributed across all 8 team members.

### 3.2 Non-Goals (Explicitly Out of Scope for MVP)
- Real money transactions via third-party payment gateways (Stripe, Razorpay, or PayPal). Only a test/mock confirmation flow is supported.
- External communication services (SMS gateways via Twilio or transactional emails via SendGrid). Tickets are presented directly on-screen and stored in booking history.
- Native mobile applications (iOS / Android). The web portal is fully responsive as a progressive SPA.
- WebSocket-based live seat holding / countdown timers. Seat contention is handled during atomic checkout submission.
- Internationalization (i18n) and multi-currency conversion. The MVP standardizes on English and INR (₹).

---

## 4. Target Users & Personas

### 4.1 Persona 1: Rahul Sen (The College Student / Budget Traveler)
- **Age**: 21
- **Role**: Guest / Registered Passenger
- **Behavior**: Travels between Kolkata and Siliguri twice a month. Values quick search on his smartphone, transparent seat pricing, and seeing window vs. aisle seat arrangements.
- **Pain Point**: Hates arriving at the terminal to find his booked seat was accidentally assigned to someone else.

### 4.2 Persona 2: Sunita Banerjee (The Frequent Family Traveler)
- **Age**: 38
- **Role**: Registered Passenger
- **Behavior**: Books monthly intercity journeys for herself, her spouse, and her elderly mother.
- **Pain Point**: Frustrated by having to re-type family member names, ages, and gender preferences every single time she books.

### 4.3 Persona 3: Vikram Das (The Fleet Administrator)
- **Age**: 45
- **Role**: System Administrator
- **Behavior**: Operates a fleet of 15 AC and Non-AC buses across regional routes. Needs to update departures, modify fares, and review passenger manifests for departing buses.
- **Pain Point**: Struggles with paper manifests and needs a single web view of daily passenger bookings.

---

## 5. User Stories

User stories are categorized by user role and assigned unique identifiers (`US-xx`).

### 5.1 Guest User Stories
- **US-01**: As a guest user, I want to access the home page without logging in so that I can immediately explore available bus services.
- **US-02**: As a guest user, I want to search for buses by selecting an origin city, destination city, and journey date so that I can see relevant travel options.
- **US-03**: As a guest user, I want to view search results showing bus operator name, bus type, departure/arrival times, duration, and fare per seat.
- **US-04**: As a guest user, I want to inspect a bus's seat layout to see available and already-booked seats before committing to register.
- **US-05**: As a guest user, I want to register for a new account with my name, email, phone number, and password so that I can book seats and view tickets.

### 5.2 Registered Passenger User Stories
- **US-06**: As a registered user, I want to log in using my email and password so that I can access my account securely.
- **US-07**: As a registered user, I want to stay logged in via a secure JWT session so that I do not have to re-enter credentials on every page navigation.
- **US-08**: As a registered user, I want to select between 1 and 6 available seats on an interactive seat map so that my travel group can sit together.
- **US-09**: As a registered user, I want to enter passenger details (name, age, gender) for each selected seat.
- **US-10**: As a registered user, I want to save frequent passenger profiles to my "Saved Travellers" list and auto-fill them during checkout.
- **US-11**: As a registered user, I want to view a booking summary breakdown (bus info, seat numbers, fare calculation) before final confirmation.
- **US-12**: As a registered user, I want to complete the booking and instantly receive a digital ticket with a unique booking reference (PNR).
- **US-13**: As a registered user, I want to view my booking history ("My Bookings") showing upcoming and past journeys.
- **US-14**: As a registered user, I want to view or update my personal profile and manage my saved travellers.
- **US-15** *(Post-MVP)*: As a registered user, I want to cancel an upcoming booking and free up my allocated seats.
- **US-16** *(Post-MVP)*: As a registered user, I want to download or print my confirmed ticket as a clean PDF or paper format.

### 5.3 Administrator User Stories
- **US-17**: As an administrator, I want to log in using administrative credentials so that I can access the restricted admin portal.
- **US-18**: As an administrator, I want to view a dashboard with quick operational navigation.
- **US-19**: As an administrator, I want to add a new bus route with details (bus number, name, type, origin, destination, timings, fare, total seats, amenities).
- **US-20**: As an administrator, I want to edit existing bus schedules and fare details.
- **US-21**: As an administrator, I want to deactivate or delete a bus from active schedules.
- **US-22**: As an administrator, I want to view all passenger bookings placed across the platform with filtering by journey date.
- **US-23** *(Post-MVP)*: As an administrator, I want to see analytical metrics such as total revenue, total bookings count, and active bus counts.

---

## 6. Functional Requirements & MoSCoW Prioritization

Every requirement is uniquely identified (`FR-xx`) and prioritized according to the MoSCoW framework:
- **Must Have (M)**: Critical MVP core requirements. Must be completed in Weeks 1–3.
- **Should Have (S)**: High-value features scheduled for Phase 3/4.
- **Could Have (C)**: Desirable post-MVP enhancements if time permits.
- **Won't Have (W)**: Explicitly deferred beyond current 4-week scope.

### 6.1 Authentication & Authorization Module

| ID | Functional Requirement | Priority | Target Release |
| :--- | :--- | :--- | :--- |
| **FR-01** | User registration with name, unique email, password (min 6 characters), and 10-digit phone number. Passwords must be hashed using `bcryptjs` with cost factor 10. | Must Have | MVP |
| **FR-02** | User login verifying email and password, issuing a signed JSON Web Token (JWT) with 24-hour expiration containing `userId` and `role`. | Must Have | MVP |
| **FR-03** | Role-Based Access Control (RBAC) middleware verifying JWT signatures and enforcing route permissions (`user` vs `admin`). | Must Have | MVP |
| **FR-04** | Client-side auth persistence via `localStorage` and React Context (`AuthContext`) with automatic state hydration and logout handling. | Must Have | MVP |
| **FR-05** | Form validation on all auth endpoints rejecting malformed inputs with descriptive errors using `express-validator`. | Must Have | MVP |

### 6.2 Bus Search & Schedule Module

| ID | Functional Requirement | Priority | Target Release |
| :--- | :--- | :--- | :--- |
| **FR-06** | Search bus endpoint filtering by case-insensitive origin, destination, and active operational status (`isActive: true`). | Must Have | MVP |
| **FR-07** | Search results presentation displaying bus name, registration number, bus type, departure time, arrival time, journey duration, and fare per seat. | Must Have | MVP |
| **FR-08** | Bus details retrieval endpoint providing complete bus metadata and amenities list. | Must Have | MVP |
| **FR-09** | Filtering and sorting search results by bus type (AC/Non-AC, Seater/Sleeper), price, and departure time. | Could Have | Post-MVP |

### 6.3 Interactive Seat Selection & Availability Module

| ID | Functional Requirement | Priority | Target Release |
| :--- | :--- | :--- | :--- |
| **FR-10** | Seat availability endpoint returning occupied seat numbers for a specific bus ID on a selected journey date. | Must Have | MVP |
| **FR-11** | Interactive graphical seat map rendering 36–40 seats with visual state distinctions: Available (White/Border), Selected (Green), Booked (Gray/Disabled). | Must Have | MVP |
| **FR-12** | Client-side seat selection limits restricting a single booking transaction to between 1 and 6 seats. | Must Have | MVP |
| **FR-13** | Dynamic live calculation of total fare as seats are selected or deselected (`fare * selectedSeats.length`). | Must Have | MVP |

### 6.4 Passenger Details & Saved Travellers Module

| ID | Functional Requirement | Priority | Target Release |
| :--- | :--- | :--- | :--- |
| **FR-14** | Passenger information form capturing full name, age (1–120), and gender (`male`, `female`, `other`) for each selected seat number. | Must Have | MVP |
| **FR-15** | Saved Travellers CRUD allowing registered users to save, list, and delete frequent passenger records. | Must Have | MVP |
| **FR-16** | One-click auto-population allowing users to select a saved traveller to fill a designated seat's passenger fields. | Should Have | MVP |

### 6.5 Booking Confirmation & Concurrency Module

| ID | Functional Requirement | Priority | Target Release |
| :--- | :--- | :--- | :--- |
| **FR-17** | Booking creation endpoint validating seat availability and persisting booking with unique PNR reference (`BK-XXXXXXXX`). | Must Have | MVP |
| **FR-18** | **Database-Level Duplicate Seat Prevention**: Enforce a compound unique index on `{ busId: 1, journeyDate: 1, "passengers.seatNumber": 1 }` filtered by `{ bookingStatus: "confirmed" }`. | Must Have | MVP |
| **FR-19** | Atomic race condition error handling: Catch MongoDB error code `11000` and return HTTP `409 Conflict` with a user-friendly message prompt to re-select seats. | Must Have | MVP |
| **FR-20** | Booking summary checkout review screen presenting route details, passenger manifest, seat numbers, and total cost breakdown before submission. | Must Have | MVP |
| **FR-21** | Digital Ticket confirmation screen displaying complete journey details, passenger names, seat numbers, fare, and booking timestamp. | Must Have | MVP |
| **FR-22** | Personal Booking History ("My Bookings") listing all historical and upcoming user bookings sorted newest first. | Must Have | MVP |
| **FR-23** | Self-service booking cancellation releasing allocated seats back into available inventory. | Could Have | Post-MVP |
| **FR-24** | Mock payment gateway simulation with test card input and confirmation latency. | Could Have | Post-MVP |
| **FR-25** | Printable / PDF downloadable ticket view formatted for standard paper output. | Could Have | Post-MVP |

### 6.6 Administration Module

| ID | Functional Requirement | Priority | Target Release |
| :--- | :--- | :--- | :--- |
| **FR-26** | Admin authentication protection restricting administrative routes to users with `role: 'admin'`. | Must Have | MVP |
| **FR-27** | Bus creation endpoint allowing administrators to register new buses with complete metadata. | Must Have | MVP |
| **FR-28** | Bus modification endpoint allowing administrators to update routes, departure/arrival times, fare, and operational status. | Must Have | MVP |
| **FR-29** | Bus deletion endpoint allowing administrators to deactivate or remove buses. | Must Have | MVP |
| **FR-30** | Master booking audit view allowing administrators to browse all passenger bookings with pagination and date filtering. | Must Have | MVP |
| **FR-31** | Administrative statistics dashboard displaying total revenue, passenger count, active bus count, and occupancy rates. | Could Have | Post-MVP |

---

## 7. Non-Functional Requirements (NFRs)

### 7.1 Performance Requirements
- **Page Load Time**: Initial frontend load under 2.5 seconds on a standard 3G/4G broadband connection.
- **API Response Latency**: Public search and seat availability endpoints must respond within 200ms under standard local/cloud testing conditions.
- **Database Query Efficiency**: All operational queries must leverage indexes (compound search index on `origin` + `destination` + `isActive`, unique index on `email`, and concurrency index on seat allocations). Zero collection scans (`COLLSCAN`) allowed on hot endpoints.

### 7.2 Security Requirements
- **Password Protection**: Passwords must never be logged or stored in plaintext. Passwords must be hashed using `bcryptjs` with salt rounds = 10.
- **Token Security**: JWT tokens signed using a strong secret key (`JWT_SECRET`) with 24-hour expiration.
- **Injection Defense**: Protection against NoSQL injection via Mongoose typecasting and sanitized request parameters; express-validator input sanitization.
- **Cross-Origin Resource Sharing (CORS)**: Configured explicitly to allow requests only from authorized frontend origins (`CLIENT_URL`).
- **Environment Isolation**: Zero hardcoded secrets. All sensitive credentials (`MONGO_URI`, `JWT_SECRET`, `PORT`) managed through `.env` files and omitted from version control.

### 7.3 Usability & Responsiveness
- **Responsive Layout**: Designed using Bootstrap 5 fluid grid system (`container-fluid`, `row`, `col-*`) functioning smoothly across Mobile (<576px), Tablet (576px–991px), and Desktop (≥992px).
- **Touch Targets**: Interactive seat buttons on mobile devices must have a minimum touch target size of 40px × 40px with clear spacing.
- **Consistent States**: Every asynchronous screen must provide explicit Loading (Spinner), Empty (No Results card), Error (Alert banner), and Success states.

### 7.4 Accessibility (a11y)
- Standard compliance targeting WCAG 2.1 Level AA.
- Form controls must have associated `<label>` tags and distinct focus outlines.
- Seat map elements must feature informative `aria-label` attributes (e.g., `aria-label="Seat A1, ₹750, Available"`).
- Color contrast ratio of at least 4.5:1 for body text against backgrounds.

---

## 8. MVP vs. Post-MVP Scope Matrix

| Functional Area | In MVP Scope (Weeks 1–4) | Post-MVP Scope (Future Iteration) |
| :--- | :--- | :--- |
| **Auth & Profile** | Registration, Login, JWT auth, View Profile | Password reset via email, OAuth (Google Login) |
| **Traveller Management** | Add traveller, List travellers, Delete traveller, Autofill | Edit saved traveller, Frequent flyer badges |
| **Search & Discovery** | Origin, Destination, Journey Date matching | Multi-city filters, Price slider, Bus operator filter, Sort by duration/price |
| **Seat Booking** | 36-seat layout, Multi-seat select (1–6), Concurrency prevention via unique index, Instant ticket | Live seat holding with 5-minute countdown timer (WebSockets) |
| **Payments** | Immediate booking confirmation (mock standard flow) | Dedicated mock payment gateway modal / card verification |
| **Ticket & History** | Digital on-screen ticket, PNR lookup, My Bookings history | PDF ticket download, Email/SMS ticket dispatch, Self-service cancellation |
| **Administration** | Add bus, Edit bus, Delete bus, View all passenger bookings | Revenue analytics charts, Occupancy reports, Driver assignment |
| **Performance** | MongoDB compound indexing, client-side route caching | Redis caching layer (`ioredis`) for high-traffic search routes |

---

## 9. Assumptions, Risks & Mitigations

| # | Assumption / Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **1** | **Risk**: Two users attempt to book the exact same seat simultaneously. | High | **Mitigation**: Enforce a compound unique index in MongoDB on `{ busId: 1, journeyDate: 1, "passengers.seatNumber": 1 }`. Intercept `E11000` errors and return HTTP `409 Conflict`. |
| **2** | **Risk**: Free cloud instances (Render) spin down during inactivity, causing high latency on initial API calls. | Medium | **Mitigation**: Add a lightweight `/api/health` endpoint and configure client-side loading spinners with informative text ("Connecting to service..."). |
| **3** | **Risk**: Frontend and backend integration delays due to disparate API expectations among 8 team members. | High | **Mitigation**: Strictly freeze API contracts in `API_DOCUMENTATION.md` and use shared Postman collections from Day 1 of development. |
| **4** | **Assumption**: Users book travel for current or future dates; bookings for past dates are invalid. | Medium | **Mitigation**: Enforce date validation in both HTML5 date pickers (`min={today}`) and backend express-validator rules. |
| **5** | **Risk**: Inconsistent Git merge conflicts across 8 active contributors. | Medium | **Mitigation**: Strict Git branching model (`feature/*`), code reviews, and mandatory branch protection on `main`. |

---

## 10. Success Metrics

1. **Booking Completion Rate**: ≥ 90% of logged-in users who initiate seat selection complete booking within 3 minutes without validation crashes.
2. **Double Booking Error Rate**: **0.00%** occurrence of duplicate seat tickets issued for the same bus and date in production tests.
3. **API Performance**: 95th percentile API response time < 300ms for search and booking endpoints.
4. **Team Delivery**: 100% of the 8 team members successfully contribute, understand, and demonstrate their assigned modules during faculty evaluation.

---

## 11. Acceptance Criteria for MVP Features

### AC-01: Bus Search
- Given an origin city, destination city, and future date, when the user clicks "Search Buses", then all active buses matching origin and destination are returned.
- If no buses operate on the route, an informative empty state card is displayed prompting the user to select another route.

### AC-02: Seat Map Rendering
- When a user views the seat selection page for a bus on date `D`, all seats currently booked under confirmed tickets for that date must be visually marked as "Booked" and disabled from clicking.
- Seats not booked must be clickable, toggling to "Selected" state and updating the total fare.
- Users cannot select more than 6 seats in a single booking.

### AC-03: Concurrency Protection
- When two clients submit concurrent booking requests for seat `S` on bus `B` on date `D`:
  - Exactly one request must succeed with HTTP `201 Created` and receive a confirmed ticket.
  - The second request must be rejected with HTTP `409 Conflict` and receive an error message: `"One or more selected seats have already been booked"`.

### AC-04: Admin Bus Management
- Administrators can successfully create a new bus route. Newly created buses must immediately appear in guest search results.
- Administrators can deactivate a bus, immediately preventing it from appearing in public search results.

---

## 12. Phase-Wise Milestone Table

| Phase | Milestone | Deliverables | Target Timeline |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Foundation & Project Setup | Git repository setup, folder structure, MongoDB Atlas connection, `.env` configurations, database models, seed scripts, shared contracts. | **Week 1** |
| **Phase 2** | Auth, Home & Search | User registration & login APIs, JWT middleware, Home page hero & search bar, Bus search results, Profile & Saved Travellers API. | **Week 2** |
| **Phase 3** | Seat Selection, Booking & Admin | Interactive seat map UI, Booking API with concurrency prevention, My Bookings history, Admin bus CRUD, Admin bookings view. | **Week 3** |
| **Phase 4** | Integration, Testing & Deployment | Postman end-to-end API testing, responsive UI bug bash, Vercel frontend deployment, Render backend deployment, final presentation prep. | **Week 4** |
