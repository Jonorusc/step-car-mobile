# StepCar Mobile App

Welcome to the **StepCar** React Native / Expo mobile application. This repository contains the code for both iOS and Android platforms.

---

## Prerequisites

Before you can run the app you need to have the following tools installed on your machine:

- **Node.js** (>= 18.x) – https://nodejs.org/
- **Yarn** (>= 1.22) – `npm i -g yarn`
- **Expo CLI** – `npm i -g expo-cli`
- **Java Development Kit** – JDK **22** (required by Gradle 8.7). Set `JAVA_HOME` accordingly.
- **Android SDK**
  - Build‑Tools **35.0.0**
  - Platform **API 35** (Android 14)
  - Android Studio (optional, for AVD management) – https://developer.android.com/studio
- **Kotlin** – version **1.9.24** (used by Gradle)
- **Gradle** – version **8.7** (wrapper will download automatically)
- **Xcode** – version **15**+ (required for iOS builds)
- **Watchman** (optional, improves file watching on macOS) – `brew install watchman`
- **Android platform tools** – ensure `adb` is in your `PATH`
- **.env file** – create a `.env` at the project root with at least `EXPO_PUBLIC_API_URL` defined.

---

## Getting the Code

```bash
# Clone the repository
git clone https://github.com/your-username/StepCar.git

# Enter the native app directory
cd StepCar/step-car-mobile/native-app
```

---

## Install Dependencies

```bash
# Install JavaScript dependencies
yarn install
```

If you prefer npm, run `npm install` instead (the scripts use Yarn).

---

## iOS setup

1. **Install CocoaPods** (if not already installed):
   ```bash
   sudo gem install cocoapods
   ```
2. **Install iOS pods**:
   ```bash
   cd ios && pod install && cd ..
   ```
3. Ensure Xcode is installed and the iOS simulator is available.

---

## Android setup

1. Make the Gradle wrapper executable (only needed once):
   ```bash
   chmod +x android/gradlew
   ```
2. (Optional) Clean the Android build folder:
   ```bash
   ./android/gradlew clean
   ```
3. Verify required SDK components are installed:
   ```bash
   sdkmanager "platforms;android-35" "build-tools;35.0.0"
   ```

---

## Running on iOS

```bash
yarn ios
```

Expo will build the iOS bundle and launch it in the iOS simulator. The first run may take a few minutes while native code is compiled.

---

## Running on Android

```bash
yarn android
```

You can run on a physical device (USB‑debugging enabled) or an emulator. To start an AVD:

```bash
emulator -list-avds          # list available virtual devices
emulator -avd <AVD_NAME>    # launch the chosen AVD
```

---

## Common Commands

- `yarn start` – start the Expo dev server without launching a simulator.
- `yarn lint` – run ESLint checks.
- `yarn test` – execute unit tests (if any).

---

## Troubleshooting

- **Gradle permission errors** – ensure `android/gradlew` is executable: `chmod +x android/gradlew`
- **Missing Android SDK components** – run `sdkmanager "platforms;android-35" "build-tools;35.0.0"`
- **Java version mismatch** – verify with `java -version` that you are using JDK 22.
- **CocoaPods issues** – run `pod repo update` or delete the `Pods/` folder and reinstall.

---

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

---

Happy coding! 🎉
