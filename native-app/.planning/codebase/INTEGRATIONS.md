---
type: codebase-integrations
last_mapped_commit: none
---

# INTEGRATIONS.md

**Date:** 2026-05-26

## 1. External APIs & Web Services

- **Web App**: The app heavily relies on a `react-native-webview` pointing to `https://stepcar.com.br`. The web app sends messages back to the React Native app using `window.ReactNativeWebView.postMessage`.

## 2. Hardware Integrations

- **Bluetooth Printers**: Integrates with POS/receipt printers over BLE. Specific brands targeted include Zebra, Epson, Goojprt, XPrinter, MPT, etc.

## 3. Platform Integrations

- **Location/Bluetooth Permissions**: Android `ACCESS_FINE_LOCATION`, `BLUETOOTH_CONNECT`, and `BLUETOOTH_SCAN` permissions are required and requested at runtime.

## 4. API Documentation

See: [API Documentation](../../../../api_doc.md)
