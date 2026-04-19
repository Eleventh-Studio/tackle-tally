# Tackle Tally Roadmap — v2 Draft

**Status**: Draft for Andreas + Josh review
**Date**: 2026-04-15
**Prepared by**: Xi, synthesising a cross-discipline review (product management, product design, UX, architecture, engineering)

## Purpose

This doc is the detailed version of the stage-by-stage plan that previously lived inline in `CLAUDE.md`. It refines each stage with the additions surfaced by the review and flags effort realities and risks. **Dates and milestones are unchanged** — this is about refining scope, not moving goalposts.

Decisions that still need human input (from Andreas, Josh, or both) are collected in the companion doc [`roadmap-open-questions.md`](./roadmap-open-questions.md). Nothing here is final; this is the draft we're taking into the roadmap review meeting.

## Principles snapshot (unchanged, non-negotiable)

These are the rules we agreed at the start of the project. They shape every scope decision below.

- **Privacy by default** — GPS coordinates and catch locations stay on the owner's device. Nothing is shared with any other user or third party without an explicit, user-initiated action. No public social feeds, no default-public data.
- **One-handed thumb-zone UI** — The core catch-log flow must work with one thumb on a standard phone, in direct sunlight, in under 3 taps and 3 seconds. Touch targets are a minimum of 48 screen-units (roughly a thumb pad). This is how anglers actually use the app on the water.
- **Offline-first** — The app must work without any network connection. Writes go to the device first, sync (Stage 2+) is always secondary and non-blocking.
- **Full-fidelity storage** — Every catch preserves the original photo with all its embedded metadata (EXIF — the GPS, timestamp, and camera settings baked into the file by the camera), the device's precise location at log time, barometric pressure (if the phone has the sensor), and a system-generated timestamp. No compression, no stripping.
- **YAGNI in Stage 1** — "You Aren't Gonna Need It." We don't build Stage 2+ features ahead of time, even as placeholder schema or commented-out code. Keeps the Stage 1 codebase small, focused, and easy to reason about.

## Design concept: multiple capture styles

Field testing by Andreas and Josh (April 2026 camping trip) revealed that anglers use at least three distinct capture styles, sometimes switching between them within a single trip:

1. **Quick-snap-and-go** — one photo, auto-GPS, auto-barometer, done, back to fishing. This is the constitution's primary target (≤3 seconds, one hand).
2. **Curated multi-shot** — multiple photos of the same catch, picking the best one later. These users care about the photo as much as the data.
3. **Retrospective entry** — logging catches from memory at camp or at home after the trip. Possibly no photo, approximate time, species from recall.

**Design principle**: support all three styles without punishing any, but differentiate the data-quality signal. A catch logged in-the-moment with photo + GPS + barometer is richer for Stage 3-4 analytics than a retrospective text entry. Both are first-class catch records, but the metadata quality difference should be visible — for example, a subtle "full-fidelity" indicator on catches where GPS and barometer were auto-captured at log time.

**Principle IV refinement**: "Full-fidelity storage" is reinterpreted as "capture everything available at log time and clearly mark what was auto-captured vs manually entered" rather than "every catch MUST have photo + GPS + barometer." What's available during a retrospective logging session (no GPS from the fishing spot, no barometer reading, possibly no photo) is honestly stored as such — the principle is about truthfulness of what was captured, not completeness of every field. A constitution amendment to v1.2.0 may be warranted; flagged for review.

**Trade-off to watch**: if retrospective logging is too easy or too prominent, users may default to it, and the dataset loses the in-moment metadata advantage that differentiates us from a plain logbook. The app should gently incentivise in-moment capture (e.g. "capture now for full conditions data") without blocking alternatives. A missing record is always worse than a sparse one.

---

## Cross-cutting — do in Stage 1 even though they feel like Stage 2

The review flagged several foundational items that are much cheaper to add now than to retrofit later. These aren't Stage 2 features — they're plumbing that makes Stage 2 achievable without rewrites.

- **Use UUIDv7 for catch and session IDs** — UUIDv7 is a newer style of unique identifier that embeds a timestamp. It's compatible with Supabase's UUID format (what we'll use in Stage 2) and keeps catches ordered correctly when synced from multiple devices. Switching ID formats later forces rewriting every reference across the codebase.

- **Add `last_modified_at`, `sync_state`, and `photo_sha256` columns to the database now** — Three small additions: (1) when was this record last edited, (2) does this record need to be synced to the cloud yet, and (3) a content hash of the photo (used later for deduplicating uploads). Retrofitting these later means every existing catch defaults to "just now" for `last_modified_at`, which erases the real edit history that sync and analytics both rely on.

- **Add a `schema_version` marker** — A tiny record in a `_meta` table telling future versions of the app which database shape they're looking at. Makes Stage 2 migrations safer and reversible.

- **Wire up Sentry before the first EAS preview build (mid-May), not Stage 2** — Sentry is a crash-reporting service. If the app crashes on Josh's phone on the water, Sentry tells us why. Without it, we're flying blind — Josh reports "it crashed once" and we have nothing to work with. Setup is about half a day. The free tier easily covers 10 users.

- **Add pure-function unit tests for coordinate math, formatters, and EXIF parsing** — About two hours of work, high value. These are the functions that calculate GPS distances and parse the GPS data inside photos. Bugs here cause silent data corruption (wrong GPS on a catch) — the worst kind of bug for a fishing app, because the user doesn't notice until much later.

- **Ship "export-my-data" before cloud sync** — A button in Settings that exports all catches as a JSON file plus a zip of photos. Privacy-first users expect this before they trust cloud sync — it's their escape hatch. Shipping it first is a trust signal, not a retention risk.

- **Prune the `prototype/` folder** — The Base44 prototype is still committed in the repo. It leaks early product direction to any external contributor or anyone browsing the GitHub repo. Delete it or add to `.gitignore`.

---

## Stage 1 — MVP Alpha (→ 31 May 2026)

**Goal**: 10 alpha users log at least 5 catches each over a full week of real fishing, with no crashes.

### Scope additions from the review

Most are small UX wins that defend the "≤3 seconds, one hand" promise.

- **Quick-log express path** — Press and hold the LOG button on the Home screen to skip straight to the camera. The moment the shutter fires, the catch is saved as a draft with just the photo, GPS, and pressure. Species, size, and notes can be filled in later or left blank. *Why:* the current flow puts two screens between "I see a fish" and "it's saved" — that's a friction tax when the fish is flopping.

- **Draft persistence on photo capture** — As soon as the camera returns the photo, we save the record. Currently the save only happens when the user taps the final confirm screen. If the app is killed mid-log (phone rings, app crashes, user backgrounds it), the photo is lost. Fix: save a draft immediately; treat the confirm screen as "edit and commit", not "first save".

- **Haptic and optional audio confirmation on save** — Phone buzzes (and optionally chirps) when the save succeeds. *Why:* with wet hands or sun glare on the screen, the user often can't tell visually whether the tap registered.

- **Permission pre-brief card** — Before iOS or Android pops the system permission prompt for camera/location, we show a one-line explanation ("Camera: for catch photos" / "Location: for your private catch map — never shared"). *Why:* the system prompt is terse; users default to "Don't Allow"; we can't easily recover from a denial.

- **"Save anyway" escape hatch** — If GPS times out, species isn't picked, or the photo file fails to write, we never block the save. We persist what we have and mark missing fields as amber chips on the catch card, editable later. *Why:* in the field, demanding a perfect record is demanding that the user lose data.

- **Species picker — recent and pinned first, then full A-Z** — The top of the picker shows the last 5 species you logged and 3 species you've pinned as favourites. Only then the full alphabetical list of ~180. *Why:* 80% of catches are the species you caught yesterday. Scrolling past 180 names each time is friction.

- **"Last catch" thumbnail on Home** — A small image of your most recent catch above the main LOG button. Tap to view or edit. *Why:* the repeat-log pattern (catching the same species at the same spot, 5 in a row) needs a fast edit path.

- **Settings screen additions** — On top of units (cm/in, kg/lb): haptic feedback toggle, storage usage meter ("412 MB used, ~3,200 more catches fit"), export-my-data, delete-all-data. *Why:* privacy-first users expect control knobs; the storage meter in particular is important because full-fidelity originals are large files.

- **Sun Mode toggle (high-contrast variant)** — A toggle in Settings that switches the UI to a higher-contrast variant (possibly black-on-yellow or pure white-on-black) for direct sunlight. Stretch goal: auto-trigger via the phone's ambient light sensor. *Why:* the current dark theme with lime accents is pretty but unvalidated in QLD midday sun — an untested risk worth mitigating early.

- **Photo-optional catches** — Allow saving a catch without a photo. Some fish are released before a photo is taken; some catches are logged retrospectively from memory at camp or at home. Species + time are the minimum viable record. GPS and barometer are auto-captured if the user is logging in the field, or stored as null/approximate if logging from home. Catches without a photo show a placeholder icon and are clearly distinguishable so analytics can weight data quality appropriately. *Why:* field testing (April 2026) confirmed retrospective logging is a real workflow, not an edge case. (Resolves Josh question 4 in open-questions doc.)

- **Simple time-correction on new catches** — When logging a catch, offer a time picker defaulting to "now" with quick options ("~30 min ago", "~1 hr ago", custom). The catch record stores both the system timestamp (`logged_at` — when the user actually saved it, immutable) and the user-adjusted time (`caught_at` — when they say it happened, defaults to `logged_at`). The gap between the two becomes a data-quality signal for Stage 3-4 analytics: zero gap = full-fidelity in-moment capture; large gap = retrospective entry. *Why:* retrospective loggers need to indicate when the catch actually happened, not when they opened the app. (See reframed Joint question 6 in open-questions doc.)

### Defended scope — do NOT add to Stage 1

Each of these is a Stage 2+ feature masquerading as a polish item.

- **No reverse geocoding** (turning GPS coordinates into a place name like "Moreton Bay, QLD") — adds a network dependency. Stage 2.
- **No weather auto-fetch** — adds network and an external API dependency. Stage 3.
- **No AI species ID** — a major engineering lift with model-training questions. Stage 3.
- **No community or social tab** — hide it entirely in Stage 1. An empty tab advertises a feature we don't yet have, contradicting the brand.
- **No placeholder schema columns for Stage 2 features** — the cross-cutting sync columns above are infrastructure, not feature scaffolds. No `crew_id`, no `shared_with` columns in Stage 1.

### Success metrics

How we'll know Stage 1 succeeded.

- 10 out of 10 alpha users log ≥5 catches in one week of real fishing
- Median time to log a catch < 5 seconds; stretch goal < 3 seconds
- 100% of logged catches include GPS and barometric pressure (measures that the capture-at-log-time pipeline is working)
- Zero crash reports in the final week before 31 May
- One-question NPS ("How likely would you recommend this to a fishing mate?") from Josh's crew averages ≥ 8 out of 10

### Key risks

- **iCloud `ph://` URIs (iOS)** — When a user picks a photo from their iOS gallery, it can come back as an iCloud reference rather than a local file. Copying the reference directly fails silently when iCloud purges the cache. We need to force-download the asset via `expo-media-library` before copying. This is a silent data-loss bug if unhandled.

- **Barometer absent on cheap Android devices** — Budget Androids often skip the pressure sensor. We need to handle this gracefully (save the catch with a null pressure) and never block on it.

- **Dark theme in midday QLD sun** — Untested. Cheap to change in April, expensive to change after the mates have the preview build. See Josh question 11 in the open-questions doc.

- **Species list curation is single-point-of-failure on Josh** — If Josh is unavailable in May for list sign-off, Stage 1 slips. Need a backup reviewer or a "good enough for alpha" gate.

### Engineer effort estimate

About 9 dev days of scoped work plus 3-5 days of polish and bug fixes from field testing. Realistic if the EAS preview build slips from 15 May to 18-20 May.

---

## Stage 2 — Connected Beta (1 Jun → 18 Jul 2026)

**Goal**: accounts, cloud sync, and Private Crews — Xi and Josh can see each other's catches in a shared crew.

### Critical foundational work — per-catch privacy tiers (Stage 2 blocker)

Before we can ship crews, we need to decide how each catch's privacy is controlled. The constitution currently defers this, but Stage 2 must un-defer it. The model under discussion:

| Tier | What it means |
|---|---|
| **Private** | Only you see it. (Default.) |
| **Crew-precise** | Crew members see the exact GPS. |
| **Crew-fuzzy** | Crew members see a rounded location (e.g. 1 km hex) — they know which bay, not which rock bar. |
| **Never share** | Locked private forever, even if you later change crew settings. |

Each catch has one tier, settable at log time with a single toggle, changeable later. The default tier is one of the open questions (see [`roadmap-open-questions.md`](./roadmap-open-questions.md), Joint decision 1). This is the single biggest privacy-architecture decision of the project.

### Scope additions

*The first two items apply regardless of which sharing model is chosen. The remaining items are conditional on the sharing-model decision (see open-questions doc, Joint decisions).*

- **Multi-photo per catch** — Schema change from one photo per catch to a `catch_photos` table (one-to-many), with a designated "hero photo" for display. Users can take multiple shots of the same catch and select the best one afterwards. All originals preserved per Principle IV. *Why:* field testing (April 2026) confirmed the "curated multi-shot" capture style — some anglers take several photos to get the perfect shot. Deferred from Stage 1 to keep the initial schema simple; single-photo continues to work as a special case of multi-photo.

- **Full retrospective entry flow** — A dedicated "Log from memory" path where the user enters species, estimated catch time (via the dual-timestamp picker from Stage 1), optional location name or map-pin drop, and an optional photo. Auto-captured metadata (current GPS, barometer) honestly reflects the logging location and time, not the fishing spot — clearly marked as retrospective. Data-quality signal system surfaces the difference between in-moment and retrospective catches in analytics. *Why:* field testing confirmed that sitting down at camp or at home to organise the day's catches is a real and common workflow that the app should support, not fight.

- **Crew Map with fuzzy pins** — A shared map showing all crew members' catches. If the catch is tagged `Crew-precise`, it shows as an exact pin; if `Crew-fuzzy`, it shows inside a hex cell (likely 1 km across). *Why:* makes the crew valuable without leaking specific spots unless the owner chooses to.

- **Crew Session invites** — When a crew member starts a fishing session and other crew members are within 500m, they get a push notification: "Josh started a session at Hawkesbury — join?" *Why:* encourages real-time shared sessions without being a generic social feed.

- **Crew reactions (emoji only)** — Crew members can react to each other's catches with a small set of emoji (🎣 🔥 😳 🐋). No likes, no public engagement metric. *Why:* a private high-five fits the "trusted circle" model without turning into social media.

- **Crew join via QR code (in addition to link)** — One crew member shows their phone, another scans. *Why:* on a wet dock, tapping a link and copy-pasting doesn't work. Scanning does.

- **Sync status as a header pill, not a modal** — A small "Synced 2m ago" or "3 pending" indicator in the top-right corner. *Why:* never interrupt the field flow with a sync dialog.

- **Per-field "last-write-wins" conflict resolution** — If two devices edit the same catch (e.g. phone edits species, tablet edits weight), both edits are preserved. The simpler "per-row last-wins" would drop one edit. *Why:* Stage 2 explicitly promises multi-device support, so this matters. Implementation is a small JSON column tracking the last-modified timestamp per field.

- **Photo upload policy: originals private, derivatives on share** — When a catch is uploaded, the original (EXIF intact) goes to a private Supabase Storage bucket that only the owner can access. If the user shares the catch to a crew, a cloud function generates a separate EXIF-stripped copy at share time. The private bucket is never exposed. *Why:* keeps the full-fidelity principle while still letting sharing work safely.

- **Row-level security in the database** — Every table gets a rule that says "you can only see rows that belong to you, or rows shared with a crew you're in". Crew sharing is done via a separate join table, not a column on the catch record, which means unsharing doesn't require modifying the catch itself. *Why:* one bad rule here leaks private catches to other users — this needs tests.

### Sync engine decision checkpoint — 15 Jun 2026

Two options for how the phone syncs with the cloud:

- **Manual sync** (Xi writes the code): ~2 weeks to build, full control, no third-party dependency, free.
- **PowerSync** (a paid product that handles sync for us): ~USD 35/mo minimum, has SQL constraints, less control over behavior.

Default is manual sync. PowerSync is only justified if we hit multi-writer crew editing complexity that the manual path can't handle. Decision point is 15 Jun. See open-questions doc for the business framing.

### Effort reality check

Engineer estimate: about 25-28 dev days of work versus 25 calendar days available (accounting for meetings and real life). **Dangerously tight.** The sync engine alone is 8-10 days. If we fall behind, the cut is: keep auth + sync + invite + read-only shared feed; defer reactions, crew sessions, and QR invites to Stage 3.

### Key risks

- **Sync engine built ad-hoc becomes unmaintainable** — Sync is the kind of code that rots fast if it grows bullet-point by bullet-point. Mitigation: explicit state machine, comprehensive test fixtures, ~2 weeks budget not "a few days".

- **Row-level security policy mistake leaks private catches** — One wrong SQL rule and another user sees your catches. Mitigation: automated security tests before any RLS change ships.

- **Apple Developer account must be active and enrolled by 15 Jun** — Apple Sign-In is required for the iOS App Store. Enrolment lead time is 1-2 weeks. Need to confirm status now, not in June.

---

## Stage 3 — AFTA Demo Build (19 Jul → 22 Aug 2026)

**Goal**: a polished, stable, demo-ready build for the AFTA Tackle Show. Specifically, a 30-minute unassisted demo at the booth with no visible issues.

### Scope additions

- **Demo Mode (hard requirement)** — A one-tap reset in Settings that wipes user data and seeds the app with 12 sample catches and 2 sessions. Must ship by 1 Aug feature freeze. *Why:* booth staff need to reset the demo device between visitors without rebuilding sample data by hand.

- **Kiosk mode** — If the app is idle for more than 2 minutes, a dismissible 30-second guided tour overlay auto-plays. *Why:* booth staff can't re-pitch every visitor; the app walks them through the core story.

- **AI species ID** — The user photographs a fish, and the app suggests the top 3 species with confidence bars. User taps one to confirm, or overrides with the manual picker. Never auto-assigns. Runs on-device first (using a lightweight ML model shipped with the app), with an optional cloud fallback if confidence is low and the user opts in. *Why:* keeps working offline, keeps photos private by default, demos reliably at the booth without WiFi.

- **Personal heatmap (private, local-only)** — A map view showing your own catch density as a heatmap. Uses only your own data — no other users' catches visible. *Why:* the first "wow" analytics view for AFTA demos; doesn't depend on any network call.

- **Conditions correlation card** — "You catch 3× more bream when barometric pressure is falling." One insight at a time, cited to actual records. *Why:* the payoff of the full-fidelity data capture — shows the user what their own data is telling them. Demo gold.

- **Annual Summary — "2025-26 season Wrapped"** — Spotify-Wrapped-for-fishing: top species, biggest catch, most productive month, total time on water. Generates a shareable card (EXIF stripped). *Why:* AFTA is late in the 2025-26 fishing season — natural timing. Works as a yearly re-engagement hook forever.

- **Observability: Sentry (crashes) + PostHog (usage)** — Both self-hosted where possible. No personally identifying info; no precise GPS in telemetry. *Why:* at public launch (Stage 4) we need crash and usage data to iterate; can't turn it on from cold, needs to be in place.

- **Performance budgets, measured at feature freeze** — Cold start < 2 seconds on iPhone 12; catch-log flow < 3 seconds tap-to-saved; scroll at 60fps with 1,000 catches in the list; map pan < 1 second with 500 pins clustered. *Why:* AFTA is where hundreds of fishing industry people form their opinion of the app. Slow is worse than missing features.

### AFTA narrative constraint

Build one 3-minute demo story ("Josh's Sunday morning at Moreton Bay") that hits log-catch → map → analytics → AI species ID. Anything outside that story is a cut candidate.

### Cut order if behind

In order of how much we can tolerate cutting:

1. **Heatmap → simple pin map** (still shows the catches, just without the density visualization)
2. **AI species ID → faked top-5 regional dropdown** (the booth demo still works; real ML slips to Stage 4)
3. **Onboarding flow → defer to Stage 4** (AFTA visitors get a staffed walkthrough, not an in-app one)

**Non-negotiable**: performance pass, Demo Mode, App Store submission by 1 Aug.

### Effort reality check

Engineer estimate: about 16 dev days of work vs 18 calendar days available. **Zero slack.** App Store submission must go in by **1 Aug** to survive 1-2 possible rejection cycles before the 22 Aug demo date.

---

## Stage 4 — Public Launch & Growth (Sep 2026 →)

### Launch posture — soft launch first

Stage 4 public launch is phased, not a single worldwide "go":

- **Phase 1** — iOS-only, AU-only, invite codes from the AFTA cohort plus referrals. 4-6 weeks.
- **Phase 2** — widen to AU public listing (iOS) + Android Closed Testing on Play Store.
- **Phase 3** — global, Android full release.

*Why:* new user support load, App Store review risk, and monetization fine-tuning are all easier to manage at 500 users than 5,000.

### Scope additions

- **Monetization — model + paywall surface** — The actual pricing model and paywall are a Stage 4 decision (see open-questions doc #1). ADR-017 must be written before any paywall code ships.

- **Data export and account deletion (GDPR-compatible)** — A more thorough version of the Stage 1 export. When a user requests deletion, we soft-delete for 30 days (recoverable), then hard-delete with cascade. Account export generates a JSONL file plus a zip of originals, delivered via an emailed download link. *Why:* required for global launch in any GDPR-adjacent market.

- **AI forecasting** — The big Stage 4 bet. A model trained on opt-in aggregated catch data predicts "best species + best time + best area" for a user's usual spots. Runs in the cloud; the user's own history is a personal feature vector that never leaves the user's account. Opt-in to contribute aggregated data is explicit and reversible. *Why:* this is the long-term differentiator vs Fishbrain — predictive, privacy-respecting, data-backed.

- **Tide / moon / weather enrichment** — Automatically attach tide state, moon phase, and weather conditions to each catch using BOM, tides.net.au, and weather APIs. Backfill historical catches too. *Why:* makes the "conditions correlation" Stage 3 insight much more powerful.

- **Gear tracking** — A catalog of fishing gear (rods, reels, lures) and a join table tying gear to catches. Schema designed in Stage 3, feature-flagged off. Unlocks Stage 4 analytics ("your Zerek Cherabin at 1/8oz outperforms everything for Barra") and brand partnership data.

- **Public profile (opt-in)** — A simple shareable profile URL showing only a featured catch and aggregate stats (total catches, species count). Never GPS, never a catch list. *Why:* the minimum-viable social surface that doesn't betray the constitution — anglers who want to share credentials can, without creating a feed.

- **Brand partnership surface** — A featured-tackle card schema, deep links, UTM attribution. Everything else (deal-making, contracts, sponsored content logic) is a business workstream owned by Andreas, not engineering scope.

---

## Proposed new ADRs

ADRs (Architecture Decision Records) are short documents in `docs/adr/` that capture a single significant decision with its context and consequences. We add one whenever we make a non-obvious architectural choice; future developers (including future Xi) can read them to understand why the codebase looks the way it does.

Items marked **BLOCKING** must be resolved before the referenced stage begins — they cascade into dozens of implementation decisions.

| ADR | Title | Stage | Status |
|---|---|---|---|
| ADR-009 | AI species identification deployment (on-device first, cloud fallback) | 3 | Propose |
| ADR-010 | Sync engine choice (manual vs PowerSync) | 2 | **BLOCKING** by 15 Jun |
| ADR-011 | Photo storage tiering (originals private, derivatives on share) | 2 | **BLOCKING** |
| ADR-012 | Conflict resolution (per-field last-write-wins) | 2 | **BLOCKING** |
| ADR-013 | Analytics materialization + k-anonymity (≥3 users per aggregation cell) | 3 | Propose |
| ADR-014 | Forecasting model architecture | 4 | Propose |
| ADR-015 | Observability stack (Sentry + PostHog self-hosted) | 1-2 | Propose |
| ADR-016 | Account deletion and data export (GDPR) | 4 | Propose |
| ADR-017 | Monetization model | 4 | **BLOCKING** (Andreas decision first) |
| ADR-018 | Per-catch privacy tier model | 2 | **BLOCKING** |

---

## Next step

Walk through [`roadmap-open-questions.md`](./roadmap-open-questions.md) with Andreas and Josh. For each resolved question, update `CLAUDE.md` and draft the relevant ADR. Hold off on creating new Linear issues for Stage 2/3 scope until the per-catch privacy tiers (ADR-018) and sync engine choice (ADR-010) are decided — those decisions cascade into dozens of tickets and churn is expensive.
