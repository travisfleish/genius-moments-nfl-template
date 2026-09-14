// ═════════════════════════════════════════════════════════════════════════════
// GENIUS MOMENTS — PER-GAME DATA
//
// This is the ONLY file that changes between games. Everything between the
// outer braces is plain JSON: engineering can emit it verbatim, and it can be
// pasted in wholesale.
//
// ── SCHEMA ───────────────────────────────────────────────────────────────────
// competition   string   eyebrow line, e.g. "NFL · WEEK 7"
// date          string   short date shown next to the competition
// home / away   object   { abbr, name, color, ink, logo? }
//                        abbr  — 2-4 letters, used on the badge tile
//                        color — badge background; ink — text on that badge
//                        logo  — optional image URL; replaces the tile
// perspective   "home"|"away"   whose win probability and fan arc the film tracks
// overtime      boolean  adds a 10-minute OT period to the timeline axis
// intro         { line1, line2 }   opening title lines
// end           { headline, sub }  closing card
//
// scoring[]     every scoring play, in order
//   clock   "Q1 11:42" | "OT 06:38"  — quarter + time REMAINING on the clock
//   team    "home" | "away"
//   type    "TD" | "FG" | "2PT" | "SAF"  — shown on the axis and in the chip
//   points  number added to the running score (TD+XP = 7, TD alone = 6, …)
//   player  short description, e.g. "T. Beaumont 22 yd catch"
//   drive   optional drive summary, e.g. "7 plays · 68 yds · 2:39"
//   feature optional true — this play also gets an on-screen chip
//
// winProb[]     { clock, value }  value 0-1, from the perspective team's side.
//               Dense play-by-play is fine; the film samples and smooths it.
//               Lead changes and the biggest swing are computed from this.
//
// emotion[]     { label, from, to, color }  the fan emotional arc.
//               Labels use the Moments canonical set: Joy · Awe & Admiration ·
//               Hope · Tension · Sadness · Relief.
//               color: brightGreen | lightGreen | green | lightBlue | blue |
//                      purple | lightPurple | orange | coral | red
//
// moments[]     { clock, kind, team, title, status }  creative activations.
//               kind: "on" (activated) | "off" (paused) | "win" (final card).
//               Cards are auto-placed — no coordinates to maintain.
//
// audiences[]   { team, label, creative, onFrom, offFrom? }  the delivery strip.
// ═════════════════════════════════════════════════════════════════════════════

window.NFL_MOMENTS_GAME = {
  "competition": "NFL · WEEK 7",
  "date": "MON 26 OCT",
  "perspective": "home",
  "overtime": true,

  "away": { "abbr": "NOR", "name": "Northside", "color": "#0000DC", "ink": "#FFFFFF" },
  "home": { "abbr": "RIV", "name": "Riverside", "color": "#F76B6A", "ink": "#0D1226" },

  "intro": {
    "line1": "See Genius Moments live in action:",
    "line2": "Week 7: Northside at Riverside"
  },
  "end": {
    "headline": "Right fan. Right moment. Right message.",
    "sub": "Every screen. In real time."
  },

  "scoring": [
    { "clock": "Q1 11:42", "team": "home", "type": "FG", "points": 3, "player": "K. Alvarez 41 yd",        "drive": "8 plays · 52 yds · 4:18" },
    { "clock": "Q1 03:18", "team": "away", "type": "TD", "points": 7, "player": "D. Whitlock 12 yd run",   "drive": "11 plays · 80 yds · 6:02" },
    { "clock": "Q2 07:55", "team": "away", "type": "TD", "points": 7, "player": "R. Cole 34 yd catch",     "drive": "5 plays · 71 yds · 2:11", "feature": true },
    { "clock": "Q2 00:31", "team": "home", "type": "FG", "points": 3, "player": "K. Alvarez 28 yd",        "drive": "9 plays · 61 yds · 1:44" },
    { "clock": "Q3 09:12", "team": "home", "type": "TD", "points": 7, "player": "T. Beaumont 6 yd run",    "drive": "12 plays · 75 yds · 5:48", "feature": true },
    { "clock": "Q4 12:40", "team": "away", "type": "FG", "points": 3, "player": "M. Price 47 yd",          "drive": "6 plays · 29 yds · 3:02" },
    { "clock": "Q4 04:26", "team": "home", "type": "TD", "points": 7, "player": "T. Beaumont 22 yd catch", "drive": "7 plays · 68 yds · 2:39", "feature": true },
    { "clock": "Q4 01:05", "team": "away", "type": "FG", "points": 3, "player": "M. Price 33 yd",          "drive": "10 plays · 44 yds · 3:12" },
    { "clock": "OT 06:38", "team": "home", "type": "TD", "points": 7, "player": "T. Beaumont 9 yd run",    "drive": "9 plays · 70 yds · 4:22", "feature": true }
  ],

  "winProb": [
    { "clock": "Q1 15:00", "value": 0.52 }, { "clock": "Q1 11:42", "value": 0.58 },
    { "clock": "Q1 08:00", "value": 0.56 }, { "clock": "Q1 03:18", "value": 0.41 },
    { "clock": "Q2 12:00", "value": 0.40 }, { "clock": "Q2 07:55", "value": 0.24 },
    { "clock": "Q2 04:00", "value": 0.25 }, { "clock": "Q2 00:31", "value": 0.31 },
    { "clock": "Q3 14:00", "value": 0.32 }, { "clock": "Q3 09:12", "value": 0.47 },
    { "clock": "Q3 04:00", "value": 0.49 }, { "clock": "Q4 12:40", "value": 0.33 },
    { "clock": "Q4 08:00", "value": 0.36 }, { "clock": "Q4 04:26", "value": 0.74 },
    { "clock": "Q4 02:00", "value": 0.71 }, { "clock": "Q4 01:05", "value": 0.50 },
    { "clock": "OT 10:00", "value": 0.55 }, { "clock": "OT 08:30", "value": 0.62 },
    { "clock": "OT 06:38", "value": 0.99 }
  ],

  "emotion": [
    { "label": "Hope",             "from": "Q1 15:00", "to": "Q1 03:18", "color": "lightBlue" },
    { "label": "Tension",          "from": "Q1 03:18", "to": "Q2 07:55", "color": "orange" },
    { "label": "Sadness",          "from": "Q2 07:55", "to": "Q3 09:12", "color": "purple" },
    { "label": "Hope",             "from": "Q3 09:12", "to": "Q4 04:26", "color": "lightBlue" },
    { "label": "Joy",              "from": "Q4 04:26", "to": "Q4 01:05", "color": "lightGreen" },
    { "label": "Tension",          "from": "Q4 01:05", "to": "OT 10:00", "color": "orange" },
    { "label": "Awe & Admiration", "from": "OT 10:00", "to": "OT 06:38", "color": "brightGreen" },
    { "label": "Relief",           "from": "OT 06:38", "to": "FINAL",    "color": "green" }
  ],

  "moments": [
    { "clock": "Q2 07:55", "kind": "off", "team": "home", "title": "Riverside fall two scores back", "status": "MOMENT PAUSED · RIVERSIDE CREATIVE OFF" },
    { "clock": "Q3 09:12", "kind": "on",  "team": "home", "title": "Riverside within one",           "status": "MOMENT ACTIVATED · COMEBACK CREATIVE ON" },
    { "clock": "Q4 04:26", "kind": "on",  "team": "home", "title": "Riverside take the lead",        "status": "MOMENT ACTIVATED · CREATIVE ESCALATED" },
    { "clock": "OT 06:38", "kind": "win", "team": "home", "title": "Riverside win in OT",            "status": "FINAL · MOMENT ACTIVATED" }
  ],

  "audiences": [
    { "team": "away", "label": "NORTHSIDE FANS", "creative": "“Hold the line” creative",  "onFrom": "Q1 03:18", "offFrom": "Q4 04:26" },
    { "team": "home", "label": "RIVERSIDE FANS", "creative": "“Comeback surge” creative", "onFrom": "Q3 09:12" }
  ]
};
