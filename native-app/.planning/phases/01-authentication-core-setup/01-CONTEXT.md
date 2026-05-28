# Phase 1: Authentication & Core Setup - Context

**Gathered:** 2026-05-26
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase establishes the foundational native API client shell and authenticates the user natively using local inputs, storing the JWT session securely.

</domain>

<decisions>
## Implementation Decisions

### 1. API Core & Client

- Setup Axios client using `https://stepcarhomolog.com.br/api/v1` as standard Base URL.
- Inject `Authorization: Bearer <token>` automatically in all authenticated requests.
- Handle JWT Token Refresh in Axios Interceptors on 401 Unauthorized errors using `POST /user/auth/refresh`.
- **Complete Profile Fetching**: Immediately request `POST /user/auth/me` after a successful login or registration to obtain the complete user profile and subscription status before updating global store state and triggering routing redirects.

### 2. Secure Token Storage

- Store tokens natively via `expo-secure-store`.
- Maintain active user session context in Zustand `useAuthStore` and expose it via a custom `useUser` helper hook, ensuring that the profile data from `/me` is returned.

### 3. Forgot Password Redirect

- Direct users to recovery directly by opening the browser to `https://stepcar.com.br` when they click "Forgot Password". No return-to-app deep linking is required inside the native app stack.

### 4. Custom Login & Register Screens

- Create premium, fast, minimal native-first form inputs (dark slate / deep slate styling theme).
- Native forms only validate credentials locally before POSTing to the endpoints.

### the agent's Discretion

- Local input validations (e.g. email regex pattern, password length).
- Visual loading states with custom animated loaders.
- Haptic feedback pattern for login errors or registration success.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`

</canonical_refs>

<specifics>
## Specific Ideas
- Visual password visibility toggle button.
- Clean and Harmonious slate theme (`#0f172a` backdrop, glassmorphic card overlays, deep electric blue `#0284c7` buttons).

</specifics>

<deferred>
## Deferred Ideas
- Universal links callback integrations for recovery (Deferred to Web platform).

</deferred>

---

_Phase: 01-authentication-core-setup_
_Context gathered: 2026-05-26 after planning_
