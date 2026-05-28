# Phase 1: Authentication & Core Setup - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-27
**Phase:** 01-authentication-core-setup
**Areas discussed:** Profile retrieval flow on login/registration, Custom useUser hook

---

## Profile Retrieval Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Return basic info from Login only | Keep the login flow simple and only return the minimal fields (id, name, email, type_user) returned by POST `/user/auth/login`. | |
| Fetch full profile from `/me` immediately | Immediately after successful login or registration, hit the `POST /user/auth/me` endpoint to fetch the complete user details (is_subscriber, payment_status, subscription_active, address, etc.) and save it in the global state. | ✓ |

**User's choice:** Fetch full profile from `/me` immediately.
**Notes:** After logging in, the application needs to request `/me` to fetch the complete user details, which will then be exposed and returned by the `useUser` hook. This ensures the native subscription gate receives the correct subscription status.

---

## Custom useUser hook

| Option | Description | Selected |
|--------|-------------|----------|
| Expose state only from `useAuthStore` | Force other components to use `useAuthStore((state) => state.user)` directly. | |
| Expose dedicated `useUser` hook | Create and export a dedicated `useUser` hook/helper that returns the user profile data directly from `/me`. | ✓ |

**User's choice:** Expose dedicated `useUser` hook.
**Notes:** Exposing the dedicated `useUser` hook makes retrieving the logged-in user profile cleaner and mirrors the structure used in the Web application documentation (`src/hooks/user/useUser.ts → getUser()`).

---

## the agent's Discretion

- Implemented standard Jest test suites mocking both `/user/auth/login` (and `/user/auth/register`) alongside `/user/auth/me` to ensure robust, comprehensive unit test coverage.
- Created `hooks/useUser.ts` as a clean wrapper around the Zustand store user state, while also exporting `useUser` directly from `hooks/useAuth.ts` for maximum convenience and backwards compatibility.

## Deferred Ideas

- None.

---

*Phase: 01-authentication-core-setup*
*Discussion log generated: 2026-05-27*
