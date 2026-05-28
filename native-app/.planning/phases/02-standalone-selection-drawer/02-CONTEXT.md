# Phase 2: Standalone Selection & Drawer - Context

**Gathered:** 2026-05-27
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase establishes the standalone establishment selection flow and builds the main dashboard container featuring a left sliding side-drawer designed after the web dashboard's premium white sidebar layout.
</domain>

<decisions>
## Implementation Decisions

### 1. Initial Gating & Redirection
- When a user logs in, if they do not have a stored `active_establishment_id` in SecureStore, they are directed to the standalone `/establishments` page.
- Once selected, they are redirected to the `/dashboard` index page.
- Going to "Estabelecimentos" inside the drawer redirects them back to `/establishments`.

### 2. Standalone Establishment Selector UI
- Clean, premium white-slate design.
- Unified card listing user's associated establishments with their name, type, and document.
- Custom empty state if 0 establishments are returned, with logout redirects.

### 3. Left Sliding Side-Drawer UI (White Web-Style Layout)
- Model the sidebar exactly after the web screenshot:
  - White background (`#ffffff`), border on the right.
  - Profile box at the top showing operator name in bold and "Perfil" toggle.
  - Modules vertical list: Registro, Categories, Services, Companies, Vehicles.
  - Active module highlighted in a dark rounded card (`#0f172a` background and white text/icon).
  - Bottom options: "Estabelecimentos" and "Sair".
- Hamburger menu button in the header of the dashboard to trigger the drawer.

</decisions>

<canonical_refs>
## Canonical References
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
</canonical_refs>

<specifics>
## Specific Ideas
- Smooth drawer open/close slide animations.
- Clear indicator colors next to establishments.
</specifics>
