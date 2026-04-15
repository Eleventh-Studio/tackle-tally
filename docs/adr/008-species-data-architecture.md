# ADR-008: Species Data Architecture

**Date**: 2026-04-15
**Status**: Proposed (Stage 2)

## Context

Stage 1 stores species as a free-text string on each catch row, populated from a hardcoded list of ~180 Australian recreational fishing species compiled into the app bundle. This is sufficient for a single-device MVP but has three limitations that will matter in Stage 2+:

1. **No geo-awareness** — the same full list is shown to every user regardless of location. A user fishing the Daintree gets the same dropdown as one on the Murray.
2. **No global coverage** — the hardcoded list is manually maintained and Queensland-centric. Expanding to other regions or countries requires code changes and app updates.
3. **Custom species are ephemeral** — a user can type a custom species name, but it is stored as plain text with no identity, no deduplication, and no account association.

## Decision

Adopt a three-layer species model in Stage 2, backed by Supabase:

### Layer 1 — Global species database (`species` table, Supabase)

A curated, community-maintained table of recognised fish species with geographic range data.

```sql
create table species (
  id          uuid primary key default gen_random_uuid(),
  common_name text not null,
  aliases     text[],              -- alternate common names ("Barra", "Giant Perch")
  scientific_name text,
  regions     text[],              -- ISO 3166-2 subdivision codes, e.g. ['AU-QLD', 'AU-NSW']
  -- future: geom geometry(MultiPolygon, 4326) for PostGIS range polygons
  created_at  timestamptz default now()
);
```

**Region strategy**: Start with ISO 3166-2 subdivision codes (state/territory level) rather than PostGIS polygons. This is simpler to maintain, fast to query, and accurate enough for a fishing dropdown. Upgrade to PostGIS range polygons in Stage 4 when AI forecasting requires finer-grained habitat data.

### Layer 2 — User custom species (`user_species` table, Supabase)

Species entered by a user that don't match anything in the global database. Scoped to their account.

```sql
create table user_species (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  name        text not null,
  created_at  timestamptz default now(),
  unique (user_id, name)
);
```

### Layer 3 — Catch species columns (updated schema)

```sql
alter table catches
  add column species_id      uuid references species(id),      -- matched global species
  add column user_species_id uuid references user_species(id), -- user custom species
  -- species (text) column retained as display cache and offline fallback
  ;
```

At most one of `species_id` / `user_species_id` is set. The existing `species` text column is kept as a display cache so the app never needs to re-fetch a species name to render a catch record.

## Migration Path (Stage 1 → Stage 2)

When a user first authenticates and their catches are synced to Supabase:

1. **Fuzzy match** each `catches.species` text value against `species.common_name` and `species.aliases`. Matches above a confidence threshold (e.g. Levenshtein distance ≤ 2, or exact case-insensitive) auto-populate `species_id`.
2. **Unmatched strings** (custom entries, local names, typos) are inserted into `user_species` for that user and the catch's `user_species_id` is set.
3. The original `species` text column is preserved — it remains the source of truth for offline rendering and acts as a fallback if the species record is ever deleted or unreachable.
4. Users are shown a one-time "confirm your species" prompt for any catches that couldn't be auto-matched, so they can map them to the correct global record or confirm as custom.

## Geo-Aware Dropdown (Stage 2 UX)

When the user opens the species picker:

1. Read their current GPS location (already captured by the app).
2. Reverse-geocode to a region code (e.g. `AU-QLD`) — this can be done client-side with a small region → bounding box lookup table, no network call required.
3. Query `species` filtered by `regions @> ARRAY['AU-QLD']`, ordered by catch frequency for that region (derived from anonymised aggregate data).
4. Show the filtered local list. A "Show all species" toggle reveals the full global database.
5. If the user types a name not in the database, offer "Add as custom species" — which creates a `user_species` record on save.

## Consequences

- **Stage 1 is unaffected** — the free-text `species` column and hardcoded list remain unchanged. No schema migration is required before Stage 2.
- **The text column as display cache** means catch list rendering stays fast and fully offline even after the relational model is in place.
- **Region codes over PostGIS (initially)** keeps the species table maintainable by non-GIS contributors. The column comment flags the upgrade path.
- **Fuzzy matching on first sync** will not be perfect — some catches will need manual review. This is acceptable for an alpha cohort of ~10 users.
- **`user_species` stays private** — custom entries are never promoted to the global database automatically. Promotion to `species` requires manual curation. This prevents pollution of the shared dataset.
