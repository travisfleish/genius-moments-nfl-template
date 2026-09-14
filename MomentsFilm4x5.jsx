// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
//
// MOMENTS — ARGENTINA v EGYPT · WORLD CUP ROUND OF 16 — 4:5 SOCIAL CUT
// Vertical (1080×1350) redesign of Moments Game 4 Film for feed placements.
// Self-contained: wraps its own copy of the animation engine (Stage/Sprite/etc.)
// in an IIFE so it never collides with the 16:9 file's top-level consts —
// both files can be loaded on the same page safely.
//
// Redesign notes vs the 16:9 cut:
//   • Everything restacked into a single vertical column (header → emotion
//     arc → chart → creative-delivery strip → single "spotlight" moment card).
//   • No camera punch-in/pan — portrait has no off-screen real estate to pan
//     into, so all UI is laid out in fixed screen space from the start.
//   • The four PRIMARY moment callouts no longer coexist on screen at once;
//     they now play sequentially through one spotlight slot under the strip.
//   • Secondary goal/miss event chips are dropped — the goal markers on the
//     chart itself carry that information; keeps the narrow frame legible.
// ─────────────────────────────────────────────────────────────────────────────

(function () {

// ── Easing + interpolation (same math as the 16:9 engine) ──────────────────
const Easing = {
  linear: (t) => t,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function interpolate(input, output, ease = Easing.linear) {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? (ease[i] || Easing.linear) : ease;
        return output[i] + (output[i + 1] - output[i]) * easeFn(local);
      }
    }
    return output[output.length - 1];
  };
}

// ── Timeline / Sprite ────────────────────────────────────────────────────────
const TimelineContext = React.createContext({ time: 0, duration: 10, playing: false });
const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);

function Sprite({ start = 0, end = Infinity, children, keepMounted = false }) {
  const { time } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;
  return children;
}

// ── Stage (auto-scale-to-viewport shell w/ playback bar) ────────────────────
function Stage({ width = 1080, height = 1350, duration = 10, background = '#0D1226', loop = true, autoplay = true, persistKey = 'stage4x5', children }) {
  const [time, setTime] = React.useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0');
      return isFinite(v) ? clamp(v, 0, duration) : 0;
    } catch { return 0; }
  });
  const [playing, setPlaying] = React.useState(autoplay);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);
  const stageRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  React.useEffect(() => { try { localStorage.setItem(persistKey + ':t', String(time)); } catch {} }, [time, persistKey]);

  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => {
      const barH = 44;
      const s = Math.min(el.clientWidth / width, (el.clientHeight - barH) / height);
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [width, height]);

  React.useEffect(() => {
    if (!playing) { lastTsRef.current = null; return; }
    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime((t) => {
        let next = t + dt;
        if (next >= duration) { if (loop) next = next % duration; else { next = duration; setPlaying(false); } }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastTsRef.current = null; };
  }, [playing, duration, loop]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') { e.preventDefault(); setPlaying(p => !p); }
      else if (e.code === 'ArrowLeft') setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      else if (e.code === 'ArrowRight') setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      else if (e.key === '0' || e.code === 'Home') setTime(0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);

  const displayTime = hoverTime != null ? hoverTime : time;
  const ctxValue = React.useMemo(() => ({ time: displayTime, duration, playing, setTime, setPlaying }), [displayTime, duration, playing]);

  return (
    <div ref={stageRef} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0a0a0a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ width, height, background, position: 'relative', transform: `scale(${scale})`, transformOrigin: 'center', flexShrink: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
          <TimelineContext.Provider value={ctxValue}>{children}</TimelineContext.Provider>
        </div>
      </div>
      <PlaybackBar time={displayTime} duration={duration} playing={playing}
        onPlayPause={() => setPlaying(p => !p)} onReset={() => setTime(0)}
        onSeek={(t) => setTime(t)} onHover={(t) => setHoverTime(t)} />
    </div>
  );
}

function PlaybackBar({ time, duration, playing, onPlayPause, onReset, onSeek, onHover }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const timeFromEvent = React.useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);
  const onTrackMove = (e) => { if (!trackRef.current) return; const t = timeFromEvent(e); dragging ? onSeek(t) : onHover(t); };
  const onTrackLeave = () => { if (!dragging) onHover(null); };
  const onTrackDown = (e) => { setDragging(true); onSeek(timeFromEvent(e)); onHover(null); };
  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = (e) => { if (!trackRef.current) return; onSeek(timeFromEvent(e)); };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mouseup', onUp); window.removeEventListener('mousemove', onMove); };
  }, [dragging, timeFromEvent, onSeek]);
  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const fmt = (t) => { const total = Math.max(0, t); const m = Math.floor(total / 60); const s = Math.floor(total % 60); const cs = Math.floor((total * 100) % 100); return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`; };
  const mono = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: 'rgba(20,20,20,0.92)', borderTop: '1px solid rgba(255,255,255,0.08)', width: '100%', maxWidth: 680, alignSelf: 'center', borderRadius: 8, color: '#f6f4ef', fontFamily: 'Inter, system-ui, sans-serif', userSelect: 'none', flexShrink: 0 }}>
      <IconButton onClick={onReset} title="Return to start (0)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" /></svg>
      </IconButton>
      <IconButton onClick={onPlayPause} title="Play/pause (space)">
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="2" width="3" height="10" fill="currentColor" /><rect x="8" y="2" width="3" height="10" fill="currentColor" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2l9 5-9 5V2z" fill="currentColor" /></svg>
        )}
      </IconButton>
      <div style={{ fontFamily: mono, fontSize: 12, fontVariantNumeric: 'tabular-nums', width: 64, textAlign: 'right', color: '#f6f4ef' }}>{fmt(time)}</div>
      <div ref={trackRef} onMouseMove={onTrackMove} onMouseLeave={onTrackLeave} onMouseDown={onTrackDown} style={{ flex: 1, height: 22, position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: 4, background: 'oklch(72% 0.12 250)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: `${pct}%`, top: '50%', width: 12, height: 12, marginLeft: -6, marginTop: -6, background: '#fff', borderRadius: 6, boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
      </div>
      <div style={{ fontFamily: mono, fontSize: 12, fontVariantNumeric: 'tabular-nums', width: 64, textAlign: 'left', color: 'rgba(246,244,239,0.55)' }}>{fmt(duration)}</div>
    </div>
  );
}
function IconButton({ children, onClick, title }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick} title={title} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#f6f4ef', cursor: 'pointer', padding: 0, transition: 'background 120ms' }}>
      {children}
    </button>
  );
}

// ── Match data (same story as the 16:9 cut) ─────────────────────────────────
const MATCH = { competition: 'FIFA WORLD CUP · ROUND OF 16', usaName: 'Argentina', belName: 'Egypt', finalUSA: 3, finalBEL: 2 };
const C = {
  navy: '#0D1226', blue: '#0000DC', lightBlue: '#95ECFD', brightGreen: '#E1FF67',
  lightGreen: '#18C971', green: '#047C40', lightPurple: '#C2D1FF', purple: '#4337A8',
  orange: '#FA5D00', lightOrange: '#FFEBAF', coral: '#F76B6A', red: '#C20000',
  white: '#FFFFFF', lav: '#E7E7E9',
};
const FH = "'KlarheitKurrent', ui-sans-serif, system-ui, sans-serif";
const FB = "'RedHatText', ui-sans-serif, system-ui, sans-serif";

const W = 1080, H = 1350, DUR = 26.9;      // sped up ~7s from the original 33.9s cut (tighter match-play window)
const DRAW0 = 5.5, SPAN = 11.85;
const DRAW1 = DRAW0 + SPAN;
const MXX = 60;                                        // side margin
const CH = { x: MXX, y: 330, w: W - MXX * 2, h: 452 };  // chart plot area (portrait)

const tAt = (p) => DRAW0 + clamp(p, 0, 1) * SPAN;
const gameP = (t) => clamp((t - DRAW0) / SPAN, 0, 1);
const X = (p) => CH.x + p * CH.w;
const Y = (v) => CH.y + (1 - v) * CH.h;
const MT = 100;
const HT = 0.45;
const m2p = (m) => clamp(m / MT, 0, 1);

const GOALS = [
  [m2p(15), 'bel'], [m2p(67), 'bel'], [m2p(79), 'usa'], [m2p(83), 'usa'], [m2p(92), 'usa'],
];
const MISSES = [[m2p(21), 'usa', 'Messi pen. miss']];
const scoreAt = (p) => { let usa = 0, bel = 0; for (const [gp, tm] of GOALS) { if (p >= gp) (tm === 'usa' ? usa++ : bel++); } return { usa, bel }; };

const KEYS = [
  [0.00, .75], [0.14, .75], [0.15, .50], [0.19, .48],
  [0.21, .40], [0.24, .46], [0.35, .43], [0.45, .40],
  [0.58, .32], [0.66, .25], [0.67, .20], [0.74, .18], [0.78, .16],
  [0.79, .35], [0.815, .33], [0.828, .32], [0.83, .55],
  [0.87, .62], [0.90, .70], [0.915, .78], [0.92, .97], [0.95, .99], [1, 1],
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
    const amp = 0.0016 + 0.005 * b * (1 - b);
    const j = Math.sin(p * 247.3) * .45 + Math.sin(p * 531.7 + 1.3) * .35 + Math.sin(p * 1117.9 + 2.1) * .2;
    a.push(clamp(b + j * amp, 0.006, 0.995));
  }
  a[0] = KEYS[0][1]; a[NPTS - 1] = 1;
  return a;
})();
const wpAt = (p) => { const f = clamp(p, 0, 1) * (NPTS - 1); const i = Math.min(NPTS - 2, Math.floor(f)); return PTS[i] + (PTS[i + 1] - PTS[i]) * (f - i); };

const EMO = [
  ['Hope', 0.00, 0.15, C.lightBlue],
  ['Tension', 0.15, 0.67, C.orange],
  ['Sadness', 0.67, 0.79, C.lightPurple],
  ['Awe & Admiration', 0.79, 0.92, C.lightGreen],
  ['Joy', 0.92, 1.0, C.brightGreen],
];

function fadeIn(t, t0, dur = 0.6) { return clamp((t - t0) / dur, 0, 1); }
function popIn(t, t0, dur = 0.5) { return t < t0 ? 0 : Easing.easeOutBack(clamp((t - t0) / dur, 0, 1)); }
function decay(t, t0, speed = 3.5) { return t < t0 ? 0 : Math.exp(-(t - t0) * speed); }

function Pulse({ size = 10, color = C.brightGreen, dim = false }) {
  const t = useTime();
  const k = (t % 1.4) / 1.4;
  return (
    <span style={{ position: 'relative', width: size, height: size, display: 'inline-block', flexShrink: 0 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: dim ? 'rgba(255,255,255,0.25)' : color }} />
      {!dim && <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${color}`, transform: `scale(${1 + k * 1.8})`, opacity: (1 - k) * 0.7 }} />}
    </span>
  );
}

function TeamBadge({ team, size = 44 }) {
  const isArg = team === 'usa';
  const flagStyle = isArg
    ? { background: 'linear-gradient(180deg, #75AADB 0%, #75AADB 33%, #FFFFFF 33%, #FFFFFF 67%, #75AADB 67%, #75AADB 100%)' }
    : { background: 'linear-gradient(180deg, #CE1126 0%, #CE1126 33%, #FFFFFF 33%, #FFFFFF 67%, #000000 67%, #000000 100%)' };
  return (
    <span style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '50%', overflow: 'hidden', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.35)', background: C.navy }}>
      <span aria-label={team} style={{ width: '100%', height: '100%', display: 'block', ...flagStyle }} />
    </span>
  );
}

function GMTitle({ t0 = 0, size = 40 }) {
  const t = useTime();
  const o = fadeIn(t, t0, 0.5);
  return <div style={{ fontFamily: FH, fontWeight: 300, fontSize: size, letterSpacing: '-0.02em', color: C.white, opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>Genius Moments</div>;
}

function Spring({ x, y, height = 90, color = C.brightGreen, t0 = 0, flip = false, opacity = 1 }) {
  const t = useTime();
  const bars = [2, 3, 4, 5, 7, 10, 14];
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 9, transform: `rotate(45deg) ${flip ? 'scaleX(-1)' : ''}`, transformOrigin: 'center', opacity }}>
      {bars.map((w, i) => {
        const g = Easing.easeOutCubic(clamp((t - t0 - i * 0.09) / 0.6, 0, 1));
        return <div key={i} style={{ width: w, height, background: color, transform: `scaleY(${g})`, transformOrigin: 'bottom' }} />;
      })}
    </div>
  );
}

function ExposeControl() {
  const tl = useTimeline();
  React.useEffect(() => { window.__film4x5 = { setTime: tl.setTime, setPlaying: tl.setPlaying, duration: DUR }; });
  return null;
}
function ScreenLabel() {
  const t = useTime();
  const s = Math.floor(t);
  React.useEffect(() => {
    const el = document.getElementById('film-root-4x5');
    if (el) el.setAttribute('data-screen-label', `moments-argentina-egypt-4x5 · t=${s}s`);
  }, [s]);
  return null;
}

// ── SCENE 1 — INTRO ──────────────────────────────────────────────────────────
function IntroScene() {
  const t = useTime();
  const o = 1 - fadeIn(t, 3.7, 0.7);
  return (
    <Sprite start={0} end={4.4}>
      <div style={{ position: 'absolute', inset: 0, opacity: o }}>
        <Spring x={70} y={1080} t0={-1} opacity={0.85} />
        <Spring x={900} y={110} t0={-1} flip={true} opacity={0.85} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, textAlign: 'center', padding: '0 64px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontFamily: FH, fontWeight: 300, fontSize: 46, letterSpacing: '-0.03em', lineHeight: 1.14, color: C.white }}>
              See <span style={{ color: C.brightGreen }}>Genius Moments</span> live in action:
            </div>
            <div style={{ fontFamily: FH, fontWeight: 300, fontSize: 46, letterSpacing: '-0.03em', lineHeight: 1.14, color: C.white }}>
              World Cup R16: Argentina v <span style={{ color: C.lightBlue }}>Egypt</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 20 }}>
            <TeamBadge team="usa" size={84} />
            <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 30, color: 'rgba(255,255,255,0.5)' }}>v</span>
            <TeamBadge team="bel" size={84} />
          </div>
        </div>
      </div>
    </Sprite>
  );
}

// ── SCENE 2 — VISUALIZATION ─────────────────────────────────────────────────
function Header() {
  const t = useTime();
  const o = fadeIn(t, 4.0, 0.5);
  const p = gameP(t);
  const half = t < DRAW0 ? 'KICK-OFF' : p >= 1 ? 'FULL TIME' : p < HT ? "1ST HALF" : "2ND HALF";
  const sc = scoreAt(p);
  return (
    <div style={{ position: 'absolute', left: MXX, width: W - MXX * 2, top: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: o, transform: `translateY(${(1 - o) * -12}px)` }}>
      <div style={{ fontFamily: FB, fontSize: 13, fontWeight: 500, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)' }}>{MATCH.competition}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <TeamBadge team="usa" size={38} />
        <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 27, letterSpacing: '-0.02em', color: C.white }}>{MATCH.usaName}</span>
        <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 20, color: 'rgba(255,255,255,0.45)' }}>v</span>
        <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 27, letterSpacing: '-0.02em', color: C.white }}>{MATCH.belName}</span>
        <TeamBadge team="bel" size={38} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: FH, fontWeight: 700, fontSize: 30, letterSpacing: '-0.01em', color: C.white, fontVariantNumeric: 'tabular-nums' }}>
          {sc.usa} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>–</span> {sc.bel}
        </div>
        <div style={{ fontFamily: FH, fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em', color: half === 'FULL TIME' ? C.brightGreen : 'rgba(255,255,255,0.85)' }}>{half}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pulse size={8} />
          <span style={{ fontFamily: FB, fontSize: 12, fontWeight: 500, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.75)' }}>LIVE</span>
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
  const barTop = 214, barH = 42;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: CH.x, top: 190, fontFamily: FB, fontSize: 12, fontWeight: 500, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)', opacity: capO }}>
        ARGENTINA-FAN EMOTIONAL ARC
      </div>
      {EMO.map(([label, s, e, col], i) => {
        const entry = fadeIn(t, 4.1 + i * 0.06, 0.4);
        const active = live && p >= s && (p < e || p >= 1 && e === 1);
        const past = live && p >= e && !(p >= 1 && e === 1);
        const pop = 1 + 0.04 * decay(t, tAt(s), 3.5) * (live && p >= s ? 1 : 0);
        const left = X(s), width = X(e) - X(s);
        const isFirst = i === 0, isLast = i === EMO.length - 1;
        const base = {
          position: 'absolute', left, top: barTop, width, height: barH,
          borderRadius: `${isFirst ? 6 : 0}px ${isLast ? 6 : 0}px ${isLast ? 6 : 0}px ${isFirst ? 6 : 0}px`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          fontFamily: FH, fontWeight: 400, fontSize: 11.5, letterSpacing: '-0.005em', lineHeight: 1.1, padding: '0 3px',
          boxSizing: 'border-box',
          opacity: entry, transform: `scaleY(${pop}) translateY(${(1 - entry) * -8}px)`,
        };
        if (active) return <div key={i} style={{ ...base, background: col, color: C.navy, boxShadow: `0 0 22px ${col}55`, zIndex: 2 }}>{label}</div>;
        if (past) return <div key={i} style={{ ...base, background: col, color: C.navy, opacity: entry * 0.32 }}>{label}</div>;
        return <div key={i} style={{ ...base, background: 'rgba(255,255,255,0.05)', boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.45)' }}>{label}</div>;
      })}
      {live && p < 1 && (
        <div style={{ position: 'absolute', left: X(p) - 6, top: barTop + barH + 4, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: `8px solid ${C.brightGreen}` }} />
      )}
    </div>
  );
}

function ChartFrame() {
  const t = useTime();
  const o = fadeIn(t, 4.3, 0.6);
  const p = gameP(t);
  const halfLabels = [['1st half', 0.22], ['2nd half', 0.72]];
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <rect x={CH.x} y={CH.y} width={CH.w} height={CH.h} fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" rx="4" />
      <text x={CH.x} y={CH.y - 20} fill="rgba(225,255,103,0.85)" fontFamily={FB} fontSize="13" fontWeight="500" letterSpacing="1.8">WIN PROBABILITY — ARGENTINA</text>
      <text x={CH.x} y={CH.y - 6} fill="rgba(255,255,255,0.4)" fontFamily={FB} fontSize="12" fontWeight="500" letterSpacing="1.8">VIA GENIUSIQ</text>
      {[0.5].map(v => <line key={v} x1={CH.x} y1={Y(v)} x2={CH.x + CH.w} y2={Y(v)} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 7" />)}
      {(() => { const pulse = decay(t, tAt(HT), 2.5); return <line x1={X(HT)} y1={CH.y} x2={X(HT)} y2={CH.y + CH.h} stroke={`rgba(255,255,255,${0.12 + pulse * 0.45})`} strokeWidth={1 + pulse * 1.5} />; })()}
      {MISSES.map(([mp, tm, lbl], i) => {
        if (p < mp) return null;
        const pulse = decay(t, tAt(mp), 2.2);
        const my = Y(wpAt(mp));
        return (
          <g key={`m${i}`}>
            <line x1={X(mp)} y1={CH.y} x2={X(mp)} y2={CH.y + CH.h} stroke="rgba(255,255,255,0.28)" strokeWidth={0.8} strokeDasharray="2 6" />
            <circle cx={X(mp)} cy={my} r={6 + pulse * 3} fill="none" stroke={C.coral} strokeWidth="2" opacity={0.85} />
            <line x1={X(mp) - 4} y1={my - 4} x2={X(mp) + 4} y2={my + 4} stroke={C.coral} strokeWidth="2" opacity={0.85} />
            <line x1={X(mp) - 4} y1={my + 4} x2={X(mp) + 4} y2={my - 4} stroke={C.coral} strokeWidth="2" opacity={0.85} />
          </g>
        );
      })}
      {GOALS.map(([gp, tm], i) => {
        if (p < gp) return null;
        const col = tm === 'usa' ? C.brightGreen : C.coral;
        const pulse = decay(t, tAt(gp), 2.2);
        return (
          <g key={i}>
            <line x1={X(gp)} y1={CH.y} x2={X(gp)} y2={CH.y + CH.h} stroke={col} strokeWidth={1.2 + pulse * 1.8} opacity={0.34 + pulse * 0.45} strokeDasharray="2 6" />
            <circle cx={X(gp)} cy={CH.y - 10} r={4 + pulse * 3} fill={col} opacity={0.9} />
          </g>
        );
      })}
      {[[1, '1.0'], [0.5, '0.5'], [0, '0.0']].map(([v, l]) => (
        <text key={l} x={CH.x - 14} y={Y(v) + 6} textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily={FB} fontSize="16">{l}</text>
      ))}
      {halfLabels.map(([l, m]) => (
        <text key={l} x={X(m)} y={CH.y + CH.h + 28} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontFamily={FB} fontSize="15" letterSpacing="1.5">{l}</text>
      ))}
      <text x={X(1)} y={CH.y + CH.h + 28} textAnchor="end" fill="rgba(225,255,103,0.7)" fontFamily={FB} fontSize="13" letterSpacing="1.5">FULL TIME</text>
    </svg>
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
      <path d={d} fill="none" stroke={C.brightGreen} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" opacity="0.18" />
      <path d={d} fill="none" stroke={C.brightGreen} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      {p < 1 && <circle cx={tipX} cy={tipY} r={7 + k * 14} fill="none" stroke={C.brightGreen} strokeWidth="2" opacity={(1 - k) * 0.55} />}
      <circle cx={tipX} cy={tipY} r="6" fill={C.brightGreen} />
      <g transform={`translate(${Math.min(tipX, CH.x + CH.w - 60)}, ${clamp(tipY - 24, CH.y + 14, CH.y + CH.h - 10)})`}>
        <text x="12" y="0" fill={C.brightGreen} fontFamily={FB} fontSize="18" fontWeight="500">{Math.round(wp * 100)}%</text>
      </g>
    </svg>
  );
}

// ── Creative-delivery strip — stacked (portrait has no room side-by-side) ──
function AudienceCard({ team, fan, creative, state, tChange }) {
  const t = useTime();
  const o = fadeIn(t, 4.8, 0.5);
  const pop = 1 + 0.015 * decay(t, tChange, 4);
  const isOn = state === 'DELIVERING';
  return (
    <div style={{
      width: CH.w, height: 74, borderRadius: 16,
      border: `1px solid ${isOn ? 'rgba(225,255,103,0.45)' : 'rgba(255,255,255,0.14)'}`,
      background: isOn ? 'rgba(225,255,103,0.07)' : 'rgba(255,255,255,0.035)',
      display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', boxSizing: 'border-box',
      opacity: o, transform: `scale(${pop}) translateY(${(1 - o) * 14}px)`,
    }}>
      <TeamBadge team={team} size={38} />
      <Pulse size={10} dim={!isOn} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FB, fontSize: 12, fontWeight: 500, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.55)' }}>{fan}</div>
        <div style={{ fontFamily: FB, fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.92)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{creative}</div>
      </div>
      <div style={{ fontFamily: FB, fontSize: 12.5, fontWeight: 500, letterSpacing: '0.12em', flexShrink: 0, color: isOn ? C.brightGreen : 'rgba(255,255,255,0.4)' }}>{state}</div>
    </div>
  );
}
function AudienceStrip() {
  const t = useTime();
  const p = gameP(t);
  const belState = p >= 0.79 ? 'PAUSED' : p >= 0.15 ? 'DELIVERING' : 'MONITORING';
  const belChange = p >= 0.79 ? tAt(0.79) : tAt(0.15);
  const usaState = p >= 1 ? 'DELIVERED' : p >= 0.79 ? 'DELIVERING' : 'MONITORING';
  return (
    <div style={{ position: 'absolute', left: CH.x, top: 846, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <AudienceCard team="bel" fan="EGYPT FANS" creative="“Cruise to victory” creative" state={belState} tChange={belChange} />
      <AudienceCard team="usa" fan="ARGENTINA FANS" creative="“Comeback” creative" state={usaState === 'DELIVERED' ? 'DELIVERING' : usaState} tChange={tAt(0.79)} />
    </div>
  );
}

// ── SECONDARY: goal event ticker — one compact card at a time, floating over
// the chart near the moment it happens. `scheduleSequential` gives every card
// a guaranteed minimum dwell — if goals land close together (e.g. the late
// Argentina flurry, only ~1-2s apart on this compressed timeline) the next
// card queues right behind the previous one instead of cutting it off before
// it can be read. The penalty miss stays a chart-only marker (see ChartFrame)
// to keep this ticker's pacing tight. ──────────────────────────────────────
function scheduleSequential(list, overlap = 0.3) {
  let prevEnd = -Infinity;
  return list.map((item) => {
    const start = Math.max(item.t0, prevEnd - overlap);
    const end = item.dur === Infinity ? 99 : start + item.dur;
    prevEnd = end;
    return { ...item, t0: start, t1: end };
  });
}

const EV = scheduleSequential([
  { p: m2p(15), team: 'bel', type: 'goal', label: 'GOAL',           player: 'Yasser Ibrahim', min: "15'",    score: '0–1', t0: tAt(m2p(15)) - 0.05, dur: 2.6 },
  { p: m2p(67), team: 'bel', type: 'goal', label: 'GOAL',           player: 'Mostafa Zico',   min: "67'",    score: '0–2', t0: tAt(m2p(67)) - 0.05, dur: 2.6 },
  { p: m2p(79), team: 'usa', type: 'goal', label: 'GOAL',           player: 'Cristian Romero',min: "79'",    score: '1–2', t0: tAt(m2p(79)) - 0.05, dur: 2.6 },
  { p: m2p(83), team: 'usa', type: 'goal', label: 'GOAL',           player: 'Lionel Messi',   min: "83'",    score: '2–2', t0: tAt(m2p(83)) - 0.05, dur: 2.6 },
  { p: m2p(92), team: 'usa', type: 'goal', label: 'GOAL · 90+2’', player: 'Enzo Fernández', min: "90+2'", score: '3–2', t0: tAt(m2p(92)) - 0.05, dur: 2.4 },
]);

function EventTickerCard({ ev, e }) {
  const on = ev.type === 'goal';
  const accent = on ? C.brightGreen : C.coral;
  return (
    <div style={{
      width: 300, borderRadius: 12, padding: '12px 16px', boxSizing: 'border-box',
      background: 'rgba(13,18,38,0.82)', border: '1px solid rgba(255,255,255,0.16)',
      borderLeft: `3px solid ${accent}`, backdropFilter: 'blur(6px)',
      transform: `scale(${0.7 + 0.3 * e})`, transformOrigin: 'center',
      display: 'flex', flexDirection: 'column', gap: 6,
      boxShadow: '0 12px 34px rgba(0,0,0,0.35)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontFamily: FB, fontSize: 11.5, fontWeight: 500, letterSpacing: '0.12em', color: accent }}>{ev.label}</span>
        <span style={{ fontFamily: FB, fontSize: 11.5, fontWeight: 500, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>{ev.min}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <TeamBadge team={ev.team} size={26} />
        <span style={{ fontFamily: FH, fontWeight: 400, fontSize: 19, letterSpacing: '-0.01em', color: C.white }}>{ev.player}</span>
        <span style={{ fontFamily: FH, fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.75)', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{ev.score}</span>
      </div>
    </div>
  );
}

function EventTicker() {
  const t = useTime();
  const active = EV.filter(ev => t >= ev.t0 && t <= ev.t1);
  const cardW = 300;
  const cx = CH.x + CH.w / 2;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {active.map((ev, i) => {
        const e = popIn(t, ev.t0, 0.45);
        const o = fadeIn(t, ev.t0, 0.25) * (1 - fadeIn(t, ev.t1 - 0.35, 0.35));
        return (
          <div key={i} style={{ position: 'absolute', left: cx - cardW / 2, top: CH.y + 26, opacity: o }}>
            <EventTickerCard ev={ev} e={e} />
          </div>
        );
      })}
    </div>
  );
}

// ── PRIMARY moments — a single spotlight slot that swaps sequentially,
// scheduled the same guaranteed-dwell way as the goal ticker above. ────────
const MOMENTS = scheduleSequential([
  { p: m2p(15), kind: 'on', team: 'bel', title: 'Egypt take the lead', status: 'MOMENT ACTIVATED · EGYPT-FAN CREATIVE ON', t0: tAt(m2p(15)) + 0.2, dur: 4.0 },
  { p: m2p(79), kind: 'off', team: 'bel', title: 'Egypt’s lead slips', status: 'MOMENT DEACTIVATED · EGYPT CREATIVE OFF', t0: tAt(m2p(79)) + 0.15, dur: 2.3 },
  { p: m2p(83), kind: 'on', team: 'usa', title: 'Argentina comeback', status: 'MOMENT ACTIVATED · ARGENTINA-FAN CREATIVE ON', t0: tAt(m2p(83)) + 0.15, dur: 2.3 },
  { p: 1.0, kind: 'win', team: 'usa', title: 'Argentina win 3–2', status: 'FULL TIME · MOMENT ACTIVATED', t0: DRAW1 + 0.35, dur: Infinity, big: true },
]);
const SPOT_Y = 1032, SPOT_W = CH.w;

function SpotlightCard({ m, e }) {
  const isOn = m.kind === 'on' || m.kind === 'win';
  const big = m.big;
  const onStyle = isOn
    ? { background: C.brightGreen, color: C.navy, border: 'none', boxShadow: `0 0 50px ${big ? 'rgba(225,255,103,0.5)' : 'rgba(225,255,103,0.3)'}` }
    : { background: 'rgba(13,18,38,0.78)', color: C.white, border: `1.5px solid ${C.coral}`, backdropFilter: 'blur(4px)', boxShadow: '0 0 38px rgba(247,107,106,0.2)' };
  return (
    <div style={{ width: SPOT_W, borderRadius: 14, padding: big ? '20px 24px' : '16px 22px', boxSizing: 'border-box', transform: `scale(${0.6 + 0.4 * e})`, transformOrigin: 'center', display: 'flex', flexDirection: 'column', gap: 9, ...onStyle }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <TeamBadge team={m.team} size={big ? 40 : 34} />
        <span style={{ fontFamily: FH, fontWeight: big ? 700 : 400, fontSize: big ? 32 : 26, letterSpacing: '-0.02em', lineHeight: 1.12 }}>{m.title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: isOn ? C.navy : C.coral }} />
        <span style={{ fontFamily: FB, fontSize: 12.5, fontWeight: 500, letterSpacing: '0.09em', opacity: isOn ? 0.78 : 0.72 }}>{m.status}</span>
      </div>
    </div>
  );
}

function Spotlight() {
  const t = useTime();
  const active = MOMENTS.filter(m => t >= m.t0 && t <= m.t1);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {active.map((m, i) => {
          const accent = (m.kind === 'on' || m.kind === 'win') ? C.brightGreen : C.coral;
          const ax = X(m.p), ay = Y(wpAt(m.p));
          const bx = MXX + SPOT_W / 2, by = SPOT_Y;
          const lineP = clamp((t - m.t0 - 0.1) / 0.4, 0, 1);
          const lx = bx + (ax - bx) * lineP, ly = by + (ay - by) * lineP;
          const o = fadeIn(t, m.t0, 0.3) * (m.t1 < 90 ? 1 - fadeIn(t, m.t1 - 0.35, 0.35) : 1);
          return (
            <g key={i} opacity={o}>
              <line x1={bx} y1={by} x2={lx} y2={ly} stroke={accent} strokeWidth="1.5" strokeDasharray="2 5" />
              {lineP >= 1 && <circle cx={ax} cy={ay} r="6" fill="none" stroke={accent} strokeWidth="2" />}
            </g>
          );
        })}
      </svg>
      {active.map((m, i) => {
        const e = popIn(t, m.t0, 0.5);
        const o = fadeIn(t, m.t0, 0.3) * (m.t1 < 90 ? 1 - fadeIn(t, m.t1 - 0.35, 0.35) : 1);
        return (
          <div key={i} style={{ position: 'absolute', left: MXX, top: SPOT_Y, opacity: o }}>
            <SpotlightCard m={m} e={e} />
          </div>
        );
      })}
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
          const r = Math.max(0, (k - i * 0.14) * 560);
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
  const o = fadeIn(t, 3.9, 0.6) * (1 - fadeIn(t, 22.6, 0.9));
  const pulse = 1 + 0.02 * decay(t, DRAW1, 2.4); // gentle centered zoom-pulse at the winner, no pan needed
  return (
    <Sprite start={3.8} end={23.8}>
      <div style={{ position: 'absolute', inset: 0, opacity: o }}>
        <div style={{ position: 'absolute', width: W, height: H, transform: `scale(${pulse})`, transformOrigin: 'center' }}>
          <Header />
          <EmotionBar />
          <ChartFrame />
          <WinLine />
          <EventTicker />
          <AudienceStrip />
          <WinFlash />
        </div>
        <Spotlight />
        <img src="assets/logos/GENIUS_SPORTS_HORIZONTAL_WHITE_RGB.svg" alt="Genius Sports"
          style={{ position: 'absolute', left: '50%', bottom: 30, height: 20, opacity: 0.55, transform: 'translateX(-50%)' }} />
      </div>
    </Sprite>
  );
}

// ── SCENE 3 — END CARD ───────────────────────────────────────────────────────
function EndScene() {
  const t = useTime();
  const o = fadeIn(t, 22.8, 0.8) * (1 - fadeIn(t, 25.7, 1.1));
  const h1o = fadeIn(t, 23.2, 0.7), subo = fadeIn(t, 23.7, 0.7), logoo = fadeIn(t, 24.3, 0.7);
  return (
    <Sprite start={22.6} end={26.9}>
      <div style={{ position: 'absolute', inset: 0, opacity: o }}>
        <Spring x={90} y={130} t0={23.1} flip={true} opacity={0.85} />
        <Spring x={910} y={1140} t0={23.3} opacity={0.85} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, textAlign: 'center', padding: '0 60px' }}>
          <GMTitle t0={23.0} />
          <div style={{ fontFamily: FH, fontWeight: 300, fontSize: 42, letterSpacing: '-0.03em', lineHeight: 1.14, color: C.white, opacity: h1o, transform: `translateY(${(1 - h1o) * 22}px)` }}>
            Right fan. Right moment.<br />Right message.
          </div>
          <div style={{ fontFamily: FB, fontSize: 22, fontWeight: 400, color: 'rgba(255,255,255,0.72)', letterSpacing: '-0.01em', opacity: subo, transform: `translateY(${(1 - subo) * 16}px)` }}>
            Every screen. In real time.
          </div>
          <img src="assets/logos/GENIUS_SPORTS_HORIZONTAL_WHITE_RGB.svg" alt="Genius Sports"
            style={{ height: 60, opacity: logoo * 0.95, transform: `translateY(${(1 - logoo) * 12}px)`, marginTop: 14 }} />
        </div>
      </div>
    </Sprite>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
function MomentsFilm4x5() {
  return (
    <Stage width={W} height={H} duration={DUR} background={C.navy} persistKey="moments-g4-4x5" loop={true}>
      <IntroScene />
      <ChartScene />
      <EndScene />
      <ScreenLabel />
      <ExposeControl />
    </Stage>
  );
}
window.MomentsFilm4x5 = MomentsFilm4x5;

})();
