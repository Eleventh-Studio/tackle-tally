# ADR-004: Supabase + PostGIS for Backend (Stage 2+)

**Date**: 2026-04-13
**Status**: Accepted (implementation deferred to Stage 2)

## Context

Stage 2 requires cloud sync, multi-device support, and user accounts. Stage 3 requires geo-spatial analytics and aggregation. A backend platform must be selected now to ensure the local data model in Stage 1 aligns with the future server schema.

Options evaluated: Supabase, Firebase, AWS Amplify, custom Node.js + PostgreSQL.

## Decision

**Supabase with the PostGIS extension enabled.**

## Rationale

**Why Supabase:**
- PostgreSQL foundation: catch data is highly relational (catches, species, locations, users, crews) and will require complex analytical SQL in Stage 3. A document database (Firestore) would fight this use case.
- PostGIS: the geo-spatial analytics requirement (proximity queries, regional aggregation, fuzzy zone generation for public sharing) is a first-class concern. PostGIS is the industry standard. No other evaluated option matches it without significant additional tooling.
- Row Level Security (RLS): PostgreSQL RLS enforces data privacy at the database layer, not the application layer. When social/sharing features arrive, RLS policies can ensure a user's private catches are never accessible regardless of application bugs.
- Supabase Auth: built-in, integrates directly with RLS policies, supports email + OAuth including Apple Sign-In
- Supabase Storage: private per-user buckets for original (EXIF-intact) images
- Open source and self-hostable if needed
- Free tier is sufficient for Stage 2 alpha/beta scale

**Why not Firebase:**
- Firestore is a NoSQL document database — a poor fit for relational catch data and SQL-based analytics
- Geo queries in Firestore require geohash-based workarounds (GeoFirestore) — significantly less capable than PostGIS
- Vendor lock-in to Google infrastructure

**Why not custom backend:**
- Supabase provides auth, database, storage, and realtime in one managed platform
- Building equivalent infrastructure from scratch would delay Stage 2 significantly

**PostGIS capabilities relevant to Stage 3:**
- `ST_DWithin` — find catches within a radius of a point
- `ST_Buffer` — generate fuzzy display zones from precise coordinates
- `ST_HexagonGrid` / `ST_SquareGrid` — aggregate catches into regional cells for heatmaps
- GIST spatial indexes — fast geo queries at scale

## Consequences

- The local SQLite schema (Stage 1) should mirror the planned Supabase PostgreSQL schema to minimise sync friction
- PostGIS geometry types are not available in SQLite locally — store lat/lng as REAL columns locally, use PostGIS geometry in Supabase
- Apple Sign-In integration is required before App Store submission (iOS policy)
- Supabase free tier limits (500MB DB, 1GB storage, 50,000 MAU) are sufficient for alpha/beta; paid plan required at public launch
