# ADR-003: expo-sqlite + Drizzle ORM for Local Storage

**Date**: 2026-04-13
**Status**: Accepted

## Context

Stage 1 requires a fully offline local database on-device. The database must store catch records with rich metadata (GPS, EXIF data, barometric pressure, images). Stage 2 will add cloud sync.

Options evaluated: expo-sqlite + Drizzle ORM, WatermelonDB, Realm (Atlas Device SDK), MMKV.

## Decision

**expo-sqlite + Drizzle ORM for Stage 1. Re-evaluate sync layer at Stage 2.**

## Rationale

**Why expo-sqlite + Drizzle:**
- expo-sqlite is part of the Expo SDK — no additional native module complexity
- Drizzle ORM is TypeScript-first with excellent type inference; schema changes are tracked via migrations
- Simple mental model: SQL tables map directly to the Supabase PostgreSQL schema planned for Stage 2, reducing impedance mismatch at sync time
- Minimal abstraction — straightforward to reason about for a small team

**Why not WatermelonDB:**
- WatermelonDB's reactive/observable model adds complexity that isn't needed for Stage 1 (single user, no sync)
- Its sync protocol requires a custom server adapter; the benefit is only realised at Stage 2
- Adds setup overhead that delays reaching the AFTA deadline

**Why not Realm:**
- MongoDB Atlas Device Sync is the natural sync target, but we've chosen Supabase (PostgreSQL) for Stage 2
- Vendor lock-in to the MongoDB ecosystem

**Why not MMKV:**
- Key-value store — not suitable for structured relational catch data with queries

**Stage 2 sync strategy:**
At Stage 2, evaluate:
- **PowerSync**: purpose-built offline-first sync layer for PostgreSQL/Supabase — designed for this exact pattern
- **Manual delta sync**: Drizzle + Supabase REST API with a custom sync queue
- WatermelonDB remains an option but would require replacing the local DB layer

## Consequences

- Local schema must be designed carefully — it will become the migration baseline for Stage 2 sync
- No reactive data layer in Stage 1 (acceptable — single screen updates via Zustand)
- A sync migration will be required at Stage 2; the choice of PowerSync vs manual should be made before any Stage 2 work begins
