# Database Schema Specification

## Bus Booking App — Online Bus Ticket Booking System

This document provides the definitive database architecture for the **Bus Booking App**. It defines all MongoDB collections, field types, validation constraints, indexes, relationships, Mongoose schema implementations, sample operational queries, and future schema migrations.

---

## 1. Architecture Overview & Design Principles

The database layer is built on **MongoDB** accessed via **Mongoose ODM** (v8+ / v9+). It balances normalized relational integrity with document embedding to achieve optimal read throughput for public bus searches and atomic safety for concurrent seat bookings.

### Key Architectural Decisions:
1. **Passenger Embedding vs. Normalization**:
   - Passengers in a booking are embedded directly inside the `Booking` document as an array (`passengers`). This ensures an entire ticket with all seat assignments and passenger details is written atomically in a single document write.
2. **Preventing Double Booking via Database-Level Constraints**:
   - Double-booking the same seat on the same bus for the same journey date is prevented at the database engine level via a **Compound Partial Unique Index** on `{ "busId": 1, "journeyDate": 1, "passengers.seatNumber": 1 }` with a partial filter `{ "bookingStatus": "confirmed" }`.
   - Any concurrent request attempting to book an already confirmed seat violates this index and triggers a MongoDB `E11000` duplicate key exception, completely preventing race conditions without requiring complex distributed locks.
3. **Dedicated `SavedTraveller` Collection**:
   - Registered users frequently book for family, colleagues, or themselves. Frequent passenger profiles are stored in a dedicated `savedtravellers` collection linked by `userId` foreign reference.
4. **Dates and Timings**:
   - `journeyDate` is standardized to UTC midnight (`YYYY-MM-DDT00:00:00.000Z`) to allow clean equality matching.
   - `departureTime` and `arrivalTime` are stored as 24-hour formatted strings (`HH:mm`) for readable display and cross-day journey calculations.

---

## 2. Entity-Relationship (ER) Diagram (OBTBS Trip-Centric)

```mermaid
erDiagram
    BUS ||--o{ TRIP : operates
    ROUTE ||--o{ TRIP : defines
    TRIP ||--o{ SEAT_RESERVATION : locks_or_books
    TRIP ||--o{ BOOKING : reserved_under
    USER ||--o{ BOOKING : places
    BOOKING ||--|| PAYMENT : settles
    BOOKING ||--|| TICKET : issues

    BUS {
        ObjectId _id PK
        string busNumber UK
        string busName
        string busType
        number totalSeats
        objectArray seatLayout
        string operationalStatus
    }

    ROUTE {
        ObjectId _id PK
        string origin
        string destination
        number distanceKm
        number durationMinutes
        objectArray boardingPoints
        objectArray droppingPoints
    }

    TRIP {
        ObjectId _id PK
        ObjectId busId FK
        ObjectId routeId FK
        string travelDate
        string departureTime
        string arrivalTime
        string status
    }

    SEAT_RESERVATION {
        ObjectId _id PK
        ObjectId tripId FK
        ObjectId busId FK
        string seatNumber
        string status
        date lockExpiresAt
    }

    BOOKING {
        ObjectId _id PK
        string pnr UK
        ObjectId userId FK
        ObjectId tripId FK
        string bookingStatus
        string paymentStatus
        number totalFare
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId bookingId FK
        string gateway
        string gatewayPaymentId UK
        number amount
        string status
    }

    TICKET {
        ObjectId _id PK
        ObjectId bookingId FK
        string pnr UK
        object journeySnapshot
        objectArray passengerSnapshot
        date generatedAt
    }
```
        string origin
        string destination
        string departureTime
        string arrivalTime
        string journeyDuration
        number fare
        number totalSeats
        array amenities
        boolean isActive
        date createdAt
        date updatedAt
    }

    BOOKING {
        ObjectId _id PK
        string bookingReference UK
        ObjectId userId FK
        ObjectId busId FK
        date journeyDate
        array passengers
        number totalFare
        string bookingStatus
        string paymentStatus
        date createdAt
        date updatedAt
    }
```

---

## 3. Collections & Data Dictionary

### 3.1 `users` Collection

Stores authentication credentials and basic profile information for registered passengers and administrators.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key, Auto-generated | Unique user identifier. |
| `name` | `String` | Required, Trimmed, Length: 2–50 | Full name of the user. |
| `email` | `String` | Required, Unique, Lowercase, Trimmed | Unique login email address. |
| `password` | `String` | Required, Min length 6 | Salted bcrypt hash of user password (never plaintext). |
| `phone` | `String` | Required, Trimmed, Regex: `^[0-9]{10}$` | 10-digit primary mobile contact number. |
| `role` | `String` | Required, Enum: `['user', 'admin']`, Default: `'user'` | System authorization role. |
| `createdAt` | `Date` | Auto-managed by Mongoose | Timestamp of registration. |
| `updatedAt` | `Date` | Auto-managed by Mongoose | Timestamp of last record update. |

---

### 3.2 `savedtravellers` Collection

Stores saved passenger profiles associated with a registered user to facilitate one-click passenger addition during checkout.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key, Auto-generated | Unique record identifier. |
| `userId` | `ObjectId` | Required, Ref: `'User'`, Indexed | Foreign key linking traveller to owner user. |
| `name` | `String` | Required, Trimmed, Length: 2–50 | Full legal name of traveller. |
| `age` | `Number` | Required, Min: 1, Max: 120 | Age of traveller in completed years. |
| `gender` | `String` | Required, Enum: `['male', 'female', 'other']` | Gender identification for seat arrangement. |
| `createdAt` | `Date` | Auto-managed by Mongoose | Timestamp created. |
| `updatedAt` | `Date` | Auto-managed by Mongoose | Timestamp updated. |

---

### 3.3 `buses` Collection

Master inventory of buses managed by administrators, defining routes, schedules, seat capacities, and base fares.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key, Auto-generated | Unique bus inventory identifier. |
| `busNumber` | `String` | Required, Unique, Uppercase, Trimmed | Registration number (e.g., `"WB-04-A-1234"`). |
| `busName` | `String` | Required, Trimmed, Length: 2–100 | Travel agency or bus name (e.g., `"Royal Cruiser"`). |
| `busType` | `String` | Required, Enum: `['Seater', 'Sleeper', 'AC Seater', 'AC Sleeper']` | Physical layout and comfort category. |
| `origin` | `String` | Required, Lowercase, Trimmed, Indexed | Origin city or boarding terminal (e.g., `"kolkata"`). |
| `destination` | `String` | Required, Lowercase, Trimmed, Indexed | Destination city or dropping terminal (e.g., `"siliguri"`). |
| `departureTime` | `String` | Required, Format: `HH:mm` (24-hour) | Scheduled departure time (e.g., `"20:30"`). |
| `arrivalTime` | `String` | Required, Format: `HH:mm` (24-hour) | Scheduled arrival time (e.g., `"06:30"`). |
| `journeyDuration` | `String` | Required, Format: `"Xh Ym"` | Calculated duration (e.g., `"10h 00m"`). |
| `fare` | `Number` | Required, Min: 1 | Standard fare per seat in INR (₹). |
| `totalSeats` | `Number` | Required, Min: 10, Max: 60, Default: 36 | Total seat capacity (layout grid size). |
| `amenities` | `[String]` | Array of strings | Amenities offered (e.g., `["WiFi", "Water Bottle", "Charging Point", "Blanket"]`). |
| `isActive` | `Boolean` | Required, Default: `true`, Indexed | Flag indicating whether bus is actively scheduled. |
| `createdAt` | `Date` | Auto-managed by Mongoose | Creation timestamp. |
| `updatedAt` | `Date` | Auto-managed by Mongoose | Last modification timestamp. |

---

### 3.4 `bookings` Collection

Stores confirmed reservations placed by users. Contains embedded subdocuments for individual passengers and seat assignments.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key, Auto-generated | Unique booking identifier. |
| `bookingReference` | `String` | Required, Unique, Uppercase, Trimmed | Human-readable PNR code (e.g., `"BK-98F42A7C"`). |
| `userId` | `ObjectId` | Required, Ref: `'User'`, Indexed | Foreign key linking booking to customer. |
| `busId` | `ObjectId` | Required, Ref: `'Bus'`, Indexed | Foreign key linking booking to bus schedule. |
| `journeyDate` | `Date` | Required, Normalized to UTC midnight | Date of travel (ISO date string `YYYY-MM-DDT00:00:00.000Z`). |
| `passengers` | `[SubDoc]` | Required, Array min length: 1, max length: 6 | List of passengers booked under this ticket. |
| `passengers.seatNumber` | `String` | Required, Uppercase, Trimmed (e.g., `"A1"`) | Specific allocated seat code. |
| `passengers.name` | `String` | Required, Trimmed, Length: 2–50 | Passenger legal name. |
| `passengers.age` | `Number` | Required, Min: 1, Max: 120 | Passenger age. |
| `passengers.gender` | `String` | Required, Enum: `['male', 'female', 'other']` | Passenger gender. |
| `totalFare` | `Number` | Required, Min: 1 | Total price calculated (`passengers.length * bus.fare`). |
| `bookingStatus` | `String` | Required, Enum: `['confirmed', 'cancelled']`, Default: `'confirmed'` | Lifecycle state of ticket (`'cancelled'` is Post-MVP). |
| `paymentStatus` | `String` | Required, Enum: `['paid', 'unpaid', 'mock_paid']`, Default: `'paid'` | Payment status (`'mock_paid'` for test flow). |
| `createdAt` | `Date` | Auto-managed by Mongoose | Booking time. |
| `updatedAt` | `Date` | Auto-managed by Mongoose | Modification time. |

---

## 4. Indexing Strategy & Concurrency Enforcement

### 4.1 The Concurrency Index: Duplicate Seat Prevention

To guarantee that **two passengers cannot book the same seat on the same bus for the same date**, MongoDB's multikey index mechanism is combined with a partial filter.

```javascript
// Compound partial unique index definition in Mongoose
BookingSchema.index(
  {
    busId: 1,
    journeyDate: 1,
    "passengers.seatNumber": 1
  },
  {
    unique: true,
    partialFilterExpression: { bookingStatus: "confirmed" },
    name: "unique_bus_date_seat_confirmed"
  }
);
```

#### How this protects against race conditions:
1. Two concurrent clients (`User A` and `User B`) both inspect the seat layout for Bus `X` on date `2026-11-20` and both pick seat `"A1"`.
2. Both submit checkout requests at the exact same millisecond.
3. Node.js threads issue `Booking.create()` concurrently to MongoDB.
4. MongoDB acquires a document lock. The first write succeeds and creates index keys:
   `{ busId: X, journeyDate: 2026-11-20, "passengers.seatNumber": "A1" }`.
5. When the second write attempts insertion, MongoDB's unique index constraint immediately detects the duplicate key collision on `"passengers.seatNumber": "A1"`.
6. MongoDB aborts the second insert and raises error code `11000` (`MongoServerError: E11000 duplicate key error`).
7. The backend controller catches error code `11000` and immediately responds to `User B` with HTTP `409 Conflict`:
   ```json
   {
     "success": false,
     "message": "One or more selected seats (A1) have already been booked. Please select other seats."
   }
   ```
8. **Post-MVP Cancellation Support**: If `User A` later cancels their booking, `bookingStatus` changes to `'cancelled'`. Because the index specifies `partialFilterExpression: { bookingStatus: "confirmed" }`, the cancelled document is excluded from the unique constraint, instantly making seat `"A1"` available for other users without requiring manual index deletion.

### 4.2 Complete Index Summary Table

| Collection | Indexed Fields | Type | Purpose / Query Optimization |
| :--- | :--- | :--- | :--- |
| `users` | `{ email: 1 }` | Unique | Fast credential lookup during login & unique email enforcement. |
| `savedtravellers` | `{ userId: 1 }` | Single Field | Fast retrieval of user's saved passenger list. |
| `buses` | `{ busNumber: 1 }` | Unique | Enforces vehicle registration number uniqueness. |
| `buses` | `{ origin: 1, destination: 1, isActive: 1 }` | Compound | Fast bus schedule search queries on origin + destination. |
| `bookings` | `{ bookingReference: 1 }` | Unique | Instant PNR ticket lookup. |
| `bookings` | `{ userId: 1, createdAt: -1 }` | Compound | Speeds up "My Bookings" sorted chronologically. |
| `bookings` | `{ busId: 1, journeyDate: 1 }` | Compound | Fast retrieval of occupied seats for interactive seat layout. |
| `bookings` | `{ busId: 1, journeyDate: 1, "passengers.seatNumber": 1 }` | **Compound Unique (Partial)** | **Zero-concurrency race condition double-booking prevention.** |

---

## 5. Mongoose Schema Implementations

The following code snippets are ready for drop-in use in the `backend/models/` folder.

### 5.1 `backend/models/User.js`
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits']
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'user'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
```

### 5.2 `backend/models/SavedTraveller.js`
```javascript
const mongoose = require('mongoose');

const savedTravellerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['male', 'female', 'other'],
        message: '{VALUE} is not a valid gender'
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedTraveller', savedTravellerSchema);
```

### 5.3 `backend/models/Bus.js`
```javascript
const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Bus number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    busName: {
      type: String,
      required: [true, 'Bus name is required'],
      trim: true,
      minlength: [2, 'Bus name must be at least 2 characters'],
      maxlength: [100, 'Bus name cannot exceed 100 characters']
    },
    busType: {
      type: String,
      required: [true, 'Bus type is required'],
      enum: {
        values: ['Seater', 'Sleeper', 'AC Seater', 'AC Sleeper'],
        message: '{VALUE} is not a valid bus type'
      }
    },
    origin: {
      type: String,
      required: [true, 'Origin is required'],
      lowercase: true,
      trim: true
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      lowercase: true,
      trim: true
    },
    departureTime: {
      type: String,
      required: [true, 'Departure time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Departure time must be in 24h format HH:mm']
    },
    arrivalTime: {
      type: String,
      required: [true, 'Arrival time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Arrival time must be in 24h format HH:mm']
    },
    journeyDuration: {
      type: String,
      required: [true, 'Journey duration is required (e.g., 10h 00m)'],
      trim: true
    },
    fare: {
      type: Number,
      required: [true, 'Fare per seat is required'],
      min: [1, 'Fare must be greater than zero']
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats count is required'],
      min: [10, 'Total seats must be at least 10'],
      max: [60, 'Total seats cannot exceed 60'],
      default: 36
    },
    amenities: {
      type: [String],
      default: ['Water Bottle', 'Charging Point']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Compound index for bus search
busSchema.index({ origin: 1, destination: 1, isActive: 1 });

module.exports = mongoose.model('Bus', busSchema);
```

### 5.4 `backend/models/Booking.js`
```javascript
const mongoose = require('mongoose');

const passengerSubSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['male', 'female', 'other'],
        message: '{VALUE} is not a valid gender'
      }
    }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus ID is required'],
      index: true
    },
    journeyDate: {
      type: Date,
      required: [true, 'Journey date is required']
    },
    passengers: {
      type: [passengerSubSchema],
      required: [true, 'At least one passenger is required'],
      validate: [
        {
          validator: function (val) {
            return val && val.length > 0 && val.length <= 6;
          },
          message: 'A single booking must contain between 1 and 6 passengers.'
        },
        {
          validator: function (val) {
            const seats = val.map((p) => p.seatNumber);
            return new Set(seats).size === seats.length;
          },
          message: 'Duplicate seat numbers detected within the same booking request.'
        }
      ]
    },
    totalFare: {
      type: Number,
      required: [true, 'Total fare is required'],
      min: [1, 'Total fare must be greater than zero']
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid', 'mock_paid'],
      default: 'paid'
    }
  },
  { timestamps: true }
);

// Indexes
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ busId: 1, journeyDate: 1 });

// Critical Unique Index for Double-Booking Prevention
bookingSchema.index(
  {
    busId: 1,
    journeyDate: 1,
    'passengers.seatNumber': 1
  },
  {
    unique: true,
    partialFilterExpression: { bookingStatus: 'confirmed' },
    name: 'unique_bus_date_seat_confirmed'
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
```

---

## 6. Sample JSON Documents

### 6.1 `users` Sample Document
```json
{
  "_id": { "$oid": "654a1b2c3d4e5f6789a00001" },
  "name": "Arjun Sharma",
  "email": "arjun.sharma@example.com",
  "password": "$2a$10$w8TKnk2PzJ1E7oQZ/QzD3eFkLmOpQrStUvWxYzAbCdEfGhIjKlMn.",
  "phone": "9876543210",
  "role": "user",
  "createdAt": { "$date": "2026-11-01T10:00:00.000Z" },
  "updatedAt": { "$date": "2026-11-01T10:00:00.000Z" }
}
```

### 6.2 `savedtravellers` Sample Document
```json
{
  "_id": { "$oid": "654a1b2c3d4e5f6789a00055" },
  "userId": { "$oid": "654a1b2c3d4e5f6789a00001" },
  "name": "Priya Sharma",
  "age": 28,
  "gender": "female",
  "createdAt": { "$date": "2026-11-02T14:20:00.000Z" },
  "updatedAt": { "$date": "2026-11-02T14:20:00.000Z" }
}
```

### 6.3 `buses` Sample Document
```json
{
  "_id": { "$oid": "654a1b2c3d4e5f6789a00100" },
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
  "amenities": ["WiFi", "Water Bottle", "Charging Point", "Blanket", "Reading Light"],
  "isActive": true,
  "createdAt": { "$date": "2026-10-15T08:00:00.000Z" },
  "updatedAt": { "$date": "2026-10-15T08:00:00.000Z" }
}
```

### 6.4 `bookings` Sample Document
```json
{
  "_id": { "$oid": "654a1b2c3d4e5f6789a00500" },
  "bookingReference": "BK-98F42A7C",
  "userId": { "$oid": "654a1b2c3d4e5f6789a00001" },
  "busId": { "$oid": "654a1b2c3d4e5f6789a00100" },
  "journeyDate": { "$date": "2026-11-20T00:00:00.000Z" },
  "passengers": [
    {
      "seatNumber": "A1",
      "name": "Arjun Sharma",
      "age": 30,
      "gender": "male"
    },
    {
      "seatNumber": "A2",
      "name": "Priya Sharma",
      "age": 28,
      "gender": "female"
    }
  ],
  "totalFare": 1900,
  "bookingStatus": "confirmed",
  "paymentStatus": "paid",
  "createdAt": { "$date": "2026-11-10T12:30:45.000Z" },
  "updatedAt": { "$date": "2026-11-10T12:30:45.000Z" }
}
```

---

## 7. Sample Operational Queries

### 7.1 Search Buses by Origin, Destination & Active Status
Used by guest users on the Search Results screen.
```javascript
const searchBuses = async (origin, destination) => {
  return await Bus.find({
    origin: origin.toLowerCase().trim(),
    destination: destination.toLowerCase().trim(),
    isActive: true
  }).sort({ departureTime: 1 });
};
```

### 7.2 Fetch All Occupied Seats for a Bus on a Specific Date
Called when rendering the interactive seat selection layout to distinguish available vs. booked seats.
```javascript
const getOccupiedSeats = async (busId, journeyDate) => {
  // Normalize journeyDate to UTC midnight
  const targetDate = new Date(journeyDate);
  targetDate.setUTCHours(0, 0, 0, 0);

  const bookings = await Booking.find({
    busId,
    journeyDate: targetDate,
    bookingStatus: 'confirmed'
  }).select('passengers.seatNumber');

  // Flatten seat numbers from all booking documents
  const occupiedSeats = bookings.flatMap((b) => b.passengers.map((p) => p.seatNumber));
  return occupiedSeats;
};
```

### 7.3 Atomic Booking Creation with Duplicate Key Error Handling
Executed during checkout when the user clicks "Confirm Booking".
```javascript
const createBooking = async ({ userId, busId, journeyDate, passengers }) => {
  // 1. Verify bus exists and calculate total fare
  const bus = await Bus.findById(busId);
  if (!bus || !bus.isActive) {
    throw { status: 404, message: 'Bus not found or inactive' };
  }

  const targetDate = new Date(journeyDate);
  targetDate.setUTCHours(0, 0, 0, 0);

  const totalFare = bus.fare * passengers.length;
  const bookingReference = 'BK-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  try {
    const booking = await Booking.create({
      bookingReference,
      userId,
      busId,
      journeyDate: targetDate,
      passengers,
      totalFare,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid'
    });

    return booking;
  } catch (error) {
    // 2. Intercept MongoDB E11000 duplicate key error
    if (error.code === 11000) {
      const conflictError = new Error(
        'One or more selected seats have already been booked by another user. Please choose different seats.'
      );
      conflictError.status = 409;
      throw conflictError;
    }
    throw error;
  }
};
```

### 7.4 Get User Booking History
Retrieves user's tickets with populated bus route details, sorted latest first.
```javascript
const getUserBookings = async (userId) => {
  return await Booking.find({ userId })
    .populate('busId', 'busName busNumber busType origin destination departureTime arrivalTime')
    .sort({ createdAt: -1 });
};
```

### 7.5 Admin View All Bookings with Pagination
Allows administrators to audit all system reservations.
```javascript
const getAdminBookings = async ({ page = 1, limit = 10, date }) => {
  const query = {};
  if (date) {
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);
    query.journeyDate = targetDate;
  }

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('busId', 'busName busNumber origin destination departureTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(query)
  ]);

  return {
    bookings,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  };
};
```

---

## 8. Seed Data & Initialization Guidance

The backend project includes a seed script located at `backend/scripts/seed.js` to populate clean initial test data.

### Seeding Execution Command:
```bash
cd backend
npm run seed
```

### Initial Data Requirements:
1. **Default Administrator**:
   - `email`: `admin@busbooking.com`
   - `password`: `Admin@1234` (hashed via `bcrypt.hash("Admin@1234", 10)`)
   - `role`: `admin`
2. **Default Sample User**:
   - `email`: `user@busbooking.com`
   - `password`: `User@1234`
   - `role`: `user`
3. **Core Routes & Buses**:
   - Kolkata ⇄ Siliguri (Seater & AC Sleeper)
   - Mumbai ⇄ Pune (AC Seater)
   - Bangalore ⇄ Chennai (AC Sleeper)
   - Delhi ⇄ Jaipur (AC Seater)
4. **Pre-seeded Confirmed Bookings**:
   - Ensure a sample booking exists for tomorrow's date on Kolkata ⇄ Siliguri occupying seats `"A1"` and `"A2"`, allowing team members to immediately test occupied seat rendering and collision handling on the UI.

---

## 9. Future Schema Extensions (Post-MVP)

### 9.1 Ticket Cancellation Lifecycle (Post-MVP)
- When cancellation is enabled, tickets are updated to `bookingStatus: 'cancelled'`.
- The compound unique index on `{ busId: 1, journeyDate: 1, "passengers.seatNumber": 1 }` with `partialFilterExpression: { bookingStatus: "confirmed" }` ensures cancelled seats automatically become available for re-booking without any data deletion.
- Additional audit fields to append to `Booking`:
  ```javascript
  cancellationDate: { type: Date },
  refundAmount: { type: Number, default: 0 },
  cancellationReason: { type: String, trim: true }
  ```

### 9.2 Mock / Real Payment Gateway Details (Post-MVP)
- To track payment transaction IDs and gateways:
  ```javascript
  paymentDetails: {
    transactionId: { type: String, trim: true },
    paymentMethod: { type: String, enum: ['card', 'upi', 'netbanking', 'mock_gateway'] },
    paidAt: { type: Date }
  }
  ```

### 9.3 Optional Redis Cache Schema (Post-MVP)
- When Redis (`ioredis`) is enabled post-MVP, search queries are cached with an expiration of 120 seconds:
  - Cache Key Format: `buses:search:${origin}:${destination}`
  - TTL: 120 seconds
  - Bus Seat Map Cache: `bus:${busId}:seats:${journeyDate}` (TTL: 15 seconds, invalidated immediately upon successful booking).
