# Roadmap: StepCar Native Mobile App

## Overview

This roadmap orchestrates the step-by-step transition of StepCar into a fully native-first application modeled directly after the premium Web Dashboard. The development is organized into 6 operational phases to ensure structured feature deployment, continuous testing, and absolute stability.

## Phases

- [x] **Phase 1: Authentication & Core Setup** - Initialize API clients, interceptors, secure token storage, and premium native Auth screens.
- [x] **Phase 2: Standalone Selection & Drawer** - Build the standalone establishment selector screen and the premium white sliding navigation drawer.
- [x] **Phase 3: Registro & Vehicles CRUD** - Build the main operational Registro dashboard with CRUD for vehicles, company selector, and BLE receipt printing.
- [x] **Phase 4: Categories CRUD Module** - Implement listing, creating, updating, and deleting of service categories.
- [x] **Phase 5: Services CRUD Module** - Implement listing, creating, updating, and deleting of services.
- [x] **Phase 6: Companies CRUD Module** - Implement listing, creating, updating, and deleting of partner companies.
- [x] **Phase 7: Financeiro Dashboard** - Implement financial dashboard with stats, metrics, and graphs based on a date range picker.
- [ ] **Phase 8: Employee Login & Permissions** - Implement employee email login and restrict delete/edit/create actions.

---

## Phase Details

### Phase 1: Authentication & Core Setup

**Goal**: Establish a bulletproof secure authentication system and API core.
**Depends on**: Nothing
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07
**Success Criteria**:
1. User can natively log in and register, storing credentials securely.
2. Expired tokens are refreshed silently in the background on API requests.
3. Forgot Password redirects the user to the main website securely.
4. Unsubscribed authenticated users are blocked natively and directed to the website to subscribe.

**Plans**:
- [x] 01-01: Setup API client, Axios instance, secure storage, and JWT token refresh interceptor.
- [x] 01-02: Build native login and native registration UI screens using custom premium inputs.
- [x] 01-03: Implement forgot password secure web browser redirect directly to stepcar.com.br.
- [x] 01-04: Build the native Subscription Gating screen and hook up background validation checks.

### Phase 2: Standalone Selection & Drawer

**Goal**: Build a standalone establishment selection screen and a web-dashboard aligned left sliding drawer navigation layout.
**Depends on**: Phase 1
**Requirements**: ESTB-01, ESTB-02, ESTB-03, NAV-01, NAV-02, NAV-03, NAV-04
**Success Criteria**:
1. User is guided to the standalone `/establishments` selection page if no establishment is active.
2. Selecting an establishment persists the selection in secure store and routes immediately to the dashboard.
3. Dashboard features a left-sliding navigation drawer styled with a white background and operator profile header at the top.
4. Menu highlights the active module with a dark rounded card (`#0f172a`), matching the web design exactly.
5. Bottom triggers in the drawer successfully go back to `/establishments` or logout the session.

**Plans**:
- [x] 02-01: Implement standalone `/establishments` selection view and empty state check with manual secure store rehydration.
- [x] 02-02: Build the left sliding side-drawer component using the premium white web-aligned aesthetic (active module card in `#0f172a` and bottom triggers).

### Phase 3: Registro & Vehicles CRUD

**Goal**: Implement the primary Registro view, vehicle CRUD, company selection, and auto BLE coupon printing, optimized for native mobile-first layouts.
**Depends on**: Phase 2
**Requirements**: VEHC-01, VEHC-02, VEHC-03, VEHC-04, VEHC-05, VEHC-06
**Success Criteria**:
1. Primary operational screen presents the "Registro" dashboard optimized for mobile UX (teal primary "NOVO REGISTRO" button, recently added vehicles styled as card widgets with clear status indicators, and swipe actions).
2. Attendant can list, register, edit, and delete vehicles in the active establishment.
3. Vehicle registration includes an optional company selector.
4. Completing a registration automatically connects to the BLE printer and prints the wash coupon receipt.

**Plans**:
- [x] 03-01: Build "Registro" dashboard screen with "NOVO REGISTRO" teal button and recently added vehicles card-list layout featuring pull-to-refresh.
- [x] 03-02: Build native create/edit vehicle forms including progressive category/services choice and company selector using custom bottom sheets or full-screen modals.
- [x] 03-03: Connect BLE auto-print trigger immediately upon successful vehicle registration.

### Phase 4: Categories CRUD Module

**Goal**: Build full native, mobile-first CRUD management for service categories.
**Depends on**: Phase 2
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04
**Success Criteria**:
1. Attendant can list service categories in a highly-readable native card layout.
2. Attendant can create, update, and delete categories natively using mobile-optimized forms and swipe-to-delete patterns.

**Plans**:
- [ ] 04-01: Build Categories list mobile card screen and detailed overlay sheet.
- [ ] 04-02: Implement Category Create, Edit, and Delete forms and mutations.

### Phase 5: Services CRUD Module

**Goal**: Build full native, mobile-first CRUD management for services.
**Depends on**: Phase 4
**Requirements**: SVC-01, SVC-02, SVC-03, SVC-04
**Success Criteria**:
1. Attendant can list services inside the active establishment in a native card list.
2. Attendant can create, update, and delete services natively using mobile-optimized forms and swipe-to-delete patterns.

**Plans**:
- [ ] 05-01: Build Services list card screen and details modal.
- [ ] 05-02: Implement Service Create, Edit, and Delete forms and mutations.

### Phase 6: Companies CRUD Module

**Goal**: Build full native, mobile-first CRUD management for partner companies.
**Depends on**: Phase 2
**Requirements**: COM-01, COM-02, COM-03, COM-04
**Success Criteria**:
1. Attendant can list associated companies in a native mobile card list.
2. Attendant can create, update, and delete companies natively using mobile-optimized forms and swipe-to-delete patterns.

**Plans**:
- [ ] 06-01: Build Companies list card screen and details modal.
- [ ] 06-02: Implement Company Create, Edit, and Delete forms and mutations.

### Phase 8: Employee Login & Permissions

**Goal**: Support employee accounts with restricted edit/delete privileges natively.
**Depends on**: Phase 6
**Requirements**: EMP-01, EMP-02, EMP-03, EMP-04
**Success Criteria**:
1. Login flow accepts employees (`type_user === 'EMPLOYEE'`).
2. Delete action is hidden across Vehicles, Categories, Services, Companies for employees.
3. Edit action is hidden across Vehicles, Categories, Services, Companies for employees.
4. Create action is hidden for Companies for employees.

**Plans**:
- [ ] 08-01: Adapt login flow and API hooks to accept Employee users and store role in Auth context.
- [ ] 08-02: Implement UI conditional rendering (hide edit/delete/create where necessary) based on the user role.

---

## Progress

| Phase                              | Plans Complete | Status      | Completed  |
| ---------------------------------- | -------------- | ----------- | ---------- |
| 1. Authentication & Core Setup     | 4/4            | Complete    | 2026-05-26 |
| 2. Standalone Selection & Drawer   | 2/2            | Complete    | 2026-05-27 |
| 3. Registro & Vehicles CRUD        | 3/3            | Complete    | 2026-05-27 |
| 4. Categories CRUD Module          | 2/2            | Complete    | 2026-05-29 |
| 5. Services CRUD Module            | 2/2            | Complete    | 2026-05-29 |
| 6. Companies CRUD Module           | 3/3            | Complete    | 2026-05-29 |
| 7. Financeiro Dashboard            | 2/2            | Complete    | 2026-05-29 |
| 8. Employee Login & Permissions    | 0/2            | Pending     | -          |

---

## Next Steps

1. **Phase 8: Employee Login & Permissions** - Implement the Employee Login & Permissions features to replicate the access control from the web platform.

---

_Last updated: 2026-06-08_
