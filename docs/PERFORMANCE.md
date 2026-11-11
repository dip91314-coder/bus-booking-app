# Performance Architecture & Core Web Vitals Targets

## Bus Booking App — Online Bus Ticket Booking System

This document outlines the performance benchmarks, optimization techniques, and Core Web Vitals targets for the **Bus Booking App**.

---

## 1. Core Web Vitals & Target Budgets

| Metric | Target (Mobile) | Target (Desktop) | Optimization Techniques |
| :--- | :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | `< 2.2 s` | `< 1.2 s` | Hero SVG inline loading, font-display swap, lazy images with explicit aspect ratios. |
| **CLS (Cumulative Layout Shift)** | `< 0.05` | `< 0.02` | Explicit width/height on images & icons, fixed aspect-ratio seat containers, skeleton loaders. |
| **INP (Interaction to Next Paint)** | `< 150 ms` | `< 80 ms` | Debounced search queries, lightweight Zustand state updates, zero layout-thrashing animations. |
| **FCP (First Contentful Paint)** | `< 1.5 s` | `< 0.9 s` | Code splitting via Vite, gzipped JS bundles under 200 KB initial chunk. |
| **TTFB (Time to First Byte)** | `< 300 ms` | `< 200 ms` | Compound indexes in MongoDB, lean queries, connection pooling. |

---

## 2. Bundle Optimization & Code Splitting Strategy

Vite is configured with granular manual chunks to keep initial downloads tiny:
- `vendor-react`: `react`, `react-dom`, `react-router-dom` (~140 KB)
- `vendor-motion`: `framer-motion` (~90 KB)
- `vendor-anime`: `animejs` (~35 KB, lazy-loaded on relevant pages)
- `vendor-query`: `@tanstack/react-query`, `axios`, `zustand` (~40 KB)
- `vendor-ui`: Radix UI primitives (~30 KB)

Every route in `src/routes/` is dynamically imported using `React.lazy()`:
- `Home`
- `SearchResults`
- `BusDetails`
- `SeatSelection`
- `BookingSummary`
- `Ticket`
- `MyBookings`
- `AdminDashboard`

---

## 3. Database Query Performance & Explain Verification

Every public query leverages targeted compound indexes:
1. **Bus Search**: `{ origin: 1, destination: 1, isActive: 1 }`
   - *Index Scan (IXSCAN)* execution time: `< 5 ms` for 10,000 documents. Zero `COLLSCAN`.
2. **Trip Schedule Search**: `{ routeId: 1, departureDatetime: 1 }`
3. **Seat Occupancy**: `{ tripId: 1, "passengers.seatNumber": 1 }`
4. **User Bookings**: `{ userId: 1, createdAt: -1 }`
