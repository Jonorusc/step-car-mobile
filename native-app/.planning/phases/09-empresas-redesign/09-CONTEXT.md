# Phase 9 Context: Empresas Redesign

**Date:** 2026-06-10

## Domain
Implementing the new Company main page summary (4 indicators) and integrating the new "Fechamentos" (Billings) logic from web-stepcar into the native app.

## Canonical Refs
- `web-stepcar/src/views/company/ListCompany/index.tsx`
- `web-stepcar/src/hooks/company/useListCompany.ts`
- `web-stepcar/src/hooks/company/tableColumns.tsx`

## Decisions

### Indicators Layout
- **Decision:** Use a horizontal scroll view (carousel) to display the 4 indicators.
- **Why:** Saves vertical space on mobile devices while allowing all data to be accessible.

### Billings (Fechamentos) View
- **Decision:** Use a new full-screen route (e.g., `/companies/[id]/billings`).
- **Why:** Gives the billings table and list plenty of space, mimicking a dedicated page view similar to the web.

### Vehicle Navigation
- **Decision:** Open a bottom sheet showing only that company's vehicles inline.
- **Why:** Keeps the user within the context of the companies module without forcing them to switch to the vehicles tab, improving the mobile UX.

## Code Context
- Web codebase already has `useCompanyIndicators` inside `useListCompany.ts` that hits `/user/company/indicators`.
- `useBillingsMutations.ts` and `useBillingsQueries.ts` are present in `web-stepcar/src/hooks/company/billings`.
