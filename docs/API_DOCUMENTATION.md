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
| **Buses** | `GET` | `/buses/search` | Public | Legacy search buses | FR-06 | *Deprecated* (Use `/trips`) |
| **Buses** | `GET` | `/buses/:id/seats` | Public | Legacy computed seat layout | FR-10 | *Deprecated* (Use `/trips/:tripId/seats`) |
| **Seats** | `POST` | `/seats/hold` | Authenticated | Legacy seat hold | FR-10 | *Deprecated* (Use `/trips/:tripId/locks`) |
| **Admin** | `GET` | `/admin/dashboard` | Admin Only | Dashboard KPI metrics & recent activity | SRS §5.1 | Active |
| **Admin** | `GET` | `/admin/trips` | Admin Only | List scheduled trips with filters | SRS §5.4 | Active |
| **Admin** | `POST` | `/admin/trips` | Admin Only | Schedule a new trip | SRS §5.4 | Active |
| **Admin** | `PUT` | `/admin/trips/:id` | Admin Only | Update trip schedule or status | SRS §5.4 | Active |
| **Admin** | `DELETE`| `/admin/trips/:id` | Admin Only | Delete scheduled trip | SRS §5.4 | Active |
| **Admin** | `GET` | `/admin/pricing` | Admin Only | List multi-tier pricing policies | SRS §5.6 | Active |
| **Admin** | `POST` | `/admin/pricing` | Admin Only | Create dynamic pricing policy | SRS §5.6 | Active |
| **Admin** | `PUT` | `/admin/pricing/:id` | Admin Only | Update pricing policy | SRS §5.6 | Active |
| **Admin** | `DELETE`| `/admin/pricing/:id` | Admin Only | Delete pricing policy | SRS §5.6 | Active |
| **Admin** | `PUT` | `/admin/buses/:id/layout` | Admin Only | Manage physical seat layout | SRS §5.5 | Active |
| **Admin** | `GET` | `/admin/buses` | Admin Only | Fleet management | SRS §5.2 | Active |
| **Admin** | `GET` | `/admin/routes` | Admin Only | Route management | SRS §5.3 | Active |
| **Admin** | `GET` | `/admin/bookings` | Admin Only | Booking records | SRS §5.7 | Active |
| **Admin** | `GET` | `/admin/payments` | Admin Only | Payment monitoring & refunds | SRS §5.8 | Active |
| **Admin** | `GET` | `/admin/passengers`| Admin Only | Customer management & account status | SRS §5.9 | Active |
| **Admin** | `GET` | `/admin/reports` | Admin Only | Comprehensive analytical reports | SRS §5.10 | Active |

---

## 1.1 Admin Management API

All routes below require an authenticated administrator and use the standard `{ success, data }` response envelope. IDs in these routes are MongoDB resource IDs; booking cancellation also accepts a booking reference.

| Resource | Path | Supported operations |
| :--- | :--- | :--- |
| Dashboard | `/admin/dashboard`, `/admin/reports` | `GET` metrics and analytics; reports accept `?timeframe=7D`, `30D`, `90D`, or `YTD` |
| Buses | `/admin/buses` | `GET`, `POST`; `PUT` and `DELETE /:id` |
| Routes | `/admin/routes` | `GET`, `POST`; `PUT` and `DELETE /:id` |
| Schedules | `/admin/schedules` | `GET`, `POST`; `PUT` and `DELETE /:id` |
| Bookings | `/admin/bookings` | `GET`; `POST /:id/cancel` |
| Passengers | `/admin/passengers` | `GET`; `PUT /:id`; `PATCH /:id/status` |
| Drivers | `/admin/drivers` | `GET`, `POST`; `PUT` and `DELETE /:id` |
| Staff | `/admin/staff` | `GET`, `POST`; `PUT` and `DELETE /:id` |
| Payments | `/admin/payments` | `GET`; `POST /:id/refund` |
| Offers | `/admin/offers` | `GET`, `POST`; `PUT` and `DELETE /:id` |
| Reviews | `/admin/reviews` | `GET`; `PATCH /:id/status`; `DELETE /:id` |
| Notifications | `/admin/notifications` | `GET`, `POST`; `PATCH /:id/read`, `PATCH /read-all`, `DELETE /:id` |
| Settings | `/admin/settings` | `GET`, `PUT`; `POST /change-password` |

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
      "busName": "Greenline Express",
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
    "busName": "Greenline Express",
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
        "busName": "Greenline Express",
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

### 7.4 Admin: Delete Bus
- **Method**: `DELETE`
- **Path**: `/admin/buses/:id`
- **Access Level**: Admin Only

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Bus deleted successfully",
  "data": null
}
```

---

### 7.5 Admin: View All Bookings (Audit Log)
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
          "busName": "Greenline Express"
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

## 8. Postman Testing Guide

### 8.1 Postman Environment Setup
Create a Postman Environment named `Bus Booking App (Local)` with the following variables:
- `baseUrl`: `http://localhost:5000/api`
- `userToken`: *(auto-populated by login test script)*
- `adminToken`: *(auto-populated by admin login test script)*
- `busId`: *(auto-populated by search buses script)*
- `bookingReference`: *(auto-populated by create booking script)*

### 8.2 Automated Token Storage Script (Tests Tab)
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

### 8.3 Concurrency Race Condition Automated Test
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
