# Tackle Tally — Claude Code Guidance

## What This App Is

Tackle Tally is a privacy-first fishing catch-log app for Australian recreational anglers. It is a **rugged utility tool**, not a social media app. The core value propositions in priority order:

1. **Ease of use in the field** — log a catch in ≤ 3 seconds with one wet hand in direct sunlight
2. **Privacy for serious anglers** — GPS data is private by default; secret spots stay secret
3. **Data analytics** — high-fidelity local capture (GPS, EXIF, barometric pressure) feeds future predictive features

## Current Stage

**Stage 1 — MVP Alpha** (April–May 2026)
Single-device, fully offline catch-logging tool. No backend, no accounts, no sharing. Test with Josh and ~10 fishing mates via Expo EAS preview builds.

**Key upcoming milestone:** AFTA Tackle Show, Gold Coast, 22 Aug 2026 — target for a solid demo build.

## Constitution

The project constitution is at `.specify/memory/constitution.md`. Read it before planning any feature. The non-negotiables are:

- **One-handed thumb-zone UI** — ≥ 48dp targets, primary actions in bottom two-thirds of screen
- **Offline-first** — all writes to local storage first, sync is always secondary
- **Full-fidelity storage** — original image + EXIF + precise GPS always preserved; no privacy tiers in Stage 1
- **YAGNI** — Stage 2+ features (social, sync, analytics) are not scaffolded in Stage 1

## Confirmed Tech Stack

| Concern | Choice |
|---|---|
| Framework | React Native, Expo managed workflow, TypeScript |
| Navigation | Expo Router |
| Styling | NativeWind v4 (custom components, no component library) |
| State | Zustand |
| Local DB | expo-sqlite + Drizzle ORM |
| Sensors | expo-camera, expo-location, expo-sensors (Barometer) |
| Distribution | Expo EAS Build + EAS Update |
| Backend (Stage 2) | Supabase + PostGIS |
| Auth (Stage 2) | Supabase Auth + Apple Sign-In |
| Sync (Stage 2) | Evaluate PowerSync or manual Drizzle sync against Supabase REST |
| Server state (Stage 2) | TanStack Query |

## Architecture Decisions

All architectural decisions are recorded as ADRs in `docs/adr/`. Read these before proposing changes to the stack.

| ADR | Decision |
|---|---|
| [ADR-001](docs/adr/001-react-native-expo.md) | React Native + Expo over PWA or native |
| [ADR-002](docs/adr/002-nativewind-custom-components.md) | NativeWind + custom components over component libraries |
| [ADR-003](docs/adr/003-expo-sqlite-drizzle.md) | expo-sqlite + Drizzle ORM for local storage |
| [ADR-004](docs/adr/004-supabase-postgis.md) | Supabase + PostGIS for backend (Stage 2) |
| [ADR-005](docs/adr/005-full-fidelity-storage.md) | Full-fidelity storage, social/privacy architecture deferred |
| [ADR-006](docs/adr/006-eas-distribution.md) | Expo EAS Build + EAS Update for distribution |
| [ADR-007](docs/adr/007-zustand-state.md) | Zustand for state management |

## Development Workflow (Speckit)

This project uses [Speckit](https://github.com/spec-kit/spec-kit) for feature development:

```
/speckit-specify   → write a feature spec
/speckit-plan      → create implementation plan
/speckit-tasks     → generate task list
/speckit-implement → implement tasks
```

Feature branches: `001-feature-name`, `002-feature-name`, etc.

## Key Data Notes

- **Timestamp**: system-generated at log time, not user-editable
- **GPS**: captured via `expo-location` at log time AND read from photo EXIF (iOS may omit EXIF GPS without explicit permission)
- **Barometric pressure**: captured via `expo-sensors` Barometer at log time — not available from EXIF
- **Images**: stored with full EXIF intact locally; EXIF stripped server-side before any sharing (Stage 2+)
- **No backdating**: data integrity depends on verifiable metadata

## Product Roadmap Reference

- Stage 1 (Apr–May 2026): One-handed logging, local DB, EXIF/sensor capture
- Stage 2 (Jun–Jul 2026): Private Crews, Supabase sync, multi-device
- Stage 3 (Aug 2026): Public launch, AFTA show, influencer partnerships
- Stage 4 (2027+): AI forecasting, brand/gear integration
