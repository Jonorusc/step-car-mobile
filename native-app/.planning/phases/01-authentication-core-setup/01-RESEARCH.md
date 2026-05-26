# Phase 1 Research: Authentication & Core Setup

This document outlines the technical research, architectural decisions, and verification strategy required to implement native authentication and core API infrastructure for StepCar.

---

## 1. Domain Research & API Specifications

The authentication suite is built on top of three core endpoints defined in the API documentation:

### A. Login (`POST /user/auth/login`)

- **Payload**:
    ```json
    {
        "email": "usuario@email.com",
        "password": "senhaSegura123"
    }
    ```
- **Response (200 OK)**:
    ```json
    {
        "data": {
            "access_token": "eyJ0eXAiOiJKV1Q...",
            "user": {
                "id": 10,
                "name": "João Silva",
                "email": "joao@email.com",
                "type_user": "admin"
            }
        }
    }
    ```

### B. Token Refresh (`POST /user/auth/refresh`)

- **Purpose**: Authenticates the token and returns a refreshed session token when the current token is close to expiry.
- **Trigger**: Intercepted in the background when the app encounters a `401 Unauthorized` response.

### C. Active User Profile (`POST /user/auth/me`)

- **Purpose**: Retrieves comprehensive user metadata, subscription states, addresses, and employee access rules derived from the JWT Bearer token.

---

## 2. Technical Stack & State Decisions

- **Secure Storage**: We will use `expo-secure-store` which uses iOS Keychain and Android Keystore to encrypt and store the JWT access and refresh tokens.
- **HTTP Client**: Axios with interceptors. We will implement:
    - **Request Interceptor**: Injects the Bearer token dynamically from `SecureStore` into the `Authorization` header.
    - **Response Interceptor**: Catches `401` errors, triggers a background refresh request, queues any concurrent requests, and retries them automatically with the new token.
- **State Management**: Zustand store (`useAuthStore` in `hooks/useAuth.ts`) to manage:
    - `isAuthenticated: boolean`
    - `user: User | null`
    - `login(email, password): Promise<void>`
    - `logout(): Promise<void>`

---

## 3. Forgot Password Flow

- **Decision**: Simplicity first. Since password recovery logic belongs exclusively on the website to leverage existing web-based token validation workflows, clicking "Forgot Password" will trigger:
    ```typescript
    import * as WebBrowser from 'expo-web-browser';
    await WebBrowser.openBrowserAsync('https://stepcar.com.br');
    ```
- No deep-linking callbacks or universal links need to be registered inside the native app itself for this action.

---

## 4. UI Style Guide & Native Branding

- **Design System**: A sleek, premium, native-first aesthetic.
- **Color Token System**:
    - `Background`: Deep Slate (`#0f172a`)
    - `Card / Inputs overlay`: HSL glassmorphism (`rgba(30, 41, 59, 0.7)`)
    - `Primary Action`: Electric Blue (`#0284c7`)
    - `Success / Active`: Vivid Teal (`#14b8a6`)
    - `Text Primary`: Off-White (`#f8fafc`)
    - `Text Muted`: Slate Gray (`#94a3b8`)
- **Visuals**: Clean native forms, visual password eye toggle, loading micro-animations, and subtle haptic feedback for user inputs using `expo-haptics`.

---

## ## Validation Architecture

To ensure premium quality and complete correctness, the validation strategy consists of the following dimensions:

### A. Unit Validation

- **Input Validation**: Test email and password format validation logic inside `utils/validation.ts` (e.g., standard regex patterns and password length constraints).
- **Zustand Authentication Store**: Mock secure storage and assert state transitions for `login`, `logout`, and session loading.

### B. Integration & API Mocking

- **Token Refresh Interceptor**: Mock Axios request/response cycles using `axios-mock-adapter` or Jest mocks.
- **Concurrent Request Queueing**: Simulate a token refresh scenario where 3 parallel requests receive a `401`, trigger a single refresh token request, and subsequently resolve correctly with the new token.

### C. Visual & User Flow Validation

- **Authentication Screens**: Render `Login` and `Register` screens within Jest-Expo and assert that validation error states appear visually in the UI.
- **WebView Clean Transition**: Assert that once authentication is complete, the app routes seamlessly to the main authenticated navigation stack instead of the legacy WebView layout.
