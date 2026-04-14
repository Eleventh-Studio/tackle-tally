# ADR-002: NativeWind + Custom Components over Component Libraries

**Date**: 2026-04-13
**Status**: Accepted

## Context

React Native UI development requires a styling approach and a decision on whether to use a third-party component library (React Native Paper, Gluestack UI, etc.) or build custom components.

Tackle Tally's UI is intentionally non-standard: oversized touch targets, high-contrast sunlight mode, thumb-zone layout constraints. These requirements are central to the product's value proposition.

## Decision

**NativeWind v4 for styling. Custom components only — no third-party component library.**

## Rationale

**Why NativeWind:**
- Tailwind utility classes are well-understood and fast to iterate with
- NativeWind v4 uses CSS variables and is close to parity with web Tailwind
- Produces styled React Native `StyleSheet` output — no runtime performance overhead
- Works naturally with Expo managed workflow

**Why no component library:**
- React Native Paper (Material Design) and similar libraries are built for standard mobile UX patterns, not the custom thumb-zone / one-handed pattern Tackle Tally requires
- Pre-built components would be overridden for nearly every use case — the library becomes friction rather than help
- A small set of hand-rolled components (Button, Card, Input, BottomSheet) built to the thumb-zone spec is simpler and more maintainable than fighting a library's opinions
- The colour scheme and visual design are not finalised — they must be validated for sunlight readability by alpha testers. NativeWind's utility approach makes it straightforward to retheme by updating a token file rather than overriding a library's stylesheet

**Alternatives considered:**
- Gluestack UI: accessible and cross-platform, but same override problem
- Tamagui: strong performance story but complex setup and unfamiliar mental model for the team
- React Native Paper: Material Design aesthetic conflicts with the "rugged utility tool" brand

## Consequences

- More upfront work to build a small component system
- No pre-built accessibility handling — must be implemented explicitly in custom components
- Design system is entirely under project control, which is a feature given the custom UI requirements
