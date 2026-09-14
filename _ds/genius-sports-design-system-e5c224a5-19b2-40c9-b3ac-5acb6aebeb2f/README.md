# Genius Sports — Design System

A working design system for **Genius Sports**, derived from the company's official
"Genius Brand Kit" Lovable starter template. It packages the brand's foundations —
type, color, the signature "spring" motif, logos, and the PNG brand-icon set — plus
ready-to-use UI-kit components so design agents can produce on-brand interfaces,
collateral, and prototypes.

> **Source repository**
> `travisfleish/lovable-brand-template` — https://github.com/travisfleish/lovable-brand-template
> A Vite + React + TanStack + Tailwind v4 starter ("gs-brand-template") with Genius
> Sports brand foundations built in. All tokens, fonts, logos, icons, and components
> in this system were lifted directly from that repo's `src/` and `public/` folders.
> Explore it further to build higher-fidelity production work.
>
> A companion reference, `travisfleish/lovable-resource-guide`, also exists in the
> same account and may hold additional brand guidance.

---

## What is Genius Sports?

Genius Sports is a global **sports data and technology** company. It sits between
sports leagues/federations, sportsbooks, and media: capturing official live data,
powering live odds and trading, and helping rights-holders and brands engage fans.
The brand voice is confident, fast, and performance-minded — built around the idea
of **winning the moment**.

The product surface implied by the brand kit spans several "worlds":
- **Sports data & statistics** — official live data capture, distribution, stats.
- **Betting / trading technology** — live pricing, live data feeds, integrity.
- **Media & fan engagement** — personalisation, video, social, reach, monetisation.

Brand-icon names (Live Data, Live Pricing, Major Sports, Monetise, Personalise,
Distribute, Reach, Engage, Stadium, Fans, VR-3D…) map directly onto these themes.

---

## Content Fundamentals

**Voice.** Confident, kinetic, and benefit-led. Short declaratives. The brand
organizes everything around momentum and outcomes — the template's own hero reads
*"Genius Brand Kit … Start building — every component, token, and font is ready to
use."* Marketing copy favours active verbs that double as the icon taxonomy:
*Monetise, Personalise, Distribute, Engage, Reach*.

**Person.** Speaks to the customer as **"you"**, refers to itself as **"we" / Genius
Sports**. Outcome-oriented ("win the moment", "powering the connected fan").

**Casing.** Sentence case for headlines and UI labels — *not* Title Case. Subheadings
/ eyebrows are short and set in sentence case at ~15px. Buttons are sentence case
("Get started", "Book a demo", "Learn more").

**Spelling.** **British English** (Monetise, Personalise — with an *s*, and "Euros"/
"Pounds" icons). Keep the -ise spellings when extending the system.

**Numbers & stats.** Big, confident, abbreviated: *"700+", "240B+", "47%"*. Stat
values are set in the display face at light weight with a short accent rule beneath.

**Emoji.** None. The brand never uses emoji. Iconography is handled by the dedicated
PNG brand-icon set (see ICONOGRAPHY). Avoid unicode-glyph icons too.

**Vibe.** Premium sports-tech. Editorial whitespace, a near-black navy canvas for
"hero" moments, electric blue for action, and a single zingy accent (bright green or
coral) used sparingly. Energetic but never cluttered.

---

## Visual Foundations

**Type.**
- **Klarheit Kurrent** (display / headings) — a clean geometric-humanist grotesk.
  Set **light** (weight 300/400) at large sizes with **tight negative tracking**
  (−0.03em to −0.05em). This is the brand's signature typographic move: big, airy,
  low-contrast headlines.
- **Red Hat Text** (body / UI) — weights 400 & 500. Body copy almost always rides at
  **~80% opacity** over the ink color for a softer read.
- Sizing is **fluid** via `clamp()` between a 768px and 1024px viewport (see
  `colors_and_type.css`). Display ramp tops out around 88px; body ramp 12–24px.
- ⚠️ Klarheit Kurrent ships here partly as **TRIAL** weights (the `ES…_TRIAL` files,
  weights 400/500/600) — internal collateral & throwaway prototypes only. The
  licensed weights are **400 Regular** and **700 Bold**. Use only those two for
  production, or license the full family.

**Color.** Navy `#0D1226` is the primary dark canvas and ink; electric **blue
`#0000DC`** is the single primary action color. A small accent set does the heavy
lifting on dark surfaces — **bright green `#E1FF67`** (the most "Genius" accent) and
coral/**light-red `#F76B6A`** (used as the icon fill). Secondary hues (greens,
purple, orange, red) and soft pastel tints (light blue, light purple, light orange)
round out an extended palette for charts/illustration. Neutrals: white, snow
`#FAFAFA`, light grey `#F6F7F9`, lavender-grey `#E7E7E9` (hairlines).

**Backgrounds.** Two modes, used in big alternating blocks: **white** (editorial,
ink = navy) and **navy** (hero / impact, ink = white, accents = bright green). Blue
is used for full-bleed CTA panels. No photographic textures or gradients in the kit
itself — backgrounds are flat color. Imagery, when present, would read cool/electric
to match the palette.

**The "Spring" motif.** The brand's signature graphic device: a row of **vertical
bars of progressively increasing width**, typically rotated **45°** (the canonical
angle), in blue on light or bright-green on dark. It appears as edge decoration on
pills/subheadings, as large background flourishes flanking mastheads, and bleeding
out of CTA panels. Treat it as the one "hero" decoration — reach for it instead of
inventing new ornaments.

**Shape & radius.** The system is built on the **full pill** (`border-radius: 125rem`)
for every button, tag, and the dot-subheading capsule. Cards are gently rounded:
**16px** (`rounded-2xl`) for stat blocks, **8px** (`rounded-lg`) for CTA panels.

**Borders & elevation.** Borders are **1px hairlines in lavender-grey** `#E7E7E9`.
The system is essentially **shadow-less** — separation comes from color blocks,
hairlines, and whitespace, not drop-shadows. Don't add heavy shadows.

**Buttons & hover.** Pills with a distinctive **animated hover**: 4 horizontal
accent lines sweep in from alternating sides while the label does a **letter-by-letter
vertical swap** to its hover color (navy→blue, white→blue, etc.). A simpler, faithful
fallback is a color crossfade (navy→blue) over ~300ms. Outline buttons shift their
border to light-blue on hover. Cursor is always pointer.

**Press / focus.** No shrink/scale press state in the source; interaction is carried
by the color/line transitions. Keep focus rings accessible (use blue).

**Motion.** Two custom easings: **slide** `cubic-bezier(0.68,-0.2,0.15,0.98)` for
directional movement and **bounce** `cubic-bezier(0.34,1.56,0.64,1)` for playful
overshoot. A baseline `imageOpacity` fade (300ms) reveals media. Durations cluster
at 250–500ms. Framer Motion drives the richer button/spring animations.

**Transparency & blur.** Used sparingly: body text at 80% opacity, muted captions at
50–60%, dark-surface captions at white/60–70%. No glassmorphism/backdrop-blur in the
kit.

**Layout.** Centered containers with named max-widths (narrow 1110 / default 1280 /
wide 1376; small 676 / medium 846). Generous, rhythmic vertical section padding via a
custom spacing scale. Content is frequently center-aligned in hero/masthead contexts,
left-aligned in dense content.

---

## Iconography

Genius Sports uses a **bespoke PNG brand-icon set** — *not* a stroke-icon font like
Lucide/Heroicons. Characteristics:
- **Two-tone, filled style:** a heavy **navy outline** with **coral/red `#F76B6A`
  accent fills** on key shapes. Friendly, rounded, slightly playful — distinct from
  thin line icons.
- Shipped as **PNG** at two finishes: **`light/`** (navy + coral, for light
  backgrounds) and **`dark/`** (white versions, for navy/dark backgrounds).
- **25 concepts**, named by product/theme rather than literal object:
  Basketball, Cloud, Data, Distribute, Engage, Euros, Fans, Field, Football,
  LiveData, LivePricing, MajorSports, Monetise, Personalise, Platform, Pounds,
  Pricing, Reach, Soccer, Social, Stadium, Statistics, Tier1Support, Video, VR3D.
- All copied into **`assets/icons/light/`** and **`assets/icons/dark/`** (filenames
  normalized: spaces removed, `White` suffix dropped — the folder denotes finish).
- **Logos** (`assets/logos/`): four lockups — **horizontal, vertical, wordmark,
  marque** ("G" swirl) — each in **blue** and **white** RGB SVG. The marque is the
  compact app/avatar mark. (Source SVGs had no fill defined and defaulted to black;
  a `fill` was added to each so blue renders as `#0000DC` and white as `#fff`.)
- **No emoji, no unicode-glyph icons.** Small inline UI arrows (right-arrow,
  arrow-in-circle) are simple SVG strokes — see `ui_kits/marketing/Icons.jsx`.

**When you need an icon not in the set:** prefer composing from the existing 25. If
you must substitute, match the two-tone filled look (navy outline + coral accent) —
do **not** drop in a thin line icon, and **flag the substitution**.

---

## Files in this system

| Path | What it is |
|---|---|
| `README.md` | This document — brand context, content & visual foundations, iconography, index |
| `SKILL.md` | Agent-Skill front-matter wrapper so this kit works in Claude Code |
| `colors_and_type.css` | Drop-in tokens: fonts, color vars (raw + semantic), fluid type scale, radii, motion |
| `fonts/` | Klarheit Kurrent (Regular/Bold + trial weights) & Red Hat Text (Regular/Medium) `.woff2` |
| `assets/logos/` | 8 logo SVGs — horizontal / vertical / wordmark / marque × blue / white |
| `assets/icons/light/` · `assets/icons/dark/` | 25 brand icons × 2 finishes (PNG) |
| `preview/` | 21 Design-System specimen cards (registered in the Design System tab) |
| `ui_kits/marketing/` | Marketing-site UI kit — React/JSX components + interactive `index.html` |

### UI kits
- **`ui_kits/marketing/`** — the Genius Sports marketing website: nav header, hero
  masthead with springs, product/feature grid using the brand icons, stat band, CTA
  panel, and footer, assembled into an interactive single-page demo. See its README.

---

## Notes & caveats
- Recreations are **cosmetic**, not production code — components favour fidelity and
  reusability over real functionality.
- The richest brand animations (button line-sweep, masthead springs) are reproduced
  faithfully but simplified from the Framer-Motion originals.
- Klarheit Kurrent TRIAL-weight licensing applies (see Type, above).
