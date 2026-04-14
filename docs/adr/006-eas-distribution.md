# ADR-006: Expo EAS Build + EAS Update for Distribution

**Date**: 2026-04-13
**Status**: Accepted

## Context

Non-technical alpha testers (fishing mates) need to install and receive daily builds without friction. The distribution mechanism must work for both iOS and Android before App Store submission.

## Decision

**Expo EAS Build for native builds distributed via shareable link. Expo EAS Update for OTA JavaScript updates.**

## Rationale

**EAS Build:**
- Generates real `.ipa` (iOS) and `.apk`/`.aab` (Android) builds in the cloud — no local Xcode/Android Studio required
- Builds are distributed via a shareable URL; testers tap the link and install directly
- iOS internal distribution requires device UDID registration (one-time, ~2 minutes per tester)
- Eliminates the need for TestFlight for internal alpha testing

**EAS Update (OTA):**
- JavaScript/asset changes can be pushed as over-the-air updates
- Testers receive new code on the next app launch — no reinstall required
- Enables daily build distribution without the overhead of a full native build each time
- Native code changes (new native modules, config changes) still require a full EAS Build

**Alternatives considered:**
- TestFlight: iOS only, requires Apple review for external testers, more process overhead
- Firebase App Distribution: requires installing a companion app; slightly more friction than EAS
- Direct APK sideloading: Android only; iOS requires enterprise certificate or TestFlight

## Consequences

- Apple Developer account ($99/year) required before any iOS builds
- iOS device UDIDs must be registered in the Apple Developer portal for internal distribution
- OTA updates are limited to JS/asset changes — any new native dependency requires a new EAS Build pushed to testers
- EAS free tier allows 30 builds/month; sufficient for alpha, may need a paid plan at beta scale
