# Utility Lab for iPhone

This is the local Capacitor 8 native iOS wrapper for the React web app. It contains an Xcode project, a UIKit/WKWebView entry point, and Swift Package Manager configuration. It has not been compiled, signed, or tested in an iOS Simulator or on an iPhone.

- Display name: **Utility Lab**
- Bundle identifier: `app.utilitylab.cs2`
- Minimum deployment target: **iOS 15.0**
- Capacitor iOS runtime: **8.6.0**, pinned by the generated Swift package
- Web build directory: `dist`, copied into the native app by Capacitor
- Native dependency manager: **Swift Package Manager**, without CocoaPods

## Run on a Mac

Install Node.js 22 or newer, Xcode 26 or newer, and the Xcode Command Line Tools. From the `utility-lab` directory, run:

```sh
npm ci
npm run ios:sync
npm run ios:open
```

`ios:sync` builds the current web app and copies its assets and configuration into this native project. Run it again after web changes. Generated web assets and `capacitor.config.json` are intentionally ignored by Git, so this step is required after cloning.

`ios:open` opens `ios/App/App.xcodeproj` in Xcode. Let Xcode resolve Swift packages, choose an iPhone simulator, and run the **App** scheme. To run on a physical iPhone, select a development team in the App target's Signing & Capabilities settings and choose the connected device.

Do not run `cap add ios` again; this repository already includes the platform project. Make shared app changes in `capacitor.config.ts` and sync rather than editing its generated JSON copy.

## What was checked on Windows

`npx cap add ios --packagemanager SPM` completed successfully on 9 November 2026. The CLI generated the native project, copied the existing local `dist` assets, and wrote the SPM dependency package. The bundle identifier, display name, deployment target, package version and generated configuration were inspected.

Windows can prepare and sync this source project. Apple's build tools, the iOS Simulator, native compilation and device signing require macOS and Xcode. No native build or release verification is claimed. See Capacitor's [environment requirements](https://capacitorjs.com/docs/getting-started/environment-setup), [iOS workflow](https://capacitorjs.com/docs/ios), and [Swift Package Manager guide](https://capacitorjs.com/docs/ios/spm).

## Native artwork

The native icon and launch screen use the approved blue and white Waypoints artwork from `public/icon.svg`. The 1024px icon has a full square, opaque blue background; iOS supplies the corner mask. The launch image places the same mark on the app's `#f5f5f2` background. Editable SVG sources are in `ios/BrandAssets`.

To regenerate these local assets from the shared brand source, run `node ios/scripts/generate-brand-assets.mjs` from `utility-lab`. The script uses the project's Playwright dependency and Microsoft Edge on Windows. On other systems, install Playwright's Chromium browser first or set `PLAYWRIGHT_CHANNEL` to a locally installed supported browser. It does not load external media.

## Draft limits

The interactive Utility Lab interface is the bundled web app. Creator videos and remotely linked photos require a network connection. Native playback, file import/export, keyboard behavior, safe areas and landscape board interactions need an iPhone/Simulator check before distributing this draft.

There are no signing certificates, provisioning profiles, Apple account details or App Store submission settings in this project.
