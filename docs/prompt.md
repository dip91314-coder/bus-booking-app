# YatraBus: Master UI/UX Prompt

Paste everything below the line into your AI builder (Claude, Cursor, Lovable, v0, etc.). For a big build, send it in phases: Part A–C first, then one page group at a time.

---

## 0. ROLE AND GOAL

You are a senior product designer and front-end engineer building **YatraBus**, an Indian intercity and interstate bus booking platform (web first, mobile-web equal priority). It competes with redBus, AbhiBus, MakeMyTrip Bus and IntrCity. The product must feel **fast, trustworthy and calm**, and work well for first-time users on 4G in Tier-2/Tier-3 cities as well as repeat travellers.

Deliver production-quality React + TypeScript + Tailwind code (or the stack I name), with every page in sections 5–6 implemented **with all of its states** (loading, empty, error, partial, success). Never ship a page with only the happy path.

## 1. DESIGN PRINCIPLES (decide every trade-off with these)

1. **No price surprises.** The price a user sees at search must equal the price at checkout. Show a fare breakdown (base fare, GST, convenience fee or "₹0") from the results card onward. Seat-level price differences must be visible *on the seat map itself*, with a price filter there too.
2. **Never lose the user's work.** Back, refresh and tab-switching must preserve search, filters, selected seats and passenger details (URL params + session storage). Going back from checkout must not restart the search.
3. **Trust at the moment of doubt.** Surface operator rating, cancellation/refund policy, amenities and live-tracking availability right where the decision happens (results card, seat selection, payment), not in FAQs.
4. **Show, don't tell, for seats.** The seat map should look like the real bus (driver cabin, door, aisle, lower/upper deck), not an abstract grid.
5. **Progress, not waiting.** Loading states describe what is happening ("Checking live seats with 14 operators…"), never a bare spinner.
6. **Errors are recoverable.** Every error says what happened, why, and gives one clear next action. Validate inline and non-blocking.
7. **One primary action per screen**, always visible (sticky on mobile).
8. **Honest claims.** Do not display "Zero Convenience Fee", "Guaranteed seat", or "Govt. Verified" unless the data model backs it up. Gate these labels on real flags.

## 2. DESIGN SYSTEM (tokens)

Match the existing YatraBus look: deep-indigo hero gradient, white content surfaces, orange primary CTA, rounded-xl cards, Inter (or Plus Jakarta Sans) type.

```
Color
  brand.navy-900   #0B1B5C   hero, footer, headings on dark
  brand.indigo-600 #3B3FDB   links, selected states, focus ring
  brand.orange-500 #F97316   primary CTA, highlights ("Your Way.")
  brand.orange-600 #EA6A0C   CTA hover/pressed
  neutral-0 #FFFFFF | 50 #F8FAFC | 100 #F1F5F9 | 200 #E2E8F0 | 400 #94A3B8 | 600 #475569 | 900 #0F172A
  success #16A34A | warning #D97706 | danger #DC2626 | info #0284C7
Seat colors (never rely on color alone; add icon/pattern/label)
  available   white + slate-300 border
  selected    indigo-600 fill, white check
  booked      slate-200 fill, slate-400 "x" / diagonal hatch
  ladies-only pink-100 fill, pink-500 border, "♀" glyph
  blocked/held amber-100 fill, clock icon
Type scale (px / line-height): 12/16, 14/20, 16/24, 18/28, 20/28, 24/32, 30/36, 40/44, 56/60 (hero)
Spacing: 4px base (4, 8, 12, 16, 24, 32, 48, 64, 96)
Radius: sm 8, md 12, lg 16, xl 24, pill 999
Elevation: card 0 1px 3px rgba(15,23,42,.08); raised 0 8px 24px rgba(15,23,42,.12)
Motion: 150ms (micro), 250ms (panel), 400ms (page). ease-out. Respect prefers-reduced-motion (disable shimmer, slides, confetti).
Breakpoints: 360 / 640 / 768 / 1024 / 1280. Design mobile-first at 360px.
Touch targets ≥ 44×44px. Body text ≥ 16px on mobile.
Rupee formatting: Indian grouping (₹1,25,000), tabular numerals.
Dates: "Wed, 11 Nov" in lists; 24-hour or 12-hour per user setting (default 12-hour with AM/PM). Times shown as "21:30 → 05:45 +1 day" when overnight.
```

### Core components to build once and reuse
Button (primary/secondary/ghost/danger, loading, disabled), IconButton, Input, Select/Combobox (city autocomplete), DatePicker (with unavailable-date style), Stepper (passenger count), Checkbox, Radio, Toggle, Chip (filter), Badge (Bestseller, Express, Overnight, Ladies-only), Rating pill, Card, Modal, Bottom sheet (mobile) / Drawer (desktop), Toast, Inline Alert, Tabs, Accordion, Tooltip, Breadcrumb, Progress stepper (booking steps), Countdown timer (seat hold), Price breakdown, Seat, BusCard, RouteCard, DestinationCard, Skeleton (variants), EmptyState, ErrorState, Pagination/InfiniteScroll, Map (OpenStreetMap + Leaflet) with pins.

## 3. GLOBAL UX RULES

- **Navigation:** Top bar: logo, Search Buses, Routes, Offers, Manage Booking, Help, language switch (EN/HI + regional), Login/Profile. Mobile: top bar + bottom nav (Home, Bookings, Offers, Help, Account).
- **Info scent:** breadcrumb on all inner pages (Home › Kolkata to Siliguri bus › Seats).
- **Forms:** labels always visible (not placeholder-only), inline validation on blur, error text under the field in danger color with icon, never clear a field on error, preserve input.
- **Autocomplete:** city/stop search tolerates typos and partial input, shows recent searches and saved places (Home/Work) when focused and empty, supports "Siliguri", "Silliguri" and "NJP".
- **Swap origin/destination** button with 250ms rotate animation.
- **Persistence:** keep search in URL (`/buses?from=KOL&to=SIL&date=2026-11-12&pax=2`) so links are shareable.
- **Optimistic UI** for wishlist, saving passengers and applying coupons, with rollback on failure.
- **Network:** offline banner, retry with backoff, request de-duplication, cached last results viewable offline, tickets always available offline once booked.
- **Accessibility (WCAG 2.2 AA):** 4.5:1 text contrast, visible 2px focus ring, full keyboard operation incl. seat map (arrow keys move, Space/Enter selects), `aria-live="polite"` for price/selection changes, seat buttons labelled "Seat L12, lower berth, window, ₹950, available", skip link, semantic landmarks, no color-only meaning, form errors linked via aria-describedby.
- **i18n:** all strings externalised, Hindi + Bengali + Tamil + Telugu ready, layouts tolerate 40% longer text.
- **Performance budget:** LCP < 2.5s on 4G, JS < 200KB initial, images AVIF/WebP with explicit width/height (no layout shift), lazy-load below fold, route-level code splitting, results virtualised after 30 items.
- **Microcopy tone:** friendly, short, Indian-English, no jargon. Examples later in section 8.

## 4. SITE MAP

Public: Home · Search Results · Bus Details · Seat Selection · Boarding/Dropping · Passenger Details · Review & Offers · Payment · Booking Confirmation · Routes Directory · Route Landing (SEO) · Destination Landing · Offers · Help Centre / FAQ · Contact · About · Terms · Privacy · Cancellation Policy · 404 · 500 · Maintenance.

Account: Login / OTP · Sign-up · Profile · Saved Passengers · My Bookings (Upcoming/Completed/Cancelled) · Ticket Detail · Live Tracking · Cancel Booking · Modify/Reschedule · Refund Status · Wallet & Rewards · Notifications · Reviews & Ratings · Settings (language, notifications, privacy).

Post-booking: Manage Booking (guest lookup by PNR + phone) · Download/Share Ticket · Invoice · Raise Support Ticket · Rate Your Trip.

Admin and Fleet Operator portals: Dashboard · Routes & Schedules · Buses & Seat Layout Builder · Pricing & Offers · Bookings · Passenger Manifest · Cancellations & Refunds · Reports · Users & Roles · Audit Log · Settings.

## 5. PAGE-BY-PAGE SPECIFICATION (CUSTOMER)

For **every** page below, build: **Default → Loading (skeleton) → Empty → Error → Success/Partial**, on mobile and desktop.

### 5.1 Home (existing design, refine)
- **Hero:** headline "Your Journey, Your Way." with orange accent, one-line sub, search card overlapping hero bottom. Search card: From, swap, To, Journey Date, Return Date (optional, "+ Add Return"), Passengers, Search Buses (orange). Quick-pick chips below ("Kolkata → Siliguri" …) populated from real popular routes.
- Sections in order: Trust strip (verified operators, seat locking, ₹0 fee *if true*, 24×7 support) · Popular Routes (price from, duration, departures/day, "Book Seats") · Top Destinations (real, relevant photos only; each with state, tagline, connecting routes, price from) · Highway Explorer map · How it works (3 steps) · Reviews · Offers/Newsletter · Footer.
- **Fixes to apply from the current build:** remove the large blank gap between hero and "Why travellers choose"; make sure each destination image matches its city (Varanasi ghats, Jaipur Hawa Mahal, not generic vans or festival crowds); show the top announcement bar only if it carries a real, dated offer; move "Admin Portal" out of the customer header into the footer or a separate subdomain.
- **Returning-user variant:** "Continue your search", recent searches, upcoming trip card with countdown and "Track bus" button.
- **Loading:** hero and search card render instantly (static). Routes/Destinations/Reviews use skeleton cards.
- **Empty:** if no popular routes, show "Search any route to get started" with 3 static suggestion chips.
- **Error:** section-level inline error with "Try again" (don't break the whole page).

### 5.2 Search Results
- **Sticky summary bar:** From → To, date, pax, "Modify" (opens inline editor, not a new page). Date strip with ±3 days and lowest fare per day (greyed + "No buses" on empty days, unavailable dates clearly styled).
- **Filters (left rail desktop / bottom sheet mobile):** Bus type (AC/Non-AC, Sleeper/Seater/Semi-sleeper, Volvo/Multi-axle), Departure time buckets, Arrival time buckets, Price slider (with histogram), Operators, Rating 4+, Amenities (charging, blanket, water, WiFi, reading light), Live tracking, Ladies-seat available, Boarding/Dropping points. **Multi-select works and results update live**; show active filter chips with "Clear all". Show count per option and result count in the sheet's apply button ("Show 38 buses").
- **Sort:** Recommended, Cheapest, Fastest, Earliest, Latest, Top rated.
- **Bus card (scan-friendly):** Operator + bus type · Rating pill + review count · Departure time/point → duration → arrival time/point (+1 day marker) · Seats left (urgent style under 6) · Price "from ₹X" with strike-through if discounted · Amenity icons (max 4 + "+3") · Badges (Bestseller, Free cancellation until…, Live tracking) · **CTA "Select Seats"**. Expand "Details" inline for photos, route stops, policies, reviews without leaving the page.
- Only show buses that have **at least the required number of seats** for the chosen passenger count.
- Seat-map thumbnail or "12 window seats left" teaser optional on desktop.
- **Loading:** progress message ("Checking live seats with operators…") + 6 BusCard skeletons; stream results in as they arrive; filter rail skeleton.
- **Empty (no buses):** illustration, "No buses from Kolkata to Siliguri on 12 Nov", then actions: try nearby dates (show cheapest), remove filters, nearby cities/boarding points, "Notify me when buses are added".
- **Empty after filtering:** "No buses match your filters", show which filter is most restrictive, one-tap "Remove [filter]".
- **Error:** "We couldn't load buses. This is on us, not you." with Retry and cached results if present.
- **Partial:** some operators timed out; show results + inline notice "Some operators are slow to respond. Refresh to include them."

### 5.3 Seat Selection (the most important screen)
- Realistic bus layout: driver cabin, door, aisle, lower and upper deck (tabs on mobile, side-by-side on desktop), seat/berth numbering, window marker.
- **Legend** always visible. Seat states: available, selected, booked, ladies-only, held-by-someone-else, blocked. Seat-level price on each seat or on tap/hover, **price filter chips on the map** (e.g., "Under ₹800", "₹800–1,000", "Premium").
- Tooltip/sheet on seat: number, type, window/aisle, price, "Ladies-only" rule.
- Selection feedback: 150ms scale + check, haptic on mobile (`navigator.vibrate(10)`), live-region announcement.
- Right panel (desktop) / sticky bottom bar (mobile): Selected seats list, running fare, "Continue" disabled until the number of seats equals passenger count, with helper text "Select 1 more seat".
- Rules enforced with clear messages: max 6 seats, ladies seat can't be adjacent to a male-only booking, single-seat gaps warning (optional).
- **Seat hold timer** starts at Continue ("Seats held for 08:00"); warning at 2:00; on expiry modal "Your hold expired. Seats may still be free: Re-select".
- Cancellation policy summary card visible here (timeline: free until X, 50% until Y, none after).
- **Loading:** seat grid skeleton in bus outline shape; legend and header real.
- **Empty/sold out:** "Sold out while you were choosing" + similar buses list.
- **Conflict (race):** if a chosen seat gets booked mid-selection, shake the seat, unselect, toast "Seat L12 was just booked", keep the others.
- **Error:** seat map fails → retry + "View other buses".

### 5.4 Boarding & Dropping Points
- Two tabs/steps: Boarding, Dropping. Searchable list with time, landmark, distance from user (if location permitted), and a mini-map pin (OSM). Default to nearest. Show contact number for the pickup point and "Be there 15 min early".
- **Loading:** list skeletons. **Empty:** "No pickup points listed. Contact operator" + number. **Error:** retry.

### 5.5 Passenger Details
- Per seat: Name, Age, Gender (required for ladies-seat check), optional ID for state-mandated routes. **Saved passengers** picker. Contact: Phone (OTP-verified for guests) and Email, with "Tickets sent here" helper. WhatsApp updates opt-in checkbox.
- State GST details collapsible ("I have a GST number").
- Persistent right-hand **booking summary** (route, times, seats, fare breakdown) from this step through payment.
- Inline validation on blur; focus the first invalid field on submit; never wipe fields.
- **Loading:** form skeleton only for saved-passenger fetch. **Error:** if a saved passenger fails to load, the form still works.

### 5.6 Review & Offers
- Trip recap (editable links back to seats/points without losing data), fare breakdown, **coupon field** (apply with optimistic update, clear success/failure messages, show best available offers as tappable chips), insurance/add-ons as *unchecked by default* (no dark patterns), cancellation policy again, Terms checkbox.
- **Coupon states:** idle, applying, applied (shows savings), invalid (reason: expired / min. booking ₹300 / not applicable to this route).

### 5.7 Payment
- Methods: UPI (intent + QR + VPA), Cards, Netbanking, Wallets, Pay Later. UPI first. Secure-payment badges, total always visible, countdown continues.
- States: Processing (full-screen but cancelable after 20s with explainer "Don't press back"), **Pending** (UPI approval waiting, auto-poll, "Check status"), **Failed** (reason + "Try another method", seats still held), **Timeout** (money-deducted-but-unconfirmed message with reference and guaranteed auto-refund timeline), **Success → confirmation**.

### 5.8 Booking Confirmation / E-Ticket
- Success with a calm animation (reduced-motion safe). PNR, QR, route, times, seats, boarding point with map link, operator contact, driver/vehicle number (when available), cancellation policy, "Add to Calendar", "Share on WhatsApp", "Download PDF", "Track bus" (when live). Prompt to create an account if guest.
- Ticket must work **offline** and print cleanly.
- **Loading:** "Confirming your seats with the operator…" (never show success before confirmation). **Error:** "Payment received, ticket pending", reference + support CTA.

### 5.9 My Bookings & Ticket Detail
- Tabs Upcoming · Completed · Cancelled. Booking card with route, date, status chip, quick actions (Ticket, Track, Cancel, Rebook). Search by PNR.
- **Empty states per tab** (Upcoming: "No trips planned yet" + Search CTA; Completed: "Your finished trips will appear here"; Cancelled: "No cancelled bookings").
- **Skeleton:** 3 booking cards.

### 5.10 Live Tracking
- Map with bus marker, route line, ETA to your boarding point, last-updated stamp, driver/vehicle info, share-tracking link. States: tracking not started ("Tracking begins 2 hours before departure"), live, signal lost (last seen X min ago), trip completed.

### 5.11 Cancel & Refund
- Steps: choose passengers/seats → show **refund calculator** (amount, deductions, timeline, destination account) → reason (optional) → confirm. Status page with timeline (Initiated → Processing → Credited) and expected date. Non-cancellable bookings show why.

### 5.12 Reviews & Support
- Post-trip rating (stars + tags: punctual, clean, driver behaviour, AC) with skip option. Help Centre with search, topic cards, FAQ accordions, contact options (call, chat, email), raise-ticket form, ticket status list.

### 5.13 Auth
- Phone/email + OTP (6-digit, auto-advance, paste support, resend timer 30s, auto-read SMS via WebOTP). Social login optional. States: invalid OTP, expired, too many attempts (cooldown), network error. Guest checkout allowed.

### 5.14 SEO & Content pages
- **Route landing** (`/bus/kolkata-to-siliguri`): live results module, price calendar, operators list, timetable, travel tips, FAQs with schema markup. **Destination landing**: highlights, how to reach by bus, connecting routes. **Routes directory**: A–Z and state-wise.
- Static legal pages with sticky table of contents.

### 5.15 System pages
- 404 (search box + popular routes), 500 (retry + status link), Maintenance (ETA, subscribe), Offline, Session expired (preserve work, re-login modal), Permission-denied (location).

## 6. ADMIN AND FLEET OPERATOR PORTAL

Dense, desktop-first (min 1024px), sidebar nav, table-centric, keyboard-friendly. Role-based visibility (Super Admin, Admin, Fleet Owner, Support Agent, Finance).
- **Dashboard:** KPI cards (bookings, revenue, occupancy %, cancellations, refunds pending), date-range picker, trend chart, top routes, alerts. Skeleton for cards and charts.
- **Bookings table:** search, filters, saved views, column chooser, bulk actions, row drawer with full detail, export CSV. Empty: "No bookings in this range". Loading: row skeletons.
- **Seat Layout Builder:** drag/drop seats, sleeper/seater, decks, ladies seats, preview as customer.
- **Routes & Schedules:** stops, timings, recurrence, holidays, price rules (dynamic per seat type).
- **Passenger manifest** (printable, per trip) and **boarding checklist**.
- **Cancellations & Refunds:** queue with SLA timers.
- **Reports, Users & Roles, Audit Log, Settings.**
- Destructive actions: typed confirmation for deletions; undo toast for reversible changes; unsaved-changes guard.
- Table states: loading, empty, filtered-empty, error, no-permission.

## 7. STATE LIBRARY (build these as reusable components)

### 7.1 Skeletons
- Match the **real layout shape** to avoid layout shift. Shimmer 1.4s linear (disable for reduced-motion, use static tint).
- Variants: `SkeletonBusCard`, `SkeletonSeatMap`, `SkeletonRouteCard`, `SkeletonDestinationCard`, `SkeletonBookingCard`, `SkeletonTicket`, `SkeletonForm`, `SkeletonTableRow`, `SkeletonStatCard`, `SkeletonMap`, `SkeletonTextBlock`, `SkeletonAvatar`.
- Rules: show skeleton only if loading > 200ms (avoid flicker) and keep it at least 400ms once shown; replace with content via a 150ms fade; for lists, show 6 on desktop, 4 on mobile; add progress copy for slow operations (>3s).

### 7.2 Empty states
Anatomy: simple illustration (consistent line style), title, one sentence of explanation, **one primary action**, optional secondary link. Required list: no buses, no filter match, sold out, no bookings (×3 tabs), no saved passengers, no notifications, no offers, no wallet transactions, no reviews yet, no search history, no tracking yet, empty admin tables, no results for support search.

### 7.3 Error states
Types: inline field, section-level, full-page, toast, banner. Required list: network offline, timeout, 4xx/5xx, search failed, seat-map failed, seat just taken, hold expired, payment failed/pending/timeout, coupon invalid, OTP invalid/expired, session expired, geolocation denied, map tiles failed (fallback to list), image failed (neutral placeholder), unsupported browser. Each includes cause, next action, and a reference ID for support when relevant.

### 7.4 Success and info states
Booking confirmed, refund initiated, coupon applied, passenger saved, review submitted, subscribed to newsletter, notification-me set. Inline banners for: price changed since search (show old vs new, require re-confirmation), fewer seats left, operator delay, schedule change.

### 7.5 Other
Offline mode, slow-network mode (reduce images, disable map autoload), permission prompts (location, notifications) with pre-permission explainer, first-run onboarding tooltips (max 3, dismissible), cookie/consent banner, PWA install prompt (after first successful booking only), app-update available.

## 8. MICROCOPY EXAMPLES

- Search loading: "Checking live seats across 5,200+ operators…"
- No buses: "No buses on 12 Nov. The next available is 13 Nov from ₹690."
- Seat just taken: "Seat L12 was just booked. Pick another, we kept your other seats."
- Hold expiring: "2:00 left to keep your seats."
- Payment pending: "Waiting for your UPI approval. Don't close this page."
- Payment unconfirmed: "Your money is safe. If no ticket is issued in 15 minutes, it's refunded automatically. Ref: YB-48213."
- Coupon invalid: "SAVE250 needs a booking of ₹1,000 or more. Add ₹150 to unlock it."
- Offline: "You're offline. Your tickets are still available below."
- Generic error: "Something went wrong on our side. Try again, and if it continues, quote ref YB-xxxxx."

## 9. RESPONSIVE BEHAVIOUR

- **Mobile:** single column, sticky bottom CTA with price, filters/sort as bottom sheets, seat map decks as tabs, date strip horizontally scrollable, bottom nav, thumb-zone actions.
- **Tablet:** two-column results (filters collapse to drawer).
- **Desktop:** 3-column results (filters · list · optional map/summary), side-by-side decks, persistent booking summary.
- Test at 360, 390, 768, 1024, 1440. No horizontal scroll at any width.

## 10. DATA, TECH AND QUALITY REQUIREMENTS

- Stack: React + TypeScript, Tailwind (tokens above), React Query for server state with stale-while-revalidate, Zustand/Context for booking session, React Hook Form + Zod, Leaflet + OpenStreetMap, i18next, Playwright + Axe for tests.
- Mock API layer with realistic delays (300ms–2s), plus switches to **force** loading, empty, error, partial and conflict states so every state is demoable (`?state=empty`).
- Seed data: 12+ real Indian routes, 30+ buses with varied types, seat layouts (2+1 sleeper, 2+2 seater, 1+2 Volvo), realistic prices (₹350–₹1,800), Indian names, IST times, overnight arrivals.
- Analytics events for each funnel step and each error/empty state (search → results → seat → passenger → payment → confirm).
- Security/UX: no card data in app state, idempotent payment calls, rate-limited OTP, PII masked in ticket sharing.

## 11. DELIVERABLES AND ORDER OF WORK

1. Design tokens + component library with Storybook-style demo page showing every component and every state.
2. Home → Search Results → Seat Selection → Passenger → Review → Payment → Confirmation (full happy path + all states).
3. Account area (My Bookings, Ticket, Tracking, Cancel/Refund).
4. Content/SEO/system pages.
5. Admin & Operator portal.
6. Accessibility, performance and responsive pass; fix anything failing section 3.

After each phase, list: pages built, states covered, anything deliberately skipped, and open questions. Ask before inventing business rules (fees, cancellation slabs, refund timelines).

## 12. ACCEPTANCE CHECKLIST

- [ ] Every page has default, loading, empty, error and success/partial states
- [ ] Price never changes between results, seat map, review and payment without a visible notice
- [ ] Back/refresh never loses search, filters, seats or form input
- [ ] Seat map is keyboard- and screen-reader-operable; states don't rely on color alone
- [ ] Skeletons match final layouts; no layout shift (CLS < 0.1)
- [ ] All errors have a cause, a next action and (where relevant) a reference ID
- [ ] Hold timer, payment pending/timeout, and seat-conflict flows work
- [ ] Verified at 360px and 1440px; no horizontal scroll
- [ ] Marketing claims are backed by data flags
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95 on Home, Results, Seat Selection