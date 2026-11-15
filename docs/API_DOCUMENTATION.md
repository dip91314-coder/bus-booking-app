# API Documentation

## Bus Booking App — Online Bus Ticket Booking System

| Document Version | Base URL (Local) | Base URL (Production) | Auth Header Format |
| :--- | :--- | :--- | :--- |
| 1.0.0 | `http://localhost:5000/api` | `https://bus-booking-app-api.onrender.com/api` | `Authorization: Bearer <jwt_token>` |

---

## 1. Endpoints Summary Table

| Module | Method | Path | Access Level | Description | Traceable FR | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Public | Register new customer account | FR-01, FR-05 | Active |
| **Auth** | `POST` | `/auth/login` | Public | Authenticate user & return JWT | FR-02, FR-05 | Active |
| **Auth** | `GET` | `/auth/me` | Authenticated | Get current authenticated user profile | FR-03, FR-04 | Active |
| **Trips** | `GET` | `/trips` | Public | Search scheduled trips by From, To, and Date | SRS §6.1, §6.2 | Active (Canonical) |
| **Trips** | `GET` | `/trips/:id` | Public | Get trip journey details and pricing | SRS §6.3 | Active |
| **Trips** | `GET` | `/trips/:tripId/seats` | Public | Get physical seating layout with real-time lock/booked status | SRS §6.4, §7.1 | Active (Canonical) |
| **Trips** | `POST` | `/trips/:tripId/locks` | Authenticated | Temporarily lock selected seats (8 mins) with 409 conflict handling | SRS §7.5, §7.6 | Active (Canonical) |
| **Trips** | `POST` | `/trips/:tripId/locks/release` | Authenticated | Release user's active seat locks | SRS §7.5 | Active |
| **Bookings** | `POST` | `/bookings` | Authenticated | Create pending booking tied to active locks; recomputes server price | SRS §6.6, §7.5 | Active (Trip-Centric) |
| **Bookings** | `GET` | `/bookings/my-bookings` | Authenticated | Get customer booking history | SRS §6.10 | Active |
| **Bookings** | `GET` | `/bookings/:reference` | Authenticated | Get booking details by PNR or ID | SRS §6.7 | Active |
| **Bookings** | `POST` | `/bookings/:id/cancel` | Authenticated | Cancel a booking and release seats | SRS §7.5 | Active |
| **Payments** | `POST` | `/payments/initiate` | Authenticated | Create gateway payment order for pending booking | SRS §6.6 | Active |
| **Payments** | `POST` | `/payments/verify` | Authenticated | Verify signature and confirm reservation idempotently | SRS §6.6, §7.5 | Active |
| **Payments** | `POST` | `/payments/webhook` | Public (Signed)| Gateway webhook listener with HMAC SHA256 timing-safe verification | SRS §6.6, §12 | Active |
| **Tickets** | `GET` | `/tickets/:id` | Authenticated | View confirmed digital ticket | SRS §6.7 | Active |
| **Tickets** | `GET` | `/tickets/pnr/:pnr` | Authenticated | View confirmed digital ticket by PNR | SRS §6.7 | Active |
| **Tickets** | `GET` | `/tickets/:id/pdf` | Authenticated | Download official server-generated PDF ticket | SRS §6.7, §11 | Active |
| **Tickets** | `GET` | `/tickets/pnr/:pnr/pdf` | Authenticated | Download official PDF ticket by PNR | SRS §6.7, §11 | Active |
| **Packages** | `GET` | `/packages` | Public | Browse tour packages and weekend circuits (cached) | SRS §6.1, §4.2 | Active |
| **Packages** | `GET` | `/packages/:slug` | Public | Get circuit details with itinerary and pricing | SRS §6.1, §4.2 | Active |
| **Destinations** | `GET` | `/destinations` | Public | List curated Indian destinations (cached) | SRS §6.1 | Active |
| **Destinations** | `GET` | `/destinations/:id` | Public | Get destination details, highlights and pickups | SRS §6.1 | Active |
| **Offers** | `GET` | `/offers` | Public | List active coupons and festive promo offers (cached) | SRS §6.6 | Active |
| **Offers** | `POST` | `/offers/validate` | Public | Validate promo code and compute discount on server | SRS §6.6 | Active |
| **Health** | `GET` | `/health` | Public | Service health probe (MongoDB + Redis status) | Dev/Ops | Active |
| **Settings** | `GET` | `/settings` | Public | Fetch public platform brand settings | SRS §5.10 | Active |
| **Notifications**| `GET` | `/notifications` | Authenticated | Get customer trip delay/cancellation notifications | SRS §6.10 | Active |
| **Notifications**| `PATCH` | `/notifications/:id/read` | Authenticated | Mark trip notification as read | SRS §6.10 | Active |
| **Travellers** | `GET` | `/users/saved-passengers` | Authenticated | Get user's saved passenger roster | FR-04 | Active |
| **Travellers** | `POST` | `/users/saved-passengers` | Authenticated | Save new frequent passenger profile | FR-04 | Active |
| **Travellers** | `DELETE`| `/users/saved-passengers/:id` | Authenticated | Delete saved passenger profile | FR-04 | Active |
| **Journal** | `GET` | `/journal` | Authenticated | Get customer's travel memory journal entries | SRS §6.10 | Active |
| **Journal** | `POST` | `/journal` | Authenticated | Create a new travel journal entry | SRS §6.10 | Active |
| **Journal** | `DELETE`| `/journal/:id` | Authenticated | Delete a travel journal entry | SRS §6.10 | Active |
| **Buses** | `GET` | `/buses/search` | Public | Legacy search buses | FR-06 | *Deprecated* (Use `/trips`) |
| **Buses** | `GET` | `/buses/:id/seats` | Public | Legacy computed seat layout | FR-10 | *Deprecated* (Use `/trips/:tripId/seats`) |
| **Seats** | `POST` | `/seats/hold` | Authenticated | Legacy seat hold | FR-10 | *Deprecated* (Use `/trips/:tripId/locks`) |
| **Admin** | `GET` | `/admin/dashboard` | Admin Only | Dashboard KPI metrics & recent activity | SRS §5.1 | Active |
| **Admin** | `GET` | `/admin/trips` | Admin Only | List scheduled trips with filters | SRS §5.4 | Active |
| **Admin** | `POST` | `/admin/trips` | Admin Only | Schedule a new trip | SRS §5.4 | Active |
| **Admin** | `PUT` | `/admin/trips/:id` | Admin Only | Update trip schedule or status (notifies booked users on delay/cancellation) | SRS §5.4 | Active |
| **Admin** | `DELETE`| `/admin/trips/:id` | Admin Only | Delete scheduled trip | SRS §5.4 | Active |
| **Admin** | `POST` | `/admin/trips/recurrence` | Admin Only | Bulk generate recurring trip schedules across date range | SRS §5.4 | Active |
| **Admin** | `GET` | `/admin/pricing` | Admin Only | List multi-tier pricing policies with multipliers | SRS §5.6 | Active |
| **Admin** | `POST` | `/admin/pricing` | Admin Only | Create dynamic pricing policy rule | SRS §5.6 | Active |
| **Admin** | `PUT` | `/admin/pricing/:id` | Admin Only | Update pricing policy rule | SRS §5.6 | Active |
| **Admin** | `DELETE`| `/admin/pricing/:id` | Admin Only | Delete pricing policy rule | SRS §5.6 | Active |
| **Admin** | `POST` | `/admin/pricing/preview` | Admin Only | Live dynamic price simulator with multipliers and tax | SRS §5.6 | Active |
| **Admin** | `PUT` | `/admin/buses/:id/layout` | Admin Only | Visual seat layout designer (blocked if future confirmed bookings exist) | SRS §5.5 | Active |
| **Admin** | `GET` | `/admin/buses` | Admin Only | Fleet management with real-time seating and assignments | SRS §5.2 | Active |
| **Admin** | `POST` | `/admin/buses` | Admin Only | Register new bus in fleet | SRS §5.2 | Active |
| **Admin** | `PUT` | `/admin/buses/:id` | Admin Only | Update bus specifications and amenities | SRS §5.2 | Active |
| **Admin** | `DELETE`| `/admin/buses/:id` | Admin Only | Delete bus (blocked if future confirmed bookings exist) | SRS §5.2 | Active |
| **Admin** | `GET` | `/admin/routes` | Admin Only | Route management with stops and boarding points | SRS §5.3 | Active |
| **Admin** | `POST` | `/admin/routes` | Admin Only | Create new bus transit route | SRS §5.3 | Active |
| **Admin** | `PUT` | `/admin/routes/:id` | Admin Only | Update transit route and stops | SRS §5.3 | Active |
| **Admin** | `DELETE`| `/admin/routes/:id` | Admin Only | Delete transit route | SRS §5.3 | Active |
| **Admin** | `GET` | `/admin/bookings` | Admin Only | Booking records and search | SRS §5.7 | Active |
| **Admin** | `POST` | `/admin/bookings/:id/cancel` | Admin Only | Cancel customer booking and trigger refund | SRS §5.7 | Active |
| **Admin** | `POST` | `/admin/bookings/:id/change-seat` | Admin Only | Reassign seat on booking with conflict validation | SRS §5.7 | Active |
| **Admin** | `GET` | `/admin/payments` | Admin Only | Payment monitoring & transaction status | SRS §5.8 | Active |
| **Admin** | `POST` | `/admin/payments/:id/refund` | Admin Only | Execute manual payment refund | SRS §5.8 | Active |
| **Admin** | `GET` | `/admin/passengers`| Admin Only | Customer management & wallet overview | SRS §5.9 | Active |
| **Admin** | `PUT` | `/admin/passengers/:id`| Admin Only | Update customer contact information | SRS §5.9 | Active |
| **Admin** | `PATCH` | `/admin/passengers/:id/status`| Admin Only | Suspend or activate customer account | SRS §5.9 | Active |
| **Admin** | `PATCH` | `/admin/passengers/:id/wallet`| Admin Only | Credit or debit customer wallet with audit log | SRS §5.9 | Active |
| **Admin** | `GET` | `/admin/packages/all`| Admin Only | List all tour packages including inactive ones | SRS §5.10 | Active |
| **Admin** | `POST` | `/admin/packages` | Admin Only | Create new tour package / weekend circuit | SRS §5.10 | Active |
| **Admin** | `PUT` | `/admin/packages/:id` | Admin Only | Update tour package or itinerary | SRS §5.10 | Active |
| **Admin** | `DELETE`| `/admin/packages/:id` | Admin Only | Delete tour package / circuit | SRS §5.10 | Active |
| **Admin** | `POST` | `/destinations` | Admin Only | Add new curated destination | SRS §5.10 | Active |
| **Admin** | `PUT` | `/destinations/:id` | Admin Only | Update curated destination details | SRS §5.10 | Active |
| **Admin** | `DELETE`| `/destinations/:id` | Admin Only | Delete curated destination | SRS §5.10 | Active |
| **Admin** | `GET` | `/admin/audit-logs` | Admin Only | System audit trails (who changed what with before/after diff) | SRS §5.10 | Active |
| **Admin** | `POST` | `/admin/upload` | Admin Only | Multipart file upload (images up to 5MB) | SRS §5.10 | Active |
| **Admin** | `GET` | `/admin/reports` | Admin Only | Comprehensive analytical reports | SRS §5.10 | Active |

---

## 1.1 Admin Management API

All routes below require an authenticated administrator and use the standard `{ success, data }` response envelope. IDs in these routes are MongoDB resource IDs; booking cancellation also accepts a booking reference.

| Resource | Path | Supported operations |
| :--- | :--- | :--- |
| Dashboard | `/admin/dashboard`, `/admin/reports` | `GET` metrics and analytics; reports accept `?timeframe=7D`, `30D`, `90D`, or `YTD` |
| Buses | `/admin/buses` | `GET`, `POST`; `PUT` and `DELETE /:id`; `PUT /:id/layout` (Seat layout editor with future booking lock) |
| Trips & Recurrence | `/admin/trips`, `/admin/trips/recurrence` | `GET`, `POST`, `PUT`, `DELETE /:id`; `POST /recurrence` (automated batch generator) |
| Pricing & Simulator | `/admin/pricing`, `/admin/pricing/preview` | `GET`, `POST`, `PUT`, `DELETE /:id`; `POST /preview` (multi-tier dynamic simulator) |
| Tour Packages | `/packages/admin/all`, `/packages/admin` | `GET` all; `POST` create; `PUT` and `DELETE /packages/admin/:id` |
| Destinations | `/destinations` | `GET`, `POST`; `PUT` and `DELETE /:id` |
| Routes | `/admin/routes` | `GET`, `POST`; `PUT` and `DELETE /:id` |
| Schedules | `/admin/schedules` | `GET`, `POST`; `PUT` and `DELETE /:id` |
| Bookings & Reassignment | `/admin/bookings` | `GET`; `POST /:id/cancel`; `POST /:id/change-seat` (operational seat reassignment) |
| Passengers & Wallets | `/admin/passengers` | `GET`; `PUT /:id`; `PATCH /:id/status`; `PATCH /:id/wallet` (credit/debit with audit trail) |
| Drivers | `/admin/drivers` | `GET`, `POST`; `PUT` and `DELETE /:id` |
| Staff | `/admin/staff` | `GET`, `POST`; `PUT` and `DELETE /:id` |
| Payments | `/admin/payments` | `GET`; `POST /:id/refund` |
| Offers | `/admin/offers` | `GET`, `POST`; `PUT` and `DELETE /:id` |
| Reviews | `/admin/reviews` | `GET`; `PATCH /:id/status`; `DELETE /:id` |
| Notifications | `/admin/notifications` | `GET`, `POST`; `PATCH /:id/read`, `PATCH /read-all`, `DELETE /:id` |
| Settings | `/admin/settings` | `GET`, `PUT`; `POST /change-password` |
| File Uploads | `/admin/upload` | `POST` multipart/form-data for image assets (JPEG/PNG/WebP <= 5MB) |
| Audit Logs | `/admin/audit-logs` | `GET` chronological system audit log entries with filter by action & entity |

Admin bus, route, schedule, and booking responses include the field names used by the admin frontend (for example `capacity`, `source`, `distance`, `pnr`, and title-cased status values), while persistence continues to use the existing core domain models.

---

## 2. Standard Protocol & Response Envelopes

### 2.1 Standard Success Envelope
All successful requests return HTTP `200` (or `201` for creation) with this structure:
```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

### 2.2 Standard Error Envelope
All error responses return HTTP status codes `400`, `401`, `403`, `404`, `409`, or `500` with this structure:
```json
{
  "success": false,
  "message": "Human-readable summary of the error",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific validation failure explanation"
    }
  ]
}
```

### 2.3 Status Code Conventions
- `200 OK`: Request succeeded.
- `201 Created`: New resource successfully created.
- `400 Bad Request`: Validation failure or missing required fields.
- `401 Unauthorized`: Token missing, invalid, or expired.
- `403 Forbidden`: Authenticated user does not possess required role (`admin`).
- `404 Not Found`: Target resource does not exist.
- `409 Conflict`: Conflict state (e.g. duplicate email, or seat race condition collision).
- `500 Internal Server Error`: Unhandled server exception.

---

## 3. Authentication Module

### 3.1 Register User
- **Method**: `POST`
- **Path**: `/auth/register`
- **Access Level**: Public
- **Description**: Registers a new customer or administrator account.

#### Request Body
```json
{
  "name": "Arjun Sharma",
  "email": "arjun.sharma@example.com",
  "password": "Password@123",
  "phone": "9876543210",
  "role": "user"
}
```

#### Validation Rules
- `name`: Required, trimmed, 2–50 characters.
- `email`: Required, valid email format, normalized to lowercase.
- `password`: Required, minimum 6 characters.
- `phone`: Required, exactly 10 digits (`^[0-9]{10}$`).
- `role`: Optional, only `'user'` is accepted. Administrator accounts must be provisioned by an administrator.

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Registration successful. You may now log in.",
  "data": {
    "user": {
      "id": "654a1b2c3d4e5f6789a00001",
      "name": "Arjun Sharma",
      "email": "arjun.sharma@example.com",
      "phone": "9876543210",
      "role": "user"
    }
  }
}
```

#### Error Responses
- **`400 Bad Request`**: Validation error (e.g. invalid phone number).
- **`409 Conflict`**: Email already registered.
  ```json
  {
    "success": false,
    "message": "A user with this email address is already registered",
    "errors": [{ "field": "email", "message": "Email already in use" }]
  }
  ```

---

### 3.2 Login User
- **Method**: `POST`
- **Path**: `/auth/login`
- **Access Level**: Public
- **Description**: Verifies credentials and issues a signed JWT token valid for 24 hours.

#### Request Body
```json
{
  "email": "arjun.sharma@example.com",
  "password": "Password@123"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "654a1b2c3d4e5f6789a00001",
      "name": "Arjun Sharma",
      "email": "arjun.sharma@example.com",
      "phone": "9876543210",
      "role": "user"
    }
  }
}
```

#### Error Responses
- **`401 Unauthorized`**: Invalid email or password.
  ```json
  {
    "success": false,
    "message": "Invalid email or password",
    "errors": []
  }
  ```

---

### 3.3 Get Current User Profile
- **Method**: `GET`
- **Path**: `/auth/me`
- **Access Level**: Authenticated (`user` or `admin`)
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Current user retrieved successfully",
  "data": {
    "id": "654a1b2c3d4e5f6789a00001",
    "name": "Arjun Sharma",
    "email": "arjun.sharma@example.com",
    "phone": "9876543210",
    "role": "user"
  }
}
```

---

## 4. Saved Travellers Module

### 4.1 Get Saved Travellers
- **Method**: `GET`
- **Path**: `/travellers`
- **Access Level**: Authenticated (`user`)
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Saved travellers retrieved",
  "data": [
    {
      "_id": "654a1b2c3d4e5f6789a00055",
      "userId": "654a1b2c3d4e5f6789a00001",
      "name": "Priya Sharma",
      "age": 28,
      "gender": "female",
      "createdAt": "2026-11-02T14:20:00.000Z"
    }
  ]
}
```

---

### 4.2 Create Saved Traveller
- **Method**: `POST`
- **Path**: `/travellers`
- **Access Level**: Authenticated (`user`)
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Request Body
```json
{
  "name": "Rohan Sen",
  "age": 24,
  "gender": "male"
}
```

#### Validation Rules
- `name`: Required, 2–50 characters.
- `age`: Required, integer between 1 and 120.
- `gender`: Required, enum `['male', 'female', 'other']`.

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Traveller saved successfully",
  "data": {
    "_id": "654a1b2c3d4e5f6789a00088",
    "userId": "654a1b2c3d4e5f6789a00001",
    "name": "Rohan Sen",
    "age": 24,
    "gender": "male",
    "createdAt": "2026-11-10T14:00:00.000Z"
  }
}
```

---

### 4.3 Delete Saved Traveller
- **Method**: `DELETE`
- **Path**: `/travellers/:id`
- **Access Level**: Authenticated (`user`)
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Saved traveller deleted successfully",
  "data": null
}
```

---

## 5. Buses Module

### 5.1 Search Buses
- **Method**: `GET`
- **Path**: `/buses/search`
- **Access Level**: Public
- **Query Parameters**:
  - `origin` *(string, required)*: Origin city name (e.g. `kolkata`).
  - `destination` *(string, required)*: Destination city name (e.g. `siliguri`).
  - `date` *(string, required)*: Journey date in format `YYYY-MM-DD`.

#### Example Request
`GET /api/buses/search?origin=kolkata&destination=siliguri&date=2026-11-20`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Buses found",
  "data": [
    {
      "_id": "654a1b2c3d4e5f6789a00100",
      "busNumber": "WB-04-E-5678",
      "busName": "YatraBus AC Sleeper",
      "busType": "AC Sleeper",
      "origin": "kolkata",
      "destination": "siliguri",
      "departureTime": "20:00",
      "arrivalTime": "06:00",
      "journeyDuration": "10h 00m",
      "fare": 950,
      "totalSeats": 36,
      "amenities": ["WiFi", "Water Bottle", "Charging Point", "Blanket"],
      "isActive": true
    }
  ]
}
```

---

### 5.2 Get Single Bus Details
- **Method**: `GET`
- **Path**: `/buses/:id`
- **Access Level**: Public

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Bus details retrieved",
  "data": {
    "_id": "654a1b2c3d4e5f6789a00100",
    "busNumber": "WB-04-E-5678",
    "busName": "YatraBus AC Sleeper",
    "busType": "AC Sleeper",
    "origin": "kolkata",
    "destination": "siliguri",
    "departureTime": "20:00",
    "arrivalTime": "06:00",
    "journeyDuration": "10h 00m",
    "fare": 950,
    "totalSeats": 36,
    "amenities": ["WiFi", "Water Bottle", "Charging Point", "Blanket"]
  }
}
```

---

### 5.3 Get Booked Seats for Bus on Date
- **Method**: `GET`
- **Path**: `/buses/:id/seats`
- **Access Level**: Public
- **Query Parameters**:
  - `date` *(string, required)*: Journey date `YYYY-MM-DD`.

#### Example Request
`GET /api/buses/654a1b2c3d4e5f6789a00100/seats?date=2026-11-20`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Seat layout occupancy fetched",
  "data": {
    "busId": "654a1b2c3d4e5f6789a00100",
    "journeyDate": "2026-11-20",
    "totalSeats": 36,
    "bookedSeats": ["A1", "A2", "B4"]
  }
}
```

---

## 6. Bookings Module

### 6.1 Create Booking (Atomic & Concurrency Enforced)
- **Method**: `POST`
- **Path**: `/bookings`
- **Access Level**: Authenticated (`user`)
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Request Body
```json
{
  "busId": "654a1b2c3d4e5f6789a00100",
  "journeyDate": "2026-11-20",
  "passengers": [
    {
      "seatNumber": "A3",
      "name": "Arjun Sharma",
      "age": 30,
      "gender": "male"
    },
    {
      "seatNumber": "A4",
      "name": "Priya Sharma",
      "age": 28,
      "gender": "female"
    }
  ]
}
```

#### Validation Rules
- `busId`: Required, valid MongoDB ObjectId.
- `journeyDate`: Required, valid date format `YYYY-MM-DD` (must not be in the past).
- `passengers`: Array of 1 to 6 objects. Each item must have:
  - `seatNumber`: Required string (e.g. `"A3"`).
  - `name`: Required string, 2–50 characters.
  - `age`: Required integer between 1 and 120.
  - `gender`: Required, enum `['male', 'female', 'other']`.

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "_id": "654a1b2c3d4e5f6789a00500",
    "bookingReference": "BK-98F42A7C",
    "userId": "654a1b2c3d4e5f6789a00001",
    "busId": "654a1b2c3d4e5f6789a00100",
    "journeyDate": "2026-11-20T00:00:00.000Z",
    "passengers": [
      {
        "seatNumber": "A3",
        "name": "Arjun Sharma",
        "age": 30,
        "gender": "male"
      },
      {
        "seatNumber": "A4",
        "name": "Priya Sharma",
        "age": 28,
        "gender": "female"
      }
    ],
    "totalFare": 1900,
    "bookingStatus": "confirmed",
    "paymentStatus": "paid",
    "createdAt": "2026-11-10T12:30:45.000Z"
  }
}
```

#### Error Responses
- **`400 Bad Request`**: Validation failed (e.g., more than 6 passengers or duplicate seats inside same request).
- **`409 Conflict` (Seat Concurrency Collision)**: Triggered when MongoDB catches error code `11000` via unique compound index `{ busId, journeyDate, "passengers.seatNumber" }`.
  ```json
  {
    "success": false,
    "message": "One or more selected seats (A3) have already been booked by another passenger. Please select other seats.",
    "errors": [
      {
        "field": "seats",
        "message": "Seat collision detected"
      }
    ]
  }
  ```

---

### 6.2 Get User Booking History ("My Bookings")
- **Method**: `GET`
- **Path**: `/bookings/my-bookings`
- **Access Level**: Authenticated (`user`)
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Booking history retrieved",
  "data": [
    {
      "_id": "654a1b2c3d4e5f6789a00500",
      "bookingReference": "BK-98F42A7C",
      "journeyDate": "2026-11-20T00:00:00.000Z",
      "totalFare": 1900,
      "bookingStatus": "confirmed",
      "paymentStatus": "paid",
      "passengers": [
        { "seatNumber": "A3", "name": "Arjun Sharma", "age": 30, "gender": "male" },
        { "seatNumber": "A4", "name": "Priya Sharma", "age": 28, "gender": "female" }
      ],
      "busId": {
        "_id": "654a1b2c3d4e5f6789a00100",
        "busNumber": "WB-04-E-5678",
        "busName": "YatraBus AC Sleeper",
        "busType": "AC Sleeper",
        "origin": "kolkata",
        "destination": "siliguri",
        "departureTime": "20:00",
        "arrivalTime": "06:00"
      },
      "createdAt": "2026-11-10T12:30:45.000Z"
    }
  ]
}
```

---

### 6.3 Get Single Booking / Ticket
- **Method**: `GET`
- **Path**: `/bookings/:bookingReference`
- **Access Level**: Authenticated (`user` or `admin`)
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Example Request
`GET /api/bookings/BK-98F42A7C`

#### Success Response (`200 OK`)
Returns detailed booking document populated with bus details and passenger manifest.

---

### 6.4 Cancel Booking *(Post-MVP)*
- **Method**: `PUT`
- **Path**: `/bookings/:bookingReference/cancel`
- **Access Level**: Authenticated (`user`)
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Booking cancelled successfully. Seats have been released.",
  "data": {
    "bookingReference": "BK-98F42A7C",
    "bookingStatus": "cancelled"
  }
}
```

---

## 7. Administration Module

All endpoints in this section require:
1. Valid JWT header: `Authorization: Bearer <jwt_token>`.
2. Role verification: `req.user.role === 'admin'`. Non-admins receive `403 Forbidden`.

### 7.1 Admin: Get All Buses
- **Method**: `GET`
- **Path**: `/admin/buses`
- **Access Level**: Admin Only

#### Success Response (`200 OK`)
Returns array of all buses in database regardless of `isActive` flag.

---

### 7.2 Admin: Create Bus
- **Method**: `POST`
- **Path**: `/admin/buses`
- **Access Level**: Admin Only

#### Request Body
```json
{
  "busNumber": "MH-12-Q-4545",
  "busName": "Shivneri Luxury",
  "busType": "AC Seater",
  "origin": "mumbai",
  "destination": "pune",
  "departureTime": "07:00",
  "arrivalTime": "10:30",
  "journeyDuration": "3h 30m",
  "fare": 550,
  "totalSeats": 40,
  "amenities": ["WiFi", "Water Bottle", "Charging Point"],
  "isActive": true
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Bus added successfully",
  "data": {
    "_id": "654a1b2c3d4e5f6789a00250",
    "busNumber": "MH-12-Q-4545",
    "busName": "Shivneri Luxury",
    "isActive": true
  }
}
```

---

### 7.3 Admin: Update Bus
- **Method**: `PUT`
- **Path**: `/admin/buses/:id`
- **Access Level**: Admin Only

#### Request Body
Accepts any mutable bus fields (`fare`, `departureTime`, `arrivalTime`, `isActive`, etc.).

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Bus updated successfully",
  "data": { ... }
}
```

---

### 7.4 Admin: Update Bus Seat Layout (Safety Guarded)
- **Method**: `PUT`
- **Path**: `/admin/buses/:id/layout`
- **Access Level**: Admin Only
- **Safety Precondition**: Validates that no future confirmed bookings exist for this bus (`Booking.countDocuments({ busId, journeyDate: { $gte: today }, bookingStatus: 'confirmed' }) === 0`).

#### Request Body
```json
{
  "seatLayout": [
    {
      "seatNumber": "L1",
      "deck": "lower",
      "type": "seater",
      "position": "window",
      "category": "normal",
      "isLadies": false,
      "isBlocked": false
    },
    {
      "seatNumber": "U1",
      "deck": "upper",
      "type": "sleeper",
      "position": "window",
      "category": "normal",
      "isLadies": true,
      "isBlocked": false
    }
  ],
  "totalSeats": 36
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Bus seat layout updated successfully",
  "data": {
    "_id": "654a1b2c3d4e5f6789a00250",
    "busNumber": "WB-04-E-5678",
    "totalSeats": 36,
    "seatLayout": [ ... ]
  }
}
```

#### Error Response — Future Confirmed Bookings Guard (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Cannot modify seat layout: Bus has 3 future confirmed booking(s). Layout changes would invalidate passenger seat assignments."
}
```

---

### 7.5 Admin: Delete Bus (Safety Guarded)
- **Method**: `DELETE`
- **Path**: `/admin/buses/:id`
- **Access Level**: Admin Only
- **Safety Precondition**: If active future confirmed bookings exist for any scheduled trip on this vehicle, deletion is strictly aborted.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Bus deleted successfully",
  "data": null
}
```

#### Error Response — Future Confirmed Bookings Guard (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Cannot delete bus: Bus has 5 future confirmed booking(s). Please reassign or cancel trips first."
}
```

---

### 7.6 Admin: Batch Generate Recurring Trips
- **Method**: `POST`
- **Path**: `/admin/trips/recurrence`
- **Access Level**: Admin Only
- **Description**: Generates daily or recurring schedules between `startDate` and `endDate` while preventing duplicate departures for the vehicle on the same date and time.

#### Request Body
```json
{
  "routeId": "654a1b2c3d4e5f6789a00010",
  "busId": "654a1b2c3d4e5f6789a00250",
  "departureTime": "21:30",
  "arrivalTime": "06:30",
  "startDate": "2026-12-01",
  "endDate": "2026-12-15",
  "operatingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "baseFare": 850
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Generated 14 recurring trips successfully (0 conflicts skipped)",
  "data": {
    "createdCount": 14,
    "conflictCount": 0,
    "createdTrips": [
      {
        "_id": "673752e82cf5bb49fa81c001",
        "travelDate": "2026-12-01",
        "departureTime": "21:30",
        "arrivalTime": "06:30",
        "status": "scheduled"
      }
    ]
  }
}
```

---

### 7.7 Admin: Live Dynamic Price Simulator
- **Method**: `POST`
- **Path**: `/admin/pricing/preview`
- **Access Level**: Admin Only
- **Description**: Simulates the multi-tier pricing resolution matrix and returns itemized multiplier calculations and applicable taxes.

#### Request Body
```json
{
  "routeId": "654a1b2c3d4e5f6789a00010",
  "busId": "654a1b2c3d4e5f6789a00250",
  "travelDate": "2026-12-05",
  "departureTime": "20:00",
  "seatNumber": "U1",
  "seatType": "sleeper",
  "isWeekend": true,
  "isFestive": false,
  "isLastMinute": true,
  "isLowerBerth": false,
  "isFrontRow": false
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "basePrice": 800,
    "activeMultipliers": {
      "weekendMultiplier": 1.2,
      "lastMinuteMultiplier": 1.15,
      "sleeperMultiplier": 1.2
    },
    "appliedMultiplierProduct": 1.656,
    "calculatedPrice": 1325,
    "additionalCharges": 20,
    "taxPercent": 5,
    "taxAmount": 67,
    "finalFare": 1412
  }
}
```

---

### 7.8 Admin: Operational Seat Reassignment
- **Method**: `POST`
- **Path**: `/admin/bookings/:id/change-seat`
- **Access Level**: Admin Only
- **Description**: Reassigns a passenger's seat assignment on a confirmed booking to an unoccupied physical seat on the bus layout, atomically releasing the old seat reservation and reserving the new seat.

#### Request Body
```json
{
  "oldSeatNumber": "L2",
  "newSeatNumber": "L4"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Seat successfully reassigned from L2 to L4",
  "data": {
    "bookingId": "673752e82cf5bb49fa810100",
    "pnr": "YTB-202611-9402",
    "oldSeatNumber": "L2",
    "newSeatNumber": "L4",
    "updatedBooking": { ... }
  }
}
```

---

### 7.9 Admin: Passenger Wallet Adjustment
- **Method**: `PATCH`
- **Path**: `/admin/passengers/:id/wallet`
- **Access Level**: Admin Only
- **Description**: Credits or debits a registered passenger's digital wallet balance with automated audit logging.

#### Request Body
```json
{
  "amount": 250,
  "type": "credit",
  "reason": "Goodwill compensation for operational delay"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Successfully credited ₹250 to passenger wallet",
  "data": {
    "userId": "673752e82cf5bb49fa810005",
    "name": "Priya Sen",
    "email": "priya.sen@example.com",
    "previousBalance": 100,
    "newBalance": 350
  }
}
```

---

### 7.10 Admin: System Audit Logs
- **Method**: `GET`
- **Path**: `/admin/audit-logs`
- **Access Level**: Admin Only
- **Query Parameters**:
  - `page` *(number, optional, default: 1)*
  - `limit` *(number, optional, default: 20)*
  - `action` *(string, optional, e.g. `CREATE_BUS`, `UPDATE_TRIP`, `ADJUST_WALLET`)*
  - `entity` *(string, optional, e.g. `Bus`, `Trip`, `User`)*

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "673752e82cf5bb49fa819999",
        "adminId": "673752e82cf5bb49fa810001",
        "adminEmail": "admin@yatrabus.com",
        "action": "ADJUST_WALLET",
        "targetEntity": "User",
        "targetId": "673752e82cf5bb49fa810005",
        "summary": "Adjusted wallet for priya.sen@example.com by +₹250 (credit): Goodwill compensation for operational delay",
        "diff": {
          "previousBalance": 100,
          "newBalance": 350,
          "amount": 250,
          "type": "credit"
        },
        "ipAddress": "127.0.0.1",
        "createdAt": "2026-11-15T07:22:15.000Z"
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "pages": 3
    }
  }
}
```

---

### 7.11 Admin: File Asset Upload
- **Method**: `POST`
- **Path**: `/admin/upload`
- **Access Level**: Admin Only
- **Content-Type**: `multipart/form-data`
- **Payload**: Form field `file` containing image (`image/jpeg`, `image/png`, `image/webp`), max 5MB.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "url": "/uploads/bus-interior-1700039201923.webp",
  "filename": "bus-interior-1700039201923.webp"
}
```

---

### 7.12 Admin: View All Bookings (Audit Log)
- **Method**: `GET`
- **Path**: `/admin/bookings`
- **Access Level**: Admin Only
- **Query Parameters**:
  - `page` *(number, optional, default: 1)*
  - `limit` *(number, optional, default: 10)*
  - `date` *(string, optional, format: YYYY-MM-DD)*

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "All bookings retrieved",
  "data": {
    "bookings": [
      {
        "_id": "654a1b2c3d4e5f6789a00500",
        "bookingReference": "BK-98F42A7C",
        "journeyDate": "2026-11-20T00:00:00.000Z",
        "totalFare": 1900,
        "bookingStatus": "confirmed",
        "userId": {
          "_id": "654a1b2c3d4e5f6789a00001",
          "name": "Arjun Sharma",
          "email": "arjun.sharma@example.com",
          "phone": "9876543210"
        },
        "busId": {
          "busNumber": "WB-04-E-5678",
          "busName": "YatraBus AC Sleeper"
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "pages": 5
    }
  }
}
```

---

## 8. Tour Packages & Weekend Circuits Module

### 8.1 Public: Get Tour Packages
- **Method**: `GET`
- **Path**: `/packages`
- **Access Level**: Public (Redis Cached, 10 min TTL)
- **Query Parameters**:
  - `category` *(string, optional, e.g. `Pilgrim`, `Konkan`, `Leisure`, `Monsoon`, `Heritage`)*
  - `city` *(string, optional, e.g. `Kolkata`, `Mumbai`, `Delhi`)*
  - `featured` *(boolean, optional)*

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "673752e82cf5bb49fa820001",
      "title": "Digha & Mandarmani Coastal Retreat",
      "slug": "digha-mandarmani-coastal-retreat",
      "category": "Leisure",
      "durationDays": 3,
      "durationNights": 2,
      "packageType": "Weekend Beach Circuit",
      "pricePerPerson": 4200,
      "departureCity": "Kolkata",
      "destinationCity": "Digha",
      "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "itinerary": [
        {
          "day": 1,
          "title": "Departure from Kolkata & Beach Arrival",
          "description": "Morning AC Volvo transfer from Esplanade to New Digha. Hotel check-in and sunset stroll.",
          "meals": ["Breakfast", "Dinner"]
        }
      ],
      "inclusions": ["AC Volvo Travel", "Resort Stay", "Breakfast", "Sightseeing Transfers"],
      "exclusions": ["Personal Watersports", "Lunch"],
      "featured": true,
      "isActive": true
    }
  ]
}
```

---

### 8.2 Public: Get Tour Package by Slug
- **Method**: `GET`
- **Path**: `/packages/:slug`
- **Access Level**: Public

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "_id": "673752e82cf5bb49fa820001",
    "title": "Digha & Mandarmani Coastal Retreat",
    "slug": "digha-mandarmani-coastal-retreat",
    "category": "Leisure",
    "durationDays": 3,
    "durationNights": 2,
    "pricePerPerson": 4200,
    "departureCity": "Kolkata",
    "itinerary": [ ... ],
    "inclusions": [ ... ],
    "exclusions": [ ... ]
  }
}
```

---

### 8.3 Admin: Create Tour Package
- **Method**: `POST`
- **Path**: `/packages/admin`
- **Access Level**: Admin Only

#### Request Body
```json
{
  "title": "Jaipur & Ajmer Royal Heritage Express",
  "slug": "jaipur-ajmer-royal-heritage-express",
  "category": "Heritage",
  "durationDays": 2,
  "durationNights": 1,
  "packageType": "Weekend Heritage Circuit",
  "pricePerPerson": 3499,
  "departureCity": "Delhi",
  "destinationCity": "Jaipur",
  "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
  "routeDescription": "Delhi -> Jaipur -> Amer Fort -> Ajmer Sharif -> Delhi",
  "itinerary": [
    { "day": 1, "title": "Delhi to Pink City", "description": "Express transit to Jaipur, Amber Fort & Hawa Mahal tour.", "meals": ["Breakfast"] },
    { "day": 2, "title": "Ajmer Dargah & Return", "description": "Morning excursion to Ajmer and evening return to Delhi.", "meals": ["Breakfast"] }
  ],
  "inclusions": ["AC Bus Transport", "Hotel Stay", "Breakfast"],
  "exclusions": ["Monument Entry", "Lunch"],
  "featured": true,
  "isActive": true
}
```

---

## 9. Curated Destinations Module

### 9.1 Public: Get Destinations
- **Method**: `GET`
- **Path**: `/destinations`
- **Access Level**: Public (Redis Cached, 10 min TTL)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "673752e82cf5bb49fa830001",
      "name": "Digha",
      "state": "West Bengal",
      "tag": "Beach",
      "title": "Bengal's Favorite Seaside Haven",
      "description": "Golden sand beaches, casuarina groves, and fresh seafood markets.",
      "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "startingFare": 450,
      "highlights": ["Sea Beach", "Marine Aquarium", "Amarabati Park"],
      "popularPickups": ["Esplanade", "Howrah", "Kolkata Airport"],
      "isActive": true
    }
  ]
}
```

---

### 9.2 Admin: Create Destination
- **Method**: `POST`
- **Path**: `/destinations`
- **Access Level**: Admin Only

#### Request Body
```json
{
  "name": "Puri",
  "state": "Odisha",
  "tag": "Spiritual",
  "title": "Abode of Lord Jagannath",
  "description": "Sacred coastal city celebrated for its historic temple, chariot festival, and wide golden beaches.",
  "image": "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=1200&q=80",
  "highlights": ["Jagannath Temple", "Golden Beach", "Konark Sun Temple"],
  "popularPickups": ["Kolkata Esplanade", "Bhubaneswar Baramunda"],
  "startingFare": 580,
  "isActive": true
}
```

---

## 10. Offers, Health & Settings Module

### 10.1 Public: Get Active Offers
- **Method**: `GET`
- **Path**: `/offers`
- **Access Level**: Public (Redis Cached, 5 min TTL)
- **Description**: Returns all active coupon codes that have not expired and have remaining usage capacity.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "code": "YATRAFIRST",
      "title": "Welcome First Journey",
      "description": "Flat ₹150 off on your maiden YatraBus booking",
      "discountType": "flat",
      "value": 150,
      "minAmount": 400,
      "badge": "NEW USER",
      "isActive": true
    },
    {
      "code": "FESTIVE50",
      "title": "Festive Super Saver",
      "description": "Get 15% off up to ₹250 on all inter-city festival trips",
      "discountType": "percent",
      "value": 15,
      "maxDiscount": 250,
      "minAmount": 600,
      "badge": "FESTIVAL",
      "isActive": true
    }
  ]
}
```

---

### 10.2 Public: Validate Promo Offer
- **Method**: `POST`
- **Path**: `/offers/validate`
- **Access Level**: Public
- **Description**: Evaluates promo validity against route, travel date, usage quota, and booking subtotal, computing the final discount strictly on the backend.

#### Request Body
```json
{
  "code": "FESTIVE50",
  "bookingAmount": 1200,
  "route": "Kolkata to Digha"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Offer applied successfully",
  "data": {
    "code": "FESTIVE50",
    "discount": 180,
    "discountType": "percent",
    "value": 15,
    "maxDiscount": 250,
    "finalAmount": 1020
  }
}
```

---

### 10.3 Public: System Health Check
- **Method**: `GET`
- **Path**: `/health`
- **Access Level**: Public
- **Description**: Returns operational status of MongoDB and Redis cache layer. Returns 200 when MongoDB is connected, 503 if primary database is degraded.

#### Success Response (`200 OK`)
```json
{
  "status": "healthy",
  "service": "YatraBus Pan-India Backend API",
  "timestamp": "2026-11-15T13:20:00.000Z",
  "environment": "development",
  "mongo": "connected",
  "redis": "connected"
}
```

---

### 10.4 Public: Platform Settings
- **Method**: `GET`
- **Path**: `/settings`
- **Access Level**: Public
- **Description**: Retrieves dynamic branding and site configurations managed from the Admin Settings dashboard.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "siteName": "YatraBus",
    "brandTagline": "India's Premier Bus Transit Platform",
    "supportEmail": "support@yatrabus.com",
    "supportPhone": "+91 98765 43210",
    "emergencyHelpline": "1800-200-9287",
    "cancelPolicyHours": 12,
    "cancelRefundPercent": 85,
    "serviceChargeFlat": 35
  }
}
```

---

### 10.5 Authenticated: Customer Notifications
- **Method**: `GET`
- **Path**: `/notifications`
- **Access Level**: Authenticated User
- **Description**: Retrieves automated transit notifications generated when administrators reschedule or cancel trips.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "673752e82cf5bb49fa840001",
      "type": "DELAY",
      "title": "Trip Schedule Update",
      "message": "Trip on route Kolkata to Siliguri has been rescheduled from 20:00 to 21:00.",
      "isRead": false,
      "createdAt": "2026-11-15T12:00:00.000Z"
    }
  ]
}
```

---

### 10.6 Authenticated: Mark Notification as Read
- **Method**: `PATCH`
- **Path**: `/notifications/:id/read`
- **Access Level**: Authenticated User

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "_id": "673752e82cf5bb49fa840001",
    "isRead": true
  }
}
```

---

## 11. Postman Testing Guide

### 11.1 Postman Environment Setup
Create a Postman Environment named `Bus Booking App (Local)` with the following variables:
- `baseUrl`: `http://localhost:5000/api`
- `userToken`: *(auto-populated by login test script)*
- `adminToken`: *(auto-populated by admin login test script)*
- `busId`: *(auto-populated by search buses script)*
- `bookingReference`: *(auto-populated by create booking script)*

### 11.2 Automated Token Storage Script (Tests Tab)
In the Postman request for **POST /auth/login**:
```javascript
const response = pm.response.json();
if (response.success && response.data.token) {
  if (response.data.user.role === 'admin') {
    pm.environment.set("adminToken", response.data.token);
  } else {
    pm.environment.set("userToken", response.data.token);
  }
  pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
  });
}
```

### 11.3 Concurrency Race Condition Automated Test
1. Set up a Postman collection folder named **Concurrency Bug Bash**.
2. Duplicate the `POST /bookings` request into two requests: `Request A` and `Request B`.
3. Set the JSON payload for both requests to the identical seat:
   ```json
   {
     "busId": "{{busId}}",
     "journeyDate": "2026-11-25",
     "passengers": [{ "seatNumber": "B1", "name": "Test Passenger", "age": 22, "gender": "male" }]
   }
   ```
4. Run both in Postman Collection Runner simultaneously.
5. **Expected Assertion**: Exactly one returns `201 Created` and the other returns `409 Conflict`.
