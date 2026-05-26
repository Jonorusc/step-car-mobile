---
phase: 1
slug: authentication-core-setup
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

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
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior                  | Test Type   | Automated Command                    | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ---------- | -------------------------------- | ----------- | ------------------------------------ | ----------- | ---------- |
| 01-01-01 | 01   | 1    | AUTH-02     | T-01-01    | Encrypt JWT tokens natively      | unit        | `yarn test utils/api.test.ts`        | ❌ W0       | ⬜ pending |
| 01-01-02 | 01   | 1    | AUTH-03     | T-01-02    | Interceptor refresh lock         | integration | `yarn test hooks/useAuth.test.ts`    | ❌ W0       | ⬜ pending |
| 01-02-01 | 01   | 2    | AUTH-01     | T-01-03    | Local inputs sanitize validation | unit        | `yarn test utils/validation.test.ts` | ❌ W0       | ⬜ pending |
| 01-02-02 | 01   | 2    | AUTH-05     | —          | N/A                              | unit        | `yarn test app/register.test.ts`     | ❌ W0       | ⬜ pending |
| 01-03-01 | 01   | 3    | AUTH-04     | —          | N/A                              | unit        | `yarn test app/login.test.ts`        | ❌ W0       | ⬜ pending |
| 01-04-01 | 01   | 4    | AUTH-07     | —          | N/A                              | manual      | —                                    | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `utils/__tests__/api.test.ts` — stubs for token injection and refresh mock tests
- [ ] `hooks/__tests__/useAuth.test.ts` — stubs for authentication Zustand store
- [ ] `utils/__tests__/validation.test.ts` — stubs for email/password format tests

---

## Manual-Only Verifications

| Behavior                                        | Requirement | Why Manual                                                 | Test Instructions                                                                                                                                          |
| ----------------------------------------------- | ----------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web Browser Forgot Password redirect            | AUTH-04     | Involves platform WebBrowser control                       | Click "Forgot Password" on login screen and assert it opens the Safari/Chrome custom tab pointing to `https://stepcar.com.br`                              |
| Native Biometrics / iOS Keychain secure storage | AUTH-06     | Keystore/Keychain sandbox limits in simulated environments | Authenticate on physical hardware, close the application completely, reopen, and assert the user bypasses Login directly to active establishment selection |
| Native Blocking Subscription Gating             | AUTH-07     | Complex navigation redirects and external portal state     | Register/Login with a non-subscriber account, assert that the app blocks access and redirects to `/subscription`, tap "Subscribe" (opens site), tap "Verify" |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending 2026-05-26
