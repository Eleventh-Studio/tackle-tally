# ADR-005: Full-Fidelity Storage; Social/Privacy Architecture Deferred

**Date**: 2026-04-13
**Status**: Accepted

## Context

Tackle Tally's long-term vision includes social features (sharing catches with a "Crew," public aggregated analytics with location abstraction). This raised the question of whether to design a privacy tier system (private/crew/public) into the Stage 1 data model.

## Decision

**Store everything at full fidelity. Do not design or scaffold any privacy tier, sharing model, or location blurring logic in Stage 1.**

## Rationale

The full-fidelity source record (original image with EXIF, precise GPS, complete metadata) is the permanent source of truth. Derived representations (blurred coordinates, stripped-EXIF images, compressed thumbnails) are generated on-demand for specific sharing contexts when those contexts exist.

Designing a sharing/privacy model before any sharing features exist would:
- Lock in assumptions about how users will want to share (tiers vs. per-person vs. per-catch — this is genuinely unknown)
- Add schema fields with no Stage 1 purpose, violating the YAGNI principle
- Risk a migration later if the assumed model turns out to be wrong

The cost of adding a `privacy_level` field later is very low. The cost of designing the wrong social model now and migrating real user data is high.

The only exception is the non-negotiable: timestamps are system-generated and not user-editable. This is a data integrity constraint, not a privacy feature.

**What "full fidelity" means concretely:**
- Original image file stored with EXIF data intact
- Precise GPS coordinates from `expo-location` at log time
- EXIF GPS coordinates recorded separately (where available)
- Barometric pressure from `expo-sensors` at log time
- System timestamp — not user-editable post-creation

**What is explicitly NOT designed in Stage 1:**
- Privacy tiers or visibility levels
- Location blurring or fuzzy zone generation
- Crew/social circle data model
- EXIF stripping pipeline (needed for sharing, not for storage)
- Any `shared_with`, `visibility`, or `privacy_level` schema fields

## Consequences

- Stage 1 schema is simpler and can be built quickly
- Social architecture decision is deferred until Stage 2, when real usage patterns inform the design
- Full-fidelity data captured in Stage 1 will be the source material for all future derived representations — quality of capture now directly impacts value of analytics later
- When social features are designed in Stage 2, a migration will add the relevant fields to existing catch records
