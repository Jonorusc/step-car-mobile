---
type: codebase-conventions
last_mapped_commit: none
---

# CONVENTIONS.md

**Date:** 2026-05-26

## 1. Code Style
- **TypeScript**: Strict mode enabled. Interfaces are used for object shapes.
- **State Management**: Zustand is preferred over React Context for global state, but standard `useState` is used for local component state.
- **Path Aliasing**: `@/*` is configured to map to `./*`.

## 2. Error Handling
- Errors during BLE connection/printing are logged to `console.error` and presented to the user via `Alert.alert`.

## 3. ESC/POS Formatting
- Raw byte buffers are manipulated using `buffer` to construct ESC/POS commands for printing. It relies on constants (`ESC`, `GS`) and helper functions to build the command sequence (`utils/printer.ts`).
