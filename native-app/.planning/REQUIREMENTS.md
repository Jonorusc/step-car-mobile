# Requirements: StepCar Native Mobile App

**Defined:** 2026-05-26  
**Core Value:** To provide an ultra-fast, premium native registration flow for vehicles and a seamless, bulletproof Bluetooth thermal printing experience that works offline.

---

## v1 Requirements

### Authentication
- [ ] **AUTH-01**: User can log in with email and password using `POST /user/auth/login`.
- [ ] **AUTH-02**: Session access token is stored securely using `expo-secure-store`.
- [ ] **AUTH-03**: App automatically refreshes expired or near-expiration tokens in the background using `POST /user/auth/refresh`.
- [ ] **AUTH-04**: User is redirected to the web browser to trigger "Forgot Password", and can return seamlessly to the app.
- [ ] **AUTH-05**: User can register an account natively.
- [ ] **AUTH-06**: Session persistency survives app termination and device restarts.

### Establishment Selection
- [ ] **ESTB-01**: User can view a listing of their associated establishments using `GET /user/establishment/list-establishment-user`.
- [ ] **ESTB-02**: User can switch active establishment through a premium switcher interface.
- [ ] **ESTB-03**: Selected establishment ID is persisted in local device memory.
- [ ] **ESTB-04**: App displays a clear empty state if the user has no associated establishments.

### Vehicle Management
- [ ] **VEHC-01**: User can view a paginated list of vehicles in the current establishment using `GET /user/vehicle/list?establishmentId=...`.
- [ ] **VEHC-02**: User can search vehicles by model, plate, or color.
- [ ] **VEHC-03**: User can filter the vehicle list by date range or price.
- [ ] **VEHC-04**: App implements standard pull-to-refresh and high-performance infinite scroll pagination.
- [ ] **VEHC-05**: User can view complete details of a selected vehicle (including services performed, dates, and discounts).

### Progressive Vehicle Registration Wizard
- [ ] **REGW-01**: 5-Step Progressive wizard structure: Basic Data → Category → Services → Details → Summary.
- [ ] **REGW-02**: Wizard fetches categories using `GET /user/category/list?establishmentId=...` and displays interactive category cards with visual icons.
- [ ] **REGW-03**: Wizard displays services progressive selection filtered by active categories using `GET /user/service/list?establishmentId=...&categoryIds=...`.
- [ ] **REGW-04**: User can input custom discount (in BRL/centavos), company identification, and metadata.
- [ ] **REGW-05**: User registers the vehicle via `POST /user/vehicle/create` and sees an elegant summary card.
- [ ] **REGW-06**: High-fidelity haptic feedback transitions upon step completion and registration success.

### Profile & Settings
- [ ] **PROF-01**: App displays logged-in user profile details using `POST /user/auth/me`.
- [ ] **PROF-02**: App visualizes active subscription plans, payment statuses (`active`/`inactive`), and expiration dates.
- [ ] **PROF-03**: User can view their list of registered addresses.
- [ ] **PROF-04**: App recognizes employee access limits and blocks or displays appropriate access states.

### Flagship Bluetooth Printing Hub
- [ ] **PRNT-01**: User has access to a dedicated "Printing Hub" dashboard within the primary navigation.
- [ ] **PRNT-02**: Scanning view features an immersive radar scanning animation showing live discovered BLE printers.
- [ ] **PRNT-03**: App automatically detects previously paired devices and handles seamless background auto-connection.
- [ ] **PRNT-04**: User can review beautiful, interactive receipt previews with custom layout configurations (58mm vs 80mm).
- [ ] **PRNT-05**: User can reprint past receipts from a "Recent Printed Jobs" archive, cached in local device storage.
- [ ] **PRNT-06**: Printing Hub displays real-time connection diagnostics (RSSI signal indicators, printer health, connection quality).
- [ ] **PRNT-07**: Robust print queue system that processes receipts asynchronously and supports retries on printer disconnections.

---

## v2 Requirements

### Advanced Features & Diagnostics
- **OFFL-01**: Offline Mode - User can save vehicle registration payloads in local device queue while disconnected and synchronize automatically once internet returns.
- **PRNT-08**: Dynamic receipt layout customization (e.g., custom logo image upload, personalized header message, custom margin configuration).
- **ANLT-01**: Offline analytics event queuing and batch-dispatching when system reconnects.

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| In-App Password Recovery | Deferred to website browser redirect to preserve web-based token validation mechanisms. |
| Category & Service Management | Administrative tools (creating new service items, editing base prices) remain on the web dashboard to keep the mobile experience lean and operational. |
| In-App Subscription Payment | Payments are handled on the desktop/mobile website to avoid app store commission overhead. |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1: Authentication & Core Setup | Pending |
| AUTH-02 | Phase 1: Authentication & Core Setup | Pending |
| AUTH-03 | Phase 1: Authentication & Core Setup | Pending |
| AUTH-04 | Phase 1: Authentication & Core Setup | Pending |
| AUTH-05 | Phase 1: Authentication & Core Setup | Pending |
| AUTH-06 | Phase 1: Authentication & Core Setup | Pending |
| ESTB-01 | Phase 2: Establishments & Session | Pending |
| ESTB-02 | Phase 2: Establishments & Session | Pending |
| ESTB-03 | Phase 2: Establishments & Session | Pending |
| ESTB-04 | Phase 2: Establishments & Session | Pending |
| VEHC-01 | Phase 3: Vehicle Hub & Search | Pending |
| VEHC-02 | Phase 3: Vehicle Hub & Search | Pending |
| VEHC-03 | Phase 3: Vehicle Hub & Search | Pending |
| VEHC-04 | Phase 3: Vehicle Hub & Search | Pending |
| VEHC-05 | Phase 3: Vehicle Hub & Search | Pending |
| REGW-01 | Phase 4: Progressive Registration Wizard | Pending |
| REGW-02 | Phase 4: Progressive Registration Wizard | Pending |
| REGW-03 | Phase 4: Progressive Registration Wizard | Pending |
| REGW-04 | Phase 4: Progressive Registration Wizard | Pending |
| REGW-05 | Phase 4: Progressive Registration Wizard | Pending |
| REGW-06 | Phase 4: Progressive Registration Wizard | Pending |
| PRNT-01 | Phase 5: Flagship Printing Hub | Pending |
| PRNT-02 | Phase 5: Flagship Printing Hub | Pending |
| PRNT-03 | Phase 5: Flagship Printing Hub | Pending |
| PRNT-04 | Phase 5: Flagship Printing Hub | Pending |
| PRNT-05 | Phase 5: Flagship Printing Hub | Pending |
| PRNT-06 | Phase 5: Flagship Printing Hub | Pending |
| PRNT-07 | Phase 5: Flagship Printing Hub | Pending |
| PROF-01 | Phase 6: User Profile & Details | Pending |
| PROF-02 | Phase 6: User Profile & Details | Pending |
| PROF-03 | Phase 6: User Profile & Details | Pending |
| PROF-04 | Phase 6: User Profile & Details | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0 ✓

---
*Last updated: 2026-05-26*
