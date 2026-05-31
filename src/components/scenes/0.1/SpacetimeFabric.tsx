import { useEffect, useRef, useState } from "react";

/* SVG rubber-sheet grid that warps around a draggable mass.
   Three test particles orbit per inverse-square gravity, rendered in warped space. */
export default function SpacetimeFabric() {
  const VB_W = 880;
  const VB_H = 520;
  const COLS = 26;
  const ROWS = 16;
  const STEP_X = VB_W / (COLS - 1);
  const STEP_Y = VB_H / (ROWS - 1);

  const STRENGTH = 0.62;
  const WELL_R = 165;
  const G_CONST = 9500;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const gridRef = useRef<SVGPathElement | null>(null);
  const massGRef = useRef<SVGGElement | null>(null);
  const auraRef = useRef<SVGGElement | null>(null);
  const glowRef = useRef<SVGCircleElement | null>(null);
  const particleEls = useRef<(SVGCircleElement | null)[]>([]);
  const trailEls = useRef<(SVGPathElement | null)[]>([]);

  const massRef = useRef({ x: VB_W / 2, y: VB_H / 2 });

  type Particle = { x: number; y: number; vx: number; vy: number; trail: [number, number][] };
  const seedParticles = (): Particle[] => [
    { x: VB_W / 2 + 210, y: VB_H / 2, vx: 0.0, vy: 1.05, trail: [] },
    { x: VB_W / 2 - 260, y: VB_H / 2 + 40, vx: 0.05, vy: -0.95, trail: [] },
    { x: VB_W / 2 + 40, y: VB_H / 2 - 180, vx: 1.1, vy: 0.05, trail: [] },
  ];
  const particlesRef = useRef<Particle[]>(seedParticles());

  function warp(x: number, y: number, m: { x: number; y: number }): [number, number] {
    const dx = m.x - x;
    const dy = m.y - y;
    const d2 = dx * dx + dy * dy;
    const pull = STRENGTH / (1 + d2 / (WELL_R * WELL_R));
    const k = pull < 0.92 ? pull : 0.92;
    return [x + dx * k, y + dy * k];
  }

  function buildGridPath(m: { x: number; y: number }): string {
    let d = "";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const [px, py] = warp(c * STEP_X, r * STEP_Y, m);
        d += (c === 0 ? "M" : "L") + px.toFixed(2) + " " + py.toFixed(2) + " ";
      }
    }
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const [px, py] = warp(c * STEP_X, r * STEP_Y, m);
        d += (r === 0 ? "M" : "L") + px.toFixed(2) + " " + py.toFixed(2) + " ";
      }
    }
    return d;
  }

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function updateMassVisual() {
      const m = massRef.current;
      const t = `translate(${m.x.toFixed(2)} ${m.y.toFixed(2)})`;
      massGRef.current?.setAttribute("transform", t);
      auraRef.current?.setAttribute("transform", t);
      glowRef.current?.setAttribute("transform", t);
    }
    function updateGrid() {
      gridRef.current?.setAttribute("d", buildGridPath(massRef.current));
    }
    function updateParticles() {
      const m = massRef.current;
      const ps = particlesRef.current;
      const dt = 1 / 60;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        if (!reduced) {
          const dx = m.x - p.x;
          const dy = m.y - p.y;
          const d2 = Math.max(dx * dx + dy * dy, 900);
          const dInv = 1 / Math.sqrt(d2);
          const a = G_CONST / d2;
          p.vx += dx * dInv * a * dt;
          p.vy += dy * dInv * a * dt;
          p.vx *= 0.9998;
          p.vy *= 0.9998;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 8) {
            p.x = 8;
            p.vx = Math.abs(p.vx) * 0.85;
          }
          if (p.x > VB_W - 8) {
            p.x = VB_W - 8;
            p.vx = -Math.abs(p.vx) * 0.85;
          }
          if (p.y < 8) {
            p.y = 8;
            p.vy = Math.abs(p.vy) * 0.85;
          }
          if (p.y > VB_H - 8) {
            p.y = VB_H - 8;
            p.vy = -Math.abs(p.vy) * 0.85;
          }
          p.trail.push([p.x, p.y]);
          if (p.trail.length > 70) p.trail.shift();
        }

        const [wx, wy] = warp(p.x, p.y, m);
        const el = particleEls.current[i];
        if (el) {
          el.setAttribute("cx", wx.toFixed(2));
          el.setAttribute("cy", wy.toFixed(2));
        }
        const tel = trailEls.current[i];
        if (tel) {
          const tr = p.trail;
          let d = "";
          for (let j = 0; j < tr.length; j++) {
            const [tx, ty] = warp(tr[j][0], tr[j][1], m);
            d += (j === 0 ? "M" : "L") + tx.toFixed(2) + " " + ty.toFixed(2) + " ";
          }
          tel.setAttribute("d", d);
        }
      }
    }

    let raf = 0;
    function loop() {
      updateMassVisual();
      updateGrid();
      updateParticles();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const [hint, setHint] = useState(true);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let dragging = false;
    function svgPoint(clientX: number, clientY: number) {
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * VB_W,
        y: ((clientY - rect.top) / rect.height) * VB_H,
      };
    }
    function setMassTo(clientX: number, clientY: number) {
      const p = svgPoint(clientX, clientY);
      massRef.current.x = Math.max(40, Math.min(VB_W - 40, p.x));
      massRef.current.y = Math.max(40, Math.min(VB_H - 40, p.y));
    }
    const onDown = (e: MouseEvent | TouchEvent) => {
      dragging = true;
      setHint(false);
      const t = (e as TouchEvent).touches
        ? (e as TouchEvent).touches[0]
        : (e as MouseEvent);
      setMassTo(t.clientX, t.clientY);
      e.preventDefault();
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const t = (e as TouchEvent).touches
        ? (e as TouchEvent).touches[0]
        : (e as MouseEvent);
      setMassTo(t.clientX, t.clientY);
      e.preventDefault();
    };
    const onUp = () => {
      dragging = false;
    };

    svg.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    svg.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    return () => {
      svg.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      svg.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  function reset() {
    massRef.current = { x: VB_W / 2, y: VB_H / 2 };
    particlesRef.current = seedParticles();
    setHint(true);
  }

  return (
    <div data-theme="dark" className="fig-viz relative rounded-xl overflow-hidden border border-white/[0.06] bg-black/40">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="block w-full h-auto cursor-grab active:cursor-grabbing select-none"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Interactive: drag the mass to warp the spacetime grid"
      >
        <defs>
          <radialGradient id="fabric-bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0b1224" />
            <stop offset="100%" stopColor="#05060c" />
          </radialGradient>
          <radialGradient id="fabric-well" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#22d3ee" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fabric-mass" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="75%" stopColor="#7c2d12" />
            <stop offset="100%" stopColor="#1a0b2e" />
          </radialGradient>
          <radialGradient id="fabric-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <filter id="fabric-blur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        <rect width={VB_W} height={VB_H} fill="url(#fabric-bg)" />

        <circle ref={glowRef} cx="0" cy="0" r={WELL_R * 1.7} fill="url(#fabric-well)" />

        <path
          ref={gridRef}
          stroke="#22d3ee"
          strokeOpacity="0.34"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />

        {[0, 1, 2].map((i) => (
          <path
            key={`trail-${i}`}
            ref={(el) => {
              trailEls.current[i] = el;
            }}
            fill="none"
            stroke="#f59e0b"
            strokeOpacity="0.5"
            strokeWidth="1"
            strokeLinecap="round"
          />
        ))}

        {[0, 1, 2].map((i) => (
          <circle
            key={`p-${i}`}
            ref={(el) => {
              particleEls.current[i] = el;
            }}
            r="3.5"
            fill="#fde68a"
            stroke="#f59e0b"
            strokeWidth="0.8"
          />
        ))}

        <g ref={auraRef}>
          <circle className="mass-aura" cx="0" cy="0" r="58" fill="url(#fabric-aura)" />
        </g>

        <g ref={massGRef}>
          <circle cx="0" cy="0" r="22" fill="url(#fabric-mass)" />
          <circle
            cx="-6"
            cy="-7"
            r="5"
            fill="#fff7d6"
            opacity="0.5"
            filter="url(#fabric-blur)"
          />
        </g>
      </svg>

      <div className="absolute top-3 left-4 right-4 flex items-center justify-between gap-3 pointer-events-none">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/45">
          Interactive · rubber-sheet
        </div>
        <div
          className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma/80 transition-opacity duration-500"
          style={{ opacity: hint ? 1 : 0 }}
        >
          ◐ drag anywhere
        </div>
      </div>

      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/45 pointer-events-none">
          <span className="inline-block w-2 h-2 rounded-full bg-solar shadow-[0_0_8px_#f59e0b] mr-2 align-middle"></span>
          test particles trace the curved space
        </div>
        <button
          onClick={reset}
          className="pill rounded-full px-3 py-1 text-[11px] font-mono tracking-[0.18em] uppercase pointer-events-auto"
          type="button"
        >
          reset
        </button>
      </div>
    </div>
  );
}
