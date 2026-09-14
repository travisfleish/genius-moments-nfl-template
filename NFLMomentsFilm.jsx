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

// ═════════════════════════════════════════════════════════════════════════════
// GENIUS MOMENTS — NFL FILM TEMPLATE
//
// Nothing below is specific to a single game. Every team name, colour, scoring
// play, win-probability point, emotion segment, creative activation and line of
// copy is read from ONE object: `window.NFL_MOMENTS_GAME`, set by `nfl-game.js`.
//
// To publish a new game:
//   1. Engineering supplies the payload as JSON (schema: see nfl-game.js).
//   2. Paste it into nfl-game.js between the braces. Nothing else changes.
//
// Clock strings are always "Q1 12:34" / "OT 08:30" — quarter + time REMAINING,
// exactly as they appear on a broadcast clock.
// ═════════════════════════════════════════════════════════════════════════════

const C = {
  navy: '#0D1226', blue: '#0000DC', lightBlue: '#95ECFD', brightGreen: '#E1FF67',
  lightGreen: '#18C971', green: '#047C40', lightPurple: '#C2D1FF', purple: '#4337A8',
  orange: '#FA5D00', lightOrange: '#FFEBAF', coral: '#F76B6A', red: '#C20000',
  white: '#FFFFFF', lav: '#E7E7E9',
};
const FH = "'KlarheitKurrent', ui-sans-serif, system-ui, sans-serif";
const FB = "'RedHatText', ui-sans-serif, system-ui, sans-serif";

const W = 1920, H = 1080, DUR = 35;
const DRAW0 = 5.6, SPAN = 19.8;                 // game draws continuously, kickoff → final
const DRAW1 = DRAW0 + SPAN;                     // 25.4 — final whistle, win beat
const CH = { x: 230, y: 400, w: 1460, h: 440 };

// ── Fallback payload: a neutral placeholder matchup (no real NFL clubs) ──────
const DEFAULT_GAME = {
  competition: 'NFL · WEEK 7',
  date: 'MON 26 OCT',
  away:  { abbr: 'NOR', name: 'Northside', color: '#0000DC', ink: '#FFFFFF' },
  home:  { abbr: 'RIV', name: 'Riverside', color: '#F76B6A', ink: '#0D1226' },
  perspective: 'home',
  overtime: true,
  intro: { line1: 'See Genius Moments live in action:', line2: 'Week 7: Northside at Riverside' },
  end:   { headline: 'Right fan. Right moment. Right message.', sub: 'Every screen. In real time.' },
  scoring: [
    { clock: 'Q1 11:42', team: 'home', type: 'FG', points: 3, player: 'K. Alvarez 41 yd',  drive: '8 plays · 52 yds · 4:18' },
    { clock: 'Q1 03:18', team: 'away', type: 'TD', points: 7, player: 'D. Whitlock 12 yd run', drive: '11 plays · 80 yds · 6:02' },
    { clock: 'Q2 07:55', team: 'away', type: 'TD', points: 7, player: 'R. Cole 34 yd catch',   drive: '5 plays · 71 yds · 2:11', feature: true },
    { clock: 'Q2 00:31', team: 'home', type: 'FG', points: 3, player: 'K. Alvarez 28 yd',  drive: '9 plays · 61 yds · 1:44' },
    { clock: 'Q3 09:12', team: 'home', type: 'TD', points: 7, player: 'T. Beaumont 6 yd run',  drive: '12 plays · 75 yds · 5:48', feature: true },
    { clock: 'Q4 12:40', team: 'away', type: 'FG', points: 3, player: 'M. Price 47 yd',    drive: '6 plays · 29 yds · 3:02' },
    { clock: 'Q4 04:26', team: 'home', type: 'TD', points: 7, player: 'T. Beaumont 22 yd catch', drive: '7 plays · 68 yds · 2:39', feature: true },
    { clock: 'Q4 01:05', team: 'away', type: 'FG', points: 3, player: 'M. Price 33 yd',    drive: '10 plays · 44 yds · 3:12' },
    { clock: 'OT 06:38', team: 'home', type: 'TD', points: 7, player: 'T. Beaumont 9 yd run', drive: '9 plays · 70 yds · 4:22', feature: true },
  ],
  winProb: [
    { clock: 'Q1 15:00', value: 0.52 }, { clock: 'Q1 11:42', value: 0.58 },
    { clock: 'Q1 08:00', value: 0.56 }, { clock: 'Q1 03:18', value: 0.41 },
    { clock: 'Q2 12:00', value: 0.40 }, { clock: 'Q2 07:55', value: 0.24 },
    { clock: 'Q2 04:00', value: 0.25 }, { clock: 'Q2 00:31', value: 0.31 },
    { clock: 'Q3 14:00', value: 0.32 }, { clock: 'Q3 09:12', value: 0.47 },
    { clock: 'Q3 04:00', value: 0.49 }, { clock: 'Q4 12:40', value: 0.33 },
    { clock: 'Q4 08:00', value: 0.36 }, { clock: 'Q4 04:26', value: 0.74 },
    { clock: 'Q4 02:00', value: 0.71 }, { clock: 'Q4 01:05', value: 0.50 },
    { clock: 'OT 10:00', value: 0.55 }, { clock: 'OT 08:30', value: 0.62 },
    { clock: 'OT 06:38', value: 0.99 },
  ],
  emotion: [
    { label: 'Hope',             from: 'Q1 15:00', to: 'Q1 03:18', color: 'lightBlue' },
    { label: 'Tension',          from: 'Q1 03:18', to: 'Q2 07:55', color: 'orange' },
    { label: 'Sadness',          from: 'Q2 07:55', to: 'Q3 09:12', color: 'purple' },
    { label: 'Hope',             from: 'Q3 09:12', to: 'Q4 04:26', color: 'lightBlue' },
    { label: 'Joy',              from: 'Q4 04:26', to: 'Q4 01:05', color: 'lightGreen' },
    { label: 'Tension',          from: 'Q4 01:05', to: 'OT 10:00', color: 'orange' },
    { label: 'Awe & Admiration', from: 'OT 10:00', to: 'OT 06:38', color: 'brightGreen' },
    { label: 'Relief',           from: 'OT 06:38', to: 'FINAL',    color: 'green' },
  ],
  moments: [
    { clock: 'Q2 07:55', kind: 'off', team: 'home', title: 'Riverside fall two scores back', status: 'MOMENT PAUSED · RIVERSIDE CREATIVE OFF' },
    { clock: 'Q3 09:12', kind: 'on',  team: 'home', title: 'Riverside within one',           status: 'MOMENT ACTIVATED · COMEBACK CREATIVE ON' },
    { clock: 'Q4 04:26', kind: 'on',  team: 'home', title: 'Riverside take the lead',        status: 'MOMENT ACTIVATED · CREATIVE ESCALATED' },
    { clock: 'OT 06:38', kind: 'win', team: 'home', title: 'Riverside win in OT',            status: 'FINAL · MOMENT ACTIVATED' },
  ],
  audiences: [
    { team: 'away', label: 'NORTHSIDE FANS', creative: '“Hold the line” creative', onFrom: 'Q1 03:18', offFrom: 'Q4 04:26' },
    { team: 'home', label: 'RIVERSIDE FANS', creative: '“Comeback surge” creative', onFrom: 'Q3 09:12' },
  ],
};

// ── Clock maths ──────────────────────────────────────────────────────────────
const QLEN = 900, OTLEN = 600;
function parseClock(s, game) {
  const str = String(s || '').trim().toUpperCase();
  const total = game.overtime ? 4 * QLEN + OTLEN : 4 * QLEN;
  if (str === 'FINAL' || str === 'END') return total;
  const m = /^(Q([1-4])|OT)\s+(\d{1,2}):(\d{2})$/.exec(str);
  if (!m) return 0;
  const isOT = m[1] === 'OT';
  const len = isOT ? OTLEN : QLEN;
  const rem = clamp((+m[3]) * 60 + (+m[4]), 0, len);
  return isOT ? 4 * QLEN + (len - rem) : (+m[2] - 1) * QLEN + (len - rem);
}
function fmtClock(elapsed, game) {
  const total = game.overtime ? 4 * QLEN + OTLEN : 4 * QLEN;
  const e = clamp(elapsed, 0, total);
  if (e >= 4 * QLEN && game.overtime) {
    const rem = Math.max(0, OTLEN - (e - 4 * QLEN));
    return { period: 'OT', clock: `${String(Math.floor(rem / 60)).padStart(2, '0')}:${String(Math.floor(rem % 60)).padStart(2, '0')}` };
  }
  const q = Math.min(3, Math.floor(e / QLEN));
  const rem = Math.max(0, QLEN - (e - q * QLEN));
  return { period: `Q${q + 1}`, clock: `${String(Math.floor(rem / 60)).padStart(2, '0')}:${String(Math.floor(rem % 60)).padStart(2, '0')}` };
}

// ── Timeline construction — everything derived from the payload ──────────────
function buildTimeline(src) {
  const game = Object.assign({}, DEFAULT_GAME, src);
  const total = game.overtime ? 4 * QLEN + OTLEN : 4 * QLEN;
  const P = (c) => clamp(parseClock(c, game) / total, 0, 1);

  // Scoring plays with running score + lead-change detection
  let hs = 0, as = 0, lead = 0;
  const scoring = (game.scoring || []).map((s) => {
    if (s.team === 'home') hs += s.points; else as += s.points;
    const nl = hs === as ? 0 : (hs > as ? 1 : -1);
    const leadChange = nl !== 0 && nl !== lead && lead !== 0;
    lead = nl;
    return Object.assign({}, s, { p: P(s.clock), home: hs, away: as, leadChange });
  });
  const finalScore = { home: hs, away: as };

  // Win-probability curve for the perspective team
  const keys = (game.winProb || []).map((w) => [P(w.clock), clamp(w.value, 0.01, 0.995)])
    .sort((a, b) => a[0] - b[0]);
  if (!keys.length) keys.push([0, 0.5], [1, 0.5]);
  if (keys[0][0] > 0) keys.unshift([0, keys[0][1]]);
  if (keys[keys.length - 1][0] < 1) keys.push([1, keys[keys.length - 1][1]]);
  // A scoring play should read as a step, not a ramp: hold the prior value until
  // the instant of the play.
  const clean = keys.slice();
  const prevVal = (p) => { let v = clean[0][1]; for (let i = 0; i < clean.length; i++) { if (clean[i][0] < p - 1e-6) v = clean[i][1]; else break; } return v; };
  const atVal = (p) => sampleKeys(clean, p);
  scoring.forEach((s) => keys.push([Math.max(0, s.p - 0.004), prevVal(s.p)]));
  keys.sort((a, b) => a[0] - b[0]);

  const NPTS = 361;
  const pts = [];
  for (let i = 0; i < NPTS; i++) {
    const p = i / (NPTS - 1);
    const b = sampleKeys(keys, p);
    const amp = 0.0018 + 0.006 * b * (1 - b);
    const j = Math.sin(p * 247.3) * 0.45 + Math.sin(p * 531.7 + 1.3) * 0.35 + Math.sin(p * 1117.9 + 2.1) * 0.2;
    pts.push(clamp(b + j * amp, 0.006, 0.995));
  }
  pts[0] = keys[0][1];
  pts[NPTS - 1] = sampleKeys(keys, 1);

  const wp = (p) => {
    const f = clamp(p, 0, 1) * (NPTS - 1);
    const i = Math.min(NPTS - 2, Math.floor(f));
    return pts[i] + (pts[i + 1] - pts[i]) * (f - i);
  };

  // Largest single win-probability swing, measured across scoring plays
  let swing = null;
  scoring.forEach((s) => {
    const d = atVal(s.p) - prevVal(s.p);
    if (!swing || Math.abs(d) > Math.abs(swing.delta)) swing = { delta: d, play: s, clock: s.clock };
  });

  const emotion = (game.emotion || []).map((e) => ({
    label: e.label, from: P(e.from), to: P(e.to), color: C[e.color] || e.color || C.lightBlue,
  }));

  // Quarter boundaries as game-progress
  const periods = [
    { label: 'Q1', from: 0, to: QLEN }, { label: 'Q2', from: QLEN, to: 2 * QLEN },
    { label: 'Q3', from: 2 * QLEN, to: 3 * QLEN }, { label: 'Q4', from: 3 * QLEN, to: 4 * QLEN },
  ];
  if (game.overtime) periods.push({ label: 'OT', from: 4 * QLEN, to: total });
  periods.forEach((q) => { q.p0 = q.from / total; q.p1 = q.to / total; });

  // Creative moments — screen-space cards, auto-placed so they never collide
  const SLOTS = [
    { x: 1400, y: 372 }, { x: 110, y: 372 }, { x: 1400, y: 546 }, { x: 110, y: 546 },
    { x: 1400, y: 720 }, { x: 110, y: 720 },
  ];
  const slotFree = SLOTS.map(() => -99);
  const moments = (game.moments || []).map((m) => {
    const p = P(m.clock);
    const isWin = m.kind === 'win';
    const t0 = isWin ? DRAW1 + 0.5 : tAtP(p) + 0.2;
    const t1 = isWin ? 99 : Math.min(DRAW1 + 0.9, t0 + 5.2);
    let box;
    if (isWin) { box = { x: 1300, y: 606 }; }
    else {
      const prefer = p < 0.5 ? 0 : 1;              // left half of chart → card on the right
      let idx = SLOTS.findIndex((s, i) => (i % 2 === prefer) && slotFree[i] < t0);
      if (idx < 0) idx = slotFree.findIndex((f) => f < t0);
      if (idx < 0) idx = 0;
      slotFree[idx] = t1;
      box = SLOTS[idx];
    }
    return Object.assign({}, m, { p, wp: wp(p), t0, t1, box, big: isWin });
  });

  // Featured scoring plays get a secondary chip
  const EV_SLOTS = [{ x: 110, y: 930 }, { x: 1520, y: 930 }];
  const events = scoring.filter((s) => s.feature).map((s, i) => Object.assign({}, s, {
    t0: tAtP(s.p) - 0.05,
    t1: Math.min(DRAW1 + 0.6, tAtP(s.p) + 4.4),
    box: EV_SLOTS[i % EV_SLOTS.length],
  }));

  const audiences = (game.audiences || []).map((a) => Object.assign({}, a, {
    onP: a.onFrom ? P(a.onFrom) : 0,
    offP: a.offFrom ? P(a.offFrom) : 2,
  }));

  return { src, game, total, P, scoring, finalScore, keys, pts, NPTS, wp, swing, emotion, periods, moments, events, audiences };
}

function sampleKeys(keys, p) {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (p >= keys[i][0] && p <= keys[i + 1][0]) {
      const span = keys[i + 1][0] - keys[i][0];
      const f = span === 0 ? 1 : (p - keys[i][0]) / span;
      return keys[i][1] + (keys[i + 1][1] - keys[i][1]) * f;
    }
  }
  return keys[keys.length - 1][1];
}

const tAtP = (p) => DRAW0 + clamp(p, 0, 1) * SPAN;

let G = buildTimeline(DEFAULT_GAME);
function syncGameData() {
  const src = (typeof window !== 'undefined' && window.NFL_MOMENTS_GAME) || DEFAULT_GAME;
  if (src !== G.src) G = buildTimeline(src);
}

const tAt = tAtP;
const gameP = (t) => clamp((t - DRAW0) / SPAN, 0, 1);
const X = (p) => CH.x + clamp(p, 0, 1) * CH.w;
const Y = (v) => CH.y + (1 - clamp(v, 0, 1)) * CH.h;
const wpAt = (p) => G.wp(p);
const teamOf = (side) => G.game[side === 'home' ? 'home' : 'away'];
const persp = () => teamOf(G.game.perspective || 'home');
const scoreAt = (p) => {
  let home = 0, away = 0;
  G.scoring.forEach((s) => { if (p >= s.p) { if (s.team === 'home') home += s.points; else away += s.points; } });
  return { home, away };
};

// ── Camera — derived, no hand-tuned keyframes ────────────────────────────────
const camSCurve = interpolate(
  [0, DRAW0 - 0.6, DRAW0 + 1.6, DRAW1 - 0.2, DRAW1 + 0.6, DRAW1 + 3.9, DRAW1 + 4.9, DUR],
  [1, 1, 1.08, 1.10, 1.20, 1.20, 1, 1], Easing.easeInOutCubic);
const camS = (t) => camSCurve(t);
const camFX = (t) => {
  const s = camS(t), half = W / (2 * s);
  const target = t < DRAW0 ? W / 2 : X(gameP(t));
  return clamp(target, half, Math.min(W - half, CH.x - 20 + half));
};
const camFY = (t) => {
  const s = camS(t), half = H / (2 * s);
  const target = t < DRAW0 ? H / 2 : (t >= DRAW1 ? Y(wpAt(1)) : 560);
  return clamp(target, half, Math.min(H - half, 40 + half));
};

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
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${color}`,
          transform: `scale(${1 + k * 1.8})`, opacity: (1 - k) * 0.7 }} />
      )}
    </span>
  );
}

// Club mark: supplied logo if the payload has one, otherwise an abbreviation tile
function TeamBadge({ team, size = 44 }) {
  const tm = teamOf(team);
  if (tm.logo) {
    return <img src={tm.logo} alt={tm.abbr} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />;
  }
  return (
    <span style={{
      width: size, height: size, borderRadius: size * 0.26, flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: tm.color, color: tm.ink || '#FFFFFF',
      fontFamily: FH, fontWeight: 700, fontSize: size * 0.36, letterSpacing: '-0.02em',
      boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.22)',
    }}>{tm.abbr}</span>
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

function Spring({ x, y, height = 140, color = C.brightGreen, t0 = 0, flip = false, opacity = 1 }) {
  const t = useTime();
  const bars = [2, 3, 4, 6, 9, 13, 18];
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 12,
      transform: `rotate(45deg) ${flip ? 'scaleX(-1)' : ''}`, transformOrigin: 'center', opacity }}>
      {bars.map((w, i) => {
        const g = Easing.easeOutCubic(clamp((t - t0 - i * 0.09) / 0.6, 0, 1));
        return <div key={i} style={{ width: w, height, background: color, transform: `scaleY(${g})`, transformOrigin: 'bottom' }} />;
      })}
    </div>
  );
}

function ExposeControl() {
  const tl = useTimeline();
  React.useEffect(() => { window.__film = { setTime: tl.setTime, setPlaying: tl.setPlaying, duration: DUR }; });
  return null;
}

function ScreenLabel() {
  const t = useTime();
  const s = Math.floor(t);
  React.useEffect(() => {
    const el = document.getElementById('film-root');
    if (el) el.setAttribute('data-screen-label', `nfl-moments · t=${s}s`);
  }, [s]);
  return null;
}


// Highlights the words "Genius Moments" in the opening line, wherever they fall
function introParts(line) {
  const key = 'Genius Moments';
  const idx = String(line || '').indexOf(key);
  if (idx < 0) return line;
  return [
    line.slice(0, idx),
    React.createElement('span', { key: 'gm', style: { color: C.brightGreen } }, key),
    line.slice(idx + key.length),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 1 — INTRO
// ─────────────────────────────────────────────────────────────────────────────
function IntroScene() {
  const t = useTime();
  const o = 1 - fadeIn(t, 3.7, 0.7);
  const g = G.game;
  return (
    <Sprite start={0} end={4.4}>
      <div style={{ position: 'absolute', inset: 0, opacity: o }}>
        <Spring x={120} y={760} t0={-1} opacity={0.85} />
        <Spring x={1660} y={120} t0={-1} flip={true} opacity={0.85} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontFamily: FH, fontWeight: 300, fontSize: 84, letterSpacing: '-0.04em', lineHeight: 1.08, color: C.white }}>
              {introParts(g.intro.line1)}
            </div>
            <div style={{ fontFamily: FH, fontWeight: 300, fontSize: 84, letterSpacing: '-0.04em', lineHeight: 1.08, color: C.white }}>
              {g.intro.line2}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36, marginTop: 32 }}>
            <TeamBadge team="away" size={120} />
            <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 42, color: 'rgba(255,255,255,0.5)' }}>at</span>
            <TeamBadge team="home" size={120} />
          </div>
        </div>
      </div>
    </Sprite>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2 — THE VISUALISATION
// ─────────────────────────────────────────────────────────────────────────────
function Header() {
  const t = useTime();
  const o = fadeIn(t, 4.0, 0.5);
  const p = gameP(t);
  const g = G.game;
  const elapsed = p * G.total;
  const live = t >= DRAW0;
  const ck = fmtClock(elapsed, g);
  const state = !live ? 'KICKOFF' : p >= 1 ? 'FINAL' : `${ck.period}  ${ck.clock}`;
  const sc = scoreAt(p);
  return (
    <div style={{ position: 'absolute', left: CH.x, right: W - CH.x - CH.w, top: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: o, transform: `translateY(${(1 - o) * -14}px)` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: FB, fontSize: 15, fontWeight: 500, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)' }}>
          {g.competition}{g.date ? `  ·  ${g.date}` : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <TeamBadge team="away" size={46} />
          <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 35, letterSpacing: '-0.03em', color: C.white }}>{g.away.name}</span>
          <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 24, color: 'rgba(255,255,255,0.45)', margin: '0 6px' }}>at</span>
          <TeamBadge team="home" size={46} />
          <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 35, letterSpacing: '-0.03em', color: C.white }}>{g.home.name}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ fontFamily: FH, fontWeight: 700, fontSize: 32, letterSpacing: '-0.01em', color: C.white, fontVariantNumeric: 'tabular-nums' }}>
          {sc.away} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>–</span> {sc.home}
        </div>
        <div style={{ fontFamily: FH, fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', color: p >= 1 && live ? C.brightGreen : 'rgba(255,255,255,0.85)', minWidth: 132, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{state}</div>
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
        {persp().name.toUpperCase()}-FAN EMOTIONAL ARC
      </div>
      {G.emotion.map((seg, i) => {
        const entry = fadeIn(t, 4.1 + i * 0.05, 0.4);
        const active = live && p >= seg.from && (p < seg.to || (p >= 1 && seg.to >= 1));
        const past = live && p >= seg.to && !(p >= 1 && seg.to >= 1);
        const pop = 1 + 0.04 * decay(t, tAt(seg.from), 3.5) * (live && p >= seg.from ? 1 : 0);
        const left = X(seg.from), width = Math.max(2, X(seg.to) - X(seg.from));
        const isFirst = i === 0, isLast = i === G.emotion.length - 1;
        const label = width < 45 ? '' : width < 108 ? seg.label.split(' ')[0] : seg.label;
        const base = {
          position: 'absolute', left, top: 172, width, height: 48,
          borderRadius: `${isFirst ? 6 : 0}px ${isLast ? 6 : 0}px ${isLast ? 6 : 0}px ${isFirst ? 6 : 0}px`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          fontFamily: FH, fontWeight: 400, fontSize: width < 130 ? 12 : 14.5, letterSpacing: '-0.01em', lineHeight: 1.1, padding: '0 6px', wordBreak: 'break-word',
          boxSizing: 'border-box', overflow: 'hidden',
          opacity: entry, transform: `scaleY(${pop}) translateY(${(1 - entry) * -10}px)`,
        };
        if (active) return <div key={i} style={{ ...base, background: seg.color, color: C.navy, boxShadow: `0 0 26px ${seg.color}55`, zIndex: 2 }}>{label}</div>;
        if (past) return <div key={i} style={{ ...base, background: seg.color, color: C.navy, opacity: entry * 0.32 }}>{label}</div>;
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
  const perspName = persp().name.toUpperCase();
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <rect x={CH.x} y={CH.y} width={CH.w} height={CH.h} fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" rx="4" />
      <text x={CH.x} y={CH.y - 30} fontFamily={FB} fontSize="16" fontWeight="500" letterSpacing="2.5">
        <tspan fill="rgba(225,255,103,0.85)">{`WIN PROBABILITY — ${perspName}`}</tspan>
        <tspan fill="rgba(255,255,255,0.4)">{'  · VIA GENIUSIQ'}</tspan>
      </text>
      <line x1={CH.x} y1={Y(0.5)} x2={CH.x + CH.w} y2={Y(0.5)} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 7" />

      {/* quarter dividers — halftime reads stronger */}
      {G.periods.slice(1).map((q) => {
        const half = Math.abs(q.p0 - 0.5) < 0.001 || q.label === 'Q3';
        const pulse = decay(t, tAt(q.p0), 2.5);
        return (
          <line key={q.label} x1={X(q.p0)} y1={CH.y} x2={X(q.p0)} y2={CH.y + CH.h}
            stroke={`rgba(255,255,255,${(half ? 0.2 : 0.09) + pulse * 0.4})`} strokeWidth={(half ? 1.4 : 1) + pulse * 1.4} />
        );
      })}

      {/* lead changes */}
      {G.scoring.filter((s) => s.leadChange).map((s, i) => {
        if (p < s.p) return null;
        const pulse = decay(t, tAt(s.p), 1.6);
        return (
          <g key={`lc${i}`}>
            <line x1={X(s.p)} y1={CH.y} x2={X(s.p)} y2={CH.y + CH.h} stroke={`rgba(255,255,255,${0.16 + pulse * 0.4})`} strokeWidth="1" />
            <rect x={X(s.p) - 5} y={Y(0.5) - 5} width="10" height="10" transform={`rotate(45 ${X(s.p)} ${Y(0.5)})`} fill="none" stroke={C.white} strokeWidth="1.6" opacity={0.75} />
            <text x={X(s.p)} y={Y(0.5) - 18} textAnchor="middle" fill={C.white} fontFamily={FB} fontSize="13" fontWeight="500" letterSpacing="2" opacity={pulse * 1.6}>LEAD CHANGE</text>
          </g>
        );
      })}

      {/* scoring plays */}
      {G.scoring.map((s, i) => {
        if (p < s.p) return null;
        const tm = teamOf(s.team);
        const col = s.team === (G.game.perspective || 'home') ? C.brightGreen : C.coral;
        const pulse = decay(t, tAt(s.p), 2.2);
        return (
          <g key={i}>
            <line x1={X(s.p)} y1={CH.y} x2={X(s.p)} y2={CH.y + CH.h} stroke={col} strokeWidth={1 + pulse * 1.8} opacity={0.24 + pulse * 0.5} strokeDasharray="2 6" />
            <circle cx={X(s.p)} cy={CH.y - 12} r={4 + pulse * 3} fill={col} opacity={0.9} />
            <text x={X(s.p)} y={CH.y + CH.h + (i % 2 ? 78 : 58)} textAnchor="middle" fill={col} fontFamily={FB} fontSize="14" fontWeight="500" letterSpacing="1.4" opacity={0.85}>
              {`${tm.abbr} ${s.type}`}
            </text>
          </g>
        );
      })}

      {[[1, '1.0'], [0.5, '0.5'], [0, '0.0']].map(([v, l]) => (
        <text key={l} x={CH.x - 18} y={Y(v) + 7} textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily={FB} fontSize="20">{l}</text>
      ))}
      {G.periods.map((q) => (
        <text key={q.label} x={(X(q.p0) + X(q.p1)) / 2} y={CH.y + CH.h + 32} textAnchor="middle"
          fill={q.label === 'OT' ? 'rgba(225,255,103,0.8)' : 'rgba(255,255,255,0.5)'} fontFamily={FB} fontSize="19" letterSpacing="2">{q.label}</text>
      ))}
    </svg>
  );
}

function WinLine() {
  const t = useTime();
  const p = gameP(t);
  if (t < DRAW0) return null;
  const N = G.NPTS;
  const n = Math.max(1, Math.floor(p * (N - 1)));
  let d = `M ${X(0)} ${Y(G.pts[0])}`;
  for (let i = 1; i <= n; i++) d += ` L ${X(i / (N - 1)).toFixed(1)} ${Y(G.pts[i]).toFixed(1)}`;
  const tipX = X(p), tipY = Y(wpAt(p));
  if (p * (N - 1) > n) d += ` L ${tipX.toFixed(1)} ${tipY.toFixed(1)}`;
  const area = d + ` L ${tipX.toFixed(1)} ${Y(0)} L ${X(0)} ${Y(0)} Z`;
  const k = (t % 1.2) / 1.2;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <path d={area} fill="rgba(225,255,103,0.06)" />
      <path d={d} fill="none" stroke={C.brightGreen} strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" opacity="0.18" />
      <path d={d} fill="none" stroke={C.brightGreen} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
      {p < 1 && <circle cx={tipX} cy={tipY} r={9 + k * 18} fill="none" stroke={C.brightGreen} strokeWidth="2" opacity={(1 - k) * 0.55} />}
      <circle cx={tipX} cy={tipY} r="7" fill={C.brightGreen} />
      <g transform={`translate(${Math.min(tipX, CH.x + CH.w - 70)}, ${clamp(tipY - 26, CH.y + 14, CH.y + CH.h - 10)})`}>
        <text x="14" y="0" fill={C.brightGreen} fontFamily={FB} fontSize="21" fontWeight="500">{Math.round(wpAt(p) * 100)}%</text>
      </g>
    </svg>
  );
}

// ── Audience / creative delivery strip ───────────────────────────────────────
function AudienceCard({ a }) {
  const t = useTime();
  const p = gameP(t);
  const o = fadeIn(t, 4.8, 0.5);
  const state = p >= a.offP ? 'PAUSED' : p >= a.onP ? 'DELIVERING' : 'MONITORING';
  const tChange = tAt(p >= a.offP ? a.offP : a.onP);
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
      <TeamBadge team={a.team} size={46} />
      <Pulse size={11} dim={!isOn} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FB, fontSize: 14, fontWeight: 500, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.55)' }}>{a.label}</div>
        <div style={{ fontFamily: FB, fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.92)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.creative}</div>
      </div>
      <div style={{ fontFamily: FB, fontSize: 14.5, fontWeight: 500, letterSpacing: '0.14em', flexShrink: 0, color: isOn ? C.brightGreen : 'rgba(255,255,255,0.4)' }}>{state}</div>
    </div>
  );
}

function AudienceStrip() {
  return (
    <div style={{ position: 'absolute', left: CH.x, top: 246, width: CH.w, display: 'flex', gap: 36 }}>
      {G.audiences.map((a, i) => <AudienceCard key={i} a={a} />)}
    </div>
  );
}

function WinFlash() {
  const t = useTime();
  if (t < DRAW1) return null;
  const k = t - DRAW1;
  const flash = interpolate([0, 0.12, 0.8], [0, 0.4, 0])(k);
  return (
    <React.Fragment>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[0, 1, 2].map((i) => {
          const r = Math.max(0, (k - i * 0.14) * 700);
          const op = Math.max(0, 0.5 - (k - i * 0.14) * 0.45);
          return r > 0 ? <circle key={i} cx={X(1)} cy={Y(wpAt(1))} r={r} fill="none" stroke={C.brightGreen} strokeWidth="2.5" opacity={op} /> : null;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: C.brightGreen, opacity: flash, pointerEvents: 'none' }} />
    </React.Fragment>
  );
}

// ── Cards ────────────────────────────────────────────────────────────────────
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
        <span style={{ fontFamily: FH, fontWeight: big ? 700 : 400, fontSize: big ? 34 : 26, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{m.title}</span>
        {big && <TeamBadge team={m.team} size={46} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: isOn ? C.navy : C.coral }} />
        <span style={{ fontFamily: FB, fontSize: 14, fontWeight: 500, letterSpacing: '0.1em', opacity: isOn ? 0.78 : 0.72 }}>{m.status}</span>
      </div>
    </div>
  );
}

function EventCard({ ev, e }) {
  const accent = ev.team === (G.game.perspective || 'home') ? C.brightGreen : C.coral;
  return (
    <div style={{
      width: 340, borderRadius: 12, padding: '11px 14px',
      background: 'rgba(13,18,38,0.72)', border: '1px solid rgba(255,255,255,0.14)',
      borderLeft: `3px solid ${accent}`, backdropFilter: 'blur(4px)',
      transform: `scale(${0.7 + 0.3 * e})`, transformOrigin: 'center',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontFamily: FB, fontSize: 11.5, fontWeight: 500, letterSpacing: '0.14em', color: accent }}>
          {ev.type === 'TD' ? 'TOUCHDOWN' : ev.type === 'FG' ? 'FIELD GOAL' : ev.type}
        </span>
        <span style={{ fontFamily: FB, fontSize: 11.5, fontWeight: 500, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.5)' }}>{ev.clock}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <TeamBadge team={ev.team} size={26} />
        <span style={{ fontFamily: FH, fontWeight: 400, fontSize: 19, letterSpacing: '-0.01em', color: C.white, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.player}</span>
        <span style={{ fontFamily: FH, fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.75)', marginLeft: 'auto', flexShrink: 0, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{ev.away}–{ev.home}</span>
      </div>
      {ev.drive && (
        <div style={{ fontFamily: FB, fontSize: 12.5, fontWeight: 400, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.5)' }}>{ev.drive}</div>
      )}
    </div>
  );
}

// Connector geometry shared by both card layers
function connector(t, item, bw, bh, thin) {
  const s = camS(t), fx = camFX(t), fy = camFY(t);
  const tx = W / 2 - s * fx, ty = H / 2 - s * fy;
  const ax = clamp(tx + s * X(item.p), 40, W - 40);
  const ay = clamp(ty + s * Y(wpAt(item.p)), 40, H - 40);
  const cx = item.box.x + bw / 2, cy = item.box.y + bh / 2;
  const dx = ax - cx, dy = ay - cy;
  const kx = dx !== 0 ? (bw / 2) / Math.abs(dx) : Infinity;
  const ky = dy !== 0 ? (bh / 2) / Math.abs(dy) : Infinity;
  const k = Math.min(kx, ky, 1);
  const ex = cx + dx * k, ey = cy + dy * k;
  const lineP = clamp((t - item.t0 - 0.1) / 0.4, 0, 1);
  return { ax, ay, ex, ey, lx: ex + (ax - ex) * lineP, ly: ey + (ay - ey) * lineP, lineP };
}

function EventCallouts() {
  const t = useTime();
  const active = G.events.filter((ev) => t >= ev.t0 && t <= ev.t1);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {active.map((ev, i) => {
          const accent = ev.team === (G.game.perspective || 'home') ? C.brightGreen : C.coral;
          const g = connector(t, ev, 340, 96);
          const o = fadeIn(t, ev.t0, 0.3) * (ev.t1 < 90 ? 1 - fadeIn(t, ev.t1 - 0.35, 0.35) : 1);
          return (
            <g key={i} opacity={o * 0.7}>
              <line x1={g.ex} y1={g.ey} x2={g.lx} y2={g.ly} stroke={accent} strokeWidth="1" strokeDasharray="2 5" />
              {g.lineP >= 1 && <circle cx={g.ax} cy={g.ay} r="4.5" fill="none" stroke={accent} strokeWidth="1.5" />}
            </g>
          );
        })}
      </svg>
      {active.map((ev, i) => {
        const e = popIn(t, ev.t0, 0.5);
        const o = fadeIn(t, ev.t0, 0.3) * (ev.t1 < 90 ? 1 - fadeIn(t, ev.t1 - 0.35, 0.35) : 1);
        return <div key={i} style={{ position: 'absolute', left: ev.box.x, top: ev.box.y, opacity: o }}><EventCard ev={ev} e={e} /></div>;
      })}
    </div>
  );
}

function MomentCallouts() {
  const t = useTime();
  const active = G.moments.filter((m) => t >= m.t0 && t <= m.t1);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {active.map((m, i) => {
          const isOn = m.kind === 'on' || m.kind === 'win';
          const accent = isOn ? C.brightGreen : C.coral;
          const g = connector(t, m, m.big ? 470 : 372, m.big ? 150 : 128);
          const o = fadeIn(t, m.t0, 0.3) * (m.t1 < 90 ? 1 - fadeIn(t, m.t1 - 0.35, 0.35) : 1);
          return (
            <g key={i} opacity={o}>
              <line x1={g.ex} y1={g.ey} x2={g.lx} y2={g.ly} stroke={accent} strokeWidth="1.5" strokeDasharray="2 5" />
              {g.lineP >= 1 && <circle cx={g.ax} cy={g.ay} r="6" fill="none" stroke={accent} strokeWidth="2" />}
            </g>
          );
        })}
      </svg>
      {active.map((m, i) => {
        const e = popIn(t, m.t0, 0.5);
        const o = fadeIn(t, m.t0, 0.3) * (m.t1 < 90 ? 1 - fadeIn(t, m.t1 - 0.35, 0.35) : 1);
        return <div key={i} style={{ position: 'absolute', left: m.box.x, top: m.box.y, opacity: o }}><MomentCard m={m} e={e} /></div>;
      })}
    </div>
  );
}

// Biggest win-probability swing of the game — computed, never authored
function SwingCard() {
  const t = useTime();
  const t0 = DRAW1 + 1.5;
  if (t < t0 || !G.swing) return null;
  const e = popIn(t, t0, 0.55);
  const o = fadeIn(t, t0, 0.35);
  const s = G.swing;
  const pts = Math.round(Math.abs(s.delta) * 100);
  const tm = teamOf(s.play.team);
  return (
    <div style={{
      position: 'absolute', left: 110, top: 700, width: 470, borderRadius: 14, opacity: o,
      background: 'rgba(13,18,38,0.82)', border: '1px solid rgba(225,255,103,0.4)', backdropFilter: 'blur(4px)',
      padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 8,
      transform: `scale(${0.7 + 0.3 * e})`, transformOrigin: 'center', pointerEvents: 'none',
    }}>
      <div style={{ fontFamily: FB, fontSize: 13.5, fontWeight: 500, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.55)' }}>BIGGEST SWING OF THE GAME</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <span style={{ fontFamily: FH, fontWeight: 300, fontSize: 64, letterSpacing: '-0.04em', color: C.brightGreen, lineHeight: 1 }}>
          {s.delta >= 0 ? '+' : '−'}{pts}
        </span>
        <span style={{ fontFamily: FB, fontSize: 20, fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>win-probability points</span>
      </div>
      <div style={{ fontFamily: FB, fontSize: 17, fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
        {s.clock} · {tm.abbr} {s.play.type} — {s.play.player}
      </div>
    </div>
  );
}

function ChartScene() {
  const t = useTime();
  const o = fadeIn(t, 3.9, 0.6) * (1 - fadeIn(t, 30.7, 0.9));
  const s = camS(t), fx = camFX(t), fy = camFY(t);
  const tx = W / 2 - s * fx, ty = H / 2 - s * fy;
  return (
    <Sprite start={3.8} end={31.9}>
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
        <SwingCard />
        <img src="assets/logos/GENIUS_SPORTS_HORIZONTAL_WHITE_RGB.svg" alt="Genius Sports"
          style={{ position: 'absolute', right: 56, bottom: 26, height: 26, opacity: 0.55 }} />
      </div>
    </Sprite>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3 — END CARD
// ─────────────────────────────────────────────────────────────────────────────
function EndScene() {
  const t = useTime();
  const o = fadeIn(t, 30.9, 0.8) * (1 - fadeIn(t, 33.8, 1.1));
  const h1o = fadeIn(t, 31.3, 0.7), subo = fadeIn(t, 31.8, 0.7), logoo = fadeIn(t, 32.4, 0.7);
  const g = G.game;
  return (
    <Sprite start={30.7} end={35}>
      <div style={{ position: 'absolute', inset: 0, opacity: o }}>
        <Spring x={140} y={140} t0={31.2} flip={true} opacity={0.85} />
        <Spring x={1640} y={740} t0={31.4} opacity={0.85} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 38, textAlign: 'center' }}>
          <GMTitle t0={31.1} />
          <div style={{ fontFamily: FH, fontWeight: 300, fontSize: 68, letterSpacing: '-0.03em', lineHeight: 1.05, color: C.white, opacity: h1o, transform: `translateY(${(1 - h1o) * 26}px)`, maxWidth: 1500 }}>
            {g.end.headline}
          </div>
          <div style={{ fontFamily: FB, fontSize: 32, fontWeight: 400, color: 'rgba(255,255,255,0.72)', letterSpacing: '-0.01em', maxWidth: 980, opacity: subo, transform: `translateY(${(1 - subo) * 18}px)` }}>
            {g.end.sub}
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
function NFLMomentsFilm() {
  syncGameData();
  return (
    <Stage width={W} height={H} duration={DUR} background={C.navy} persistKey="nfl-moments" loop={true}>
      <IntroScene />
      <ChartScene />
      <EndScene />
      <ScreenLabel />
      <ExposeControl />
    </Stage>
  );
}
window.NFLMomentsFilm = NFLMomentsFilm;
