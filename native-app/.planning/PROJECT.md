# Project: StepCar Native Mobile App

## Current Milestone: v5.0 Empresas Redesign & New Features

**Goal:** Implement the new "Empresas" features in the native app, matching the recently redesigned companies module in web-stepcar (including the company main page summary and all the new endpoints).

**Target features:**
- Integrate the native app with the new "empresas-redesign-new-features" endpoints.
- Replicate the new company main page summary and screens from web-stepcar to the native mobile app.
- Ensure the native app's "Empresas" CRUD flow matches the updated web-stepcar logic.

## What This Is

StepCar is a fully native mobile application converted from the StepCar Web Dashboard. It integrates directly with the StepCar API to provide a high-performance, offline-ready native experience for vehicle wash and parking management.

## Core Value

To provide an ultra-fast, premium native registration flow for vehicles and a seamless, bulletproof Bluetooth thermal printing experience that matches the layout, white design pattern, and operational convenience of the web application.

## Requirements

### Validated

- **Auth Suite**: Native login, registration, token refresh, secure token persistence. (Complete)

### Active

- [ ] **Employee Login Flow**: Adapt the authentication screens to support email/password login for employees (`type_user === 'EMPLOYEE'`).
- [ ] **Roles & Permissions**: Apply conditional rendering across all CRUD modules to hide delete, update, and creation actions if the authenticated user is an employee, replicating the `web-stepcar` logic.
- [ ] **Establishment Selection & Standalone Flow**: A dedicated establishment selection screen `/establishments` shown on startup if no establishment is selected. Selecting an establishment persists the choice and redirects the user to the main dashboard.
- [ ] **Web-Style Sidebar Drawer**: A beautiful sliding drawer menu on the left side of the dashboard, styled with the premium white design pattern from the web app:
  - White background (`#ffffff`) with right border.
  - Attendant profile header card at the top.
  - Vertical menu items matching the 5 active web modules: Registro, Categorias, Serviços, Empresas, Veículos (with active module styled in a dark rounded card `#0f172a` with white text and icon).
  - Bottom triggers: "Estabelecimentos" (to go back to `/establishments`), "Sair" (logout).
- [ ] **MVP CRUD Modules (Native Mobile Optimized)**:
  - **Veículos / Registro**: Primary screen ("Registro" menu item) with "NOVO REGISTRO" teal button, recently added vehicles mobile card list, and instant coupon printing on completion. Supports listing, editing, and deleting vehicles natively.
  - **Categorias**: Listing, creating, updating, and deleting service categories.
  - **Serviços**: Listing, creating, updating, and deleting services.
  - **Empresas**: Listing, creating, updating, and deleting partner companies.
  - **Veículos**: Listing, creating, updating, and deleting vehicles.
- [ ] **Company Selection in Registration**: attachment of an associated company to a vehicle during registration using the `companyId` API field.
- [ ] **Automated Coupon Printing**: Auto-connect and instant printing of receipt coupon via BLE upon successful vehicle registration.
- [ ] **Empresas Redesign & Flow**: Update native app "Empresas" module to match web-stepcar redesign, including main page summary, full CRUD flow using new endpoints.

### Out of Scope

- **Password Recovery in App**: Redirected to the web platform.
- **Complex Financial Analytics Charts**: Handled on the admin web dashboard.
- **Profile Management**: Handled completely on the web dashboard.
- **Subscription Management**: Handled completely on the web dashboard.
- **App Configurations / General Settings**: Handled completely on the web dashboard.

## Context

- **Legacy State**: Transitioned from a legacy WebView wrapper to a premium native experience.
- **Target Users**: Car wash operators and parking lot attendants who need high-speed entry and immediate coupon printing at checkout.
- **Design Directive**: Native mobile-first design (shaped specifically for mobile UX using elegant cards, swipable lists, custom inputs, and modals, rather than forcing a desktop-table or responsive web layout). It maintains the premium white theme of the web dashboard with `#0f172a` selection tags.

## Constraints

- **Hardware Integration**: Uses standard Bluetooth Classic/BLE thermal printers (58mm/80mm paper widths).
- **Authentication Protocol**: JWT Bearer tokens with automated Axios background refresh interceptors.
- **SDK Stability**: Standardized on Expo SDK 52 and Expo Router v4.
- **Git Commit Policy**: The user handles all Git commits manually. AI agents must NEVER run git commit or staging commands.

## Key Decisions

| Decision                    | Rationale                                                                                                                 | Outcome     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **Zustand + React Query**   | Zustand handles local UI state and React Query manages server-side API caching and pagination.                            | — Validated |
| **Expo Router v4**          | Provides standard file-based routing supporting modular dashboards and standalone gating screens natively.                 | — Validated |
| **Custom ESC/POS Chunking** | Raw byte transmission over BLE requires chunking into 20-byte payloads to support legacy thermal printers.                | — Validated |

- Always check how is being done in the webstecar repo (web-stepcar) before building a new feature for mobile app

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-06-10 after starting milestone v5.0 Empresas Redesign & New Features_
