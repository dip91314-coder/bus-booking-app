# Application Flows & Sequence Diagrams

## Bus Booking App — Online Bus Ticket Booking System

This document visualizes all key operational workflows of the **Bus Booking App** using Mermaid flowcharts and sequence diagrams. Every flow includes step-by-step explanatory text and explicitly maps each action to its corresponding backend REST API endpoint.

---

## 1. System Navigation & High-Level User Flow

```mermaid
flowchart TD
    Start([User Visits Website]) --> RoleCheck{User Authenticated?}
    
    RoleCheck -->|No - Guest| Home[Home Page / Search Form]
    RoleCheck -->|Yes - User| UserHome[User Dashboard / Search Form]
    RoleCheck -->|Yes - Admin| AdminDash[Admin Dashboard]

    Home --> Search[Search Buses by Origin, Destination, Date]
    UserHome --> Search
    
    Search --> Results[Browse Search Results]
    Results --> Details[Inspect Bus Details & Amenities]
    Details --> ViewSeats[View Interactive Seat Map]
    
    ViewSeats --> AuthPrompt{User Logged In?}
    AuthPrompt -->|No| LoginModal[Login or Register Page]
    LoginModal -->|Success| SeatSelect[Select 1-6 Seats]
    AuthPrompt -->|Yes| SeatSelect
    
    SeatSelect --> PassengerForm[Enter Passenger Details & Apply Saved Travellers]
    PassengerForm --> Summary[Review Booking Summary & Fare]
    Summary --> ConfirmBooking[Submit Booking]
    
    ConfirmBooking --> ConflictCheck{Duplicate Seat Conflict?}
    ConflictCheck -->|Yes - 409 Conflict| ConflictAlert[Prompt: Seats already taken -> Reselect]
    ConflictAlert --> ViewSeats
    
    ConflictCheck -->|No - 201 Created| TicketScreen[Display Confirmed Digital Ticket & PNR]
    TicketScreen --> History[View In 'My Bookings']
    
    AdminDash --> ManageBuses[Manage Buses: Add, Edit, Deactivate]
    AdminDash --> AuditBookings[Audit All Passenger Bookings]
```

---

## 2. Guest Bus Search Flow

Enables guests to search available buses without registering.

### 2.1 Flowchart
```mermaid
flowchart LR
    A[Guest Enters Origin & Destination] --> B[Picks Journey Date >= Today]
    B --> C[Clicks 'Search Buses']
    C --> D{Buses Found?}
    D -->|Yes| E[Render Bus Cards with Pricing & Timings]
    D -->|No| F[Render Empty State Card: No routes found]
```

### 2.2 Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Guest as Guest User (Browser)
    participant UI as React Frontend (SearchResults.jsx)
    participant API as Express API (/api/buses)
    participant DB as MongoDB Atlas (buses)

    Guest->>UI: Selects Origin: "Kolkata", Destination: "Siliguri", Date: "2026-11-20"
    Guest->>UI: Clicks "Search Buses"
    UI->>API: GET /api/buses/search?origin=kolkata&destination=siliguri&date=2026-11-20
    API->>DB: Bus.find({ origin: "kolkata", destination: "siliguri", isActive: true })
    DB-->>API: Returns matching bus documents
    API-->>UI: HTTP 200 OK { success: true, data: [ ...buses ] }
    alt Buses Exist
        UI-->>Guest: Renders list of bus cards with fares and timings
    else No Routes Found
        UI-->>Guest: Displays "No buses found for this route" with search reset
    end
```

**API Endpoint Called**: `GET /api/buses/search?origin=:origin&destination=:destination&date=:date`

---

## 3. User Registration & Authentication Flow

Covers account creation, login credential verification, and JWT session issuance.

### 3.1 Flowchart
```mermaid
flowchart TD
    Start([User Navigates to /register or /login]) --> Action{Register or Login?}
    
    Action -->|Register| RegForm[Enter Name, Email, Password, Phone]
    RegForm --> ValidateReg{Client & Server Validation Pass?}
    ValidateReg -->|No| RegErr[Display Inline Field Errors]
    ValidateReg -->|Yes| CheckEmail{Email Already Registered?}
    CheckEmail -->|Yes| Conflict[Return 409 Conflict: Email taken]
    CheckEmail -->|No| HashPass[Hash Password with bcryptjs (10 rounds)]
    HashPass --> SaveUser[Save User to MongoDB]
    SaveUser --> LoginRedirect[Redirect to /login with Success Banner]
    
    Action -->|Login| LoginForm[Enter Email and Password]
    LoginForm --> VerifyCreds{Email & Password Match?}
    VerifyCreds -->|No| LoginErr[Return 401 Unauthorized: Invalid credentials]
    VerifyCreds -->|Yes| GenJWT[Sign JWT Token (24h expiry)]
    GenJWT --> SaveLocal[Save Token & User to localStorage]
    SaveLocal --> HydrateContext[Update React AuthContext]
    HydrateContext --> RedirectHome[Redirect to intended page / Home]
```

### 3.2 Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant React as React Frontend (Login.jsx / AuthContext)
    participant API as Express API (/api/auth)
    participant DB as MongoDB Atlas (users)

    User->>React: Enters email and password; clicks "Login"
    React->>API: POST /api/auth/login { email, password }
    API->>DB: User.findOne({ email: email.toLowerCase() })
    DB-->>API: User record (with password hash)
    API->>API: bcrypt.compare(password, user.password)
    alt Passwords Match
        API->>API: jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' })
        API-->>React: HTTP 200 OK { success: true, data: { token, user } }
        React->>React: localStorage.setItem('token', token); update AuthContext state
        React-->>User: Navigate to previous page or /
    else Mismatch or User Not Found
        API-->>React: HTTP 401 Unauthorized { success: false, message: "Invalid email or password" }
        React-->>User: Display alert: "Invalid email or password"
    end
```

**API Endpoints Called**:
- Registration: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Session Hydration: `GET /api/auth/me`

---

## 4. Seat Selection & Concurrency-Safe Booking Flow

The primary application transaction: allows seat inspection, group booking (1–6 seats), and handles database-level collision prevention.

### 4.1 Flowchart
```mermaid
flowchart TD
    SelectBus[User Clicks 'Select Seats' on Bus Card] --> LoadSeats[Fetch Occupied Seats for Date]
    LoadSeats --> RenderMap[Render Interactive 2x2 Seat Layout]
    RenderMap --> UserToggles[User Clicks 1-6 Available Seats]
    UserToggles --> SeatCountCheck{Seats Count <= 6?}
    SeatCountCheck -->|No| Warning[Toast: Maximum 6 seats per booking]
    SeatCountCheck -->|Yes| UpdateFare[Live Update Total Fare: count * fare]
    UpdateFare --> NextPass[Proceed to Passenger Details]
    NextPass --> FillDetails[Enter Names, Ages, Genders or Apply Saved Travellers]
    FillDetails --> CheckoutReview[Review Booking Summary & PNR Preview]
    CheckoutReview --> SubmitBooking[User Clicks 'Confirm Booking']
    SubmitBooking --> AtomicInsert[MongoDB Booking.create() with Unique Concurrency Index]
    AtomicInsert --> DuplicateCollision{Index Collision Error 11000?}
    DuplicateCollision -->|Yes| HandleConflict[Catch 11000 -> Return HTTP 409 Conflict]
    HandleConflict --> ConflictUI[Alert: 'Seats taken by another user' -> Reload Seat Map]
    DuplicateCollision -->|No| SuccessInsert[HTTP 201 Created -> Return Confirmed Ticket]
    SuccessInsert --> TicketView[Navigate to /ticket/:bookingReference]
```

### 4.2 Sequence Diagram (Including Duplicate Seat Conflict Path)
```mermaid
sequenceDiagram
    autonumber
    actor Alice as Passenger Alice
    actor Bob as Passenger Bob
    participant UI_A as Alice's Browser
    participant UI_B as Bob's Browser
    participant API as Express API (/api/bookings)
    participant DB as MongoDB Atlas

    Note over Alice,Bob: Both view Kolkata -> Siliguri on 2026-11-20
    UI_A->>API: GET /api/buses/654a1.../seats?date=2026-11-20
    API->>DB: Booking.find({ busId, journeyDate, bookingStatus: "confirmed" })
    DB-->>API: Booked seats: ["B1", "B2"]
    API-->>UI_A: Return bookedSeats: ["B1", "B2"]
    
    UI_B->>API: GET /api/buses/654a1.../seats?date=2026-11-20
    API-->>UI_B: Return bookedSeats: ["B1", "B2"]

    Note over Alice,Bob: Both select Seat "A1" (Available) and enter passenger details
    
    par Concurrent Submission
        Alice->>UI_A: Clicks "Confirm Booking"
        Bob->>UI_B: Clicks "Confirm Booking"
        UI_A->>API: POST /api/bookings (busId, date, Seat "A1", Alice info)
        UI_B->>API: POST /api/bookings (busId, date, Seat "A1", Bob info)
    end

    Note over API,DB: MongoDB executes write lock
    API->>DB: Thread 1 (Alice): Booking.create(...)
    API->>DB: Thread 2 (Bob): Booking.create(...)

    DB->>DB: Thread 1 creates doc & writes compound unique index {busId, date, "A1"}
    DB-->>API: Thread 1 SUCCESS
    API-->>UI_A: HTTP 201 Created { success: true, data: { bookingReference: "BK-98F42A7C" } }
    UI_A-->>Alice: Shows Confirmed Ticket Screen (Ticket BK-98F42A7C)

    DB->>DB: Thread 2 detects duplicate key on unique_bus_date_seat_confirmed
    DB-->>API: Thread 2 REJECTED with MongoServerError: E11000
    API->>API: Catches code 11000 -> Maps to HTTP 409 Conflict
    API-->>UI_B: HTTP 409 Conflict { success: false, message: "Seat A1 is already booked" }
    UI_B-->>Bob: Shows Alert: "Seat A1 has just been booked. Please pick another seat."
    UI_B->>API: Refresh occupied seats (now marks "A1" as booked)
```

**API Endpoints Called**:
- Fetch Occupancy: `GET /api/buses/:id/seats?date=:date`
- Fetch Saved Travellers: `GET /api/travellers`
- Create Booking: `POST /api/bookings`
- Fetch Ticket: `GET /api/bookings/:bookingReference`

---

## 5. Booking History & Ticket Retrieval Flow

Allows passengers to access previous tickets and upcoming journeys.

### 5.1 Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor User as Passenger Browser
    participant UI as React Frontend (MyBookings.jsx)
    participant API as Express API (/api/bookings/my-bookings)
    participant DB as MongoDB Atlas

    User->>UI: Clicks "My Bookings" in Navbar
    UI->>UI: Checks AuthContext for JWT token
    UI->>API: GET /api/bookings/my-bookings (Header: Authorization: Bearer <token>)
    API->>API: authMiddleware extracts userId from JWT
    API->>DB: Booking.find({ userId }).populate('busId').sort({ createdAt: -1 })
    DB-->>API: Returns list of user's bookings
    API-->>UI: HTTP 200 OK { success: true, data: [ ...bookings ] }
    alt Has Bookings
        UI-->>User: Renders booking cards with route, seats, fare, and "View Ticket" buttons
    else No Bookings
        UI-->>User: Displays empty state: "No bookings found yet. Explore buses!"
    end
    User->>UI: Clicks "View Ticket" on a specific card
    UI-->>User: Navigates to /ticket/:bookingReference
```

**API Endpoint Called**: `GET /api/bookings/my-bookings`

---

## 6. Admin Bus Fleet Management Flow (CRUD)

Restricted administrative operations allowing bus operators to manage fleet schedules.

### 6.1 Flowchart
```mermaid
flowchart TD
    AdminLogin[Admin Logs In with admin role] --> AdminPortal[Admin Navigation: Manage Buses]
    AdminPortal --> ActionChoice{Admin Action}
    
    ActionChoice -->|Add Bus| OpenAddModal[Open Add Bus Modal Form]
    OpenAddModal --> InputData[Enter Bus Number, Name, Type, Route, Timings, Fare, Seats]
    InputData --> PostBus[POST /api/admin/buses]
    PostBus --> BusCreated[HTTP 201 Created -> Bus Appears in Table]
    
    ActionChoice -->|Edit Bus| OpenEditModal[Open Edit Modal with Pre-populated Data]
    OpenEditModal --> ModifyData[Adjust Fare, Timings, or Active Status]
    ModifyData --> PutBus[PUT /api/admin/buses/:id]
    PutBus --> BusUpdated[HTTP 200 OK -> Table Row Refreshed]
    
    ActionChoice -->|Delete / Deactivate| ConfirmDelete[Confirm Deactivation Alert]
    ConfirmDelete --> DelBus[DELETE /api/admin/buses/:id]
    DelBus --> BusDeleted[HTTP 200 OK -> Bus Removed / Deactivated]
```

### 6.2 Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Admin as System Administrator
    participant UI as React Frontend (ManageBuses.jsx)
    participant API as Express API (/api/admin/buses)
    participant DB as MongoDB Atlas (buses)

    Admin->>UI: Submits new bus form (Bus Number: "WB-04-E-9999", Fare: 850)
    UI->>API: POST /api/admin/buses (Header: Bearer <adminToken>)
    API->>API: authMiddleware verifies JWT
    API->>API: adminMiddleware verifies req.user.role === 'admin'
    alt Not Admin
        API-->>UI: HTTP 403 Forbidden { success: false, message: "Access denied" }
    else Admin Verified
        API->>DB: Bus.create({ ...busData })
        DB-->>API: Created bus document
        API-->>UI: HTTP 201 Created { success: true, data: { ...newBus } }
        UI-->>Admin: Displays success banner; refreshes bus table
    end
```

**API Endpoints Called**:
- List Fleet: `GET /api/admin/buses`
- Create Bus: `POST /api/admin/buses`
- Update Bus: `PUT /api/admin/buses/:id`
- Delete Bus: `DELETE /api/admin/buses/:id`

---

## 7. Admin All Bookings Audit Flow

Enables administrators to view and filter all passenger bookings placed across the platform.

### 7.1 Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Admin as System Administrator
    participant UI as React Frontend (AllBookings.jsx)
    participant API as Express API (/api/admin/bookings)
    participant DB as MongoDB Atlas (bookings)

    Admin->>UI: Navigates to "All Bookings" (selects Date filter: "2026-11-20")
    UI->>API: GET /api/admin/bookings?date=2026-11-20&page=1&limit=10 (Header: Bearer <adminToken>)
    API->>API: authMiddleware & adminMiddleware verify admin role
    API->>DB: Booking.find({ journeyDate: "2026-11-20" }).populate('userId busId')
    DB-->>API: Returns paginated booking documents
    API-->>UI: HTTP 200 OK { success: true, data: { bookings, pagination } }
    UI-->>Admin: Renders table displaying PNR, Customer Name, Bus Number, Seats, and Fare
```

**API Endpoint Called**: `GET /api/admin/bookings?date=:date&page=:page&limit=:limit`

---

## 8. Token Expiry & Unauthorized Handling Flow

Protects private routes and handles graceful logout when JWT tokens expire.

### 8.1 Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant Axios as Axios Interceptor (services/api.js)
    participant API as Express API
    participant React as React Router & AuthContext

    User->>Axios: Performs action requiring authentication (e.g. view ticket)
    Axios->>API: GET /api/bookings/BK-98F42A7C (Expired Bearer Token)
    API->>API: authMiddleware calls jwt.verify(token) -> Throws TokenExpiredError
    API-->>Axios: HTTP 401 Unauthorized { success: false, message: "Token expired. Please login again." }
    Axios->>Axios: Interceptor detects status 401
    Axios->>React: Dispatches LOGOUT action; clears localStorage token
    React-->>User: Redirects to /login with notification: "Your session has expired. Please log in again."
```

---

## 9. Planned Booking Cancellation Flow (Post-MVP)

Enables users to cancel confirmed reservations and frees up allocated seats.

### 9.1 Flowchart
```mermaid
flowchart TD
    UserBookings[User Views My Bookings] --> ClickCancel[Clicks 'Cancel Ticket' on Confirmed Ticket]
    ClickCancel --> ConfirmModal[Modal: Are you sure you want to cancel this booking?]
    ConfirmModal -->|User Confirms| PutCancel[PUT /api/bookings/:bookingReference/cancel]
    PutCancel --> UpdateStatus[Update bookingStatus to 'cancelled']
    UpdateStatus --> IndexExclusion[Partial Unique Index Excludes Cancelled Status]
    IndexExclusion --> SeatFreed[Seat Automatically Becomes Available for Other Users]
    SeatFreed --> UIUpdate[UI Shows Status: Cancelled; Refresh Seat Map]
```

### 9.2 Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant UI as React Frontend
    participant API as Express API (/api/bookings)
    participant DB as MongoDB Atlas

    User->>UI: Clicks "Cancel Booking" on Ticket BK-98F42A7C
    UI->>API: PUT /api/bookings/BK-98F42A7C/cancel (Header: Bearer <token>)
    API->>DB: Booking.findOneAndUpdate({ bookingReference, userId }, { bookingStatus: 'cancelled' })
    DB-->>API: Updated booking document
    Note over DB: Because unique index has partialFilterExpression: { bookingStatus: 'confirmed' },<br/>these seats are now instantly free in search!
    API-->>UI: HTTP 200 OK { success: true, message: "Booking cancelled successfully" }
    UI-->>User: Displays cancellation confirmation banner
```

**API Endpoint Called**: `PUT /api/bookings/:bookingReference/cancel` *(Post-MVP)*
