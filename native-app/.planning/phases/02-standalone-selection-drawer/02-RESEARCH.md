# Phase 2 Research: Standalone Selection & Drawer

This document details the architectural layout, navigation strategy, and visual UI system required to adapt the StepCar Web Dashboard's white design pattern and vertical sidebar menu into a high-performance, native sliding side-drawer on mobile.

---

## 1. Web Dashboard Conversion Parameters

From the web screenshot and specifications, we identify these core layout details:

### A. Sidebar Aesthetics (White Theme)
- **Background**: Pure white (`#ffffff`) with a subtle right-hand border (`#e2e8f0` or `#cbd5e1`).
- **Profile Card**: Displays at the top of the sidebar. Shows "Victor Emanuel" (operator name) in bold with a small dropdown arrow and "Perfil" text below.
- **Vertical Navigation Items**:
  - Unselected item: Light grey icon with slate text (`#475569`), very clean.
  - Selected/Active item: Styled inside a dark, highly rounded card (background: `#0f172a`, text/icon: `#ffffff`).
  - Active module is called **Registro** (for vehicle registration), displaying the write icon.
- **Bottom Actions**: Exposes "Estabelecimentos" (leads back to selection screen) and "Sair" (logs out).

### B. Dashboard Panel Aesthetics (Clean Slate Theme)
- **Background**: Very light slate (`#f8fafc`).
- **Header**: Large clean typography ("Página Principal").
- **Teal CTA**: "NOVO REGISTRO" teal action button (`#008080` background with custom write icon).
- **Recently Added Vehicles Table**:
  - Styled inside a white, rounded panel card.
  - Columns: `MODELO`, `PLACA`, `PREÇO`, `DATA`, `AÇÕES`.
  - Actions: Delete (trash icon), Edit (pencil icon), Print (printer icon).
  - Price column shows BRL value in bold and discount value in red below (e.g. `-R$ 98,90`).
  - A subtle "Ver mais" button sits underneath the table.

---

## 2. Native Mobile Navigation Architecture

To implement this layout natively using Expo Router v4:
1. **Initial Gating Flow (`app/_layout.tsx` / `app/index.tsx`)**:
   - Verify authentication. If unauthenticated, redirect to `/login`.
   - Check if `activeEstablishment` exists inside Zustand/SecureStore.
   - If `activeEstablishment` is **null**, route the user to `/establishments` (standalone selection screen).
   - If `activeEstablishment` is **set**, route the user immediately to the main dashboard container `/dashboard`.
2. **Standalone Selector Screen (`app/(private)/establishments.tsx`)**:
   - Clean, white-slate background, matching the login screen theme.
   - Centered card showing active list of establishments.
   - Tapping an establishment updates `activeEstablishment` inside Zustand, sets the SecureStore key `active_establishment_id`, and triggers immediate router redirect to `/dashboard`.
3. **Dashboard Sliding Side-Drawer (`app/(private)/dashboard/_layout.tsx`)**:
   - A custom sliding sidebar drawer menu.
   - When the attendant clicks the hamburger icon in the header, the sidebar drawer slides in from the left.
   - Styled exactly like the web screenshot sidebar (pure white background, vertical profile box at the top, active module styled in a dark card `#0f172a` with white text and icon, and bottom triggers at the bottom).
   - Sidebar options map to the MVP CRUD modules:
     - **Registro**: redirects to `dashboard/index.tsx`
     - **Categorias**: redirects to `dashboard/categories.tsx`
     - **Serviços**: redirects to `dashboard/services.tsx`
     - **Empresas**: redirects to `dashboard/companies.tsx`
     - **Veículos**: redirects to `dashboard/vehicles.tsx`
   - Bottom options:
     - **Estabelecimentos**: Sets `activeEstablishment` to **null**, deletes `active_establishment_id` in SecureStore, and redirects back to `/establishments`.
     - **Sair**: Calls `logout()` and redirects to `/login`.
