<!--
SYNC IMPACT REPORT
Version change: 1.0.0 → 1.1.0
Added: Principle VII (Full-Fidelity Data Storage), complete stack details in Principle V, EXIF pipeline, sensor capture
Modified: Principle V expanded with full confirmed stack; Principle VI strengthened with explicit Stage 2+ deferral
Templates updated:
  ✅ .specify/templates/plan-template.md — Technical Context defaults reflect confirmed stack (unchanged from v1.0.0)
Deferred TODOs:
  - Social sharing architecture (privacy tiers, location blurring) — explicitly deferred to Stage 2
  - PowerSync vs WatermelonDB sync layer — evaluate at Stage 2
  - Blurring granularity for shared catches — deferred to Stage 2
-->

# Tackle Tally Constitution

## Core Principles

### I. Privacy by Default
All user-generated data (GPS coordinates, catch locations, metadata) is private to the owner's account by default. No data is shared with any other user or third party without an explicit, user-initiated action. Social and sharing features are a Stage 2+ concern and MUST NOT be scaffolded in Stage 1 code.

### II. One-Handed Thumb-Zone UI (NON-NEGOTIABLE)
Every screen in the primary logging flow MUST be fully operable with a single thumb on a standard phone. This means:
- Touch targets MUST be ≥ 48 × 48 dp
- Primary actions MUST be reachable in the bottom two-thirds of the screen
- No critical action may require two hands, a stylus, or precise tap accuracy
- High-contrast mode MUST be supported for direct-sunlight readability
- The core catch-log flow MUST be completable in ≤ 3 taps / ≤ 3 seconds

Any feature that violates the thumb-zone constraint MUST be flagged as a constitution violation and justified in the plan's Complexity Tracking table.

### III. Offline-First / Sync-Later (NON-NEGOTIABLE)
The app MUST function completely without any network connection. This means:
- All writes go to local storage first; sync is always secondary and non-blocking
- No feature may be gated behind a live network call at capture time
- Metadata (timestamp, GPS, barometric pressure) MUST be captured and stored locally at the moment of logging, not deferred to sync
- Sync failures MUST be silent and retried; they MUST NOT degrade the in-field UX

### IV. Full-Fidelity Data Storage
Every catch record MUST be stored with complete, unmodified data:
- Original image file preserved with EXIF intact in the user's private storage
- Precise GPS coordinates (device location at log time)
- EXIF GPS coordinates (from photo metadata, if present)
- System-generated timestamp — NOT user-editable post-creation
- Barometric pressure captured via device sensor at log time
- Device make/model recorded for data integrity

This full-fidelity record is the permanent source of truth. Derived representations (compressed images, blurred coordinates, stripped EXIF) are generated on-demand for specific purposes (sharing, display) and MUST NOT replace the source record. Privacy tier design and sharing architecture are explicitly deferred to Stage 2.

### V. Confirmed Technology Stack
The app is built on this stack. Deviations require a constitution amendment and ADR.

**Mobile (Stage 1+)**
- Framework: React Native, Expo managed workflow, TypeScript
- Navigation: Expo Router (file-based)
- Styling: NativeWind v4 (Tailwind utility classes)
- UI components: Custom — no third-party component library
- State: Zustand (app/local state)
- Local DB: expo-sqlite + Drizzle ORM
- Sensors: expo-camera, expo-location, expo-sensors (Barometer)
- EXIF: expo-media-library for reading; EXIF stripped server-side before any sharing
- Distribution: Expo EAS Build + EAS Update

**Backend (Stage 2+)**
- Platform: Supabase (PostgreSQL + PostGIS extension)
- Auth: Supabase Auth — email/password + Apple Sign-In (mandatory for iOS App Store)
- Storage: Supabase Storage (original images, private per user)
- Sync: expo-sqlite + Drizzle manual sync against Supabase REST; evaluate PowerSync at Stage 2
- Server state (client): TanStack Query added at Stage 2

**Analytics (Stage 3+)**
- Geo-spatial queries: PostGIS (proximity, regional aggregation, fuzzy zone generation)
- External enrichment: tide APIs (BOM or tides.net.au), moon phase (computed), weather
- Aggregation: PostgreSQL materialized views; ML layer TBD at Stage 3

### VI. Simplicity & MVP Discipline
Stage 1 is a one-handed logging tool and nothing else. Features that belong to Stage 2+ (social, cloud sync, analytics, forecasting, sharing) MUST NOT be scaffolded, stubbed, or have placeholder schema fields added in Stage 1 code. YAGNI is strictly enforced. Every added dependency or abstraction MUST be justified by an immediate Stage 1 requirement.

### VII. Data Integrity Over Data Volume
Catch records MUST include verifiable metadata. The app MUST NOT allow backdating catches (timestamp is system-generated). This is the foundation of the Phase 3 forecasting value — the usefulness of aggregated analytics is directly proportional to the quality of individual records captured in Stage 1.

## Development Workflow

- Feature branches follow sequential numbering: `001-feature-name`, `002-feature-name`, etc.
- Every feature starts with a spec (`/speckit-specify`) before any implementation begins
- Plans (`/speckit-plan`) document technical context and must pass the Constitution Check gate before Phase 0 research
- Tasks (`/speckit-tasks`) are organized by user story to enable independent delivery
- ADRs are maintained in `docs/adr/` — any deviation from the confirmed stack requires a new ADR
- Commits are auto-staged at key workflow transitions per `.specify/extensions.yml` hooks

## Governance

This constitution supersedes all other development practices and guidelines. Amendments require:
1. A documented rationale explaining why the principle no longer serves the product
2. A new or updated ADR in `docs/adr/`
3. A migration plan for any existing code that relied on the amended principle
4. A version bump (MAJOR for principle removal/redefinition, MINOR for additions, PATCH for clarifications)

All spec reviews and implementation plans MUST verify compliance with Principles I–VII before proceeding.

**Version**: 1.1.0 | **Ratified**: 2026-04-13 | **Last Amended**: 2026-04-13
