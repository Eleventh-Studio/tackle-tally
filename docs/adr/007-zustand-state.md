# ADR-007: Zustand for State Management

**Date**: 2026-04-13
**Status**: Accepted

## Context

The app needs a state management solution for UI state, in-progress catch logging state, and local data that needs to be shared across screens.

## Decision

**Zustand for Stage 1. TanStack Query added at Stage 2 for server/sync state.**

## Rationale

**Why Zustand:**
- Minimal boilerplate — store definition is a single function call
- No provider wrapping required; stores are accessible anywhere
- TypeScript support is first-class
- Small bundle size
- Simple mental model appropriate for a Stage 1 app with modest state complexity

**Why not Redux Toolkit:**
- Significant boilerplate for the scale of Stage 1
- Actions, reducers, selectors are overkill for a logging tool with a handful of screens

**Why not Jotai:**
- Atomic model is well-suited to fine-grained reactivity but less ergonomic for the catch-log flow where several related fields update together

**TanStack Query at Stage 2:**
- When cloud sync arrives, TanStack Query handles server state (caching, background refetch, optimistic updates) cleanly
- Zustand handles local/UI state; TanStack Query handles remote/server state — clear separation of concerns

## Consequences

- State management is intentionally simple in Stage 1 — if state complexity grows, revisit before Stage 2
- No time-travel debugging or action history (acceptable for this use case)
- Zustand stores should be co-located with the features they serve rather than centralised in one global store
