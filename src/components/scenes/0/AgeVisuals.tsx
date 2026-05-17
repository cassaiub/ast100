import { useMemo, type FC } from "react";
import { mulberry32 } from "../../../data/chapter-0-events";

interface OnProp {
  on: boolean;
}

/* Hot particle soup — radial bursts + flecks */
export const AgeVisualParticle: FC<OnProp> = ({ on }) => {
  const dots = useMemo(() => {
    const arr: { x: number; y: number; r: number; c: string }[] = [];
    const rng = mulberry32(11);
    for (let i = 0; i < 110; i++) {
      arr.push({
        x: rng() * 320 + 20,
        y: rng() * 320 + 20,
        r: 0.5 + rng() * 1.6,
        c: rng() < 0.6 ? "#fde68a" : rng() < 0.5 ? "#f97316" : "#fef9c3",
      });
    }
    return arr;
  }, []);
  return (
    <svg viewBox="0 0 360 360" className={`age-visual ${on ? "in" : ""}`}>
      <defs>
        <radialGradient id="pa-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#fde68a" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="180" cy="180" r="170" fill="url(#pa-core)" />
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill={d.c}
          opacity={0.55 + (d.r / 2) * 0.4}
        />
      ))}
      <g stroke="#fde68a" strokeOpacity="0.18" fill="none">
        <circle cx="180" cy="180" r="80" />
        <circle cx="180" cy="180" r="120" />
        <circle cx="180" cy="180" r="150" />
      </g>
    </svg>
  );
};

export const AgeVisualGalactic: FC<OnProp> = ({ on }) => {
  const blobs = useMemo(() => {
    const arr: { x: number; y: number; r: number }[] = [];
    const rng = mulberry32(22);
    for (let i = 0; i < 28; i++) {
      arr.push({ x: rng() * 320 + 20, y: rng() * 320 + 20, r: 1.5 + rng() * 5 });
    }
    return arr;
  }, []);
  return (
    <svg viewBox="0 0 360 360" className={`age-visual ${on ? "in" : ""}`}>
      <defs>
        <radialGradient id="g-haze" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="360" height="360" fill="transparent" />
      <circle cx="180" cy="180" r="170" fill="url(#g-haze)" />
      <g stroke="rgba(165,243,252,0.32)" strokeWidth="0.6" fill="none">
        <path d="M 30 80 C 110 120, 200 140, 320 70" />
        <path d="M 40 200 C 120 180, 230 230, 340 180" />
        <path d="M 30 300 C 110 280, 220 310, 330 290" />
        <path d="M 90 30 C 130 110, 150 200, 110 330" />
        <path d="M 250 20 C 230 110, 270 200, 240 340" />
      </g>
      <g transform="translate(180 180) rotate(20)" fill="none" stroke="#a5f3fc" strokeOpacity="0.55">
        <ellipse rx="44" ry="14" />
        <ellipse rx="62" ry="20" strokeOpacity="0.25" />
        <ellipse rx="80" ry="26" strokeOpacity="0.12" />
      </g>
      {blobs.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#a5f3fc" opacity={0.65 - b.r * 0.04} />
      ))}
    </svg>
  );
};

export const AgeVisualStellar: FC<OnProp> = ({ on }) => {
  const stars = useMemo(() => {
    const arr: { x: number; y: number; r: number }[] = [];
    const rng = mulberry32(33);
    for (let i = 0; i < 90; i++) {
      arr.push({ x: rng() * 340 + 10, y: rng() * 340 + 10, r: 0.4 + rng() * 1.9 });
    }
    return arr;
  }, []);
  return (
    <svg viewBox="0 0 360 360" className={`age-visual ${on ? "in" : ""}`}>
      <defs>
        <radialGradient id="s-burst" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#fde68a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s-cluster" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="180" cy="180" r="170" fill="url(#s-cluster)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.55 + s.r * 0.18} />
      ))}
      <circle cx="240" cy="120" r="40" fill="url(#s-burst)" />
      <g stroke="#fde68a" strokeOpacity="0.5" strokeWidth="0.6">
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 10;
          return (
            <line
              key={i}
              x1={240}
              y1={120}
              x2={240 + Math.cos(a) * 30}
              y2={120 + Math.sin(a) * 30}
            />
          );
        })}
      </g>
    </svg>
  );
};

export const AgeVisualPlanetary: FC<OnProp> = ({ on }) => (
  <svg viewBox="0 0 360 360" className={`age-visual ${on ? "in" : ""}`}>
    <defs>
      <radialGradient id="pl-sun" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef9c3" />
        <stop offset="40%" stopColor="#fde68a" />
        <stop offset="80%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="pl-aura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="180" cy="180" r="170" fill="url(#pl-aura)" opacity="0.45" />
    <circle cx="180" cy="180" r="22" fill="url(#pl-sun)" />
    <g fill="none" stroke="#fde68a" strokeOpacity="0.18">
      <ellipse cx="180" cy="180" rx="55" ry="14" />
      <ellipse cx="180" cy="180" rx="88" ry="22" />
      <ellipse cx="180" cy="180" rx="120" ry="30" />
      <ellipse cx="180" cy="180" rx="158" ry="40" />
    </g>
    <circle cx="180" cy="180" r="2.4" fill="#fde68a" transform="translate(-55,0)" />
    <circle cx="180" cy="180" r="3.5" fill="#a5f3fc" transform="translate(0,22)" />
    <circle cx="180" cy="180" r="5" fill="#67e8f9" transform="translate(120,-3)" />
    <circle cx="180" cy="180" r="6" fill="#f59e0b" transform="translate(-158,0)" />
    <g>
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 36;
        const r = 142 + Math.sin(i) * 8;
        return (
          <circle
            key={i}
            cx={180 + Math.cos(a) * r}
            cy={180 + Math.sin(a) * r * 0.27}
            r="0.6"
            fill="rgba(253,230,138,0.55)"
          />
        );
      })}
    </g>
  </svg>
);

export const AgeVisualChemical: FC<OnProp> = ({ on }) => {
  const nodes = useMemo(() => {
    const arr: { x: number; y: number; k: number }[] = [];
    const rng = mulberry32(44);
    for (let i = 0; i < 14; i++) {
      arr.push({ x: rng() * 280 + 40, y: rng() * 280 + 40, k: rng() });
    }
    return arr;
  }, []);
  return (
    <svg viewBox="0 0 360 360" className={`age-visual ${on ? "in" : ""}`}>
      <defs>
        <radialGradient id="c-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="180" cy="180" r="170" fill="url(#c-glow)" />
      <g stroke="rgba(196,181,253,0.45)" strokeWidth="0.8">
        {nodes.map((n, i) => {
          const m = nodes[(i + 1) % nodes.length];
          return <line key={`b1-${i}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} />;
        })}
        {nodes.map((n, i) => {
          const m = nodes[(i + 3) % nodes.length];
          return (
            <line key={`b2-${i}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} opacity="0.5" />
          );
        })}
      </g>
      {nodes.map((n, i) => (
        <g key={i}>
          <circle
            cx={n.x}
            cy={n.y}
            r="6"
            fill={n.k > 0.7 ? "#fde68a" : n.k > 0.4 ? "#a5f3fc" : "#c4b5fd"}
            opacity="0.9"
          />
          <circle
            cx={n.x}
            cy={n.y}
            r="14"
            fill={n.k > 0.7 ? "#fde68a" : n.k > 0.4 ? "#a5f3fc" : "#c4b5fd"}
            opacity="0.12"
          />
        </g>
      ))}
    </svg>
  );
};

export const AgeVisualBiological: FC<OnProp> = ({ on }) => {
  const points = useMemo(() => {
    const arr: { y: number; xL: number; xR: number }[] = [];
    for (let i = 0; i < 28; i++) {
      const t = i / 28;
      const y = 30 + t * 300;
      const xL = 180 + Math.sin(t * Math.PI * 4) * 60;
      const xR = 180 + Math.sin(t * Math.PI * 4 + Math.PI) * 60;
      arr.push({ y, xL, xR });
    }
    return arr;
  }, []);
  return (
    <svg viewBox="0 0 360 360" className={`age-visual ${on ? "in" : ""}`}>
      <defs>
        <radialGradient id="b-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="180" cy="180" r="170" fill="url(#b-glow)" />
      <path
        d={"M " + points.map((p) => `${p.xL.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")}
        fill="none"
        stroke="#67e8f9"
        strokeOpacity="0.55"
        strokeWidth="1.2"
      />
      <path
        d={"M " + points.map((p) => `${p.xR.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")}
        fill="none"
        stroke="#34d399"
        strokeOpacity="0.6"
        strokeWidth="1.2"
      />
      {points.map((p, i) => (
        <g key={i}>
          <line
            x1={p.xL}
            y1={p.y}
            x2={p.xR}
            y2={p.y}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="0.7"
          />
          <circle cx={p.xL} cy={p.y} r="2" fill="#67e8f9" opacity="0.85" />
          <circle cx={p.xR} cy={p.y} r="2" fill="#34d399" opacity="0.85" />
        </g>
      ))}
    </svg>
  );
};

export const AgeVisualCultural: FC<OnProp> = ({ on }) => (
  <svg viewBox="0 0 360 360" className={`age-visual ${on ? "in" : ""}`}>
    <defs>
      <radialGradient id="cu-earth" cx="35%" cy="40%" r="65%">
        <stop offset="0%" stopColor="#bae6fd" />
        <stop offset="50%" stopColor="#38bdf8" />
        <stop offset="85%" stopColor="#0c4a6e" />
        <stop offset="100%" stopColor="#082f49" />
      </radialGradient>
      <radialGradient id="cu-aurora" cx="50%" cy="50%" r="50%">
        <stop offset="40%" stopColor="#34d399" stopOpacity="0" />
        <stop offset="65%" stopColor="#34d399" stopOpacity="0.18" />
        <stop offset="85%" stopColor="#22d3ee" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="cu-sun" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="60" cy="50" r="30" fill="url(#cu-sun)" />
    <circle cx="200" cy="200" r="120" fill="url(#cu-aurora)" />
    <circle cx="200" cy="200" r="58" fill="url(#cu-earth)" />
    <path d="M 200 142 A 58 58 0 0 1 200 258" fill="rgba(0,0,0,0.32)" />
    <g fill="#fde68a">
      <circle cx="178" cy="180" r="0.9" opacity="0.9" />
      <circle cx="183" cy="192" r="0.8" opacity="0.9" />
      <circle cx="172" cy="200" r="0.7" opacity="0.8" />
      <circle cx="190" cy="212" r="0.9" opacity="0.85" />
      <circle cx="166" cy="216" r="0.7" opacity="0.75" />
    </g>
    <text
      x="200"
      y="340"
      textAnchor="middle"
      fill="rgba(255,255,255,0.32)"
      fontSize="9"
      fontFamily="ui-monospace, 'JetBrains Mono', monospace"
      letterSpacing="3"
    >
      PALE BLUE DOT · TODAY
    </text>
  </svg>
);

export const AGE_VISUALS: FC<OnProp>[] = [
  AgeVisualParticle,
  AgeVisualGalactic,
  AgeVisualStellar,
  AgeVisualPlanetary,
  AgeVisualChemical,
  AgeVisualBiological,
  AgeVisualCultural,
];
