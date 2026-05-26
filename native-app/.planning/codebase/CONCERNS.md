---
type: codebase-concerns
last_mapped_commit: none
---

# CONCERNS.md

**Date:** 2026-05-26

## 1. Technical Debt & Fragility

- **WebView Dependency**: The app's core functionality relies entirely on a web connection. If the user is offline or the website is down, the app is effectively useless.
- **BLE Connection Stability**: Bluetooth Low Energy can be unstable. The app has some reconnection logic in `useBLE.ts`, but BLE behavior across different Android versions can vary.
- **Hardcoded Printer Keywords**: Printer discovery relies on a hardcoded array of keywords (e.g. `"printer"`, `"bt-printer"`). If a legitimate printer's name doesn't include these, it won't be found.

## 2. Security

- The WebView communicates with `https://stepcar.com.br`. Ensure that the message passing mechanism is secured and validates incoming data, as it currently parses `data` directly into `CUPOM` and attempts to print.

## 3. Features

- Keep-alive ping to printers via BLE is currently commented out in `hooks/useBLE.ts`. This might lead to disconnects on printers that go to sleep automatically.
