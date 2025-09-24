# CAP Attendance Shell

CAP Attendance Shell is a production-ready React Native wrapper around https://www.capnhq.gov/. It keeps the official CAP experience inside a hardened WebView, adds native navigation controls, and bridges barcode scans straight into whichever form field is focused. Cookies and local storage persist across launches so members stay logged in just as they would in the system browser.

## Overview

- Native header with Back, Forward, Refresh, Take Attendance, Scan, and Privacy actions
- Early JavaScript injection (`window.__CapShell__`) that finds the active editable element (shadow DOM aware), updates values, and dispatches `input`/`change`/`keyup` events
- Barcode scanning via `react-native-vision-camera` + `vision-camera-code-scanner`, including permission prompts, haptic feedback, and a clipboard fallback
- Loading progress bar, pull-to-refresh, offline banner, toast notifications, and graceful error handling
- Privacy screen summarising on-device-only data handling
- Jest unit harness, Detox smoke suite, and Fastlane lanes scaffolded for CI/CD

## Project Structure

```
src/
  App.tsx              # App container with navigation + providers
  components/          # Header, scanner modal, progress bar, shared UI
  config/appConfig.ts  # Home/attendance URLs + feature flags
  injection/           # Injected JavaScript helpers
  navigation/          # Stack navigator definition
  screens/             # Shell WebView + Privacy screen implementations
__tests__/             # Jest unit tests (injected script harness)
e2e/                   # Detox configs, setup, and smoke specs
android|ios/fastlane/  # Fastlane scaffolding for CI builds
```

## Prerequisites

- Node.js 18+
- Watchman (macOS, optional but recommended)
- Xcode 15+ with command-line tools and an iOS simulator image
- CocoaPods (`sudo gem install cocoapods`)
- Android Studio (latest) with SDK Platform 34 / Build-Tools 34.x and an emulator (e.g., Pixel 6 API 34)
- Java 17 for Android builds

## Getting Started

### 1. Install dependencies

```bash
npm install
```

This installs the React Native runtime plus the native modules (WebView, Vision Camera, barcode scanner, navigation, etc.).

### 2. Run the iOS app (simulator or device)

```bash
cd ios
pod install
cd ..
npm run ios
```

Tips
- Use `npm run ios -- --simulator "iPhone 15"` to target a specific simulator.
- For physical devices, open `ios/CAPAttendanceShell.xcworkspace` in Xcode, configure signing, and run from there.

### 3. Run the Android app (emulator or device)

1. Launch Android Studio, open the AVD Manager, and boot an emulator (Pixel 6 API 34 recommended).
2. In a terminal:

```bash
npm run android
```

Tips
- Ensure an emulator is running or a device is connected (`adb devices`) before invoking the command.
- Approve the camera permission the first time the Scan modal opens; the clipboard fallback still works if you decline.

### 4. Development workflow

- `npm run start` launches Metro bundler if you want to run it separately.
- Fast refresh, React DevTools, and Flipper integrations all work out of the box.

## Testing & Quality Gates

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `npm run typecheck`    | Strict TypeScript checks                      |
| `npm run lint`         | ESLint with the React Native config           |
| `npm run test:unit`    | Jest suite (JSDOM harness for injected JS)    |
| `npm run detox:build:*`| Build Detox artifacts (iOS/Android)           |
| `npm run detox:test:*` | Run Detox smoke suite                         |

### Detox smoke flow

`e2e/shell.e2e.ts` launches the app with the deep link `capshell://test?mode=mock`, forces a mock HTML payload, and verifies navigation plus the `fillActiveElement` bridge. After configuring simulators/emulators run:

```bash
npx detox build --configuration ios.sim.debug
npx detox test --configuration ios.sim.debug
# or
npx detox build --configuration android.emu.debug
npx detox test --configuration android.emu.debug
```

## Fastlane

- `ios/fastlane/Fastfile`: `build_debug`, `build_release`, `detox`
- `android/fastlane/Fastfile`: `build_debug`, `build_release`, `detox`

Populate each platformâ€™s `Appfile` and add signing credentials in CI before using these lanes.

## Configuration Touchpoints

- **URLs & feature flags**: `src/config/appConfig.ts`
- **Allowed domains**: `ALLOWED_HOST` constant inside `ShellWebView`
- **Scanner formats**: `SUPPORTED_FORMATS` array in `ScannerModal`
- **Privacy copy**: `src/screens/PrivacyScreen.tsx`
- **Vector icons**: managed via `react-native.config.js` and `assets/fonts/MaterialIcons.ttf`

## Next Steps

1. **Exercise on real hardware** â€" Validate the CAP login + scanner flow on physical iOS and Android devices to confirm camera behaviour and haptics.
2. **Wire up CI/CD** â€" Connect Fastlane lanes to your build pipeline, add signing assets, and gate merges on `npm run typecheck` plus the Jest suite.
3. **Security hardening** â€" Evaluate certificate pinning, CSP enforcement, or navigation blocking if CAP publishes stricter guidance.
4. **Optional telemetry** â€" If analytics are ever required, keep them opt-in and ensure no attendance data leaves the device.
5. **Plan upgrades** â€" React Native 0.80.0 is the baseline; monitor the CLI template issue in 0.81+ and upgrade when upstream is ready.

## Additional Notes

- Hidden debug nodes (`current-url-indicator`, `injection-debug`) exist solely for Detox assertions and are invisible in production.
- The custom URL scheme `capshell://` is registered on both platforms but acts as a no-op outside automated tests.
- VisionCameraâ€™s advanced frame processors may require `react-native-worklets-core` if you add custom ML worklets later.
- Adjust or extend NPM scripts (for example `npm run lint:fix`) as your workflow evolves.
