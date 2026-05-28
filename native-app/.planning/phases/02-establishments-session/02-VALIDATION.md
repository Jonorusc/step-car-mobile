---
phase: 2
slug: establishments-session
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

## Sampling Rate

- **After every task commit:** Run `yarn test --watchAll=false`
- **After every plan wave:** Run `yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior                  | Test Type   | Automated Command                       | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ---------- | -------------------------------- | ----------- | --------------------------------------- | ----------- | ---------- |
| 02-01-01 | 02   | 1    | ESTB-01     | —          | Secure Bearer header for list    | unit        | `yarn test hooks/useEstablishments.test.ts` | ❌ W0       | ⬜ pending |
| 02-01-02 | 02   | 1    | ESTB-03     | —          | Save selection inside SecureStore | unit        | `yarn test hooks/useSession.test.ts`    | ❌ W0       | ⬜ pending |
| 02-02-01 | 02   | 2    | ESTB-02     | —          | Smooth interactive picker        | visual-unit | `yarn test components/Switcher.test.ts` | ❌ W0       | ⬜ pending |
| 02-02-02 | 02   | 2    | ESTB-04     | —          | Secure gating on empty array     | visual-unit | `yarn test components/EmptyState.test.ts` | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `hooks/__tests__/useEstablishments.test.ts` — test query parameters, bearer headers, and response structure
- [ ] `hooks/__tests__/useSession.test.ts` — test Zustand session store default values, selection updater, and SecureStore serialization/deserialization

---

## Manual-Only Verifications

| Behavior                                        | Requirement | Why Manual                                                 | Test Instructions                                                                                                                                          |
| ----------------------------------------------- | ----------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rehydration on App Reload                       | ESTB-03     | Sandbox limits in simulated unit test storage engines      | Log in, select an establishment, force-terminate the application, reopen, and assert that the previously selected active establishment is restored immediately |
| Interactive switch haptics                      | ESTB-02     | Involves physical device haptic engine feedback            | Trigger switcher modal, tap a different establishment, and feel the physical haptic pulse |
| Zero Establishment Gating                       | ESTB-04     | Flow gating based on administrative backend settings       | Login with an account that has 0 associated establishments, assert the application displays the empty state, click "Logout" to confirm redirect |
