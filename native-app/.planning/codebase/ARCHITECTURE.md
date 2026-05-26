---
type: codebase-architecture
last_mapped_commit: none
---

# ARCHITECTURE.md

**Date:** 2026-05-26

## 1. Architectural Pattern
- **Hybrid Web/Native App**: The app is effectively a "wrapper" around the StepCar web application (via `WebView`). 
- **Native Bridge**: The React Native layer is used to bridge hardware capabilities (Bluetooth printing) that are not easily accessible from a standard web browser. 
- **State Management**: Zustand is used to manage BLE connection state, discovered devices, and active characteristics (`useBLEStore` in `hooks/useBLE.ts`).

## 2. Data Flow
1. **Web to Native**: The web app at `stepcar.com.br` generates a receipt (`CUPOM` data) and sends it as a JSON string to the native layer via WebView `postMessage`.
2. **Native Intercept**: `app/index.tsx` receives the message (`onMessage`), parses the JSON, and either directly sends it to the printer if connected, or opens a modal for the user to select and connect to a Bluetooth printer.
3. **Print Pipeline**: Data is sent to `utils/printer.ts` where it is formatted into ESC/POS binary commands, then transmitted via BLE chunks to the printer (`hooks/useBLE.ts`).

## 3. Entry Points
- `app/index.tsx`: Main screen rendering the `WebView` and managing the Bluetooth Printer modal.
- `hooks/useBLE.ts`: Entry point for all Bluetooth interactions.
