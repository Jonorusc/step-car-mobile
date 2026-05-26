# Roadmap: StepCar Native Mobile App

## Overview
This roadmap orchestrates the step-by-step transition of StepCar from a legacy WebView-wrapper mobile app into a fully native-first application. The development is organized into 6 operational phases to ensure structured feature deployment, continuous testing, and absolute stability.

## Phases

- [ ] **Phase 1: Authentication & Core Setup** - Initialize API clients, interceptors, secure token storage, and premium native Auth screens.
- [ ] **Phase 2: Establishments & Session** - Build the establishment listing, native selector switcher, and persist session context.
- [ ] **Phase 3: Vehicle Hub & Search** - Implement the primary vehicle hub with infinite scroll, searching, advanced filtering, and details page.
- [ ] **Phase 4: Progressive Registration Wizard** - Redesign the 5-step vehicle registry wizard as a gorgeous native sliding stack with haptics.
- [ ] **Phase 5: Flagship Printing Hub** - Construct the premium Bluetooth printing scanner, receipt builder, connection diagnostics, and queue.
- [ ] **Phase 6: User Profile & Details** - Create the beautiful user profile view, listing subscriptions, permissions, and addresses.

---

## Phase Details

### Phase 1: Authentication & Core Setup
**Goal**: Establish a bulletproof secure authentication system and API core.
**Depends on**: Nothing
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria**:
  1. User can natively log in and register, storing credentials securely.
  2. Expired tokens are refreshed silently in the background on API requests.
  3. Forgot Password redirects the user to the main website (stepcar.com.br) securely.
**Plans**: 3 plans
Plans:
- [ ] 01-01: Setup API client, Axios instance, secure storage, and JWT token refresh interceptor.
- [ ] 01-02: Build native login and native registration UI screens using custom premium inputs.
- [ ] 01-03: Implement forgot password secure web browser redirect directly to stepcar.com.br.

### Phase 2: Establishments & Session
**Goal**: Build establishment selection and operational session initialization.
**Depends on**: Phase 1
**Requirements**: ESTB-01, ESTB-02, ESTB-03, ESTB-04
**Success Criteria**:
  1. Active establishment is loaded automatically and saved inside local storage.
  2. Users with multiple establishments can toggle between establishments smoothly.
**Plans**: 2 plans
Plans:
- [ ] 02-01: Connect `GET /user/establishment/list-establishment-user` to React Query and style establishment switcher card.
- [ ] 02-02: Manage global session context (active establishment) in Zustand and build custom empty states.

### Phase 3: Vehicle Hub & Search
**Goal**: Implement the primary vehicle activity dashboard, search, and details.
**Depends on**: Phase 2
**Requirements**: VEHC-01, VEHC-02, VEHC-03, VEHC-04, VEHC-05
**Success Criteria**:
  1. Attendant can scroll through hundreds of vehicles infinitely with zero latency.
  2. Searching and filters respond in real-time.
**Plans**: 2 plans
Plans:
- [ ] 03-01: Build vehicle list screen, React Query infinite hook, pull-to-refresh, and live text search filter.
- [ ] 03-02: Design the vehicle detailed view displaying historical services, prices, and vehicle properties.

### Phase 4: Progressive Registration Wizard
**Goal**: Implement the core 5-step native registration wizard for registering vehicles.
**Depends on**: Phase 3
**Requirements**: REGW-01, REGW-02, REGW-03, REGW-04, REGW-05, REGW-06
**Success Criteria**:
  1. Attendants can register a vehicle in under 30 seconds using the wizard.
  2. Visual selection transitions between categories and services are smooth and haptic-enabled.
**Plans**: 3 plans
Plans:
- [ ] 04-01: Create progressive wizard state machine in Zustand, implementing the sequence Basic Data → Category.
- [ ] 04-02: Implement Services selection step (filtered progressively) and details input step.
- [ ] 04-03: Create the final Summary screen, hook up the `POST /user/vehicle/create` mutation, and trigger success animations.

### Phase 5: Flagship Printing Hub
**Goal**: Redesign the printing experience into a premium, first-class native module.
**Depends on**: Phase 4
**Requirements**: PRNT-01, PRNT-02, PRNT-03, PRNT-04, PRNT-05, PRNT-06, PRNT-07
**Success Criteria**:
  1. Scanning animation displays nearby BLE thermal printers with signal RSSI.
  2. User can view high-fidelity receipt previews and tap to print or reprint from local logs.
  3. Queue manager retries automatically on bluetooth dropout.
**Plans**: 3 plans
Plans:
- [ ] 05-01: Set up specialized Zustand `useBLEStore` managing discovery, queues, and diagnostics.
- [ ] 05-02: Build Printing Hub UI, radar scanning visualization, recent jobs feed, and connection quality meter.
- [ ] 05-03: Implement the dynamic ESC/POS receipt rendering engine, 58mm/80mm preview components, and MTU data chunking.

### Phase 6: User Profile & Details
**Goal**: Build the operational user profile and account limits views.
**Depends on**: Phase 1
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04
**Success Criteria**:
  1. Logged-in user sees details of subscription, active period, and employee access.
  2. Addresses are rendered as premium visual cards.
**Plans**: 1 plan
Plans:
- [ ] 06-01: Bind `POST /user/auth/me` profile details to UI components, styling address listings and subscriptions.

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Authentication & Core Setup | 0/3 | Not started | - |
| 2. Establishments & Session | 0/2 | Not started | - |
| 3. Vehicle Hub & Search | 0/2 | Not started | - |
| 4. Progressive Registration Wizard | 0/3 | Not started | - |
| 5. Flagship Printing Hub | 0/3 | Not started | - |
| 6. User Profile & Details | 0/1 | Not started | - |

---
*Last updated: 2026-05-26*
