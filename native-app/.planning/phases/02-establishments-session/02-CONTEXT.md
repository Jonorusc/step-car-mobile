# Phase 2: Establishments & Session - Context

**Gathered:** 2026-05-27
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase builds establishment selection and operational session initialization. It retrieves the user's establishments, stores the active selection, handles changing the active establishment, and manages empty states when none are linked.
</domain>

<decisions>
## Implementation Decisions

### 1. TanStack Query Core
- Set up TanStack Query in the React Native project.
- Wrap root layout `app/_layout.tsx` in `QueryClientProvider`.
- Fetch user establishments with custom hook `useEstablishments` utilizing `/user/establishment/list-establishment-user`.

### 2. State & Session persistence
- Create Zustand store `useSessionStore` to store `activeEstablishment` state.
- Save and load the selected establishment ID to/from local storage using `expo-secure-store`.
- Automatically initialize the active establishment: if a saved ID exists and is valid, load it. If not, default to the first establishment in the list.

### 3. Switcher UI Card
- Create an elegant switcher card at the top of the main screen.
- On tapping, present a clean, custom native selector (interactive Modal or Bottom Sheet overlay) styled with premium glassmorphism overlay.
- Expose the name and formatted CNPJ of each establishment in the switcher.
- Trigger soft haptic feedback on selection.

### 4. Empty State Gating
- If the user has 0 establishments returned, block operational features and show a premium, full-screen empty state with support instructions and a logout button.

</decisions>

<canonical_refs>
## Canonical References
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
</canonical_refs>

<specifics>
## Specific Ideas
- Visual color indicator representing `cor_system` next to each establishment in the switcher.
- Smooth transition animations between selected states.
</specifics>
