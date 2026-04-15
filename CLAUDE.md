# Tackle Tally — Claude Code Guidance

## What This App Is

Tackle Tally is a privacy-first fishing catch-log app for Australian recreational anglers. It is a **rugged utility tool**, not a social media app. The core value propositions in priority order:

1. **Ease of use in the field** — log a catch in ≤ 3 seconds with one wet hand in direct sunlight
2. **Privacy for serious anglers** — GPS data is private by default; secret spots stay secret
3. **Data analytics** — high-fidelity local capture (GPS, EXIF, barometric pressure) feeds future predictive features

## Current Stage

**Stage 1 — MVP Alpha** (now → 31 May 2026)
Single-device, fully offline catch-logging tool. No backend, no accounts, no sharing.

Exit criteria: Josh and ~10 fishing mates have used it for at least one week of real fishing with no crashes.

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

## Product Roadmap

### Stage 1 — MVP Alpha (now → 31 May 2026)
**Goal:** Real-world validated catch logging on a single device, fully offline.

| Milestone | Date |
|---|---|
| EAS dev build — maps working, distributed to Xi + Josh | 30 Apr 2026 |
| EAS preview build — distributed to fishing group (~10 mates) | 15 May 2026 |
| Stage 1 complete — 1 week crash-free daily use by group | 31 May 2026 |

Scope:
- One-handed photo-first catch logging (✅ done)
- GPS capture at log time (✅ done)
- Species picker with custom entry (✅ done)
- Sessions (✅ done)
- Map view (✅ done)
- Fix TypeScript errors in useStats + CatchDetailScreen
- Barometer display in catch record
- EXIF GPS extraction from gallery photos
- Photo file persistence (copy to app documents dir on save)
- Session detail screen
- Google Maps API key for Android EAS builds
- Settings screen (unit preferences: cm/in, kg/lb)

### Stage 2 — Connected Beta (1 Jun → 18 Jul 2026)
**Goal:** Accounts, cloud sync, and Private Crews — Xi and Josh can see each other's catches in a shared crew.

| Milestone | Date |
|---|---|
| Supabase project live, auth (email + Apple Sign-In) working | 15 Jun 2026 |
| Catch sync end-to-end (local → cloud, cloud → local) | 1 Jul 2026 |
| Private Crews MVP — invite, shared catch feed | 18 Jul 2026 |

Scope:
- Supabase project setup + schema migration
- Auth: email/password + Apple Sign-In (required for iOS App Store)
- Catch sync engine (offline-first, conflict resolution)
- Photo upload to Supabase Storage (EXIF stripped)
- Species global database (see ADR-008)
- Private Crews: invite by link, shared catch feed, no social feed
- Multi-device: same account on phone + tablet

### Stage 3 — AFTA Demo Build (19 Jul → 8 Aug 2026)
**Goal:** Polished, stable, demo-ready build for the AFTA Tackle Show. 30-minute unassisted demo with no issues.

| Milestone | Date |
|---|---|
| Feature freeze | 1 Aug 2026 |
| Final demo build (EAS + TestFlight) submitted | 8 Aug 2026 |
| **AFTA Tackle Show — Gold Coast** | **22 Aug 2026** |

Scope:
- AI species identification (photo → species suggestion)
- Catch analytics: personal stats, heatmaps, best conditions
- Performance pass: launch time, scroll, image loading
- Onboarding flow for new users at the show
- App Store submission (iOS)

### Stage 4 — Public Launch & Growth (Sep 2026 →)
**Goal:** App Store public listing, recurring revenue, brand partnerships.

Scope (to be specced):
- Public App Store listing (iOS + Android)
- AI fishing forecast (conditions → predicted species + locations)
- Tide, moon phase, weather enrichment
- Gear tracking and brand integration
- Influencer partnership tools
