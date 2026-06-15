import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

/* ════════════════════════════════════════════════════════════════════
   HoverZoomImage — the generic "explore a real image up close" figure
   body, shared by every hover-zoomable photo/data-map (1.4.c Planck CMB,
   2.1.b Milky Way panorama, …). It renders the `.fig-viz` image plus the
   zoom controls and keyboard hooks; the parent wraps it in its own
   FigurePanel (which supplies the caption) and marks that panel
   `is-img-zoom` so the fullscreen caption stays compact and the image
   dominates the screen.

   Design:
     • Opt-in. Default OFF → a clean, undisturbed image. A "Zoom in" pill
       (or the `z` key, or any arrow key) switches it on.
     • Non-obstructing loupe. Instead of a lens over the cursor, a glowing
       marker sits at the sample point and TWO lines trace a cone from it
       to an enlarged inset pinned in the bottom corner OPPOSITE the
       cursor — so the inset never covers what you're pointing at (nor the
       top-right fullscreen button), and the cone shows exactly where the
       enlargement comes from.
     • Keyboard: `z` toggles; ←/→/↑/↓ pan the sample point (and switch
       zoom on). Mouse hover overrides the keyboard point.
   ════════════════════════════════════════════════════════════════════ */

const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ACCENT = "rgb(var(--c-accent-rgb))";

/* Tracks `.is-fs` on the enclosing FigureFrame so fixed-px text/controls can
   scale up in fullscreen (shared MutationObserver pattern). */
function useFs(ref: { current: Element | null }) {
  const [fs, setFs] = useState(false);
  useEffect(() => {
    const frame = ref.current?.closest("[data-figure-frame]");
    if (!frame) return;
    const sync = () => setFs(frame.classList.contains("is-fs"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(frame, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return fs;
}

export function HoverZoomImage({
  src,
  alt,
  zoom = 2.6,
  initialFocus = { x: 0.5, y: 0.5 },
  hintOff = "explore the image up close",
  footer,
}: {
  src: string;
  alt: string;
  zoom?: number;
  initialFocus?: { x: number; y: number };
  /** Short prompt shown beside the toggle when zoom is off. */
  hintOff?: string;
  /** Optional compact content rendered below the controls (e.g. a colour
      scale), given the current fullscreen flag + scale helper. */
  footer?: (fs: boolean, sz: (r: number) => string | undefined) => ReactNode;
}): JSX.Element {
  const [on, setOn] = useState(false);
  const [hover, setHover] = useState<{ fx: number; fy: number } | null>(null);
  const [focus, setFocus] = useState(initialFocus); // keyboard-controlled point
  const [box, setBox] = useState({ w: 0, h: 0, ox: 0, oy: 0 });
  const vizRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  /* Measure the IMAGE's rendered box + its offset inside the wrapper, so the
     overlay stays aligned whether the image is width- or height-limited. */
  const measure = () => {
    const img = imgRef.current;
    if (img) setBox({ w: img.clientWidth, h: img.clientHeight, ox: img.offsetLeft, oy: img.offsetTop });
  };
  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    ro.observe(img);
    if (!img.complete) img.addEventListener("load", measure, { once: true });
    return () => ro.disconnect();
  }, []);
  useEffect(measure, [fs]); // the fullscreen relayout changes the image box

  const pan = (dx: -1 | 0 | 1, dy: -1 | 0 | 1) => {
    setOn(true);
    setHover(null);
    setFocus((f) => ({ x: clamp01(f.x + dx * 0.07), y: clamp01(f.y + dy * 0.07) }));
  };
  const onMove = (e: ReactMouseEvent) => {
    if (!on) return;
    const img = imgRef.current;
    if (!img) return;
    const r = img.getBoundingClientRect();
    setHover({ fx: clamp01((e.clientX - r.left) / r.width), fy: clamp01((e.clientY - r.top) / r.height) });
  };

  const { w, h, ox, oy } = box;
  const pf = hover ?? { fx: focus.x, fy: focus.y };
  const px = pf.fx * w;
  const py = pf.fy * h;

  /* Inset geometry — a tidy landscape loupe pinned to the BOTTOM corner
     horizontally opposite the cursor (so it never covers the point or the
     top-right exit button). Sized from the image HEIGHT (with a width cap)
     so it stays proportionate whatever the image's aspect ratio. */
  const M = fs ? 18 : 10;
  let IH = Math.round((fs ? 0.42 : 0.44) * h);
  let IW = Math.round(IH * 1.5);
  const maxIW = Math.round((fs ? 0.34 : 0.4) * w);
  if (IW > maxIW) { IW = maxIW; IH = Math.round(IW / 1.5); }
  IW = Math.min(IW, Math.max(40, w - 2 * M));
  IH = Math.min(IH, Math.max(30, h - 2 * M));
  const insetRight = px < w / 2;
  const ix0 = insetRight ? w - IW - M : M;
  const iy0 = h - IH - M;

  /* Zoomed background, clamped so the inset always shows in-image content. */
  const bgW = w * zoom;
  const bgH = h * zoom;
  const bgX = Math.max(0, Math.min(px * zoom - IW / 2, bgW - IW));
  const bgY = Math.max(0, Math.min(py * zoom - IH / 2, bgH - IH));

  /* The two cone borders run from the marker to the inset's two silhouette
     corners (the extreme angles as seen from the point), so the whole inset
     sits between the lines whatever the geometry. */
  const corners: [number, number][] = [
    [ix0, iy0], [ix0 + IW, iy0], [ix0, iy0 + IH], [ix0 + IW, iy0 + IH],
  ];
  const baseA = Math.atan2(iy0 + IH / 2 - py, ix0 + IW / 2 - px);
  let minA = Infinity, maxA = -Infinity, cMin = corners[0], cMax = corners[0];
  for (const c of corners) {
    let a = Math.atan2(c[1] - py, c[0] - px) - baseA;
    a = Math.atan2(Math.sin(a), Math.cos(a));
    if (a < minA) { minA = a; cMin = c; }
    if (a > maxA) { maxA = a; cMax = c; }
  }

  const show = on && w > 0;

  return (
    <>
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md flex items-center justify-center">
        <div
          ref={wrapRef}
          className="relative flex items-center justify-center"
          style={{ width: "100%", height: fs ? "100%" : "auto", lineHeight: 0, cursor: on ? "crosshair" : "default" }}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            decoding="async"
            style={{
              display: "block",
              width: fs ? "auto" : "100%",
              height: "auto",
              maxWidth: "100%",
              maxHeight: fs ? "100%" : undefined,
              objectFit: "contain",
              borderRadius: 6,
              border: "1px solid var(--c-border)",
            }}
          />
          {show && (
            <>
              {/* cone borders + sample marker */}
              <svg
                width={w}
                height={h}
                viewBox={`0 0 ${w} ${h}`}
                aria-hidden="true"
                style={{ position: "absolute", left: ox, top: oy, width: w, height: h, maxWidth: "none", maxHeight: "none", overflow: "visible", pointerEvents: "none" }}
              >
                <line x1={px} y1={py} x2={cMin[0]} y2={cMin[1]} stroke={ACCENT} strokeWidth={fs ? 2 : 1.3} opacity={0.7} />
                <line x1={px} y1={py} x2={cMax[0]} y2={cMax[1]} stroke={ACCENT} strokeWidth={fs ? 2 : 1.3} opacity={0.7} />
                <circle cx={px} cy={py} r={fs ? 10 : 7} fill="none" stroke={ACCENT} strokeWidth={fs ? 2.4 : 1.7} style={{ filter: `drop-shadow(0 0 5px ${ACCENT})` }} />
                <circle cx={px} cy={py} r={fs ? 2.6 : 1.9} fill={ACCENT} />
              </svg>
              {/* enlarged inset, pinned to the opposite bottom corner */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: ox + ix0,
                  top: oy + iy0,
                  width: IW,
                  height: IH,
                  borderRadius: 10,
                  backgroundImage: `url(${src})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: `${bgW}px ${bgH}px`,
                  backgroundPosition: `${-bgX}px ${-bgY}px`,
                  border: `2px solid ${ACCENT}`,
                  boxShadow: "0 10px 30px rgb(0 0 0 / 0.55)",
                  pointerEvents: "none",
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Controls — compact row: the opt-in toggle + a one-line hint. */}
      <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 mt-3" style={{ flexShrink: 0 }}>
        <button
          type="button"
          data-shortcut="z"
          aria-pressed={on}
          onClick={() => { setOn((v) => !v); setHover(null); }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontFamily: "var(--font-mono)", fontSize: sz(0.62) ?? "10px",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: on ? "rgb(var(--c-bg-rgb))" : ACCENT,
            background: on ? ACCENT : "rgb(var(--c-accent-rgb) / 0.08)",
            border: `1px solid rgb(var(--c-accent-rgb) / ${on ? 1 : 0.4})`,
            borderRadius: 9999, padding: "5px 14px", cursor: "pointer",
            transition: "background 180ms var(--ease), color 180ms var(--ease)",
          }}
        >
          <span aria-hidden style={{ fontSize: "1.15em", lineHeight: 1 }}>{on ? "✕" : "⊕"}</span>
          {on ? "Exit zoom" : "Zoom in"}
        </button>
        <span className="font-mono uppercase" style={{ fontSize: sz(0.56) ?? "9px", letterSpacing: "0.16em", color: "rgb(var(--c-text-rgb) / 0.45)" }}>
          {on ? "hover the image · arrow keys pan" : hintOff}
        </span>
      </div>

      {footer && footer(fs, sz)}

      {/* Keyboard hooks — FigureFrame fires these via .click(); the four
          arrows pan the sample point (and switch zoom on). */}
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => pan(-1, 0)} style={srOnly}>pan left</button>
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => pan(1, 0)} style={srOnly}>pan right</button>
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowUp" onClick={() => pan(0, -1)} style={srOnly}>pan up</button>
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowDown" onClick={() => pan(0, 1)} style={srOnly}>pan down</button>
    </>
  );
}
