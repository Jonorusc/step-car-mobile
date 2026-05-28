---
phase: 2
slug: standalone-selection-drawer
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-27
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for verification during execution.

---

## Test Infrastructure

| Property               | Value                         |
| ---------------------- | ----------------------------- |
| **Framework**          | Jest (via `jest-expo` preset) |
| **Config file**        | `package.json`                |
| **Quick run command**  | `yarn test --watchAll=false`  |
| **Full suite command** | `yarn test`                   |
| **Estimated runtime**  | ~5 seconds                    |

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior                  | Test Type   | Automated Command                       | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ---------- | -------------------------------- | ----------- | --------------------------------------- | ----------- | ---------- |
| 02-01-01 | 02   | 1    | ESTB-01     | —          | Standalone selection layout      | unit        | `yarn test hooks/useEstablishments.test.ts` | ✅          | ⬜ pending |
| 02-01-02 | 02   | 1    | ESTB-02     | —          | Secure store persistence         | unit        | `yarn test hooks/useSession.test.ts`    | ✅          | ⬜ pending |
| 02-02-01 | 02   | 2    | NAV-01      | —          | Web sidebar white drawer layout  | visual-unit | `yarn test components/Drawer.test.ts`   | ❌ W0       | ⬜ pending |
| 02-02-02 | 02   | 2    | NAV-04      | —          | Redirection triggers             | visual-unit | `yarn test components/DrawerTriggers.test.ts` | ❌ W0   | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Manual-Only Verifications

| Behavior                                        | Requirement | Why Manual                                                 | Test Instructions                                                                                                                                          |
| ----------------------------------------------- | ----------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sliding Drawer gesture open                     | NAV-01      | Involves touch tracking and pan handlers                   | Swipe from left edge, verify side drawer slides out smoothly, showing pure white background and active module rounded card |
| Return to Selector redirect                     | NAV-04      | Router context rehydration sequence                        | Click "Estabelecimentos" at the bottom of the drawer, verify the app routes back to the selector and active establishment is set to null |
