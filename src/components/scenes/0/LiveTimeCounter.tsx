import { useEffect, useRef, useState } from "react";

const REDUCED = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* "13,800,251,094 yr since the big bang" — ticks once per second.
   The just-changed trailing digit flashes plasma for 220 ms.
   Fades out once the hero scrolls out of view. */
export default function LiveTimeCounter() {
  const START_BASE = 13_800_251_094;
  const [n, setN] = useState(START_BASE);
  const [visible, setVisible] = useState(true);
  const prevDigitsRef = useRef<string | null>(null);

  useEffect(() => {
    if (REDUCED()) return;
    const id = window.setInterval(() => setN((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const hero = document.querySelector('[data-screen-label="01 Hero"]');
    if (!hero || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setVisible(e.isIntersecting)),
      { threshold: 0 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const formatted = n.toLocaleString("en-US");
  const prev = prevDigitsRef.current;
  prevDigitsRef.current = formatted;

  let changedFrom = formatted.length;
  if (prev && prev.length === formatted.length) {
    for (let i = 0; i < formatted.length; i++) {
      if (formatted[i] !== prev[i]) {
        changedFrom = i;
        break;
      }
    }
  }

  return (
    <div
      className="live-counter font-mono text-[10px] tracking-[0.22em] uppercase text-white/35"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 600ms var(--ease)",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <span className="inline-flex items-baseline">
        {formatted.split("").map((ch, i) => (
          <span key={i} className={i >= changedFrom && /\d/.test(ch) ? "flash" : ""}>
            {ch}
          </span>
        ))}
      </span>
      <span className="ml-2 text-white/30">yr since the big bang</span>
    </div>
  );
}
