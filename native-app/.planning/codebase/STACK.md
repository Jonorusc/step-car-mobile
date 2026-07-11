---
type: codebase-stack
last_mapped_commit: none
---

# STACK.md

**Date:** 2026-05-26

## 1. Core Languages & Runtimes

- **Language**: TypeScript/JavaScript
- **Runtime**: Node.js (via React Native/Expo)

## 2. Frameworks & UI Libraries

- **App Framework**: React Native (0.76.6)
- **Expo**: SDK 52 (`expo@^52.0.30`)
- **Routing**: Expo Router (`expo-router@~4.0.17`)
- **UI Components**: `@expo/vector-icons`, `react-native-webview`
- **Fecthing**: React Query
- **Animations**: Reanimated 3.15.0
- **Gestures**: React Native Gesture Handler 4.1.7
- **Swiper**: React Native Swiper 1.6.6
- **Toast**: Notificastion 1.12.4

## 3. Key Dependencies

- `react-native-ble-plx`: For Bluetooth Low Energy communication with printers.
- `zustand`: Global state management.
- `react-native-permissions`: Managing Android/iOS permissions.

## 4. Build & Configuration

- **Package Manager**: Yarn (`yarn.lock`)
- **TypeScript**: Configured via `tsconfig.json` extending `expo/tsconfig.base`.
- **Expo Config**: `app.json` and `eas.json` (configured for internal Android APK builds).
