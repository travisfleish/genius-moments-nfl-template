// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// animations.jsx
// Reusable animation starter: Stage, Timeline, Sprite, easing helpers.
// Exports (to window): Stage, Sprite, PlaybackBar, TextSprite, ImageSprite, RectSprite,
//   useTime, useTimeline, useSprite, Easing, interpolate, animate, clamp.
//
// Usage (in an HTML file that loads React + Babel):
//
//   <Stage width={1280} height={720} duration={10} background="#f6f4ef">
//     <MyScene />
//   </Stage>
//
// <Stage> auto-scales to the viewport and provides the scrubber, play/pause,
// ←/→ seek, space, and 0-to-reset controls, and persists the playhead.
// Inside <Stage>, any child can call useTime() to read the current
// playhead (seconds). Or wrap content in <Sprite start={1} end={4}>...</Sprite>
// to only render during that window -- children receive a `localTime` and
// `progress` via the useSprite() hook. Use Easing + interpolate()/animate()
// for tweens; TextSprite / ImageSprite / RectSprite have built-in entry/exit.
// Build YOUR scenes by composing Sprites inside a Stage.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

// ── Easing functions (hand-rolled, Popmotion-style) ─────────────────────────
// All easings take t ∈ [0,1] and return eased t ∈ [0,1] (may overshoot for back/elastic).
const Easing = {
  linear: (t) => t,

  // Quad
  easeInQuad:    (t) => t * t,
  easeOutQuad:   (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic
  easeInCubic:    (t) => t * t * t,
  easeOutCubic:   (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

  // Quart
  easeInQuart:    (t) => t * t * t * t,
  easeOutQuart:   (t) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t),

  // Expo
  easeInExpo:  (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },

  // Sine
  easeInSine:    (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine:   (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Back (overshoot)
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158, c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  // Elastic
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// ── Core interpolation helpers ──────────────────────────────────────────────

// Clamp a value to [min, max]
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// interpolate([0, 0.5, 1], [0, 100, 50], ease?) -> fn(t)
// Popmotion-style: linearly maps t across input keyframes to output values,
// with optional easing per segment (single fn or array of fns).
function interpolate(input, output, ease = Easing.linear) {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? (ease[i] || Easing.linear) : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

// animate({from, to, start, end, ease})(t) — simpler single-segment tween.
// Returns `from` before `start`, `to` after `end`.
function animate({ from = 0, to = 1, start = 0, end = 1, ease = Easing.easeInOutCubic }) {
  return (t) => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}

// ── Timeline context ────────────────────────────────────────────────────────

const TimelineContext = React.createContext({ time: 0, duration: 10, playing: false });

const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);

// ── Sprite ──────────────────────────────────────────────────────────────────
// Renders children only when the playhead is inside [start, end]. Provides
// a sub-context with `localTime` (seconds since start) and `progress` (0..1).
//
//   <Sprite start={2} end={5}>
//     {({ localTime, progress }) => <Thing x={progress * 100} />}
//   </Sprite>
//
// Or as a plain wrapper — children can call useSprite() themselves.

const SpriteContext = React.createContext({ localTime: 0, progress: 0, duration: 0 });
const useSprite = () => React.useContext(SpriteContext);

function Sprite({ start = 0, end = Infinity, children, keepMounted = false }) {
  const { time } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;

  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration)
    ? clamp(localTime / duration, 0, 1)
    : 0;

  const value = { localTime, progress, duration, visible };

  return (
    <SpriteContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </SpriteContext.Provider>
  );
}

// ── Sample sprite components ────────────────────────────────────────────────

// TextSprite: fades/slides text in on entry, holds, then fades out on exit.
// Props: text, x, y, size, color, font, entryDur, exitDur, align
function TextSprite({
  text,
  x = 0, y = 0,
  size = 48,
  color = '#111',
  font = 'Inter, system-ui, sans-serif',
  weight = 600,
  entryDur = 0.45,
  exitDur = 0.35,
  entryEase = Easing.easeOutBack,
  exitEase = Easing.easeInCubic,
  align = 'left',
  letterSpacing = '-0.01em',
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let ty = 0;

  if (localTime < entryDur) {
    const t = entryEase(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    ty = (1 - t) * 16;
  } else if (localTime > exitStart) {
    const t = exitEase(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    ty = -t * 8;
  }

  const translateX = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      transform: `translate(${translateX}, ${ty}px)`,
      opacity,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing,
      whiteSpace: 'pre',
      lineHeight: 1.1,
      willChange: 'transform, opacity',
    }}>
      {text}
    </div>
  );
}

// ImageSprite: scales + fades in; optional Ken Burns drift during hold.
function ImageSprite({
  src,
  x = 0, y = 0,
  width = 400, height = 300,
  entryDur = 0.6,
  exitDur = 0.4,
  kenBurns = false,
  kenBurnsScale = 1.08,
  radius = 12,
  fit = 'cover',
  placeholder = null, // {label: string} for striped placeholder
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    scale = 0.96 + 0.04 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = (kenBurns ? kenBurnsScale : 1) + 0.02 * t;
  } else if (kenBurns) {
    const holdSpan = exitStart - entryDur;
    const holdT = holdSpan > 0 ? (localTime - entryDur) / holdSpan : 0;
    scale = 1 + (kenBurnsScale - 1) * holdT;
  }

  const content = placeholder ? (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'repeating-linear-gradient(135deg, #e9e6df 0 10px, #dcd8cf 10px 20px)',
      color: '#6b6458',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 13,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {placeholder.label || 'image'}
    </div>
  ) : (
    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />
  );

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      borderRadius: radius,
      overflow: 'hidden',
      willChange: 'transform, opacity',
    }}>
      {content}
    </div>
  );
}

// RectSprite: simple rectangle that animates position/size/color via props.
// Useful demo primitive — takes a `render` fn for per-frame customization.
function RectSprite({
  x = 0, y = 0,
  width = 100, height = 100,
  color = '#111',
  radius = 8,
  entryDur = 0.4,
  exitDur = 0.3,
  render, // optional: (ctx) => style overrides
}) {
  const spriteCtx = useSprite();
  const { localTime, duration } = spriteCtx;
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1));
    opacity = clamp(localTime / entryDur, 0, 1);
    scale = 0.4 + 0.6 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInQuad(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = 1 - 0.15 * t;
  }

  const overrides = render ? render(spriteCtx) : {};

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      background: color,
      borderRadius: radius,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      willChange: 'transform, opacity',
      ...overrides,
    }} />
  );
}


function Stage({
  width = 1280,
  height = 720,
  duration = 10,
  background = '#f6f4ef',
  fps = 60,
  loop = true,
  autoplay = true,
  persistKey = 'animstage',
  children,
}) {
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
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  // Persist playhead
  React.useEffect(() => {
    try { localStorage.setItem(persistKey + ':t', String(time)); } catch {}
  }, [time, persistKey]);

  // Auto-scale to fit viewport
  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => {
      const barH = 44; // playback bar height
      const s = Math.min(
        el.clientWidth / width,
        (el.clientHeight - barH) / height
      );
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width, height]);

  // Animation loop
  React.useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime((t) => {
        let next = t + dt;
        if (next >= duration) {
          if (loop) next = next % duration;
          else { next = duration; setPlaying(false); }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing, duration, loop]);

  // Keyboard: space = play/pause, ← → = seek
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(p => !p);
      } else if (e.code === 'ArrowLeft') {
        setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.code === 'ArrowRight') {
        setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.key === '0' || e.code === 'Home') {
        setTime(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);

  const displayTime = hoverTime != null ? hoverTime : time;

  const ctxValue = React.useMemo(
    () => ({ time: displayTime, duration, playing, setTime, setPlaying }),
    [displayTime, duration, playing]
  );

  return (
    <div
      ref={stageRef}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        background: '#0a0a0a',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Canvas area — vertically centered in remaining space */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <div
          ref={canvasRef}
          data-stage-canvas="1"
          style={{
            width, height,
            background,
            position: 'relative',
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            flexShrink: 0,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}
        >
          <TimelineContext.Provider value={ctxValue}>
            {children}
          </TimelineContext.Provider>
        </div>
      </div>

      {/* Playback bar — stacked below canvas, never overlapping */}
      <PlaybackBar
        time={displayTime}
        actualTime={time}
        duration={duration}
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        onReset={() => { setTime(0); }}
        onSeek={(t) => setTime(t)}
        onHover={(t) => setHoverTime(t)}
      />
    </div>
  );
}

// ── Playback bar ────────────────────────────────────────────────────────────
// Play/pause, return-to-begin, scrub track, time display.
// Uses fixed-width time fields so layout doesn't thrash.

function PlaybackBar({ time, duration, playing, onPlayPause, onReset, onSeek, onHover }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const timeFromEvent = React.useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);

  const onTrackMove = (e) => {
    if (!trackRef.current) return;
    const t = timeFromEvent(e);
    if (dragging) {
      onSeek(t);
    } else {
      onHover(t);
    }
  };

  const onTrackLeave = () => {
    if (!dragging) onHover(null);
  };

  const onTrackDown = (e) => {
    setDragging(true);
    const t = timeFromEvent(e);
    onSeek(t);
    onHover(null);
  };

  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = (e) => {
      if (!trackRef.current) return;
      const t = timeFromEvent(e);
      onSeek(t);
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
    };
  }, [dragging, timeFromEvent, onSeek]);

  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const fmt = (t) => {
    const total = Math.max(0, t);
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    const cs = Math.floor((total * 100) % 100);
    return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const mono = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 16px',
      background: 'rgba(20,20,20,0.92)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',

      borderRadius: 8,
      color: '#f6f4ef',
      fontFamily: 'Inter, system-ui, sans-serif',
      userSelect: 'none',
      flexShrink: 0,
    }}>
      <IconButton onClick={onReset} title="Return to start (0)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
      </IconButton>
      <IconButton onClick={onPlayPause} title="Play/pause (space)">
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3" y="2" width="3" height="10" fill="currentColor"/>
            <rect x="8" y="2" width="3" height="10" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 2l9 5-9 5V2z" fill="currentColor"/>
          </svg>
        )}
      </IconButton>

      {/* Current time: fixed width so it doesn't thrash */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'right',
        color: '#f6f4ef',
      }}>
        {fmt(time)}
      </div>

      {/* Scrub track */}
      <div
        ref={trackRef}
        onMouseMove={onTrackMove}
        onMouseLeave={onTrackLeave}
        onMouseDown={onTrackDown}
        style={{
          flex: 1,
          height: 22,
          position: 'relative',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <div style={{
          position: 'absolute',
          left: 0, right: 0, height: 4,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: 0, width: `${pct}%`, height: 4,
          background: 'oklch(72% 0.12 250)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: `${pct}%`, top: '50%',
          width: 12, height: 12,
          marginLeft: -6, marginTop: -6,
          background: '#fff',
          borderRadius: 6,
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        }}/>
      </div>

      {/* Duration: fixed width */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'left',
        color: 'rgba(246,244,239,0.55)',
      }}>
        {fmt(duration)}
      </div>
    </div>
  );
}

function IconButton({ children, onClick, title }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6,
        color: '#f6f4ef',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 120ms',
      }}
    >
      {children}
    </button>
  );
}


Object.assign(window, {
  Easing, interpolate, animate, clamp,
  TimelineContext, useTime, useTimeline,
  Sprite, SpriteContext, useSprite,
  TextSprite, ImageSprite, RectSprite,
  Stage, PlaybackBar,
});



// ─────────────────────────────────────────────────────────────────────────────
// MOMENTS — ARGENTINA v EGYPT · WORLD CUP ROUND OF 16
// Argentina 3–2 comeback win, visualized as the Moments Engine would read it:
// win probability + fan emotion + real-time message activation.
// Brand: Genius Sports (navy #0D1226, bright green #E1FF67, Klarheit/Red Hat).
//
// ⚠ MOCK DATA — edit tonight's real match here:
//   MATCH  → competition / team names / final score copy
//   GOALS  → goal timeline (game-progress p, scoring team)
//   KEYS   → Argentina win-probability curve (sharp step at each goal)
//   EMO    → Argentina-fan emotional arc
//   Callouts() / AudienceStrip() → the "moments" that get activated
// ─────────────────────────────────────────────────────────────────────────────

// ── Match meta (edit me) ──────────────────────────────────────────────────────
const MATCH = {
  competition: 'FIFA WORLD CUP · ROUND OF 16',
  usaName: 'Argentina', belName: 'Egypt',
  finalUSA: 3, finalBEL: 2,
};

const C = {
  navy: '#0D1226', blue: '#0000DC', lightBlue: '#95ECFD', brightGreen: '#E1FF67',
  lightGreen: '#18C971', green: '#047C40', lightPurple: '#C2D1FF', purple: '#4337A8',
  orange: '#FA5D00', lightOrange: '#FFEBAF', coral: '#F76B6A', red: '#C20000',
  white: '#FFFFFF', lav: '#E7E7E9',
};
const FH = "'KlarheitKurrent', ui-sans-serif, system-ui, sans-serif";
const FB = "'RedHatText', ui-sans-serif, system-ui, sans-serif";

const W = 1920, H = 1080, DUR = 33.9;
const DRAW0 = 5.5, SPAN = 18.85;                 // match draws continuously, kick-off → full time
const DRAW1 = DRAW0 + SPAN;                       // ≈24.35 — final whistle lands, win beat
const CH = { x: 230, y: 400, w: 1460, h: 440 };        // chart plot area (top pulled down to make room for the audience/creative strip above it)

const tAt = (p) => DRAW0 + clamp(p, 0, 1) * SPAN;
const gameP = (t) => clamp((t - DRAW0) / SPAN, 0, 1);
const X = (p) => CH.x + p * CH.w;
const Y = (v) => CH.y + (1 - v) * CH.h;
const MT = 100;                 // match axis length (min) — 90 + stoppage, so 90+2' winner lands ~p0.92
const HT = 0.45;               // half-time (45' / MT)
const m2p = (m) => clamp(m / MT, 0, 1);

// ── Goal timeline — real Argentina v Egypt events (game-progress p = min/100) ──
const GOALS = [
  [m2p(15), 'bel'],   // 15'   Yasser Ibrahim   — Egypt 1–0
  [m2p(67), 'bel'],   // 67'   Mostafa Zico      — Egypt 2–0
  [m2p(79), 'usa'],   // 79'   Cristian Romero   — Argentina 2–1
  [m2p(83), 'usa'],   // 83'   Lionel Messi      — Argentina 2–2
  [m2p(92), 'usa'],   // 90+2' Enzo Fernández    — Argentina 3–2 winner
];
// ── Notable non-goal events — rendered as hollow markers ──
const MISSES = [
  [m2p(21), 'usa', 'Messi pen. miss'],   // 21'  Messi missed penalty
];
const scoreAt = (p) => {
  let usa = 0, bel = 0;
  for (const [gp, tm] of GOALS) { if (p >= gp) (tm === 'usa' ? usa++ : bel++); }
  return { usa, bel };
};

// ── Argentina (home) win-probability curve — 90-minute match-outcome win prob ──
// (not draw-inclusive) — Argentina open ~75% favourites, halve at Egypt's 1st goal,
// crater to ~20% at Egypt's 2nd, then climb back with each Argentina goal.
const KEYS = [
  [0.00, .75], [0.14, .75],                 // pre-match → Argentina clear favourites
  [0.15, .50],                              // 15' Egypt 1–0 → sharp drop, ~coin-flip
  [0.19, .48],
  [0.21, .40], [0.24, .46],                 // 21' Messi penalty MISS → dip, then press again
  [0.35, .43], [0.45, .40],                 // 1–0 down through half-time
  [0.58, .32], [0.66, .25],
  [0.67, .20],                              // 67' Egypt 2–0 → down to ~20%
  [0.74, .18], [0.78, .16],
  [0.79, .35],                              // 79' Romero 2–1 → step up
  [0.815, .33], [0.828, .32],
  [0.83, .55],                              // 83' Messi 2–2 → big step up, edge back ahead
  [0.87, .62], [0.90, .70], [0.915, .78],
  [0.92, .97],                              // 90+2' Enzo 3–2 → winner
  [0.95, .99], [1, 1],
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
    const amp = 0.0016 + 0.005 * b * (1 - b);      // football: nearly smooth between goals; steps do the work
    const j = Math.sin(p * 247.3) * .45 + Math.sin(p * 531.7 + 1.3) * .35 + Math.sin(p * 1117.9 + 2.1) * .2;
    a.push(clamp(b + j * amp, 0.006, 0.995));
  }
  a[0] = KEYS[0][1]; a[NPTS - 1] = 1;
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

// ── Emotion arc (Argentina-fan perspective) ────────────────────────────────────────
// Emotions are the manual's canonical set only (Joy · Awe & Admiration · Hope · Tension · Sadness · Relief).
const EMO = [
  ['Hope',             0.00, 0.15, C.lightBlue],   // kickoff — belief / anticipation
  ['Tension',          0.15, 0.67, C.orange],       // 1–0 down — dread, threat
  ['Sadness',          0.67, 0.79, C.lightPurple],  // 2–0 down — loss
  ['Awe & Admiration', 0.79, 0.92, C.lightGreen],   // the comeback — brilliance, spectacle
  ['Joy',              0.92, 1.0,  C.brightGreen],  // winner — celebration, triumph
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
  const isArg = team === 'usa';
  const flagStyle = isArg
    ? { background: 'linear-gradient(180deg, #75AADB 0%, #75AADB 33%, #FFFFFF 33%, #FFFFFF 67%, #75AADB 67%, #75AADB 100%)' }
    : { background: 'linear-gradient(180deg, #CE1126 0%, #CE1126 33%, #FFFFFF 33%, #FFFFFF 67%, #000000 67%, #000000 100%)' };
  return (
    <span style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      borderRadius: '50%', overflow: 'hidden', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.35)', background: C.navy }}>
      <span aria-label={team} style={{ width: '100%', height: '100%', display: 'block', ...flagStyle }} />
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
    if (el) el.setAttribute('data-screen-label', `moments-argentina-egypt · t=${s}s`);
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
              World Cup R16: Argentina v <span style={{ color: C.lightBlue }}>Egypt</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36, opacity: subo, transform: `translateY(${(1 - subo) * 16}px)`, marginTop: 32 }}>
            <TeamBadge team="usa" size={120} />
            <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 42, color: 'rgba(255,255,255,0.5)' }}>v</span>
            <TeamBadge team="bel" size={120} />
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
  const half = t < DRAW0 ? 'KICK-OFF' : p >= 1 ? 'FULL TIME' : p < HT ? "1ST HALF" : "2ND HALF";
  const sc = scoreAt(p);
  return (
    <div style={{ position: 'absolute', left: CH.x, right: W - CH.x - CH.w, top: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: o, transform: `translateY(${(1 - o) * -14}px)` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: FB, fontSize: 15, fontWeight: 500, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)' }}>{MATCH.competition}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <TeamBadge team="usa" size={46} />
          <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 35, letterSpacing: '-0.03em', color: C.white }}>{MATCH.usaName}</span>
          <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 25, color: 'rgba(255,255,255,0.45)', margin: '0 5px' }}>v</span>
          <TeamBadge team="bel" size={46} />
          <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 35, letterSpacing: '-0.03em', color: C.white }}>{MATCH.belName}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ fontFamily: FH, fontWeight: 700, fontSize: 32, letterSpacing: '-0.01em', color: C.white, fontVariantNumeric: 'tabular-nums' }}>
          {sc.usa} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>–</span> {sc.bel}
        </div>
        <div style={{ fontFamily: FH, fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', color: half === 'FULL TIME' ? C.brightGreen : 'rgba(255,255,255,0.85)', minWidth: 108, textAlign: 'right' }}>{half}</div>
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
  const p = gameP(t);
  const halfLabels = [['1st half', 0.22], ['2nd half', 0.72]];
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <rect x={CH.x} y={CH.y} width={CH.w} height={CH.h} fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" rx="4" />
      <text x={CH.x} y={CH.y - 30} fill="rgba(225,255,103,0.85)" fontFamily={FB} fontSize="16" fontWeight="500" letterSpacing="2.5">WIN PROBABILITY — ARGENTINA</text>
      <text x={CH.x + 316} y={CH.y - 30} fill="rgba(255,255,255,0.4)" fontFamily={FB} fontSize="16" fontWeight="500" letterSpacing="2.5">· VIA GENIUSIQ</text>
      {[0.5].map(v => (
        <line key={v} x1={CH.x} y1={Y(v)} x2={CH.x + CH.w} y2={Y(v)} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 7" />
      ))}
      {/* half-time divider */}
      {(() => { const pulse = decay(t, tAt(HT), 2.5);
        return <line x1={X(HT)} y1={CH.y} x2={X(HT)} y2={CH.y + CH.h} stroke={`rgba(255,255,255,${0.12 + pulse * 0.45})`} strokeWidth={1 + pulse * 1.5} />; })()}
      {/* missed-penalty markers (hollow, muted) */}
      {MISSES.map(([mp, tm, lbl], i) => {
        if (p < mp) return null;
        const pulse = decay(t, tAt(mp), 2.2);
        const my = Y(wpAt(mp));
        return (
          <g key={`m${i}`}>
            <line x1={X(mp)} y1={CH.y} x2={X(mp)} y2={CH.y + CH.h} stroke="rgba(255,255,255,0.28)" strokeWidth={0.8} strokeDasharray="2 6" />
            <circle cx={X(mp)} cy={my} r={7 + pulse * 4} fill="none" stroke={C.coral} strokeWidth="2" opacity={0.85} />
            <line x1={X(mp) - 4} y1={my - 4} x2={X(mp) + 4} y2={my + 4} stroke={C.coral} strokeWidth="2" opacity={0.85} />
            <line x1={X(mp) - 4} y1={my + 4} x2={X(mp) + 4} y2={my - 4} stroke={C.coral} strokeWidth="2" opacity={0.85} />
          </g>
        );
      })}
      {/* goal markers */}
      {GOALS.map(([gp, tm], i) => {
        if (p < gp) return null;
        const col = tm === 'usa' ? C.brightGreen : C.coral;
        const pulse = decay(t, tAt(gp), 2.2);
        return (
          <g key={i}>
            <line x1={X(gp)} y1={CH.y} x2={X(gp)} y2={CH.y + CH.h} stroke={col} strokeWidth={1.2 + pulse * 1.8} opacity={0.34 + pulse * 0.45} strokeDasharray="2 6" />
            <circle cx={X(gp)} cy={CH.y - 12} r={4 + pulse * 3} fill={col} opacity={0.9} />
          </g>
        );
      })}
      {[[1, '1.0'], [0.5, '0.5'], [0, '0.0']].map(([v, l]) => (
        <text key={l} x={CH.x - 18} y={Y(v) + 7} textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily={FB} fontSize="20">{l}</text>
      ))}
      {halfLabels.map(([l, m]) => (
        <text key={l} x={X(m)} y={CH.y + CH.h + 34} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontFamily={FB} fontSize="19" letterSpacing="2">{l}</text>
      ))}
      <text x={X(1)} y={CH.y + CH.h + 34} textAnchor="end" fill="rgba(225,255,103,0.7)" fontFamily={FB} fontSize="16" letterSpacing="2">FULL TIME</text>
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
            Win probability — Argentina
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
      <Callout t0={tAt(0.675)} tEnd={tAt(0.80)} x={620} y={470} w={340}
        anchorX={X(0.70)} anchorY={Y(wpAt(0.70))} connFrom="bottom"
        title={"Egypt in control\n(2–0)"} status="MOMENT ACTIVATED · EGYPT-FAN CREATIVE ON" on={true} />
      <Callout t0={tAt(0.80)} tEnd={DRAW1 + 0.45} x={1050} y={430} w={360}
        anchorX={X(0.855)} anchorY={Y(wpAt(0.855))} connFrom="bottom"
        title={"Argentina comeback\nin the making"} status="MOMENT ACTIVATED · ARGENTINA-FAN CREATIVE ON" on={true} />
      <Callout t0={DRAW1 + 0.1} x={1372} y={318} w={300} big={true} badge="usa"
        anchorX={X(1)} anchorY={Y(1)} connFrom="top"
        title="Argentina win" status="FULL TIME · MOMENT ACTIVATED" on={true} />
      <Callout t0={DRAW1 + 0.55} x={1372} y={470} w={300}
        anchorX={X(0.99)} anchorY={Y(wpAt(0.99))} connFrom="right"
        title="Comeback complete" status="MOMENT ACTIVATED" on={true} />
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
  const belState = p >= 0.79 ? 'PAUSED' : p >= 0.15 ? 'DELIVERING' : 'MONITORING';
  const belChange = p >= 0.79 ? tAt(0.79) : tAt(0.15);
  const usaState = p >= 1 ? 'DELIVERED' : p >= 0.79 ? 'DELIVERING' : 'MONITORING';
  return (
    <div style={{ position: 'absolute', left: CH.x, top: 246, width: CH.w, display: 'flex', gap: 36 }}>
      <AudienceCard team="bel" fan="EGYPT FANS" creative="“Cruise to victory” creative" state={belState} tChange={belChange} />
      <AudienceCard team="usa" fan="ARGENTINA FANS" creative="“Comeback” creative" state={usaState === 'DELIVERED' ? 'DELIVERING' : usaState} tChange={tAt(0.79)} />
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

// ── PRIMARY: creative "moment" callouts — the engine turning fan creative on/off ──
// The crucial product story. Bold cards in SCREEN space (outside the camera
// transform) so they stay readable through the punch-in; a clamped connector
// ties each to its live point on the win-probability line.
const MOMENTS = [
  { p: m2p(15), kind: 'on',  team: 'bel', title: 'Egypt take the lead',   status: 'MOMENT ACTIVATED · EGYPT-FAN CREATIVE ON',     box: { x: 1160, y: 470 }, t0: tAt(m2p(15)) + 0.2,  t1: tAt(m2p(15)) + 4.6 },
  { p: m2p(79), kind: 'off', team: 'bel', title: 'Egypt’s lead slips',    status: 'MOMENT DEACTIVATED · EGYPT CREATIVE OFF',     box: { x: 120,  y: 352 }, t0: tAt(m2p(79)) + 0.15, t1: DRAW1 + 0.7 },
  { p: m2p(83), kind: 'on',  team: 'usa', title: 'Argentina comeback',    status: 'MOMENT ACTIVATED · ARGENTINA-FAN CREATIVE ON', box: { x: 120,  y: 528 }, t0: tAt(m2p(83)) + 0.15, t1: DRAW1 + 1.9 },
  { p: 1.0,     kind: 'win', team: 'usa', title: 'Argentina win 3–2',     status: 'FULL TIME · MOMENT ACTIVATED',                box: { x: 120,  y: 704 }, t0: DRAW1 + 0.35, t1: 99, big: true },
];

function MomentCard({ m, e }) {
  const isOn = m.kind === 'on' || m.kind === 'win';
  const big = m.big;
  const onStyle = isOn
    ? { background: C.brightGreen, color: C.navy, border: 'none', boxShadow: `0 0 60px ${big ? 'rgba(225,255,103,0.5)' : 'rgba(225,255,103,0.3)'}` }
    : { background: 'rgba(13,18,38,0.78)', color: C.white, border: `1.5px solid ${C.coral}`, backdropFilter: 'blur(4px)', boxShadow: '0 0 44px rgba(247,107,106,0.2)' };
  return (
    <div style={{
      width: big ? 470 : 372, borderRadius: 14, padding: big ? '22px 26px' : '18px 24px',
      transform: `scale(${0.55 + 0.45 * e})`, transformOrigin: 'center',
      display: 'flex', flexDirection: 'column', gap: 11, ...onStyle,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        {!big && <TeamBadge team={m.team} size={40} />}
        <span style={{ fontFamily: FH, fontWeight: big ? 700 : 400, fontSize: big ? 36 : 30, letterSpacing: '-0.02em', lineHeight: 1.1, whiteSpace: 'nowrap' }}>{m.title}</span>
        {big && <TeamBadge team={m.team} size={46} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: isOn ? C.navy : C.coral }} />
        <span style={{ fontFamily: FB, fontSize: 14, fontWeight: 500, letterSpacing: '0.1em', opacity: isOn ? 0.78 : 0.72 }}>{m.status}</span>
      </div>
    </div>
  );
}

// ── SECONDARY: match-event chips — small, muted goal / missed-penalty markers ──
const EV = [
  { p: m2p(15), team: 'bel', type: 'goal', label: 'GOAL',           player: 'Yasser Ibrahim', min: "15'",    score: '0–1', box: { x: 110,  y: 352 }, t0: tAt(m2p(15)) - 0.05, t1: tAt(m2p(15)) + 4.3 },
  { p: m2p(21), team: 'usa', type: 'miss', label: 'PENALTY MISSED', player: 'Lionel Messi',   min: "21'",    score: '0–1', box: { x: 110,  y: 456 }, t0: tAt(m2p(21)) - 0.05, t1: tAt(m2p(21)) + 4.3 },
  { p: m2p(67), team: 'bel', type: 'goal', label: 'GOAL',           player: 'Mostafa Zico',   min: "67'",    score: '0–2', box: { x: 110,  y: 352 }, t0: tAt(m2p(67)) - 0.05, t1: tAt(m2p(79)) - 0.1 },
  { p: m2p(79), team: 'usa', type: 'goal', label: 'GOAL',           player: 'Cristian Romero',min: "79'",    score: '1–2', box: { x: 1500, y: 352 }, t0: tAt(m2p(79)) - 0.05, t1: DRAW1 + 2.0 },
  { p: m2p(83), team: 'usa', type: 'goal', label: 'GOAL',           player: 'Lionel Messi',   min: "83'",    score: '2–2', box: { x: 1500, y: 452 }, t0: tAt(m2p(83)) - 0.05, t1: DRAW1 + 2.0 },
  { p: m2p(92), team: 'usa', type: 'goal', label: 'GOAL · 90+2\u2019', player: 'Enzo Fernández', min: "90+2'", score: '3–2', box: { x: 1500, y: 604 }, t0: tAt(m2p(92)) - 0.05, t1: 99 },
];

function EventCard({ ev, e }) {
  const on = ev.type === 'goal';
  const accent = on ? C.brightGreen : C.coral;
  return (
    <div style={{
      width: 252, borderRadius: 12, padding: '11px 14px',
      background: 'rgba(13,18,38,0.72)', border: '1px solid rgba(255,255,255,0.14)',
      borderLeft: `3px solid ${accent}`, backdropFilter: 'blur(4px)',
      transform: `scale(${0.7 + 0.3 * e})`, transformOrigin: 'center',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontFamily: FB, fontSize: 11.5, fontWeight: 500, letterSpacing: '0.14em', color: accent }}>{ev.label}</span>
        <span style={{ fontFamily: FB, fontSize: 11.5, fontWeight: 500, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.5)' }}>{ev.min}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <TeamBadge team={ev.team} size={26} />
        <span style={{ fontFamily: FH, fontWeight: 400, fontSize: 20, letterSpacing: '-0.01em', color: C.white }}>{ev.player}</span>
        <span style={{ fontFamily: FH, fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.75)', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{ev.score}</span>
      </div>
    </div>
  );
}

// SECONDARY event chips — muted cards with a thin connector to the event's
// persistent vertical line on the chart.
function EventCallouts() {
  const t = useTime();
  const s = camS(t), fx = camFX(t), fy = camFY(t);
  const tx = W / 2 - s * fx, ty = H / 2 - s * fy;
  const active = EV.filter(ev => t >= ev.t0 && t <= ev.t1);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {active.map((ev, i) => {
          const accent = ev.type === 'goal' ? C.brightGreen : C.coral;
          const ax = clamp(tx + s * X(ev.p), 30, W - 30);
          const ay = clamp(ty + s * Y(wpAt(ev.p)), 30, H - 30);
          const bw = 252, bh = 82;
          const cx = ev.box.x + bw / 2, cy = ev.box.y + bh / 2;
          const dx = ax - cx, dy = ay - cy;
          const kx = dx !== 0 ? (bw / 2) / Math.abs(dx) : Infinity;
          const ky = dy !== 0 ? (bh / 2) / Math.abs(dy) : Infinity;
          const k = Math.min(kx, ky, 1);
          const ex = cx + dx * k, ey = cy + dy * k;
          const lineP = clamp((t - ev.t0 - 0.1) / 0.4, 0, 1);
          const lx = ex + (ax - ex) * lineP, ly = ey + (ay - ey) * lineP;
          const o = fadeIn(t, ev.t0, 0.3) * (ev.t1 < 90 ? 1 - fadeIn(t, ev.t1 - 0.35, 0.35) : 1);
          return (
            <g key={i} opacity={o * 0.7}>
              <line x1={ex} y1={ey} x2={lx} y2={ly} stroke={accent} strokeWidth="1" strokeDasharray="2 5" />
              {lineP >= 1 && <circle cx={ax} cy={ay} r="4.5" fill="none" stroke={accent} strokeWidth="1.5" />}
            </g>
          );
        })}
      </svg>
      {active.map((ev, i) => {
        const e = popIn(t, ev.t0, 0.5);
        const o = fadeIn(t, ev.t0, 0.3) * (ev.t1 < 90 ? 1 - fadeIn(t, ev.t1 - 0.35, 0.35) : 1);
        return (
          <div key={i} style={{ position: 'absolute', left: ev.box.x, top: ev.box.y, opacity: o }}>
            <EventCard ev={ev} e={e} />
          </div>
        );
      })}
    </div>
  );
}

// PRIMARY moment callouts — bold cards + clamped connector to the live line point.
function MomentCallouts() {
  const t = useTime();
  const s = camS(t), fx = camFX(t), fy = camFY(t);
  const tx = W / 2 - s * fx, ty = H / 2 - s * fy;
  const active = MOMENTS.filter(m => t >= m.t0 && t <= m.t1);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {active.map((m, i) => {
          const isOn = m.kind === 'on' || m.kind === 'win';
          const accent = isOn ? C.brightGreen : C.coral;
          const ax = clamp(tx + s * X(m.p), 40, W - 40);
          const ay = clamp(ty + s * Y(wpAt(m.p)), 40, H - 40);
          const bw = m.big ? 470 : 372, bh = m.big ? 150 : 128;
          const cx = m.box.x + bw / 2, cy = m.box.y + bh / 2;
          const dx = ax - cx, dy = ay - cy;
          const kx = dx !== 0 ? (bw / 2) / Math.abs(dx) : Infinity;
          const ky = dy !== 0 ? (bh / 2) / Math.abs(dy) : Infinity;
          const k = Math.min(kx, ky, 1);
          const ex = cx + dx * k, ey = cy + dy * k;
          const lineP = clamp((t - m.t0 - 0.1) / 0.4, 0, 1);
          const lx = ex + (ax - ex) * lineP, ly = ey + (ay - ey) * lineP;
          const o = fadeIn(t, m.t0, 0.3) * (m.t1 < 90 ? 1 - fadeIn(t, m.t1 - 0.35, 0.35) : 1);
          return (
            <g key={i} opacity={o}>
              <line x1={ex} y1={ey} x2={lx} y2={ly} stroke={accent} strokeWidth="1.5" strokeDasharray="2 5" />
              {lineP >= 1 && <circle cx={ax} cy={ay} r="6" fill="none" stroke={accent} strokeWidth="2" />}
            </g>
          );
        })}
      </svg>
      {active.map((m, i) => {
        const e = popIn(t, m.t0, 0.5);
        const o = fadeIn(t, m.t0, 0.3) * (m.t1 < 90 ? 1 - fadeIn(t, m.t1 - 0.35, 0.35) : 1);
        return (
          <div key={i} style={{ position: 'absolute', left: m.box.x, top: m.box.y, opacity: o }}>
            <MomentCard m={m} e={e} />
          </div>
        );
      })}
    </div>
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
          <AudienceStrip />
          <ChartFrame />
          <WinLine />
          <WinFlash />
        </div>
        <EventCallouts />
        <MomentCallouts />
        <img src="assets/logos/GENIUS_SPORTS_HORIZONTAL_WHITE_RGB.svg" alt="Genius Sports"
          style={{ position: 'absolute', right: 56, bottom: 26, height: 26, opacity: 0.55 }} />
      </div>
    </Sprite>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3 — END CARD (48.4 → 60s)
// ─────────────────────────────────────────────────────────────────────────────
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
          <div style={{ fontFamily: FH, fontWeight: 300, fontSize: 68, letterSpacing: '-0.03em', lineHeight: 1.05, color: C.white, whiteSpace: 'nowrap', opacity: h1o, transform: `translateY(${(1 - h1o) * 26}px)` }}>
            Right fan. Right moment. Right message.
          </div>
          <div style={{ fontFamily: FB, fontSize: 32, fontWeight: 400, color: 'rgba(255,255,255,0.72)', letterSpacing: '-0.01em', maxWidth: 980, opacity: subo, transform: `translateY(${(1 - subo) * 18}px)` }}>
            Every screen. In real time.
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
      <EndScene />
      <ScreenLabel />
      <ExposeControl />
    </Stage>
  );
}
window.MomentsFilm = MomentsFilm;
