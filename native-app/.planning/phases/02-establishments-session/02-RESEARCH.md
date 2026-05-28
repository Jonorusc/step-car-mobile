# Phase 2 Research: Establishments & Session

This document details the architectural design, API endpoints, state management strategy, and UI aesthetics for implementing Establishment Selection and Session Management in the StepCar Native App.

---

## 1. API Specifications

The establishment flow uses one primary endpoint:

### A. List Establishments (`GET /user/establishment/list-establishment-user`)

- **Method**: `GET`
- **Authentication**: Bearer Token required
- **Description**: Returns all establishments associated with the authenticated user.
- **Response Format (200 OK)**:
    ```json
    {
      "data": {
        "current_page": 1,
        "data": {
          "data": [
            {
              "id": 1,
              "user_id": 10,
              "name_by_company": "Meu Estabelecimento",
              "document": "00.000.000/0001-00",
              "type": "CAR_WASH_AND_PARKING",
              "cor_system": "#FF5733",
              "active": 1,
              "created_at": "2024-01-01T00:00:00.000000Z",
              "updated_at": "2024-01-01T00:00:00.000000Z",
              "deleted_at": null
            }
          ]
        },
        "from": 1,
        "last_page": 1,
        "per_page": 15,
        "to": 1,
        "total": 1
      }
    }
    ```

---

## 2. Architectural Stack & Decisions

### A. Integration of TanStack Query (React Query)
- **Problem**: React Query is planned for server-side state/caching but is currently missing from `package.json`.
- **Solution**: We will add `@tanstack/react-query` to dependencies using Yarn. We will configure a global `QueryClient` and `QueryClientProvider` in `app/_layout.tsx` to wrap the entry point.
- **Caching Strategy**: Implement a custom Hook `useEstablishments` which uses React Query's `useQuery` with `queryKey: ['establishments']`. We will set a stale time of 2 minutes to match the legacy web app requirements.

### B. Session State Management with Zustand & SecureStore
- **Active Session Store**: We will create `hooks/useSession.ts` to manage the operational session:
  - `activeEstablishment: Establishment | null`
  - `setActiveEstablishment: (establishment: Establishment | null) => Promise<void>`
  - `isLoadingSession: boolean`
  - `initializeSessionEstablishment: () => Promise<void>`
- **Persistence**: We will persist the active establishment's `id` inside `expo-secure-store` using key `active_establishment_id` so that when the app restarts, the session is rehydrated automatically.

---

## 3. UI/UX Style Guide

To align with StepCar's premium aesthetics:
- **Style Archetype**: Sleek Modern Slate & Glassmorphism.
- **Theme Coordinates**:
  - Background: Off-Black Slate (`#0f172a`)
  - Switcher Container Card: Translucent Dark Slate (`rgba(30, 41, 59, 0.7)`) with glass border (`rgba(255, 255, 255, 0.05)`)
  - Buttons & Dropdowns: Sky Blue (`#0284c7`) and Teal (`#14b8a6`) highlights
- **Switching Selector Interaction**: A clean, premium bottom sheet or inline expanding picker showing available establishments with their corresponding document (CNPJ) and a badge.
- **Haptic Integrations**: Soft feedback (`Haptics.impactAsync`) when switching active establishments.

---

## 4. Empty State Architecture

If the API returns an empty array of establishments:
- The app will render a premium Full-Screen Empty State inside the private section.
- Attendants will see an illustrative symbol (e.g., alert-circle or store-mall-directory with an overlay cross), a bold off-white header, a muted explanation instructing them to contact their administrator, and a clear "Logout / Sair" action button.
