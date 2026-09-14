# Genius Moments NFL Template

A reusable animated film showing how the Genius Sports Moments engine reads an NFL game through win probability, the fan emotion arc, and real-time creative activation. Includes a **35-second 16:9 film** (1920 × 1080) and a **27-second 4:5 film** (1080 × 1350).

Plain HTML + JSX, with no build step or Node tooling. The original folder structure and all supplied files are preserved, including `fonts/`, `assets/`, `_ds/`, other film variants, and reference uploads.

## Preview

Open `NFL Moments Film.dc.html` or `NFL Moments Film 4x5.dc.html` in a browser. Keep the accompanying files and directories together. The supplied `support.js` loads React and Babel from a CDN, so an internet connection is needed. If your browser blocks local-file imports, serve this folder with a simple static web server and open the same HTML filename; no build is required.

## Publishing a new game

`nfl-game.js` is the only runtime file that changes between games. The object enclosed by its outer braces is plain JSON, and everything inside those braces uses plain JSON syntax.

1. Copy `games/_template.json` to `games/weekNN-away-home.json`, replacing `NN` with the two-digit week and `away`/`home` with lowercase team identifiers (for example, `week07-nor-riv.json`). Each real game gets its own file.
2. Replace the placeholder values with that game's data. Keep the archived file pure JSON: no comments, trailing commas, or `window.` assignment.
3. Paste the contents inside the JSON object's outer braces into the outer braces in `nfl-game.js`. Retain the `window.NFL_MOMENTS_GAME = { ... };` wrapper and the schema comment. Alternatively, replace the complete object after `=` with the complete JSON object and retain the final semicolon.
4. Reload both preview files and review the game.

`games/_template.json` contains the extracted, fictional Northside/Riverside placeholder payload. Its active copy remains in `nfl-game.js` so both previews work immediately. The films read `nfl-game.js`; the `games/` archive is not loaded automatically.

## Data schema

The table below expands the schema comment at the top of `nfl-game.js`. “Required” describes the complete per-game delivery contract: all fields are required except those explicitly marked optional in that comment. Runtime fallbacks are for previews and should not be relied on for real game delivery. Nested fields apply to each supplied object or array entry.

| Field | Type | Required | Example |
| --- | --- | --- | --- |
| `competition` | string | Yes | `"NFL · WEEK 7"` |
| `date` | string | Yes | `"MON 26 OCT"` |
| `home` | object | Yes | `{ "abbr": "RIV", "name": "Riverside", "color": "#F76B6A", "ink": "#0D1226" }` |
| `home.abbr` | string | Yes | `"RIV" (2–4 letters)` |
| `home.name` | string | Yes | `"Riverside"` |
| `home.color` | string | Yes | `"#F76B6A"` |
| `home.ink` | string | Yes | `"#0D1226"` |
| `home.logo` | string | No | `"assets/logos/team.svg"` |
| `away` | object | Yes | `{ "abbr": "RIV", "name": "Riverside", "color": "#F76B6A", "ink": "#0D1226" }` |
| `away.abbr` | string | Yes | `"RIV" (2–4 letters)` |
| `away.name` | string | Yes | `"Riverside"` |
| `away.color` | string | Yes | `"#F76B6A"` |
| `away.ink` | string | Yes | `"#0D1226"` |
| `away.logo` | string | No | `"assets/logos/team.svg"` |
| `perspective` | "home" or "away" | Yes | `"home"` |
| `overtime` | boolean | Yes | `true` |
| `intro` | object | Yes | `{"line1": "See Genius Moments live in action:", "line2": "Week 7: Northside at Riverside"}` |
| `intro.line1` | string | Yes | `"See Genius Moments live in action:"` |
| `intro.line2` | string | Yes | `"Week 7: Northside at Riverside"` |
| `end` | object | Yes | `{"headline": "Right fan. Right moment. Right message.", "sub": "Every screen. In real time."}` |
| `end.headline` | string | Yes | `"Right fan. Right moment. Right message."` |
| `end.sub` | string | Yes | `"Every screen. In real time."` |
| `scoring` | array of objects | Yes | `[{ … }]` |
| `scoring[].clock` | string | Yes | `"Q1 11:42"` |
| `scoring[].team` | "home" or "away" | Yes | `"home"` |
| `scoring[].type` | "TD", "FG", "2PT" or "SAF" | Yes | `"FG"` |
| `scoring[].points` | number | Yes | `3` |
| `scoring[].player` | string | Yes | `"K. Alvarez 41 yd"` |
| `scoring[].drive` | string | No | `"8 plays · 52 yds · 4:18"` |
| `scoring[].feature` | boolean | No | `true` |
| `winProb` | array of objects | Yes | `[{ … }]` |
| `winProb[].clock` | string | Yes | `"Q1 15:00"` |
| `winProb[].value` | number (0–1) | Yes | `0.52` |
| `emotion` | array of objects | Yes | `[{ … }]` |
| `emotion[].label` | string | Yes | `"Hope"` |
| `emotion[].from` | string | Yes | `"Q1 15:00"` |
| `emotion[].to` | string | Yes | `"Q1 03:18"` |
| `emotion[].color` | string | Yes | `"lightBlue"` |
| `moments` | array of objects | Yes | `[{ … }]` |
| `moments[].clock` | string | Yes | `"Q2 07:55"` |
| `moments[].kind` | "on", "off" or "win" | Yes | `"off"` |
| `moments[].team` | "home" or "away" | Yes | `"home"` |
| `moments[].title` | string | Yes | `"Riverside fall two scores back"` |
| `moments[].status` | string | Yes | `"MOMENT PAUSED · RIVERSIDE CREATIVE OFF"` |
| `audiences` | array of objects | Yes | `[{ … }]` |
| `audiences[].team` | "home" or "away" | Yes | `"away"` |
| `audiences[].label` | string | Yes | `"NORTHSIDE FANS"` |
| `audiences[].creative` | string | Yes | `"“Hold the line” creative"` |
| `audiences[].onFrom` | string | Yes | `"Q1 03:18"` |
| `audiences[].offFrom` | string | No | `"Q4 04:26"` |

Team `color` is the badge background and `ink` is its text color. Optional `logo` is an image URL or relative path that replaces the badge tile.

Emotion labels use the canonical set: **Joy**, **Awe & Admiration**, **Hope**, **Tension**, **Sadness**, **Relief**. Emotion colors use these tokens: `brightGreen`, `lightGreen`, `green`, `lightBlue`, `blue`, `purple`, `lightPurple`, `orange`, `coral`, `red`.

Scoring `points` is the amount added by that entry: TD + extra point = 7, TD alone = 6, and so on. Include every scoring play in chronological order, without counting the same points twice. Optional `feature: true` adds an on-screen scoring chip; `drive` adds its drive summary. Dense play-by-play `winProb` is supported and is sampled and smoothed. Its values always represent the `perspective` team's probability.

Moment `kind` values mean activated (`on`), paused (`off`), or final card (`win`). Cards are positioned automatically. An audience remains active after `onFrom` unless `offFrom` is supplied.

## Engineering notes

Every game clock is **quarter + time REMAINING**, for example `Q1 11:42` or `OT 06:38`. The same format applies to emotion `from`/`to` and audience `onFrom`/`offFrom`. Use `FINAL` for an emotion interval that extends to the end of the timeline. The current template models four 15-minute quarters and, when `overtime` is true, one 10-minute OT period.

**Lead changes, the running score, quarter axis markers, and the biggest win-probability swing are computed from the data and must not be supplied.** Running and final scores and score-lead changes come from ordered `scoring` entries. Quarter markers come from the period lengths and `overtime`. The biggest probability swing is computed across scoring plays using the `winProb` samples. The comment's shorthand about deriving lead changes from win probability should be read with this implementation distinction in mind. Card coordinates, animation timings, and curve samples are also derived by the template.
