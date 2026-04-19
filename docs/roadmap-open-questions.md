# Roadmap — Open Questions

Compiled from a cross-discipline review on 2026-04-15 (product management, product design, UX, architecture, engineering).

Each question below is written so anyone on the team can read and contribute, whether or not they touch the codebase. Every item explains:

- **What we're asking** (in plain language)
- **Why it matters** (what decisions cascade from it)
- **Options** (where the decision has discrete choices) with pros and cons
- **Xi's lean** (a starting recommendation, not a final call) where there is one

The goal of the group discussion is to make a call on the items marked **BLOCKING** (they hold up Stage 2 code) and capture leanings on the rest. Unresolved items stay in this doc for the next round.

**Discussion**: Xi + Andreas + Josh
**Date**: TBD
**Companion doc**: [`roadmap-v2-draft.md`](./roadmap-v2-draft.md)

---

## For Andreas — Product / Business / GTM

### Monetization & pricing

---

#### 1. Pricing model — how do users pay us?

**Why it matters**: Stage 4 is our public launch. The revenue model shapes which features end up behind a paywall, which in turn shapes how we design the free-tier analytics in Stage 3. This blocks ADR-017 and any paywall-related code.

**Options**:

- **A — Freemium** (free: log, view, export your own data; premium: analytics, forecasting, advanced crew features)
  - *Pros*: Lowest barrier to first install. The free tier itself markets the paid tier. Users who fish infrequently never need to pay.
  - *Cons*: Analytics is our primary differentiator vs Fishbrain — paywalling it weakens the free-tier story. Requires subscription plumbing, receipt validation, and pricing experiments.

- **B — Paid upfront** (~AUD 15 one-time at install, possibly with a 30-day free trial)
  - *Pros*: Self-selects for the privacy-first audience — people who pay for utility tools over ad-funded ones. Simplest codebase, no recurring billing. Clean "own your data" positioning.
  - *Cons*: Higher barrier to first install. No recurring revenue — limits our ability to fund AI forecasting compute costs in Stage 4+.

- **C — Subscription** (~AUD 5/month or ~AUD 40/year, all features unlocked)
  - *Pros*: Recurring revenue pays for ongoing infra (AI forecasting is expensive). Familiar model to anglers who already pay for Navionics or Fishbrain Premium.
  - *Cons*: Subscription fatigue is real in 2026. Only works if forecasting delivers ongoing month-over-month value.

**Xi's lean**: Option A (Freemium) — if anything. The analytics engine is where our long-term differentiation lives vs Fishbrain; letting users get hooked on free logging and export first, then monetizing the analytics and forecasting tier, seems to align with the "utility tool that earns its keep over time" positioning. Open to being overruled — this is squarely Andreas's call, and Option B (paid upfront) remains the simplest code path if the GTM argument pulls that way.

---

#### 2. If we ship a sharing feature — free or paywalled?

**Why it matters**: This depends on the sharing-model decision under Joint decisions (first question). Under Option 1 (solo-only), the question doesn't apply in Stage 2 — there's nothing to paywall yet. Under Option 3 (trip-based shared sessions) or Option 5 (Private Crews), we need to decide whether the sharing surface is free for all, limited-free, or premium-only.

Whatever shape sharing takes, it tends to be the strongest retention hook in any app — anglers invite mates, mates stick around. It's also something serious anglers would pay for. There's tension between growth (a free surface drives network effects) and revenue (a paywalled surface drives conversion).

**Options (applicable only if sharing-model is Option 3 or Option 5)**:

- **A — Free for everyone, no limits**: Any user can start a shared session / create a crew, no payment required.
  - *Pros*: Maximises network effects and referrals from the AFTA cohort. Aligns with "privacy for serious anglers" — no friction for trusted circles.
  - *Cons*: Removes a natural monetization lever.

- **B — Free up to N, paywall above**: e.g. free sessions up to 3 invitees, or free crews up to 5 members; Premium unlocks larger groups.
  - *Pros*: Preserves the small trusted-circle case; monetizes at scale.
  - *Cons*: Arbitrary limits feel cheap. The "one more mate" conversion moment is a bad experience.

- **C — Premium creates, free joins**: Any user can join a shared session or crew; only Premium users can initiate one.
  - *Pros*: Preserves network effects (joiners don't pay). Creators skew toward power users more likely to pay anyway.
  - *Cons*: A solo angler starting a session with 2-3 mates hits a paywall at the most important moment.

**Xi's lean**: A for Stage 2 (maximise network effects during alpha/beta, regardless of which sharing model we pick). Re-evaluate at Stage 4 public launch based on what we see in the data.

---

#### 3. Do contributors to aggregated forecasting data get Premium free?

**Why it matters**: The Stage 4 AI forecasting model trains on user catch data. Principle I requires explicit opt-in to contribute. If opt-in rates are low, the model is weaker. A "contribute aggregated data → get Premium free" exchange aligns incentives, but cannibalizes revenue.

**Context**: If we go paid upfront (pricing option B), this question mostly disappears. If freemium or subscription, it's a real lever.

**Xi's lean**: Bundle this decision into ADR-017 (pricing). Don't decide in isolation.

---

### Competitive stance

---

#### 4. Fishbrain / Fishidy positioning — amplify the difference or stay narrower?

**Why it matters**: Fishbrain is the incumbent (~15M installs, social-feed-first). Our constitution explicitly excludes a public social feed. The choice is how loudly to market that difference.

**Options**:

- **A — Amplify the difference**: Marketing copy leans hard on privacy-first + no social feed. "The fishing app that doesn't betray your spots."
  - *Pros*: Clear positioning, memorable, attracts the target audience (serious anglers who've been burned by Fishbrain). Consistent with the constitution.
  - *Cons*: Locks us into never adding social features — a potential future growth lever we'd be closing off.

- **B — Stay narrower, let the product speak**: Market on utility + analytics, don't explicitly contrast with Fishbrain.
  - *Pros*: Flexibility to add social-adjacent features later.
  - *Cons*: Harder to describe in one sentence. Blurs with Fishbrain for new users.

**Xi's lean**: A. The constitution already commits us; "no social feed" is a genuine differentiator worth naming.

---

#### 5. QLD size / bag-limit auto-warnings — value-add or liability?

**Why it matters**: Queensland (and other states) have legal size and bag limits for many species. We could auto-warn the user if a logged catch looks undersized. It's clearly useful, but it implies the app vouches for the limit being correct.

**Options**:

- **A — Ship it with a disclaimer**: "Displayed limits are a guide — always check current QLD Fisheries rules." Active warning when a catch is below limit.
  - *Pros*: Useful feature, obviously the right thing for a fishing app.
  - *Cons*: Data accuracy is on us. Limits change. If a user gets fined because we showed the wrong limit, that's bad press.

- **B — Don't ship it**: Stay out of regulatory waters entirely.
  - *Pros*: Zero legal exposure.
  - *Cons*: Misses a clear value-add.

- **C — Ship as reference info only, not an active warning**: Show the legal limit on the catch detail screen as a read-only field, no alert if undersized.
  - *Pros*: Informational, no implication we enforce compliance.
  - *Cons*: Less impactful — users have to look for it.

**Xi's lean**: C for Stage 3 / early Stage 4. Consider upgrading to A once we've had a legal review.

---

### Go-to-market & growth

---

#### 6. First 1,000 users beyond AFTA — who and how?

**Why it matters**: AFTA likely delivers a few hundred curious installs. Getting to 1,000 DAU requires a real growth plan. This is Andreas's workstream to scope.

**Candidate channels** (brainstorm, not a closed list):

- AU fishing YouTubers (AFN Fishing, Hook'd Up, Social Fishing) — sponsored content or early access in exchange for an honest review
- Bream / barra / mulloway Facebook groups — direct organic posting from Josh
- QLD tackle shops — stickers, business cards, an in-store referral code
- Fishing clubs (ANSA branches, QLD AGA) — demo nights
- Instagram / TikTok content from Josh's crew
- Cross-promotion with complementary apps (tide charts, weather apps)

**What we need from Andreas**: Pick 2-3 channels to activate by June. Each needs a named owner and a rough budget.

---

#### 7. AFTA — soft launch or demo showcase only?

**Why it matters**: The AFTA build is in TestFlight (iOS beta) and closed Android testing. We need to decide whether AFTA visitors can install a public App Store version that same day (which requires a public listing ready by 22 Aug), or only sign up for a waitlist.

**Options**:

- **A — Public App Store listing ready by AFTA**: Visitors install from the App Store at the booth.
  - *Pros*: Zero friction at the booth. Visitors leave with the app installed.
  - *Cons*: Apple review cycle is risky in August. A rejection can slip us past 22 Aug. Forces the monetization decision earlier than necessary.

- **B — Demo only + waitlist**: Booth shows the demo; visitors sign up with email for an invite when we launch in Sep/Oct.
  - *Pros*: No Apple Store dependency for the AFTA deadline. More control over the first-user experience and onboarding.
  - *Cons*: Waitlist conversion is notoriously poor (30-50%, even with good follow-up).

**Xi's lean**: B. AFTA is already a hard deadline for the build; stacking "App Store approved" on top doubles the risk. Send post-AFTA invites in waves through Sep.

---

#### 8. Brand partnerships — confirmed as Andreas's workstream?

**Why it matters**: Stage 4 mentions "brand integration" and "influencer partnership tools". This is business development — deal-making, contracts, sponsored content — not engineering. Confirming ownership keeps Xi's engineering scope tight: just deep-links, UTM attribution, and a simple "featured tackle" card schema. Everything else lives with Andreas.

**What we need**: Verbal confirmation from Andreas.

---

### Platform priorities

---

#### 9. iOS vs Android in the alpha cohort — what's the split?

**Why it matters**: Drives Apple Sign-In urgency and TestFlight setup. If most of Josh's 10 mates are on Android, we can defer Apple Sign-In to Stage 3. If most are on iOS, we need TestFlight External Testing ready by 15 May.

**What we need to know**: Rough iPhone vs Android count in the alpha 10 (Josh to confirm).

---

#### 10. Apple Developer account status

**Why it matters**: Enrolment lead time is 1-2 weeks (Individual) or longer (Business, requires DUNS registration). Apple Sign-In capability requires the paid tier active, plus explicit entitlement config. Needed by 15 Jun for Stage 2, 1 Aug for Stage 3 submission.

**What we need to know**: Is the account enrolled? Paid tier active? Sign-In with Apple capability enabled?

---

## For Josh — Field / Domain expertise

These questions are to make sure we design for how you and your mates actually fish, not how I imagine you fish.

---

#### 1. Gloves, night fishing, rod-under-load — how often do these happen?

**Why it matters**: We're designing for one-handed field use. Each scenario shapes different parts of the UI:

- If your crew often fishes with gloves (cold mornings, handling spiky fish), we should prioritise bigger touch targets and haptics (phone buzzes you can feel through gloves)
- If you fish at night with headlamps, we should ship a red-light / night mode earlier
- If you often log catches while the other hand is holding the rod under tension, the 3-second target matters even more

**What we need from Josh**:
- Rough frequency of each scenario across the alpha cohort
- Any scenarios we haven't thought of (kayak anglers holding the paddle, spearfishing post-dive, etc.)

---

#### 2. How often is a catch photographed after release?

**Why it matters**: Our constitution says "no backdating" — the timestamp is locked to when the user hits save. But if anglers often release a fish and photograph a measuring mat or log the catch from memory a few minutes later, we may need to allow a small time correction (e.g. ±10 minutes). A large correction window undermines the data-quality story; a small one matches reality.

**What we need from Josh**: Rough frequency. And whether ±10 minutes feels right or too restrictive.

---

#### 3. "Kept vs released" toggle — do anglers want it?

**Why it matters**: In Australia, catch-and-release is common and legally encouraged for many species. A simple toggle on the catch record would let anglers track their conservation ratio, and later tie into size-limit warnings.

**Options**:

- **A — Add the toggle in Stage 1**: Small scope addition, ~1 day of work.
- **B — Skip it until there's demand**: Avoids Stage 1 scope creep.

**What we need from Josh**: Would you and your mates actually use this? If yes, Stage 1 or Stage 2?

---

#### 4. Photo-less catches — resolved: yes, allow them

**Resolved by field testing (April 2026):** Andreas and Josh's camping trip confirmed that retrospective logging from memory is a real workflow — some anglers sit down at camp or at home after a trip and log catches they didn't photograph. Photo-less catches are allowed as first-class records. The catch should be clearly distinguished in the UI (e.g. a placeholder icon instead of a photo thumbnail) so that data quality differences are visible for Stage 3-4 analytics. This aligns with the broader "multiple capture styles" design concept added to the roadmap draft.

---

#### 5. Age and app-fluency spread of the alpha cohort

**Why it matters**: Shapes how much tooltip scaffolding we build for Stage 4 public launch. If all 10 alpha testers are mid-30s to 40s and use apps daily, minimal onboarding is fine. If there are older or less app-fluent testers in the mix, we need clearer first-run guidance.

**What we need from Josh**: Rough age range. Any testers who explicitly struggle with smartphone apps?

---

#### 6. Gear and bait granularity — how deep do we go?

**Why it matters**: Current catch record has lure/bait type, brand, and size. Serious anglers often care about rod action, reel drag, leader pound test, jighead weight, hook size. More fields = more data for Stage 3 analytics ("you catch more barra with braided line") but also more fiddling at log time, which hurts the 3-second target.

**Options**:

- **A — Keep current fields** (lure type / brand / size): Simplest. Works for 80% of catches.
- **B — Add rod + reel + leader as optional fields**: Serious anglers log full gear, casual anglers skip.
- **C — Add a "gear preset" system** (Stage 2+): User defines their typical setups once ("Barra setup", "Bream setup") and picks one on the catch form — one tap for full gear detail.

**Xi's lean**: A for Stage 1, C for Stage 2-3 — serious anglers want quick-pick presets, not a field-by-field form every catch.

**What we need from Josh**: How much gear detail would you and your mates actually record?

---

### Species data

---

#### 7. Can Josh sign off on the 180 bundled species list before 15 May?

**Why it matters**: The list in `src/constants/species.ts` is currently Xi's best guess from QLD/NSW/AFMA sources. It ships with the EAS preview build on 15 May. For Stage 2, this list seeds the global species database in Supabase — corrections later are messier.

**What we need from Josh**: A review pass — flag missing species (especially Moreton Bay regulars and freshwater), wrong common names, or entries that shouldn't be there.

---

#### 8. Global species DB — who owns curation in Stage 2+?

**Why it matters**: In Stage 2 the species list moves from hardcoded (bundled with the app) to a Supabase database. New species will need adding as we expand beyond QLD, or when users type custom names that turn out to be real species.

**Options**:

- **A — Admin-only**: Xi adds species on request.
  - *Pros*: Zero risk of bad data. Simplest to implement.
  - *Cons*: Xi becomes a bottleneck. Boring admin work.

- **B — Josh + Andreas moderate**: Xi builds a simple admin page; Josh and Andreas can add species themselves.
  - *Pros*: Domain experts own the list. Scales better.
  - *Cons*: Admin page is a small Stage 3 item.

- **C — Community-moderated (Stage 4)**: User custom species that reach a threshold get promoted to the global list.
  - *Pros*: Scales globally without admin labour.
  - *Cons*: Requires curation workflow, moderation, anti-spam — Stage 4 territory.

**Xi's lean**: B for Stage 2-3; C as a long-term goal.

---

### AFTA demo

---

#### 9. Booth WiFi — reliable, or should we assume it'll fail?

**Why it matters**: AFTA is a major trade show. Trade show WiFi is notoriously bad. If we assume cloud features will work and they don't on the day, the demo is dead. If we design an offline-safe demo story, we're covered either way.

**Options**:

- **A — Assume reliable WiFi + mobile hotspot backup**: Cloud features (Crew sync, AI species ID cloud fallback) are live in the demo.
- **B — Design an offline-safe demo**: Everything in the 3-minute demo narrative works without network. Cloud features are mentioned as "here's what happens when you're home" rather than shown live.

**Xi's lean**: B. Even with perfect WiFi, an offline-safe demo is more robust and reinforces the "works anywhere" story.

**What we need from Josh or Andreas**: Can we confirm the AFTA booth setup in advance?

---

#### 10. Between-visitor reset — wipe or accumulate?

**Why it matters**: At the booth, visitors interact with the demo device. Do we reset between visitors, or let their test catches accumulate?

**Options**:

- **A — Wipe sample data between visitors**: Each visitor starts fresh, logs their own practice catch, sees it appear on the map.
  - *Pros*: Fresh, personal experience.
  - *Cons*: Booth staff need to tap reset.

- **B — Accumulate test catches**: Data builds over the day, stories emerge ("here's what we've caught today").
  - *Pros*: Organic narrative.
  - *Cons*: Gets messy fast. Off-brand test catches ("Shark: 9000 kg") pollute the demo.

**Xi's lean**: A. Demo Mode will ship with a one-tap reset. Seeded sample catches provide the "here's what an active account looks like" narrative; visitors add one catch on top of that.

---

### Field ergonomics

---

#### 11. Dark + lime UI in midday QLD sun — has it been field-tested?

**Why it matters**: The app uses a dark background (`#121212`) with bright lime-green accents (`#CCFF00`). In direct tropical sunlight, dark themes can become unreadable, and bright greens can wash out. This is a high-risk visual choice that's cheap to change early and expensive to rework after the preview build is in mates' hands.

**Strong recommendation**: Dedicated field test — Josh takes the current build out in full midday QLD sun at a typical fishing spot, tries to log 3-5 catches, reports back on legibility. Before 15 May preview build.

**What we need from Josh**: Commitment to a test date.

---

### Session UX

---

#### 12. Sessions — auto-end after idle, or manual only?

**Why it matters**: A "session" groups catches by fishing trip. Currently the user manually starts and ends a session. A common UX bug waiting to happen: user forgets to end the session, opens the app a week later, logs a catch, and it attaches to a stale session from last Sunday.

**Options**:

- **A — Auto-end after N hours of idle** (e.g. 12 hours): Session closes automatically if no catch is logged for 12 hours.
  - *Pros*: No forgotten sessions.
  - *Cons*: Multi-day fishing trips get split into multiple sessions. User confusion if the threshold is wrong.

- **B — Manual only**: User always taps "End Session".
  - *Pros*: No hidden automation.
  - *Cons*: Forgotten sessions are a real and common bug.

- **C — Auto-suggest, user confirms**: After 12 hours of idle, app asks "Still fishing the Hawkesbury trip?" on next app open.
  - *Pros*: Best of both worlds.
  - *Cons*: Slight added complexity.

**Xi's lean**: C. Low friction, clear user control, no forgotten sessions.

**What we need from Josh**: Does C match how you actually plan trips (day trips vs weekend trips vs week-long charters)?

---

## Joint decisions — need Andreas + Josh + Xi alignment

### Sharing model — what shape, if any? (Stage 2 blocker, decide before the Crew trust model below)

Crews was inherited as a Stage 2 scope assumption from the original `CLAUDE.md` — the cross-discipline review refined *how* crews would work rather than *whether* we should build them. Returning to first principles: the app is a **rugged utility tool, not a social app**, with **possibilities** of social functionality. The question is what minimum surface (if any) achieves those possibilities without drifting into social media.

**The three options we're weighing**:

- **Option 1 — Solo-only in Stage 2**: Cloud sync across your own devices (phone + tablet). No sharing, no invites, nothing multi-user. Sharing is deferred to Stage 3+ based on actual alpha feedback.
  *Stage 2 saves roughly 2-3 weeks of engineering. Xi and Josh can't compare each other's catches until Stage 3.*

- **Option 3 — Trip-based shared sessions**: When you start a fishing session, you can invite 1-5 people to that specific trip. Catches logged during that session are visible to participants; when the session ends, the shared view archives. No persistent "crew" relationship between people.
  *Serves the named-collaborator need (Xi and Josh comparing on a shared trip) via explicit invites. Time-bounded — matches how mates actually fish (weekends, charters). Forward-compatible with Option 5 if we upgrade later — a crew would simply be a permanent session.*

- **Option 5 — Private Crews MVP**: Persistent invite-only group with a shared catch feed and per-catch privacy tiers. The currently drafted Stage 2 scope.
  *Most flexible; covers ongoing fishing partnerships in addition to one-off trips. Most code, most UI, most decisions (see Crew trust model questions below). Highest scope-creep risk toward "social media light".*

**First-principles questions to tease out the decision**:

---

##### A. What's the actual user need?

Is the desire "I want to see everything Dave catches" (a continuous feed), or "Dave, check this specific catch out" (explicit, deliberate sharing)? These are fundamentally different products. The answer largely separates Option 5 (feed) from Options 1 and 3 (no feed).

**What we need**: honest framing from Xi + Josh about what they actually want from Stage 2 shared visibility.

---

##### B. Is retention / virality a Stage 2 concern, or a Stage 4 concern?

The alpha cohort of ~10 grows by Josh manually inviting mates, not by a referral loop inside the app. The viral-growth argument for crews only really matters when we're trying to grow to thousands of users — Stage 4 territory. If retention is a Stage 4 concern, Options 1 or 3 become more defensible for Stage 2 because we aren't buying something we don't yet need.

**What we need**: Andreas to weigh in on whether Stage 2 needs a built-in invite loop or whether manual invitation is fine through beta.

---

##### C. Which option anchors the product long-term?

The shape we pick first shapes everything after — pivoting between group-shaped and trip-shaped products later is painful because the data structures and the users' mental models diverge. Do we want to anchor the product toward persistent groups (Option 5), toward event/trip-based interactions (Option 3), or to defer the decision entirely (Option 1)?

**What we need**: a deliberate call about the product's long-term identity, not an accidental one via scope inertia.

---

##### D. Does shrinking Stage 2 scope unblock something else?

The Stage 2 engineer estimate is dangerously tight (~25-28 dev days of work vs ~25 calendar days available). Option 1 cuts roughly 2 weeks of engineering; Option 3 lands partway between. The freed time could reduce sync-engine risk, pull Stage 3 scope forward, or act as a schedule buffer for the AFTA demo crunch.

**What we need**: weigh whether the scope saved is worth more than what crews would provide in beta.

---

##### E. GTM / marketing angle — which option tells the clearest story vs Fishbrain?

Each option implies a distinct pitch:

- **Option 1** → *"No feed, ever. Your catches, your phone, your rules."* — sharpest privacy marketing, thinnest feature pitch.
- **Option 3** → *"Share your trip, not your life."* — distinctive, memorable, fits rugged-utility positioning.
- **Option 5** → *"Private crews for your trusted fishing mates."* — most flexible, but most similar to how other apps pitch groups.

**What we need**: Andreas's read on which positioning is strongest for the target audience.

---

##### F. How reversible is each option?

- Pick Option 1, and alpha users beg for sharing → we can ship Option 3 in Stage 3 as a clean additive feature.
- Pick Option 3, and usage shows people want persistent groups → upgrading to Option 5 is natural (a crew is just a permanent session).
- Pick Option 5, and it turns out usage is low → walking back is harder; users have groups, invites, and shared data already entangled.

In general, the least regret-inducing choice tends to be the more minimal starting point when the user need is uncertain.

**What we need**: acknowledgement of the asymmetry — easier to grow into Option 5 than to retreat from it.

---

**Xi's lean**: Option 3. It serves the "Xi and Josh compare notes" use case via explicit session invites, feels less like social media than a crew feed, reuses the existing `sessions` concept in the codebase, and is cleanly upgradeable to Option 5 later if real demand emerges.

**What we need to decide**: a group call on Option 1, 3, or 5 for the Stage 2 sharing model. The Crew trust model section below only applies in full if the answer is Option 5.

---

### Crew trust model (conditional — applies if Option 5 is chosen above)

If the sharing-model decision above is Option 5 (Private Crews), the four questions below define how crews actually work and gate the Stage 2 code.

- Under **Option 1** (solo-only): none of these apply.
- Under **Option 3** (trip-based sessions): question 1 (privacy tier default) still applies per catch within a shared session, but questions 2-4 (fuzzing granularity, leader-leaves, crew size cap) don't apply in the same form — they'd need re-scoping for the session model.

---

#### 1. Default per-catch privacy tier when logged inside a crew session

**Why it matters**: Stage 2 introduces privacy tiers for each catch: `Private`, `Crew-fuzzy` (rounded location visible to crew), `Crew-precise` (exact GPS visible to crew), `Never share`. When you log a catch during a crew session, which tier is the default?

This is **the single biggest privacy-architecture decision** of the project. It blocks ADR-018 and all Stage 2 crew code.

**Options**:

- **A — Private** (user opts in to share per catch): Secret spots stay secret by default; users explicitly share each catch they want visible.
  - *Pros*: Matches the "privacy for serious anglers" constitution most faithfully.
  - *Cons*: Crew feature is less useful out of the box. Users may forget to share, crew feels dead.

- **B — Crew-fuzzy** (rough location visible to crew by default): Crew members see you've been catching fish in the general area (e.g. within 1 km).
  - *Pros*: Good middle ground. Crews are active by default, precise spots stay hidden unless you opt in.
  - *Cons*: Slightly weakens the "secret spots" promise even with close mates.

- **C — Crew-precise** (exact location visible to crew by default): Crew members see exactly where you caught what.
  - *Pros*: Maximises crew utility. Matches how trusted friends actually share in real life.
  - *Cons*: One accidental crew invite and your best spot is visible. Hard to walk back.

**Xi's lean**: B. The constitution emphasises privacy-first even with trusted circles. B makes crews useful while keeping spot precision an explicit per-catch decision.

**What we need**: A call from the three of us.

---

#### 2. Fuzzing granularity — how rough is "crew-fuzzy"?

**Why it matters**: If we pick option B (or any mix that includes fuzzy), we need to decide how coarsely we round GPS coordinates. Too fine and secret spots leak; too coarse and the crew feature loses value.

**Options** (hex grid sizes):

- **A — 500 m hex**: Small enough to see which bay or beach. Large enough to hide specific structure (rock bars, weed beds).
- **B — 1 km hex** (Xi's current lean): Broad area. Know which estuary, not which snag.
- **C — 2 km hex**: Regional. Know it was Moreton Bay, not Jumpinpin specifically.

**Xi's lean**: B. Tight enough to be informative, loose enough to protect the spot.

**What we need from Josh**: Sanity check — does 1 km match how you'd naturally share with mates verbally?

---

#### 3. If a crew leader leaves — what happens to shared catches?

**Why it matters**: If the person who created a crew leaves or deletes their account, catches they previously shared still exist in other members' feeds. Legal and trust implications for Stage 4 public launch.

**Options**:

- **A — Shared catches revert to private**: Ex-leader's catches disappear from everyone else's crew feed.
  - *Pros*: Cleanest privacy model — leave the crew, your data goes with you.
  - *Cons*: "Remember when Dave caught that big barra?" shared memories vanish. Feels punishing for the crew.

- **B — Shared catches remain visible to existing members**: Other crew members keep seeing the history.
  - *Pros*: Preserves the crew's shared memory.
  - *Cons*: Ex-member cannot retroactively un-share. Data is effectively copied.

- **C — Shared catches retained with an "orphaned" flag**: Visible, but clearly marked as from an ex-member.
  - *Pros*: Transparent middle ground.
  - *Cons*: Still doesn't let the ex-member revoke.

**Xi's lean**: A. Simplest code, cleanest privacy promise. Revisit if users complain in beta.

---

#### 4. Crew size cap

**Why it matters**: Sets scaling expectations. 10 is fine for an MVP. 100+ requires pagination, different UI, anti-spam considerations.

**Options**:

- **A — Hard cap at 10**: MVP scale, matches "trusted circle" framing.
- **B — Hard cap at 25**: Larger but still close-knit.
- **C — Hard cap at 100+**: Full "fishing club" use case.

**Xi's lean**: A for Stage 2. If we see demand for larger crews during beta, we upgrade in Stage 3/4.

**What we need**: Confirm A, or raise the cap if Josh's actual crew is larger than 10.

---

### AFTA demo scope

---

#### 5. Cut order if Stage 3 runs over

**Why it matters**: Stage 3 effort estimate is 16 dev days vs 18 calendar days available. Zero slack. If we fall behind, we cut in this order:

1. **Heatmap → simple pin map** (cut the density visualization, keep the pin map)
2. **AI species ID → faked top-5 regional dropdown** (fake it for the demo with a regional species shortlist; real ML slips to Stage 4)
3. **Onboarding flow → defer to Stage 4** (AFTA visitors get a staffed walkthrough, not an in-app one)

**Non-negotiable**: performance pass, Demo Mode, App Store submission by 1 Aug.

**What we need**: Explicit confirmation of the cut order. Flag if anything on this list is critical to Andreas from a GTM angle.

---

### Data integrity

---

#### 6. Retrospective logging and time-correction policy

**Reframed based on field testing (April 2026):** Andreas observed that some anglers want to log catches from memory after a trip — at camp, on the drive home, or the next morning. This goes well beyond the original "±10 minutes for released fish" framing. Retrospective logging is a legitimate capture style (see roadmap draft, "multiple capture styles"), and we need to decide how broadly to support it while preserving the data-integrity story that powers Stage 3-4 analytics.

The core tension: Constitution Principle VII says timestamps are system-generated and non-editable. But field testing shows this is too strict for how anglers actually work — some catches are logged hours after the fact, and forcing an incorrect "logged at 8pm" timestamp is arguably worse for data integrity than an honest "caught at ~3pm, logged at 8pm."

**Options**:

- **A — Strict no-backdating** (current rule): Timestamp is locked at save. A catch logged from memory at camp that evening gets "today at 8pm" even if the fish was caught at 3pm.
  - *Pros*: Simplest code; clearest data-integrity guarantee.
  - *Cons*: Retrospective entries end up with actively wrong timestamps, which is arguably worse for analytics than approximately-right ones. Punishes a legitimate workflow.

- **B — Dual-timestamp with correction** (Xi's lean): User can adjust the catch time via a simple picker ("just now" / "~30 min ago" / "~1 hr ago" / custom time). The record stores both the system timestamp (`logged_at` — when the entry was actually saved, immutable) and the user-corrected time (`caught_at` — when the user says it happened, defaults to `logged_at`). Both timestamps are visible to analytics. The gap between them is itself a data-quality signal: zero gap means full-fidelity in-moment capture; large gap means retrospective entry.
  - *Pros*: Honest about both the logging moment and the user's claim. Analytics can decide how much to trust each catch. Supports the retrospective workflow without destroying the data-integrity story.
  - *Cons*: Opens the door to "log my catch from last weekend" — how far back is too far? Some limit needed.

- **C — Free-form backdating**: Any time, any date, no restrictions.
  - *Pros*: Maximum flexibility for retrospective users.
  - *Cons*: Destroys the data-integrity story. Someone could log a catch from last year. Analytics has no basis for trust.

**Xi's lean**: B with a soft limit — perhaps ±24 hours. Covers the realistic case (logging at camp that evening, or the next morning) without enabling "log my fish from last month." The dual-timestamp design means analytics can always tell in-moment captures from retrospective ones and weight them accordingly.

**What we need**: Agreement on the maximum correction window. Josh's field experience should drive this — how long after a trip do anglers realistically want to log? Is 24 hours enough, or do some anglers wait longer?

---

### Branding / voice

---

#### 7. "Vault it" — is the brand voice landing?

**Why it matters**: The current save-button copy is "VAULT IT" — phrases catches as treasures stashed in a private vault, which matches the privacy-first positioning. But it might test as cutesy to serious anglers who'd prefer just "SAVE" or "LOG".

**What we need from Josh**: Run the current build past two or three of your alpha cohort. Ask them what they think of the word "vault". If half say it feels silly, we change it before the preview build goes wider.

---

## Pending technical decisions

These are mostly Xi's to decide, but they're listed here for transparency. Andreas — flag if any of these have business implications I've missed. Josh — you can skim this section.

---

#### 1. Sync engine — manual vs PowerSync

**What we're choosing between**: Two ways to sync data between the phone and the cloud.

- **Manual** (Xi writes the code): Simple to start. About 2 weeks to build. Full control. Zero third-party dependency, zero ongoing cost.
- **PowerSync** (paid product): Handles sync for us. Monthly cost (~USD 35+). Some constraints on SQL shape. Faster to ship if it works, but debugging is harder.

**Decision checkpoint**: 15 Jun 2026. Default: manual. Blocks ADR-010.

**Andreas angle**: Manual costs Xi's engineering time up-front. PowerSync costs money ongoing. At 10-50 users, manual is clearly cheaper. At 1,000+ users, we should re-evaluate.

---

#### 2. AI species ID base model

**What we're choosing**: Which AI model identifies fish species from photos (Stage 3 feature).

- **iNaturalist open-weights** (free, on-device): Good for broad species, less specialised for AU fish.
- **Roboflow hosted API** (paid per call): Better accuracy, but requires network on every ID.
- **Fine-tuned MobileNetV3 on AU species** (most work): Custom model. Best accuracy if done well. Most engineering effort.
- **Anthropic Claude Vision API** (paid per call): Likely overkill for species ID but very simple to wire up.

Blocks ADR-009. Xi to test a couple in May-June and pick.

**Andreas angle**: On-device models = no per-user cost. Cloud models = per-call cost that scales with usage.

---

#### 3. Photo storage — originals in the cloud or local-only?

**What we're choosing**: Where the original full-fidelity photos live once we have a backend.

- **Local-only, metadata in cloud**: Photos never leave the phone. Cloud only syncs text data. If the user loses their phone, they lose their photos.
- **Originals in the cloud (private bucket)**: Photos upload to a locked-down cloud bucket with per-user access rules. Lose your phone → restore from cloud. Costs Supabase Storage bandwidth.

**Xi's current lean**: Cloud storage with local as the primary render source. Users expect multi-device backup. Privacy is preserved via strict access rules.

**Andreas angle**: Storage costs scale with user count. At 10k users × 50 catches × 3 MB each, that's ~$30/month. Manageable.

---

#### 4. Conflict resolution — per-row or per-field?

**What we're choosing**: When two devices edit the same catch, how do we merge?

- **Per-row "last one wins"**: Simplest. If phone edits species while tablet edits weight, the most recent save wins — the other edit is silently lost.
- **Per-field "last one wins"**: Both edits are preserved. Slightly more complex (a small JSON column tracking the last-modified timestamp per field).

**Xi's lean**: Per-field. Protects data integrity in the multi-device case Stage 2 explicitly promises.

---

#### 5. Observability stack

**What we're choosing**: Tools to watch for crashes and usage patterns once the app has users.

- **Sentry + PostHog self-hosted EU**: Privacy-aligned, no third-party processing of user data.
- **Sentry + a lighter alternative**: Simpler, possibly cheaper.

**Xi's lean**: Sentry + PostHog. Privacy-aligned fits the brand.

---

#### 6. Android without a barometer — skip, warn, or block?

**What we mean**: Barometer sensors are standard on iPhones and Pixel Androids but absent on many cheaper Android models. Our catch record assumes one is present.

**Options**:

- **A — Silently skip**: Save the catch, leave barometer as null. Most user-friendly. Slightly weakens the aggregated analytics story.
- **B — Warn user once**: "Your phone doesn't have a barometer — catches won't include pressure." Transparent, but a bit nagging.
- **C — Block**: "Unsupported device." Too aggressive for an Australian fishing app.

**Xi's lean**: A. Graceful degradation. We surface the limitation in the analytics later if it matters.

---

## Next step

1. Discuss and decide the **BLOCKING** items (in roughly this order — each gates the next):
   - **Sharing model** (Joint decisions — the gating question; determines whether the Crew trust model questions apply at all)
   - Pricing model (Andreas question 1)
   - If sharing model is Option 5: Default crew privacy tier + Crew leader leaves (Joint questions under Crew trust model)
   - Sync engine choice by 15 Jun (Technical question 1)
   - Cut order for Stage 3 (Joint question under AFTA demo scope)
2. Capture leanings on the rest — no rush to decide everything
3. Xi updates `CLAUDE.md` and drafts the resulting ADRs in `docs/adr/`
4. Only then create Linear issues for Stage 2/3 scope — many questions cascade into dozens of tickets, and churn is expensive
