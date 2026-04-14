# Tackle Tally — App Design Guide

> Derived from the Base44 prototype in `/prototype/`. This document captures the PM's vision for screen structure and user flows. **Visual design (colours, typography, iconography) is not locked in** — all design elements are open for change. The primary design constraint that must drive any visual decisions is sunlight readability.

---

## Visual Design

### The One Non-Negotiable: Sunlight Readability

The app is used outdoors, in direct Australian sunlight, with wet hands. This is the primary constraint for all visual design decisions. Any colour scheme, contrast ratio, or UI element must be validated against this before it's considered final.

Design decisions that affect sunlight readability — background vs. foreground contrast, button size, text weight, colour palette — should be **tested on a real device in real outdoor conditions** by Josh and the alpha testers before being locked in.

### Prototype's Visual Direction (Starting Point Only)

The prototype used a dark theme (`#121212` background) with a lime/neon accent (`#CCFF00`). This is one possible direction — the logic being that dark backgrounds reduce glare and high-vis accent colours are readable in bright light, similar to high-visibility safety gear. Whether this actually works better than a light theme or a high-contrast neutral theme in direct sunlight is an open question that requires real-world testing.

**Nothing in the prototype's colour scheme should be treated as decided.**

### What Needs to Be Decided (Before or During Alpha)

- Dark vs. light vs. adaptive theme
- Primary accent colour — readable in glare, on-brand
- Contrast ratios that meet WCAG AA minimum as a floor, not a ceiling
- Whether a custom font improves or hurts readability at small sizes in sunlight

### Structural Design Elements (Can Carry Forward)

These are less about aesthetics and more about layout — reasonable defaults from the prototype:

- **Corner radius**: Cards 16dp, modals 24dp, inputs 12dp, buttons 12–16dp
- **Spacing**: 4dp base unit; 16–24dp padding; 12dp card gaps
- **Typography style**: Bold/black weight headings, ALL CAPS section labels with wide tracking, system font (SF Pro / Roboto)
- **Iconography**: Lucide icons, ~2.0 stroke weight

---

## App Shell

```
┌──────────────────────────────────┐
│  Header (sticky, per-screen)     │
│  ← back | Title | action icons   │
├──────────────────────────────────┤
│                                  │
│  Scrollable page content         │
│                                  │
│                                  │
│                                  │
├──────────────────────────────────┤
│  Bottom Tab Bar (6 tabs)         │
│  + safe area inset               │
└──────────────────────────────────┘
```

The header is page-specific — some screens have action icons (map pin, share), others just have a title. Back button replaces the title area on pushed screens.

---

## Navigation Structure

### Bottom Tab Bar

Six tabs. The active tab icon/label tints to `#CCFF00`.

| # | Label | Icon | Screen |
|---|---|---|---|
| 1 | ACTION | Zap | Home / Dashboard |
| 2 | GALLERY | Image | Photo gallery |
| 3 | COMMUNITY | Users | Community (placeholder, Stage 2+) |
| 4 | SESSIONS | List | Sessions list |
| 5 | CHARTS | Bar chart | Statistics |
| 6 | PROFILE | User | User profile |

### Navigation Model

Two navigation types:
- **Tab switch** — fade transition, restores scroll position per tab
- **Push** — slides in from right; back button slides back left

Screens that push on top of tabs (not tabs themselves):
- Log Catch (pushed from Home or SessionDetail)
- Catch Map (pushed from any screen with map icon)
- Session Detail (pushed from Sessions list)
- Trophies (pushed from Charts or Profile)
- Account Settings (pushed from Profile)

### Full Screen Flow Diagram

```
Landing (auth)
    │
    ▼
[Home / ACTION tab] ─────────────────────────────► [Log Catch] ──► back to Home
    │                                                    ▲
    │  New Session modal (in-place)                      │
    │                                                    │
[Sessions tab] ──► [Session Detail] ──────────────────► │
                        │                               
                        │  Edit Catch modal (in-place)  
                        │  Share Sheet (in-place)        
                        │
[Gallery tab] ──► Lightbox (in-place)
                  Share Sheet (in-place)

[Charts tab] ──► [Trophies]

[Profile tab] ──► [Account Settings]
                  Featured Catch Picker modal (in-place)

Any screen ──► [Catch Map] (push)
```

---

## Screen-by-Screen Layouts

### 1. Home (ACTION tab)

The primary dashboard and the entry point to logging.

```
┌─────────────────────────────────┐
│ TACKLE TALLY          [map pin] │  ← header
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │  ACTIVE SESSION banner      │ │  ← only shows when a session is active
│ │  "Morning Lake Run  ···"    │ │    tapping ends or views session
│ └─────────────────────────────┘ │
│                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │  12  │  │   5  │  │   4  │  │  ← stat cards: total catches / sessions /
│  │CATCH │  │SESS  │  │SPEC  │  │    species count
│  └──────┘  └──────┘  └──────┘  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  ████  LOG A CATCH  🎣      │ │  ← primary CTA, full width, lime green
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  + Start New Session        │ │  ← secondary action, opens modal
│ └─────────────────────────────┘ │
│                                 │
│  RECENT CATCHES                 │  ← section header (ALL CAPS, muted)
│ ┌─────────────────────────────┐ │
│ │ [photo]  Bream · 42cm       │ │  ← recent catch cards
│ │          Hawkesbury · 2h    │ │
│ └─────────────────────────────┘ │
│  ... more recent catches        │
└─────────────────────────────────┘
```

**Key behaviours:**
- Pull-to-refresh
- Active session banner is prominent — only one session can be active at a time
- "LOG A CATCH" button is the most important tap target on the entire app — must be thumb-reachable

---

### 2. Log Catch

The most important screen. Must pass the wet-hand, sun-glare, one-hand test.

```
┌─────────────────────────────────┐
│ ←  LOG CATCH                    │  ← header
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │    [photo / camera tap]     │ │  ← large photo area, tap to open camera
│ │                             │ │    or choose from library
│ │    📷 Add Photo             │ │
│ └─────────────────────────────┘ │
│                                 │
│  SPECIES                        │  ← section label
│ ┌─────────────────────────────┐ │
│ │  🤖 AI identified: Bream    │ │  ← AI suggestion badge (after photo)
│ │  Confidence: High           │ │
│ └─────────────────────────────┘ │
│ [Bream ▼ — confirm or change]   │  ← species dropdown
│                                 │
│  SIZE                           │
│ ┌──────────────┐ ┌────────────┐ │
│ │  42  cm      │ │  1.2  kg   │ │  ← large number inputs (easy thumb)
│ └──────────────┘ └────────────┘ │
│                                 │
│  LOCATION                       │
│ ┌─────────────────────────────┐ │
│ │  📍 Hawkesbury River, NSW   │ │  ← auto-filled from GPS, editable
│ └─────────────────────────────┘ │
│                                 │
│  CONDITIONS (collapsed)         │  ← expandable section
│  ▶ Weather · Tide · Moon        │    auto-populated, shown as badges
│                                 │
│  GEAR (collapsed)               │  ← expandable section
│  ▶ Lure · Line                  │
│                                 │
│  SESSION                        │
│ [Attach to active session ▼]    │  ← optional
│                                 │
├─────────────────────────────────┤
│  [Cancel]    [VAULT IT 🎣]      │  ← sticky bottom bar, "VAULT IT" = save
└─────────────────────────────────┘
```

**Key behaviours:**
- Photo tap opens action sheet: Camera / Choose from Library
- After photo selected: EXIF GPS auto-fills location, EXIF timestamp used as catch time, AI fish ID runs
- GPS also captured independently from EXIF (both stored)
- Barometric pressure captured from device sensor silently on screen open
- Weather/tide/moon auto-fetches once location is known
- Species, length, and "VAULT IT" are the minimum required fields — everything else is optional
- Bottom action bar is fixed above safe area — always reachable

---

### 3. Gallery

```
┌─────────────────────────────────┐
│ GALLERY               [filter]  │
├─────────────────────────────────┤
│  APRIL 2026                     │  ← month grouping header
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│ │    │ │    │ │    │ │    │    │  ← 4-column photo grid
│ └────┘ └────┘ └────┘ └────┘    │    species + size overlay badge
│ ┌────┐ ┌────┐ ...               │
│                                 │
│  MARCH 2026                     │
│  ...                            │
└─────────────────────────────────┘
```

Tapping a photo opens a fullscreen lightbox with species, size, date, location, conditions badges, and a share button.

---

### 4. Sessions

```
┌─────────────────────────────────┐
│ SESSIONS                        │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ 🟢 ACTIVE                   │ │  ← active session card (lime accent)
│ │ [cover photo]               │ │
│ │ Morning Lake Run            │ │
│ │ Started 2h ago · 3 catches  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [cover photo]               │ │  ← past session cards
│ │ Weekend at the Hawkesbury   │ │
│ │ 14 Apr · 2h 15m · 7 catches │ │
│ └─────────────────────────────┘ │
│ ...                             │
└─────────────────────────────────┘
```

---

### 5. Session Detail

```
┌─────────────────────────────────┐
│ ←  SESSION             [share]  │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │    [cover photo / hero]     │ │  ← full-width cover, tappable to change
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│  😄  Morning Lake Run    [edit] │  ← mood emoji + session name
│  14 Apr 2026 · 2h 15m           │  ← date + duration
│                                 │
│  ┌────┐  ┌────┐  ┌────┐        │  ← stat cards: catches / duration / species
│  │  7 │  │2h  │  │  3 │        │
│  └────┘  └────┘  └────┘        │
│                                 │
│  NOTES                          │
│  [inline textarea]              │
│                                 │
│  CATCHES                        │
│ ┌─────────────────────────────┐ │
│ │ [photo] Bream 42cm  [edit]  │ │  ← per-catch row
│ └─────────────────────────────┘ │
│                                 │
│ [+ Add Catch to This Session]   │  ← pushes LogCatch with session pre-filled
└─────────────────────────────────┘
```

---

### 6. Charts

```
┌─────────────────────────────────┐
│ CHARTS                          │
├─────────────────────────────────┤
│  CATCHES PER SESSION            │
│  [bar chart]                    │
│                                 │
│  CATCHES PER MONTH              │
│  [bar chart]                    │
│                                 │
│  TOP SPECIES                    │
│  [horizontal bar chart]         │
└─────────────────────────────────┘
```

Charts use the lime accent (`#CCFF00`) as the bar fill. Axis labels are muted gray.

---

### 7. Profile

```
┌─────────────────────────────────┐
│ PROFILE            [settings ⚙] │
├─────────────────────────────────┤
│  ┌────────────────────────────┐ │
│  │  FEATURED CATCH            │ │  ← hero card, tappable to change
│  │  [hero photo + fish stats] │ │
│  └────────────────────────────┘ │
│                                 │
│  Josh Wilson                    │
│  [bio textarea]                 │
│                                 │
│  MY STATS                       │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │  ← 4 stat cards
│ │ 47 │ │62cm│ │Bream│ │ 8 │    │    total / biggest / top species / species
│ └────┘ └────┘ └────┘ └────┘    │
│                                 │
│  SPECIES BREAKDOWN              │
│  Bream    ████████░░  16        │  ← animated progress bars
│  Flathead ████░░░░░░   9        │
│  ...                            │
└─────────────────────────────────┘
```

---

## Data Model (Stage 1)

### Catch

```typescript
interface Catch {
  id: string                    // uuid
  created_at: string            // ISO timestamp, system-generated
  
  // Media
  photo_uri: string             // local file URI (Stage 1), storage key (Stage 2)
  
  // Fish
  species: string               // e.g. "Bream (Yellowfin)"
  length_cm: number | null
  weight_g: number | null
  
  // Location — full fidelity, two sources
  device_lat: number            // from expo-location at log time
  device_lng: number
  exif_lat: number | null       // from photo EXIF (may be absent on iOS)
  exif_lng: number | null
  location_name: string | null  // reverse-geocoded (Stage 2; capture raw coords now)
  
  // Conditions
  barometric_pressure_hpa: number | null  // from expo-sensors Barometer
  weather_temp_c: number | null           // Stage 2 (requires network)
  weather_wind_kph: number | null
  weather_wind_dir_deg: number | null
  moon_phase: number | null               // 0–1
  tide_height_m: number | null
  
  // Gear (all optional)
  lure_type: string | null      // "Soft Plastic" | "Hard Plastic" | "Bait"
  lure_brand: string | null
  lure_size: string | null
  line_type: string | null      // "Mono" | "Braid" | "Fluorocarbon"
  line_weight: string | null    // e.g. "20lb"
  
  // Session link (optional)
  session_id: string | null
  
  // Notes
  notes: string | null
}
```

### Session

```typescript
interface Session {
  id: string
  created_at: string
  name: string
  started_at: string
  ended_at: string | null       // null = active
  cover_photo_uri: string | null
  mood_emoji: string | null     // one of: 😄 😎 😤 🤔 😴 🎉 💪 🌧️ 🤙
  notes: string | null
}
```

---

## Component Inventory (React Native)

Priority components to build for Stage 1:

| Component | Description | Used In |
|---|---|---|
| `BottomTabBar` | 6-tab navigation bar, lime active state | App shell |
| `ScreenHeader` | Sticky header with back, title, actions | All screens |
| `CatchCard` | Photo + species + size + metadata row | Home, Sessions, Gallery |
| `StatCard` | Icon + number + label tile | Home, SessionDetail, Profile |
| `PrimaryButton` | Full-width lime `#CCFF00` button | LogCatch, Home |
| `SecondaryButton` | Dark surface button | LogCatch, SessionDetail |
| `PhotoPicker` | Large tappable area → camera/library sheet | LogCatch |
| `NumberInput` | Large-target numeric input (size, weight) | LogCatch |
| `SpeciesSelect` | Searchable dropdown/modal picker | LogCatch |
| `SectionHeader` | ALL CAPS muted label with optional right action | All screens |
| `ConditionsBadge` | Compact weather/tide/moon data pill | Gallery, SessionDetail |
| `SessionCard` | Cover photo + name + duration + catch count | Sessions list |
| `BottomSheet` | Spring-animated sheet for modals | NewSession, EditCatch |
| `ActiveSessionBanner` | Lime-accented active session strip | Home |

---

## Key UX Behaviours

1. **Photo is the trigger for everything.** Take a photo → EXIF GPS fills location → AI suggests species → conditions load. The photo is the entry point to the entire log flow.

2. **Minimum viable log = photo + species + "VAULT IT".** Every other field is optional and collapsible. Don't show gear or conditions fields by default — tuck them behind expandable sections.

3. **"VAULT IT 🎣" not "Save".** The save action's label is part of the brand voice. Fun, not sterile.

4. **Conditions are automatic, not manual.** The user should never have to type weather or tide data. If there's no network, capture barometric pressure from the sensor and store the rest as null — fill it in later when synced (Stage 2).

5. **Sessions are optional.** A catch can exist without a session. Don't force session selection.

6. **Active session is always visible.** If a session is active, the Home screen surfaces it prominently. The user should never wonder "am I in a session right now?"

7. **Gallery is the trophy room.** It's photo-first, month-grouped, and the "wow" screen for showing your mates.

---

## What's in the Prototype but NOT in Stage 1

These features appear in the prototype but are explicitly out of scope for Stage 1:

| Feature | Reason deferred |
|---|---|
| Leaderboard | Requires multi-user backend (Stage 2) |
| Community tab | Placeholder — Stage 2+ |
| Social sharing (ShareSheet) | Requires backend + public URLs (Stage 2) |
| Weather/tide auto-fetch | Requires network call — store null, fill Stage 2 |
| AI fish identification | Requires API call — store raw photo, suggest manually |
| Reverse geocoding | Requires network — store raw lat/lng, name Stage 2 |
| User accounts / auth | Not needed for single-device local app |
| Account Settings (theme toggle) | Nice to have, not MVP |

---

## Stage 1 Screen Priority

Build in this order — each is independently testable:

1. **Log Catch** — the core value, everything else is secondary
2. **Home / ACTION tab** — dashboard + "LOG A CATCH" CTA
3. **Gallery** — view your catches
4. **Sessions** + **Session Detail** — organise catches into outings
5. **Charts** — basic stats visualization
6. **Profile** — personal record and settings
