# API Documentation

## Bus Booking App — Online Bus Ticket Booking System

| Document Version | Base URL (Local) | Base URL (Production) | Auth Header Format |
| :--- | :--- | :--- | :--- |
| 1.0.0 | `http://localhost:5000/api` | `https://bus-booking-app-api.onrender.com/api` | `Authorization: Bearer <jwt_token>` |

---

## 1. Endpoints Summary Table

| Module | Method | Path | Access Level | Description | Traceable FR |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Public | Register new user account | FR-01, FR-05 |
| **Auth** | `POST` | `/auth/login` | Public | Authenticate user & return JWT | FR-02, FR-05 |
| **Auth** | `GET` | `/auth/me` | Authenticated | Get current authenticated user profile | FR-03, FR-04 |
| **Profile** | `GET` | `/users/profile` | Authenticated | Fetch passenger profile details | FR-14 |
| **Profile** | `PUT` | `/users/profile` | Authenticated | Update passenger profile details | FR-14 |
| **Travellers** | `GET` | `/travellers` | Authenticated | Get user's saved travellers list | FR-15 |
| **Travellers** | `POST` | `/travellers` | Authenticated | Create a new saved traveller | FR-15 |
| **Travellers** | `DELETE`| `/travellers/:id` | Authenticated | Delete a saved traveller | FR-15 |
| **Buses** | `GET` | `/buses/search` | Public | Search buses by origin & destination | FR-06, FR-07 |
| **Buses** | `GET` | `/buses/:id` | Public | Get single bus details & amenities | FR-08 |
| **Buses** | `GET` | `/buses/:id/seats` | Public | Get booked seats for a bus on a date | FR-10 |
| **Bookings** | `POST` | `/bookings` | Authenticated | Create new booking (Atomic / Concurrency Safe)| FR-17, FR-18, FR-19 |
| **Bookings** | `GET` | `/bookings/my-bookings` | Authenticated | Get current user's booking history | FR-22 |
| **Bookings** | `GET` | `/bookings/:bookingReference` | Authenticated | Get single booking/ticket details | FR-21 |
| **Bookings** | `PUT` | `/bookings/:bookingReference/cancel` | Authenticated | Cancel a booking *(Post-MVP)* | FR-23 |
| **Admin** | `GET` | `/admin/buses` | Admin Only | Get all buses (including inactive) | FR-26, FR-27 |
| **Admin** | `POST` | `/admin/buses` | Admin Only | Create a new bus schedule | FR-27 |
| **Admin** | `PUT` | `/admin/buses/:id` | Admin Only | Update existing bus details | FR-28 |
| **Admin** | `DELETE`| `/admin/buses/:id` | Admin Only | Delete or deactivate bus | FR-29 |
| **Admin** | `GET` | `/admin/bookings` | Admin Only | View all system bookings (Paginated) | FR-30 |
| **Admin** | `GET` | `/admin/stats` | Admin Only | Fleet & revenue statistics *(Post-MVP)* | FR-31 |

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
- `role`: Optional, enum `['user', 'admin']`, defaults to `'user'`.

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
