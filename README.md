# Clinical Ink Prototype

A cross-platform Expo prototype that captures handwriting drawn directly on a phone or tablet and converts it to editable text. Recognition runs on-device through Google ML Kit Digital Ink Recognition on Android and iOS.

## What is included

- Smooth SVG handwriting canvas with touch and stylus input
- Undo, clear, stroke count, and recognition feedback
- English, Hindi, Tamil, and Telugu model selection
- Automatic on-device language-model download and status handling
- Editable recognized text and alternative candidates
- Local Expo native module implemented for both Kotlin and Swift
- No backend, API key, patient-data upload, or cloud recognition

The first use of each language needs internet access to download its ML Kit model. Recognition works offline after that model is downloaded.

## Supported platforms

| Platform | Drawing UI | Handwriting conversion | How to run |
| --- | --- | --- | --- |
| Android phone/tablet | Yes | Yes, on-device | Expo development build |
| iPhone/iPad | Yes | Yes, on-device | Expo development build |
| Expo Go | Yes | No | UI inspection only |
| Web browser | Yes | No native ML Kit bridge | UI inspection only |

The application code is shared between Android and iOS. Only the thin ML Kit integration layer is platform-specific.

## Technology and library stack

| Technology/library | Version in this project | Purpose |
| --- | --- | --- |
| Expo | 57 | App toolchain, native prebuild, development builds, and EAS integration |
| React Native | 0.86.3 | Cross-platform mobile UI and touch handling |
| React | 19.2.3 | Component and state model |
| TypeScript | 6.0 | Typed application, recognition contracts, and validation |
| Expo Router | 57 | File-based app entry point and future navigation support |
| Expo Modules API | Supplied by Expo 57 | Local Kotlin/Swift module exposed to TypeScript |
| Google ML Kit Digital Ink | Android 19.0.0 / iOS 8.0.0 | On-device handwriting model download and recognition |
| react-native-svg | 15.15.4 | Rendering captured strokes as smooth SVG paths |
| react-native-safe-area-context | 5.7 | Correct layout around notches and system areas |
| expo-linear-gradient | 57 | Header treatment and interface styling |
| expo-haptics | 57 | Success/error tactile feedback |
| @expo/vector-icons | 15 | Interface icons |
| ESLint + eslint-config-expo | 9.25 / 57 | Static code-quality checks |

No paid cloud OCR service or server is used. ML Kit performs inference locally after the selected model has been downloaded. This makes the prototype inexpensive to operate and avoids transmitting handwriting to a recognition API, but it does not by itself make the app medically compliant.

## Capabilities and practical capacity

### Current capabilities

- Captures finger, Apple Pencil, or compatible Android stylus movement as time-ordered strokes.
- Recognizes freehand words and short notes—not photographs of handwritten paper.
- Supports four configured models: US English (`en-US`), Hindi (`hi`), Tamil (`ta`), and Telugu (`te`).
- Downloads a language model once, reports its state, and reuses it offline.
- Uses canvas dimensions, point timing, stroke order, and up to 20 preceding characters to improve recognition context.
- Returns ranked recognition candidates, inserts the best candidate, and shows up to three alternatives.
- Allows the user to correct the final text manually before it is used elsewhere.
- Keeps the current ink and text in application memory only.

### Capacity characteristics

There is no server quota, per-request fee, or application-defined character limit. The practical unit of work is one visible writing pad and a short phrase at a time. Each gesture is stored as many `{x, y, t}` points, so extremely long continuous sessions increase memory use and can reduce recognition quality. The interface intentionally converts a small note, clears the canvas after success, and appends the result to the reviewed-text field.

For long clinical notes, use repeated short conversions. For complete pages, scanned forms, or existing images, use a document/OCR pipeline instead of this digital-ink pipeline. For signatures, store and verify the stroke data separately; converting a signature to text is not signature verification.

## Important: Expo Go is not enough

The recognizer contains custom Android and iOS native code, so it cannot be loaded by the standard Expo Go app. Use a local development build or an EAS development build. Expo Go/web can display the interface, but conversion is deliberately disabled there.

## Requirements

- Node.js 20 or newer
- npm
- Android Studio and an Android SDK for local Android builds
- For local iOS builds: macOS, Xcode, and CocoaPods
- For iOS builds from Windows: an Expo account and EAS Build

## Install

```powershell
cd D:\Clinical-Ink-Prototype
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is currently required by the Expo SDK 57 dependency graph used by this prototype.

## Run on Android

Start an emulator or connect a USB-debuggable device, then run:

```powershell
npm run android
```

This creates/updates the generated Android project, compiles the development client, installs it, and starts Metro. On later launches you can use `npm start` and open the already-installed development client.

## Run on iOS

On a Mac with Xcode:

```bash
npm run ios
```

From Windows, use EAS Build because Apple's toolchain only runs on macOS:

```powershell
npm install --global eas-cli
eas login
eas build:configure
eas build --platform ios --profile development
```

Install the resulting development build on a registered iPhone, then run:

```powershell
npm start -- --dev-client
```

The iOS bundle identifier and Android package are currently `com.prototype.clinicalink`. Change them in `app.json` before creating store or organization builds.

## How recognition flows

1. The home screen presents the supported languages.
2. Selecting a language stores it in memory and immediately opens the full-screen writing route.
3. The writing route contains only safe-area spacing, a Home back button, the expanding canvas, and fixed Undo/Clear/Convert controls.
4. `InkCanvas` records each pointer movement as an ordered `{ x, y, t }` point.
5. `useInkCanvas` groups points into strokes and supports undo/clear.
6. `useDigitalInk` prepares the selected language model and controls loading/error state.
7. `digitalInkService` validates the request and keeps UI code independent of native details.
8. `digitalInkApi` calls the local Expo module.
9. The Kotlin/Swift module converts the JSON strokes into ML Kit Ink, supplies the writing-area size and runs recognition.
10. ML Kit returns ranked candidates, which are kept in an in-memory recognition session rather than URL parameters.
11. Expo Router opens the result screen, where the best candidate is editable and alternatives are selectable.
12. The result screen's Back controls return to the full-screen writing workspace; the writing screen's Back control returns home.

### Runtime data flow

```text
Finger/stylus movement
        |
        v
InkCanvas -> useInkCanvas -> RecognitionRequest validation
        |                         |
        |                         v
        |                  digitalInkService
        |                         |
        |                         v
        |                    digitalInkApi
        |                         |
        +-------------------------v
                    Local Expo native module
                      /                 \
             Kotlin + ML Kit      Swift + ML Kit
                      \                 /
                       ranked candidates
                               |
                               v
                    editable reviewed text
```

### Recognition request shape

```ts
type RecognitionRequest = {
  ink: {
    strokes: Array<{
      points: Array<{ x: number; y: number; t: number }>;
    }>;
  };
  languageTag: string;
  writingArea: { width: number; height: number };
  preContext?: string;
};
```

Coordinates use the canvas coordinate system and `t` is a millisecond timestamp. The native layer converts this contract into the platform ML Kit objects.

## Project structure

```text
Clinical-Ink-Prototype/
|- src/
|  |- api/                 Native-module API boundary
|  |- app/                 Expo Router entry points
|  |- components/
|  |  |- ink/              Canvas-specific UI
|  |  `- ui/               Reusable presentation components
|  |- constants/           Supported language configuration
|  |- contexts/            In-memory result handoff between screens
|  |- hooks/               Canvas and recognition state
|  |- schemas/             Shared request/result types and validation
|  |- screens/             Composed application screens
|  |- services/            Recognition orchestration
|  |- theme/               Colors, spacing, radius, and typography
|  `- utils/               Stroke-to-SVG conversion
|- modules/digital-ink/
|  |- android/             Google ML Kit Kotlin bridge
|  |- ios/                 Google ML Kit Swift bridge
|  `- src/                 TypeScript native-module contract
|- app.json                Expo app and platform identifiers
|- eas.json                Development/preview/production build profiles
`- package.json
```

The root `android/` and `ios/` directories are generated output and are ignored by Git. Do not place product logic in them; keep native changes in `modules/digital-ink` so prebuild and EAS can reproduce both projects.

## Quality checks

```powershell
npm run typecheck
npm run lint
npm run doctor
```

To re-generate native projects after changing native dependencies:

```powershell
npx expo prebuild --clean
```

Do not use `--clean` if you have intentionally added manual changes inside generated native folders, because it replaces those folders.

## Common commands

| Command | What it does |
| --- | --- |
| `npm install --legacy-peer-deps` | Installs JavaScript dependencies |
| `npm start` | Starts Metro and the Expo development server |
| `npm start -- --dev-client` | Starts Metro specifically for an installed development client |
| `npm run android` | Builds, installs, and starts the Android development app |
| `npm run ios` | Builds and starts iOS locally; requires macOS/Xcode |
| `npm run web` | Opens the UI in a browser; recognition is unavailable |
| `npm run typecheck` | Checks TypeScript without emitting files |
| `npm run lint` | Runs Expo ESLint rules |
| `npm run doctor` | Checks Expo packages and project configuration |
| `npx expo prebuild` | Regenerates missing native projects without deleting them first |
| `npx expo prebuild --clean` | Fully regenerates native projects; destructive to manual native edits |

## Adding another recognition language

1. Confirm that Google ML Kit Digital Ink provides a model for the desired BCP-47 language tag.
2. Add its label, native label, and tag to `src/constants/languages.ts`.
3. Rebuild the development client only if native dependencies changed. A language-list-only change normally needs just a Metro reload.
4. Test model download, offline reuse, native-script handwriting, mixed numerals, and correction behavior on both platforms.

## Troubleshooting

### The app says conversion needs a development build

You are running in Expo Go or the browser. Build and install the native app with `npm run android`, `npm run ios`, or an EAS development build.

### A language stays in the downloading state or fails

Confirm that the device has internet access and free storage, then retry. The initial model is downloaded by ML Kit; later recognition can run offline.

### Native changes are not visible

JavaScript reloads cannot add native code. Rebuild the development client after changing Kotlin, Swift, the podspec, Gradle dependencies, or `expo-module.config.json`.

```powershell
npx expo prebuild
npm run android
```

For iOS, rebuild with Xcode or EAS instead.

### Android build cannot find the SDK

Install Android Studio and its SDK, then define `ANDROID_HOME` or ensure the generated `android/local.properties` points to the SDK. Start an emulator or enable USB debugging on a connected device.

### iOS cannot be built locally on Windows

This is an Apple toolchain restriction. Use EAS Build from Windows or open the same project on a Mac with Xcode and CocoaPods.

### PowerShell says `npm.ps1` cannot be loaded

Your Windows execution policy is blocking PowerShell wrapper scripts. Use `npm.cmd` in place of `npm` (for example, `npm.cmd run android`) or use Command Prompt. The project does not require changing the machine-wide execution policy.

## Security and privacy behavior

- Stroke data and recognized text are not sent to an application backend.
- Google ML Kit recognition runs on the device after downloading its model.
- The prototype does not persist notes, so restarting the app loses them.
- No logs should be added that contain patient names, diagnoses, identifiers, handwriting, or recognized note text.
- Device-level security, secure storage, encryption, authentication, authorization, audit logging, backups, and retention are outside this prototype.

If this is connected to a hospital system, treat both raw strokes and recognized text as potentially sensitive health data.

## Prototype boundaries

- Ink and recognized text live only in memory and disappear when the app closes.
- This is not yet a medical record system and has no authentication, audit trail, encryption-at-rest layer, consent flow, or EHR integration.
- Handwriting recognition is probabilistic. Clinical use must require human review before saving or acting on text.
- The current canvas recognizes one writing area at a time; document pages, signatures, and structured medical forms would need separate workflows.
- ML Kit model availability and accuracy vary by language and writing style.

Before production use in a hospital, add secure persistence, role-based access, audit logs, retention rules, error telemetry without patient content, accessibility testing, and the compliance controls required in the deployment country.
