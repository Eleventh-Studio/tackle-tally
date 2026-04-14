# ADR-001: React Native + Expo over PWA or Native

**Date**: 2026-04-13
**Status**: Accepted

## Context

Tackle Tally needs to run on iOS and Android. Three platform approaches were evaluated: PWA, React Native (Expo managed workflow), and fully native (Swift/Kotlin).

The primary distribution constraint is that non-technical alpha testers (Josh's fishing mates) need to install and update daily builds without friction.

## Decision

**React Native with Expo managed workflow.**

## Rationale

**Why not PWA:**
- iOS Safari does not expose the barometric pressure sensor — a core data capture requirement
- PWA camera access on iOS is sandboxed; EXIF GPS is unreliable
- "Add to Home Screen" UX is noticeably inferior to a real app install
- Would require a full rewrite for native once the product matures

**Why not fully native (Swift/Kotlin):**
- Requires two separate codebases for iOS and Android
- Slower iteration for a solo/small-team Stage 1 build
- Distribution to non-technical testers is harder without Expo's tooling

**Why Expo managed workflow:**
- Single TypeScript codebase for both platforms
- Expo EAS Build generates real `.ipa`/`.apk` builds distributable via a shareable link — close to web-level simplicity for testers
- Expo EAS Update allows OTA JS updates; testers get new code on app open without reinstalling
- Full access to device sensors (camera, GPS, barometer, haptics)
- Expo SDK covers all required native capabilities without ejecting
- Strong ecosystem and active maintenance

## Consequences

- Bound to Expo SDK compatibility for new native dependencies
- Native module ejection would require a constitution amendment and new ADR
- Apple Developer account ($99/year) required for iOS builds
