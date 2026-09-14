// ─────────────────────────────────────────────────────────────────────────────
// MOMENTS — GAME 4 FILM
// Knicks–Spurs NBA Finals Game 4 comeback, visualized as the Moments Engine
// would read it: win probability + fan emotion + real-time message activation.
// Brand: Genius Sports (navy #0D1226, bright green #E1FF67, Klarheit/Red Hat).
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  navy: '#0D1226', blue: '#0000DC', lightBlue: '#95ECFD', brightGreen: '#E1FF67',
  lightGreen: '#18C971', green: '#047C40', lightPurple: '#C2D1FF', purple: '#4337A8',
  orange: '#FA5D00', lightOrange: '#FFEBAF', coral: '#F76B6A', red: '#C20000',
  white: '#FFFFFF', lav: '#E7E7E9',
};
const FH = "'KlarheitKurrent', ui-sans-serif, system-ui, sans-serif";
const FB = "'RedHatText', ui-sans-serif, system-ui, sans-serif";

const W = 1920, H = 1080, DUR = 33.9;
const DRAW0 = 5.5, SPAN = 13.5;                  // game draw rate (full game = 13.5s)
const PAUSE_P = 0.985;                           // game progress where we cut to the clip
const T_PAUSE = DRAW0 + PAUSE_P * SPAN;          // ≈18.80 — chart freezes, fade out
const VDUR = 4.25;                               // og_play.mp4 duration
const VID_START = T_PAUSE + 0.3;                 // ≈19.10 — clip playing fullscreen
const VID_END = VID_START + VDUR;                // ≈23.35 — clip done, snap back
const RESUME = VID_END + 0.3;                    // ≈23.65 — chart resumes
const DRAW1 = RESUME + 0.7;                      // ≈24.35 — final point lands, win beat
const CH = { x: 230, y: 280, w: 1460, h: 560 };        // chart plot area

const tAt = (p) => p <= PAUSE_P
  ? DRAW0 + p * SPAN
  : RESUME + ((p - PAUSE_P) / (1 - PAUSE_P)) * (DRAW1 - RESUME);
const gameP = (t) => {
  if (t <= DRAW0) return 0;
  if (t <= T_PAUSE) return (t - DRAW0) / SPAN;
  if (t <= RESUME) return PAUSE_P;
  if (t <= DRAW1) return PAUSE_P + (1 - PAUSE_P) * (t - RESUME) / (DRAW1 - RESUME);
  return 1;
};
const X = (p) => CH.x + p * CH.w;
const Y = (v) => CH.y + (1 - v) * CH.h;

// ── Win probability data (NYK) ───────────────────────────────────────────────
const KEYS = [
  [0, .50], [.03, .47], [.06, .52], [.09, .44], [.12, .40], [.15, .43],
  [.18, .34], [.22, .30], [.25, .27], [.28, .20], [.31, .15], [.34, .11],
  [.37, .08], [.40, .06], [.44, .045], [.48, .035], [.52, .03], [.56, .05],
  [.60, .075], [.63, .10], [.655, .07], [.68, .055], [.71, .06], [.74, .035],
  [.77, .03], [.80, .05], [.83, .09], [.85, .14], [.87, .22], [.885, .17],
  [.90, .30], [.915, .42], [.93, .58], [.942, .78], [.952, .46], [.962, .66],
  [.972, .42], [.982, .80], [.99, .93], [1, 1],
];
function baseWP(p) {
  if (p <= 0) return KEYS[0][1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (p >= KEYS[i][0] && p <= KEYS[i + 1][0]) {
      const f = (p - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0]);
      return KEYS[i][1] + (KEYS[i + 1][1] - KEYS[i][1]) * f;
    }
  }
  return KEYS[KEYS.length - 1][1];
}
const NPTS = 281;
const PTS = (() => {
  const a = [];
  for (let i = 0; i < NPTS; i++) {
    const p = i / (NPTS - 1);
    const b = baseWP(p);
    const amp = 0.01 + 0.09 * b * (1 - b);
    const j = Math.sin(p * 247.3) * .45 + Math.sin(p * 531.7 + 1.3) * .35 + Math.sin(p * 1117.9 + 2.1) * .2;
    a.push(clamp(b + j * amp, 0.008, 0.995));
  }
  a[0] = 0.5; a[NPTS - 1] = 1;
  return a;
})();
const wpAt = (p) => {
  const f = clamp(p, 0, 1) * (NPTS - 1);
  const i = Math.min(NPTS - 2, Math.floor(f));
  return PTS[i] + (PTS[i + 1] - PTS[i]) * (f - i);
};

// ── Camera (Screen-Studio-style damped punch-ins) ───────────────────────────
const camTimes = [0, 4, 12, 15, 16.8, 18.8, 23.65, 24.35, 24.75, 25.95, 27.15, 33.9];
const camS  = interpolate(camTimes, [1, 1, 1.04, 1.16, 1.20, 1.22, 1.22, 1.24, 1.30, 1.30, 1, 1], Easing.easeInOutCubic);
const camFX = interpolate(camTimes, [960, 960, 960, 1240, 1380, 1480, 1480, 1500, 1560, 1560, 960, 960], Easing.easeInOutCubic);
const camFY = interpolate(camTimes, [540, 540, 540, 560, 520, 470, 470, 460, 400, 400, 540, 540], Easing.easeInOutCubic);

// ── Emotion arc (Knicks-fan perspective) ─────────────────────────────────────
const EMO = [
  ['Anticipation', 0.00, 0.10, C.lightBlue],
  ['Excitement',   0.10, 0.22, C.lightGreen],
  ['Tension',      0.22, 0.40, C.orange],
  ['Anger',        0.40, 0.54, C.coral],
  ['Tension',      0.54, 0.74, C.orange],
  ['Hope',         0.74, 0.85, C.lightPurple],
  ['Excitement',   0.85, 0.94, C.lightGreen],
  ['Joy', 0.94, 1.0, C.brightGreen],
];

// ── Small shared pieces ──────────────────────────────────────────────────────
function fadeIn(t, t0, dur = 0.6) { return clamp((t - t0) / dur, 0, 1); }
function popIn(t, t0, dur = 0.5) { return t < t0 ? 0 : Easing.easeOutBack(clamp((t - t0) / dur, 0, 1)); }
function decay(t, t0, speed = 3.5) { return t < t0 ? 0 : Math.exp(-(t - t0) * speed); }

function Pulse({ size = 10, color = C.brightGreen, dim = false }) {
  const t = useTime();
  const k = (t % 1.4) / 1.4;
  return (
    <span style={{ position: 'relative', width: size, height: size, display: 'inline-block', flexShrink: 0 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: dim ? 'rgba(255,255,255,0.25)' : color }} />
      {!dim && (
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${color}`,
          transform: `scale(${1 + k * 1.8})`, opacity: (1 - k) * 0.7,
        }} />
      )}
    </span>
  );
}

function TeamBadge({ team, size = 44 }) {
  return (
    <span style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <img src={team === 'nyk' ? 'uploads/new-york-knicks-logo.png' : 'uploads/san-antonio-spurs-logo-2.png'} alt={team}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
    </span>
  );
}

function GMTitle({ t0 = 0, size = 54 }) {
  const t = useTime();
  const o = fadeIn(t, t0, 0.5);
  return (
    <div style={{ fontFamily: FH, fontWeight: 300, fontSize: size, letterSpacing: '-0.02em', color: C.white, opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
      Genius Moments
    </div>
  );
}

function Eyebrow({ label, t0 = 0 }) {
  const t = useTime();
  const o = fadeIn(t, t0, 0.5);
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 12,
      border: '1px solid rgba(255,255,255,0.22)', borderRadius: 999,
      padding: '10px 22px', opacity: o, transform: `translateY(${(1 - o) * 12}px)`,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.brightGreen, flexShrink: 0 }} />
      <span style={{ fontFamily: FB, fontSize: 15, fontWeight: 500, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.8)' }}>{label}</span>
    </div>
  );
}

// Brand "spring" motif — progressive-width bars at 45°
function Spring({ x, y, height = 140, color = C.brightGreen, t0 = 0, flip = false, opacity = 1 }) {
  const t = useTime();
  const bars = [2, 3, 4, 6, 9, 13, 18];
  return (
    <div style={{
      position: 'absolute', left: x, top: y, display: 'flex', gap: 12,
      transform: `rotate(45deg) ${flip ? 'scaleX(-1)' : ''}`, transformOrigin: 'center', opacity,
    }}>
      {bars.map((w, i) => {
        const g = Easing.easeOutCubic(clamp((t - t0 - i * 0.09) / 0.6, 0, 1));
        return <div key={i} style={{ width: w, height, background: color, borderRadius: 0, transform: `scaleY(${g})`, transformOrigin: 'bottom' }} />;
      })}
    </div>
  );
}

// Exposes seek/pause controls for the MP4 export page
function ExposeControl() {
  const tl = useTimeline();
  React.useEffect(() => {
    window.__film = { setTime: tl.setTime, setPlaying: tl.setPlaying, duration: DUR };
  });
  return null;
}

// Sets data-screen-label on the film root once per second (for commenting)
function ScreenLabel() {
  const t = useTime();
  const s = Math.floor(t);
  React.useEffect(() => {
    const el = document.getElementById('film-root');
    if (el) el.setAttribute('data-screen-label', `moments-game4-film · t=${s}s`);
  }, [s]);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 1 — INTRO (0 → 8.4s)
// ─────────────────────────────────────────────────────────────────────────────
function IntroScene() {
  const t = useTime();
  const o = 1 - fadeIn(t, 3.7, 0.7);
  const h1o = 1, h2o = 1, subo = 1;
  return (
    <Sprite start={0} end={4.4}>
      <div style={{ position: 'absolute', inset: 0, opacity: o }}>
        <Spring x={120} y={760} t0={-1} opacity={0.85} />
        <Spring x={1660} y={120} t0={-1} flip={true} opacity={0.85} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontFamily: FH, fontWeight: 300, fontSize: 84, letterSpacing: '-0.04em', lineHeight: 1.08, color: C.white, opacity: h1o, transform: `translateY(${(1 - h1o) * 24}px)` }}>
              See <span style={{ color: C.brightGreen }}>Genius Moments</span> live in action:
            </div>
            <div style={{ fontFamily: FH, fontWeight: 300, fontSize: 84, letterSpacing: '-0.04em', lineHeight: 1.08, color: C.white, opacity: h2o, transform: `translateY(${(1 - h2o) * 24}px)` }}>
              NBA Finals: Knicks v Spurs <span style={{ color: C.lightBlue }}>Game 4</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36, opacity: subo, transform: `translateY(${(1 - subo) * 16}px)`, marginTop: 32 }}>
            <TeamBadge team="nyk" size={120} />
            <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 42, color: 'rgba(255,255,255,0.5)' }}>v</span>
            <TeamBadge team="sas" size={120} />
          </div>
        </div>
      </div>
    </Sprite>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2 — THE VISUALIZATION (7.8 → 49.4s)
// ─────────────────────────────────────────────────────────────────────────────

function Header() {
  const t = useTime();
  const o = fadeIn(t, 4.0, 0.5);
  const p = gameP(t);
  const q = t < DRAW0 ? 'TIP-OFF' : p >= 1 ? 'FINAL' : 'Q' + (Math.floor(p / 0.25) + 1);
  return (
    <div style={{ position: 'absolute', left: CH.x, right: W - CH.x - CH.w, top: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: o, transform: `translateY(${(1 - o) * -14}px)` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: FB, fontSize: 15, fontWeight: 500, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)' }}>NBA FINALS · GAME 4</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <TeamBadge team="nyk" size={46} />
          <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 35, letterSpacing: '-0.03em', color: C.white }}>New York Knicks</span>
          <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 25, color: 'rgba(255,255,255,0.45)', margin: '0 5px' }}>@</span>
          <TeamBadge team="sas" size={46} />
          <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 35, letterSpacing: '-0.03em', color: C.white }}>San Antonio Spurs</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: FH, fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', color: q === 'FINAL' ? C.brightGreen : 'rgba(255,255,255,0.85)', minWidth: 86, textAlign: 'right' }}>{q}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Pulse size={9} />
          <span style={{ fontFamily: FB, fontSize: 15, fontWeight: 500, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.8)' }}>MOMENTS ENGINE · LIVE</span>
        </div>
      </div>
    </div>
  );
}

function EmotionBar() {
  const t = useTime();
  const p = gameP(t);
  const capO = fadeIn(t, 4.1, 0.5);
  const live = t >= DRAW0;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: CH.x, top: 138, fontFamily: FB, fontSize: 14, fontWeight: 500, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)', opacity: capO }}>
        KNICKS-FAN EMOTIONAL ARC
      </div>
      {EMO.map(([label, s, e, col], i) => {
        const entry = fadeIn(t, 4.1 + i * 0.06, 0.4);
        const active = live && p >= s && (p < e || p >= 1 && e === 1);
        const past = live && p >= e && !(p >= 1 && e === 1);
        const pop = 1 + 0.04 * decay(t, tAt(s), 3.5) * (live && p >= s ? 1 : 0);
        const left = X(s), width = X(e) - X(s);
        const isFirst = i === 0, isLast = i === EMO.length - 1;
        const base = {
          position: 'absolute', left, top: 172, width, height: 48,
          borderRadius: `${isFirst ? 6 : 0}px ${isLast ? 6 : 0}px ${isLast ? 6 : 0}px ${isFirst ? 6 : 0}px`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          fontFamily: FH, fontWeight: 400, fontSize: 14.5, letterSpacing: '-0.01em', lineHeight: 1.12, padding: '0 4px',
          boxSizing: 'border-box',
          opacity: entry, transform: `scaleY(${pop}) translateY(${(1 - entry) * -10}px)`,
        };
        if (active) return <div key={i} style={{ ...base, background: col, color: C.navy, boxShadow: `0 0 26px ${col}55`, zIndex: 2 }}>{label}</div>;
        if (past) return <div key={i} style={{ ...base, background: col, color: C.navy, opacity: entry * 0.32 }}>{label}</div>;
        return <div key={i} style={{ ...base, background: 'rgba(255,255,255,0.05)', boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.45)' }}>{label}</div>;
      })}
      {live && p < 1 && (
        <div style={{ position: 'absolute', left: X(p) - 7, top: 226, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: `9px solid ${C.brightGreen}` }} />
      )}
    </div>
  );
}

function ChartFrame() {
  const t = useTime();
  const o = fadeIn(t, 4.3, 0.6);
  const qLines = [0.25, 0.5, 0.75];
  const qLabels = [['Q1', 0.125], ['Q2', 0.375], ['Q3', 0.625], ['Q4', 0.875]];
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <rect x={CH.x} y={CH.y} width={CH.w} height={CH.h} fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" rx="4" />
      {[0.5].map(v => (
        <line key={v} x1={CH.x} y1={Y(v)} x2={CH.x + CH.w} y2={Y(v)} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 7" />
      ))}
      {qLines.map(q => {
        const pulse = decay(t, tAt(q), 2.5);
        return <line key={q} x1={X(q)} y1={CH.y} x2={X(q)} y2={CH.y + CH.h} stroke={`rgba(255,255,255,${0.12 + pulse * 0.45})`} strokeWidth={1 + pulse * 1.5} />;
      })}
      {[[1, '1.0'], [0.5, '0.5'], [0, '0.0']].map(([v, l]) => (
        <text key={l} x={CH.x - 18} y={Y(v) + 7} textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily={FB} fontSize="20">{l}</text>
      ))}
      {qLabels.map(([l, m]) => (
        <text key={l} x={X(m)} y={CH.y + CH.h + 34} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontFamily={FB} fontSize="19" letterSpacing="2">{l}</text>
      ))}
      <text x={X(1)} y={CH.y + CH.h + 34} textAnchor="end" fill="rgba(225,255,103,0.7)" fontFamily={FB} fontSize="16" letterSpacing="2">FINAL</text>
    </svg>
  );
}

function ChartLegend() {
  const t = useTime();
  const t0 = tAt(0.1), tEnd = tAt(0.78);
  if (t < t0 || t > tEnd) return null;
  const e = popIn(t, t0, 0.55);
  const o = fadeIn(t, t0, 0.3) * (1 - fadeIn(t, tEnd - 0.4, 0.4));
  const ax = X(0.08), ay = Y(wpAt(0.08));
  const bx = 470, by = 478; // connector start (box bottom centre)
  const lineP = clamp((t - t0 - 0.1) / 0.4, 0, 1);
  const lx = bx + (ax - bx) * lineP, ly = by + (ay - by) * lineP;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <line x1={bx} y1={by} x2={lx} y2={ly} stroke={C.brightGreen} strokeWidth="1.5" strokeDasharray="2 5" />
        {lineP >= 1 && <circle cx={ax} cy={ay} r="6" fill="none" stroke={C.brightGreen} strokeWidth="2" />}
      </svg>
      <div style={{
        position: 'absolute', left: 250, top: 360, borderRadius: 14,
        background: 'rgba(13,18,38,0.75)', border: '1px solid rgba(225,255,103,0.4)',
        backdropFilter: 'blur(4px)', boxShadow: '0 0 44px rgba(225,255,103,0.14)',
        padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 12,
        transform: `scale(${0.7 + 0.3 * e})`, transformOrigin: 'center bottom',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg width="46" height="14">
            <line x1="0" y1="7" x2="46" y2="7" stroke={C.brightGreen} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="37" cy="7" r="6" fill={C.brightGreen} />
          </svg>
          <span style={{ fontFamily: FH, fontWeight: 400, fontSize: 24, letterSpacing: '-0.02em', color: C.white }}>
            Win probability — New York Knicks
          </span>
        </div>
        <div style={{ display: 'flex' }}>
          <span style={{ fontFamily: FB, fontSize: 14, fontWeight: 500, letterSpacing: '0.16em', color: C.brightGreen }}>VIA GENIUSIQ</span>
        </div>
      </div>
    </div>
  );
}

function WinLine() {
  const t = useTime();
  const p = gameP(t);
  if (t < DRAW0) return null;
  const n = Math.max(1, Math.floor(p * (NPTS - 1)));
  let d = `M ${X(0)} ${Y(PTS[0])}`;
  for (let i = 1; i <= n; i++) d += ` L ${X(i / (NPTS - 1)).toFixed(1)} ${Y(PTS[i]).toFixed(1)}`;
  const tipX = X(p), tipY = Y(wpAt(p));
  if (p * (NPTS - 1) > n) d += ` L ${tipX.toFixed(1)} ${tipY.toFixed(1)}`;
  const area = d + ` L ${tipX.toFixed(1)} ${Y(0)} L ${X(0)} ${Y(0)} Z`;
  const k = (t % 1.2) / 1.2;
  const wp = wpAt(p);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <path d={area} fill="rgba(225,255,103,0.06)" />
      <path d={d} fill="none" stroke={C.brightGreen} strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" opacity="0.18" />
      <path d={d} fill="none" stroke={C.brightGreen} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
      {p < 1 && <circle cx={tipX} cy={tipY} r={9 + k * 18} fill="none" stroke={C.brightGreen} strokeWidth="2" opacity={(1 - k) * 0.55} />}
      <circle cx={tipX} cy={tipY} r="7" fill={C.brightGreen} />
      <g transform={`translate(${Math.min(tipX, CH.x + CH.w - 70)}, ${clamp(tipY - 26, CH.y + 14, CH.y + CH.h - 10)})`}>
        <text x="14" y="0" fill={C.brightGreen} fontFamily={FB} fontSize="21" fontWeight="500">{Math.round(wp * 100)}%</text>
      </g>
    </svg>
  );
}

// ── Callouts ─────────────────────────────────────────────────────────────────
function Callout({ t0, tEnd = Infinity, x, y, w, anchorX, anchorY, connFrom = 'bottom', title, status, on = true, big = false, badge = null }) {
  const t = useTime();
  if (t < t0 || t > tEnd) return null;
  const e = popIn(t, t0, 0.55);
  const o = fadeIn(t, t0, 0.3) * (isFinite(tEnd) ? 1 - fadeIn(t, tEnd - 0.35, 0.35) : 1);
  const lineP = clamp((t - t0 - 0.1) / 0.4, 0, 1);
  const bx = connFrom === 'bottom' ? x + w / 2 : connFrom === 'top' ? x + w / 2 : x + w;
  const by = connFrom === 'bottom' ? y + (big ? 104 : 92) : connFrom === 'top' ? y : y + (big ? 52 : 46);
  const lx = bx + (anchorX - bx) * lineP, ly = by + (anchorY - by) * lineP;
  const onStyle = on
    ? { background: C.brightGreen, color: C.navy, border: 'none' }
    : { background: 'rgba(13,18,38,0.6)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(4px)' };
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <line x1={bx} y1={by} x2={lx} y2={ly} stroke={on ? C.brightGreen : 'rgba(255,255,255,0.4)'} strokeWidth="1.5" strokeDasharray="2 5" />
        {lineP >= 1 && <circle cx={anchorX} cy={anchorY} r="5" fill="none" stroke={on ? C.brightGreen : 'rgba(255,255,255,0.5)'} strokeWidth="2" />}
      </svg>
      <div style={{
        position: 'absolute', left: x, top: y, width: w, borderRadius: 14,
        padding: big ? '20px 24px' : '16px 22px',
        transform: `scale(${0.6 + 0.4 * e})`, transformOrigin: connFrom === 'bottom' ? 'center bottom' : 'center top',
        boxShadow: on ? `0 0 50px rgba(225,255,103,0.25)` : 'none',
        display: 'flex', flexDirection: 'column', gap: 7,
        ...onStyle,
      }}>
        <div style={{ fontFamily: FH, fontWeight: big ? 700 : 400, fontSize: big ? 36 : 25, letterSpacing: '-0.02em', lineHeight: 1.2, whiteSpace: 'pre-line', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span>{title}</span>
          {badge ? <TeamBadge team={badge} size={40} /> : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: on ? C.navy : 'rgba(255,255,255,0.35)' }} />
          <span style={{ fontFamily: FB, fontSize: 13.5, fontWeight: 500, letterSpacing: '0.1em', opacity: on ? 0.75 : 0.65 }}>{status}</span>
        </div>
      </div>
    </div>
  );
}

function Callouts() {
  return (
    <React.Fragment>
      <Callout t0={tAt(0.505)} tEnd={tAt(0.905)} x={790} y={586} w={330}
        anchorX={X(0.505)} anchorY={Y(wpAt(0.505))} connFrom="bottom"
        title={"Spurs decisive win\nin the making"} status="MOMENT ACTIVATED · SPURS-FAN CREATIVE ON" on={true} />
      <Callout t0={tAt(0.905)} x={920} y={680} w={330}
        anchorX={X(0.9)} anchorY={Y(wpAt(0.9))} connFrom="right"
        title="Spurs decisive win" status="MOMENT DEACTIVATED · CREATIVE OFF" on={false} />
      <Callout t0={tAt(0.862)} tEnd={DRAW1 + 0.45} x={1108} y={400} w={340}
        anchorX={X(0.862)} anchorY={Y(wpAt(0.862))} connFrom="bottom"
        title={"Knicks comeback\nin the making"} status="MOMENT ACTIVATED · KNICKS-FAN CREATIVE ON" on={true} />
      <Callout t0={DRAW1 + 0.1} x={1372} y={318} w={300} big={true} badge="nyk"
        anchorX={X(1)} anchorY={Y(1)} connFrom="top"
        title="Knicks win" status="FINAL · MOMENT ACTIVATED" on={true} />
      <Callout t0={DRAW1 + 0.55} x={1372} y={470} w={300}
        anchorX={X(0.99)} anchorY={Y(wpAt(0.99))} connFrom="right"
        title="Last-minute win" status="MOMENT ACTIVATED" on={true} />
    </React.Fragment>
  );
}

// ── Messaging delivery strip ─────────────────────────────────────────────────
function AudienceCard({ team, fan, creative, state, tChange }) {
  const t = useTime();
  const o = fadeIn(t, 4.8, 0.5);
  const pop = 1 + 0.015 * decay(t, tChange, 4);
  const isOn = state === 'DELIVERING';
  return (
    <div style={{
      flex: 1, minWidth: 0, height: 84, borderRadius: 16,
      border: `1px solid ${isOn ? 'rgba(225,255,103,0.45)' : 'rgba(255,255,255,0.14)'}`,
      background: isOn ? 'rgba(225,255,103,0.07)' : 'rgba(255,255,255,0.035)',
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 26px',
      opacity: o, transform: `scale(${pop}) translateY(${(1 - o) * 16}px)`,
    }}>
      <TeamBadge team={team} size={46} />
      <Pulse size={11} dim={!isOn} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FB, fontSize: 14, fontWeight: 500, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.55)' }}>{fan}</div>
        <div style={{ fontFamily: FB, fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.92)', whiteSpace: 'nowrap' }}>{creative}</div>
      </div>
      <div style={{
        fontFamily: FB, fontSize: 14.5, fontWeight: 500, letterSpacing: '0.14em', flexShrink: 0,
        color: isOn ? C.brightGreen : 'rgba(255,255,255,0.4)',
      }}>{state}</div>
    </div>
  );
}

function AudienceStrip() {
  const t = useTime();
  const p = gameP(t);
  const spursState = p >= 0.905 ? 'PAUSED' : p >= 0.505 ? 'DELIVERING' : 'MONITORING';
  const spursChange = p >= 0.905 ? tAt(0.905) : tAt(0.505);
  const nykState = p >= 1 ? 'DELIVERED' : p >= 0.862 ? 'DELIVERING' : 'MONITORING';
  return (
    <div style={{ position: 'absolute', left: CH.x, top: 908, width: CH.w, display: 'flex', gap: 36 }}>
      <AudienceCard team="sas" fan="SPURS FANS" creative="“Decisive win” creative" state={spursState} tChange={spursChange} />
      <AudienceCard team="nyk" fan="KNICKS FANS" creative="“Comeback” creative" state={nykState === 'DELIVERED' ? 'DELIVERING' : nykState} tChange={tAt(0.862)} />
    </div>
  );
}

// ── Win flash ────────────────────────────────────────────────────────────────
function WinFlash() {
  const t = useTime();
  if (t < DRAW1) return null;
  const k = t - DRAW1;
  const flash = interpolate([0, 0.12, 0.8], [0, 0.4, 0])(k);
  return (
    <React.Fragment>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[0, 1, 2].map(i => {
          const r = Math.max(0, (k - i * 0.14) * 700);
          const op = Math.max(0, 0.5 - (k - i * 0.14) * 0.45);
          return r > 0 ? <circle key={i} cx={X(1)} cy={Y(1)} r={r} fill="none" stroke={C.brightGreen} strokeWidth="2.5" opacity={op} /> : null;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: C.brightGreen, opacity: flash, pointerEvents: 'none' }} />
    </React.Fragment>
  );
}

function ChartScene() {
  const t = useTime();
  const o = fadeIn(t, 3.9, 0.6) * (1 - fadeIn(t, 29.6, 0.9));
  const s = camS(t), fx = camFX(t), fy = camFY(t);
  const tx = W / 2 - s * fx, ty = H / 2 - s * fy;
  return (
    <Sprite start={3.8} end={30.8}>
      <div style={{ position: 'absolute', inset: 0, opacity: o }}>
        <div style={{ position: 'absolute', width: W, height: H, transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: '0 0' }}>
          <Header />
          <EmotionBar />
          <ChartFrame />
          <ChartLegend />
          <WinLine />
          <Callouts />
          <AudienceStrip />
          <WinFlash />
        </div>
        <img src="assets/logos/GENIUS_SPORTS_HORIZONTAL_WHITE_RGB.svg" alt="Genius Sports"
          style={{ position: 'absolute', right: 56, bottom: 26, height: 26, opacity: 0.55 }} />
      </div>
    </Sprite>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3 — END CARD (48.4 → 60s)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2.5 — GAME-WINNING PLAY CUT-AWAY (≈18.8 → 24.25s)
// Hidden <video> lives off-DOM (outside the capture tree); frames are painted
// onto a canvas so the MP4 exporter captures them. window.__videoSettled lets
// the exporter wait for seeks during frame-by-frame rendering.
// ─────────────────────────────────────────────────────────────────────────────
// Trapezoid envelope: 0→1 over [t0,t1], hold, 1→0 over [t2,t3]
function trap(t, t0, t1, t2, t3) {
  return clamp((t - t0) / (t1 - t0), 0, 1) * (1 - clamp((t - t2) / (t3 - t2), 0, 1));
}
// TV-static intensity: spikes at the cut into the clip and the cut back out
function staticEnv(t) {
  return Math.max(
    trap(t, T_PAUSE, T_PAUSE + 0.1, VID_START, VID_START + 0.22),
    trap(t, VID_END - 0.1, VID_END, RESUME - 0.05, RESUME + 0.22)
  );
}

function VideoScene() {
  const { time: t, playing } = useTimeline();
  const canvasRef = React.useRef(null);
  const noiseRef = React.useRef(null);
  const vidRef = React.useRef(null);

  React.useEffect(() => {
    const v = document.createElement('video');
    v.src = 'uploads/og_play.mp4';
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.style.cssText = 'position:fixed;left:-9999px;top:0;width:10px;height:10px;';
    document.body.appendChild(v);
    vidRef.current = v;
    const draw = () => {
      const c = canvasRef.current;
      if (!c || v.readyState < 2) { window.__videoSettled = true; return; }
      const ctx = c.getContext('2d');
      ctx.fillStyle = C.navy; ctx.fillRect(0, 0, c.width, c.height);
      const ar = (v.videoHeight / v.videoWidth) || 0.5108;
      // Cover fit: fill the full frame, cropping edges as needed
      const scale = Math.max(c.width / (v.videoWidth || 1116), c.height / (v.videoHeight || 570));
      const vw = (v.videoWidth || 1116) * scale, vh = (v.videoHeight || 570) * scale;
      ctx.drawImage(v, (c.width - vw) / 2, (c.height - vh) / 2, vw, vh);
      window.__videoSettled = true;
    };
    v.addEventListener('seeked', draw);
    v.addEventListener('loadeddata', draw);
    let raf;
    const loop = () => { if (!v.paused) draw(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    window.__videoSettled = true;
    return () => { cancelAnimationFrame(raf); v.removeEventListener('seeked', draw); v.removeEventListener('loadeddata', draw); v.remove(); };
  }, []);

  React.useEffect(() => {
    const v = vidRef.current; if (!v) return;
    const inWin = t >= T_PAUSE - 0.3 && t <= RESUME;
    const target = clamp(t - VID_START, 0, VDUR - 0.05);
    if (playing && inWin && t >= VID_START - 0.05 && t < VID_END) {
      if (v.paused) { v.currentTime = target; v.play().catch(() => {}); }
      else if (Math.abs(v.currentTime - target) > 0.35) { v.currentTime = target; }
    } else {
      if (!v.paused) v.pause();
      if (inWin && Math.abs(v.currentTime - target) > 0.04) { window.__videoSettled = false; v.currentTime = target; }
    }
  }, [t, playing]);

  // Redraw TV static every time the playhead moves (works during export too)
  React.useEffect(() => {
    const sOp = staticEnv(t);
    const nc = noiseRef.current;
    if (!nc || sOp <= 0.01) return;
    const ctx = nc.getContext('2d');
    const w = nc.width, h = nc.height;
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    // rolling dark bands + occasional bright tear line
    for (let b = 0; b < 3; b++) {
      if (Math.random() < 0.7) {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, (Math.random() * h) | 0, w, 2 + Math.random() * 6);
      }
    }
    if (Math.random() < 0.35) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(0, (Math.random() * h) | 0, w, 1.5);
    }
  }, [t]);

  if (t < T_PAUSE || t > RESUME + 0.4) return null;
  const sOp = staticEnv(t);
  // Hard cuts hidden under the static burst — no soft crossfade
  const showVid = t >= VID_START - 0.1 && t <= VID_END + 0.15;
  const capO = fadeIn(t, VID_START + 0.25, 0.4);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {showVid && (
        <div style={{ position: 'absolute', inset: 0, background: C.navy }}>
          <canvas ref={canvasRef} width={W} height={H} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 3px, rgba(0,0,0,0.18) 4px)', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.4) 100%)' }} />
          <div style={{ position: 'absolute', right: 90, bottom: 12, fontFamily: FB, fontSize: 16, fontWeight: 400, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.55)', opacity: capO }}>
            Footage: NBA via YouTube
          </div>
        </div>
      )}
      {sOp > 0.01 && (
        <canvas ref={noiseRef} width={480} height={270}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: sOp, imageRendering: 'pixelated' }} />
      )}
    </div>
  );
}

function EndScene() {
  const t = useTime();
  const o = fadeIn(t, 29.8, 0.8) * (1 - fadeIn(t, 32.7, 1.1));
  const h1o = fadeIn(t, 30.2, 0.7), subo = fadeIn(t, 30.7, 0.7), logoo = fadeIn(t, 31.3, 0.7);
  return (
    <Sprite start={29.6} end={33.9}>
      <div style={{ position: 'absolute', inset: 0, opacity: o }}>
        <Spring x={140} y={140} t0={30.1} flip={true} opacity={0.85} />
        <Spring x={1640} y={740} t0={30.3} opacity={0.85} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 38, textAlign: 'center' }}>
          <GMTitle t0={30.0} />
          <div style={{ fontFamily: FH, fontWeight: 300, fontSize: 132, letterSpacing: '-0.04em', lineHeight: 1.05, color: C.white, opacity: h1o, transform: `translateY(${(1 - h1o) * 26}px)` }}>
            Win the moment.
          </div>
          <div style={{ fontFamily: FB, fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.72)', letterSpacing: '-0.01em', maxWidth: 980, opacity: subo, transform: `translateY(${(1 - subo) * 18}px)` }}>
            The right fan, the right moment, the right message. Activated in real time.
          </div>
          <img src="assets/logos/GENIUS_SPORTS_HORIZONTAL_WHITE_RGB.svg" alt="Genius Sports"
            style={{ height: 88, opacity: logoo * 0.95, transform: `translateY(${(1 - logoo) * 14}px)`, marginTop: 18 }} />
        </div>
      </div>
    </Sprite>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
function MomentsFilm() {
  return (
    <Stage width={W} height={H} duration={DUR} background={C.navy} persistKey="moments-g4" loop={true}>
      <IntroScene />
      <ChartScene />
      <VideoScene />
      <EndScene />
      <ScreenLabel />
      <ExposeControl />
    </Stage>
  );
}
window.MomentsFilm = MomentsFilm;
