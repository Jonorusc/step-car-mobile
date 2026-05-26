# Project: StepCar Native Mobile App

## What This Is
StepCar is a fully native mobile application that replaces the previous WebView-based mobile app wrapper. It integrates directly with the StepCar API to provide a fast, offline-capable, and premium native experience for vehicle wash and parking management.

## Core Value
To provide an ultra-fast, premium native registration flow for vehicles and a seamless, bulletproof Bluetooth thermal printing experience that works offline.

## Requirements

### Validated
*(None yet — transitioning from legacy WebView wrapper)*

### Active
- [ ] **Auth Suite**: Native login, registration, token refresh, secure token persistence, and forgot password deep link redirects.
- [ ] **Establishment Management**: Unified establishment list, secure switcher, CNPJ display, and active establishment selection persistence.
- [ ] **Vehicle Hub**: Search, filter, infinite scroll pagination, and vehicle details view.
- [ ] **Progressive Vehicle Registration Flow**: Redesigned 5-step native wizard: Basic Data → Category → Services → Details → Summary with haptic feedback.
- [ ] **Flagship Printing Hub**: Scanner animation, recent paired printers list, auto-connect, receipt previews, dynamic templates, queue management, reprint, and offline diagnostic tools.
- [ ] **User Profile**: Comprehensive user profile view, active subscription status, employee role details, and address cards.

### Out of Scope
- **Password Recovery in App**: Deferred to Web platform due to security requirements and custom web workflow complexity.
- **Service/Category Creation inside Mobile App**: High administrative complexity; deferred to the Web administration dashboard.
- **Complex Financial Analytics Charts**: Deferred to Web dashboard; mobile app focuses on operational registry and printer capabilities.

## Context
- **Legacy State**: The previous mobile application was an Expo WebView container that loaded `https://stepcar.com.br` and relied on WebView bridges to print coupons. This led to high latency, poor offline support, and fragile web-to-native communication.
- **Target Users**: Car wash operators, parking lot attendants, and administrative staff who require high speed and reliable printing at checkout.

## Constraints
- **Hardware Integration**: Uses standard Bluetooth Classic/BLE thermal printers (58mm/80mm paper widths). Bluetooth communication must be bulletproof on both Android and iOS devices.
- **Authentication Protocol**: Relies on JWT Bearer tokens with strict expiration. Mobile must handle automated background token refreshes to avoid user disruption.
- **SDK Stability**: Standardized on Expo SDK 52 and Expo Router v4 for robust native architecture.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Zustand + React Query** | Zustand handles local UI state (BLE printer selection, steps) and React Query manages server-side API caching/pagination. | — Pending |
| **Expo Router v4** | Provides standard file-based routing supporting deeply nested tab stacks and full-screen modal sheets natively. | — Pending |
| **Custom ESC/POS Chunking** | Raw byte transmission over BLE requires chunking into 20-byte payloads to support legacy thermal printers. | — Pending |

---
*Last updated: 2026-05-26 after legacy WebView assessment*
