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
- [ ] **AUTH-07**: Blocking Subscription Gate routes unsubscribed authenticated users to the website to subscribe, allowing dynamic check-payment re-verifications.

#### Establishment Selection & Standalone Flow

- [ ] **ESTB-01**: Standalone selection screen `/establishments` shown on startup if no active establishment is selected, listing all associated user establishments using `GET /user/establishment/list-establishment-user`.
- [ ] **ESTB-02**: Selecting an establishment saves its `id` securely in local storage (`active_establishment_id`) and redirects the user immediately to the main dashboard.
- [ ] **ESTB-03**: App displays a clear empty state with instructions and a logout button if 0 establishments are linked.

### Web-Style Navigation Drawer

- [ ] **NAV-01**: Sliding left-side navigation drawer styled with a premium white background (`#ffffff`), right border, and clean text colors.
- [ ] **NAV-02**: Profile header card at the top displaying operator name and profile info wrapper.
- [ ] **NAV-03**: Vertical menu representing the modules, highlighting the active module with a dark rounded card (`#0f172a` background and white text/icon).
- [ ] **NAV-04**: Menu features dedicated "Estabelecimentos" (redirects back to selection `/establishments`) and "Sair" (logout) triggers at the bottom.

### Vehicles & Registro (CRUD)

- [ ] **VEHC-01**: Primary dashboard screen ("Registro") with a "NOVO REGISTRO" teal button, recently added vehicles table, and instant coupon printing on completion.
- [ ] **VEHC-02**: Attendant can list vehicles in the active establishment using `GET /user/vehicle/list?establishmentId=...`.
- [ ] **VEHC-03**: Attendant can delete vehicles using `DELETE /user/vehicle/delete/{id}`.
- [ ] **VEHC-04**: Attendant can create a vehicle wash registration via `POST /user/vehicle/create` including basic details (plate, model, color), price, custom discount, and selected services.
- [ ] **VEHC-05**: Attendant can attach a company ID (`companyId`) associated with the registration from a list.
- [ ] **VEHC-06**: Automatic thermal coupon printing via BLE immediately upon successful vehicle registration.

### Categories Module (CRUD)

- [ ] **CAT-01**: Attendant can list categories using `GET /user/category/list?establishmentId=...`.
- [ ] **CAT-02**: Attendant can create a new category using `POST /user/category/create`.
- [ ] **CAT-03**: Attendant can update existing categories using `PUT /user/category/update`.
- [ ] **CAT-04**: Attendant can delete categories using `DELETE /user/category/delete/{id}`.

### Services Module (CRUD)

- [ ] **SVC-01**: Attendant can list services using `GET /user/service/list?establishmentId=...`.
- [ ] **SVC-02**: Attendant can create new services using `POST /user/service/create`.
- [ ] **SVC-03**: Attendant can update existing services using `PUT /user/service/update`.
- [ ] **SVC-04**: Attendant can delete services using `DELETE /user/service/delete/{id}`.

### Companies Module (CRUD)

- [ ] **COM-01**: Attendant can list companies using `GET /user/company/list`.
- [ ] **COM-02**: Attendant can create a new company using `POST /user/company/create`.
- [ ] **COM-03**: Attendant can update existing companies using `PUT /user/company/update`.
- [ ] **COM-04**: Attendant can delete companies using `DELETE /user/company/delete/{id}`.

---

## Out of Scope

| Feature                       | Reason                                                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| In-App Password Recovery      | Redirected to the web portal.                                                                                          |
| Complex Financial Analytics   | Deferred to the main administrative web dashboard.                                                                     |
| In-App Profile Management     | Handled completely on the web dashboard.                                                                               |
| In-App Subscription Mgmt      | Handled completely on the web dashboard.                                                                               |
| In-App Configs / Settings     | Handled completely on the web dashboard.                                                                               |

---

## Traceability

| Requirement | Phase                                    | Status  |
| ----------- | ---------------------------------------- | ------- |
| AUTH-01     | Phase 1: Authentication & Core Setup     | Complete|
| ESTB-01     | Phase 2: Standalone Selection & Drawer   | Pending |
| ESTB-02     | Phase 2: Standalone Selection & Drawer   | Pending |
| ESTB-03     | Phase 2: Standalone Selection & Drawer   | Pending |
| NAV-01      | Phase 2: Standalone Selection & Drawer   | Pending |
| NAV-02      | Phase 2: Standalone Selection & Drawer   | Pending |
| NAV-03      | Phase 2: Standalone Selection & Drawer   | Pending |
| NAV-04      | Phase 2: Standalone Selection & Drawer   | Pending |
| VEHC-01     | Phase 3: Registro & Vehicles CRUD        | Pending |
| VEHC-02     | Phase 3: Registro & Vehicles CRUD        | Pending |
| VEHC-03     | Phase 3: Registro & Vehicles CRUD        | Pending |
| VEHC-04     | Phase 3: Registro & Vehicles CRUD        | Pending |
| VEHC-05     | Phase 3: Registro & Vehicles CRUD        | Pending |
| VEHC-06     | Phase 3: Registro & Vehicles CRUD        | Pending |
| CAT-01      | Phase 4: Categories CRUD Module          | Pending |
| CAT-02      | Phase 4: Categories CRUD Module          | Pending |
| CAT-03      | Phase 4: Categories CRUD Module          | Pending |
| CAT-04      | Phase 4: Categories CRUD Module          | Pending |
| SVC-01      | Phase 5: Services CRUD Module            | Pending |
| SVC-02      | Phase 5: Services CRUD Module            | Pending |
| SVC-03      | Phase 5: Services CRUD Module            | Pending |
| SVC-04      | Phase 5: Services CRUD Module            | Pending |
| COM-01      | Phase 6: Companies CRUD Module           | Pending |
| COM-02      | Phase 6: Companies CRUD Module           | Pending |
| COM-03      | Phase 6: Companies CRUD Module           | Pending |
| COM-04      | Phase 6: Companies CRUD Module           | Pending |

---

_Last updated: 2026-05-27_
