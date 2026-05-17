import { useEffect, useRef } from "react";

interface Props {
  density?: number;
}

type Mote = {
  x: number;
  y: number;
  r: number;
  z: number;
  tw: number;
  twSpeed: number;
  tint: number;
};

type Dust = { x: number; y: number; life: number; max: number };

type Theme = "dark" | "light";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

export default function Starfield({ density = 400 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasTouch = "ontouchstart" in window;
    const allowFx = !hasTouch && !reduced;

    let theme: Theme = readTheme();
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let motes: Mote[] = [];
    let mx = 0;
    let my = 0;
    let tMx = 0;
    let tMy = 0;

    let cx = -9999;
    let cy = -9999;
    let pcx = -9999;
    let pcy = -9999;
    let lastEmit = 0;
    const dust: Dust[] = [];
    const DUST_CAP = 30;
    const LENS_R = 80;
    const LENS_R2 = LENS_R * LENS_R;

    function seed() {
      motes = [];
      /* Light theme has fewer, larger, slower motes — daylight dust is
         softer than night stars. */
      const factor = theme === "light" ? 0.55 : 1;
      const count = Math.round(
        density * factor * Math.min(1.4, (w * h) / (1280 * 800))
      );
      for (let i = 0; i < count; i++) {
        const z = Math.random();
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r:
            theme === "light"
              ? 0.6 + Math.random() * 1.4 + z * 0.7
              : 0.25 + Math.random() * 0.95 + z * 0.4,
          z,
          tw: Math.random() * Math.PI * 2,
          twSpeed:
            theme === "light"
              ? 0.18 + Math.random() * 0.6
              : 0.4 + Math.random() * 1.6,
          tint: Math.random(),
        });
      }
    }

    function resize() {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function onMove(e: MouseEvent | TouchEvent) {
      const t = (e as TouchEvent).touches
        ? (e as TouchEvent).touches[0]
        : (e as MouseEvent);
      tMx = (t.clientX / window.innerWidth - 0.5) * 2;
      tMy = (t.clientY / window.innerHeight - 0.5) * 2;
      cx = t.clientX;
      cy = t.clientY;
    }

    /* Observe theme changes — reseed with the new visual budget. */
    const themeObserver = new MutationObserver(() => {
      const next = readTheme();
      if (next !== theme) {
        theme = next;
        seed();
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onMove as EventListener, { passive: true });
    window.addEventListener("touchmove", onMove as EventListener, { passive: true });

    let raf = 0;
    let last = performance.now();
    function frame(now: number) {
      if (!ctx) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      mx += (tMx - mx) * 0.06;
      my += (tMy - my) * 0.06;

      ctx.clearRect(0, 0, w, h);

      /* Light theme: paint a faint sun-streak haze before motes.
         The sun sits in the upper-right; motes drift across as dust. */
      if (theme === "light") {
        const sunX = w * 0.82;
        const sunY = h * 0.18;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, h * 0.7);
        sunGrad.addColorStop(0, "rgba(254, 240, 200, 0.55)");
        sunGrad.addColorStop(0.45, "rgba(254, 215, 170, 0.18)");
        sunGrad.addColorStop(1, "rgba(254, 215, 170, 0)");
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, w, h);

        /* Soft sky wash from top-left */
        const skyGrad = ctx.createRadialGradient(
          w * 0.18,
          h * 0.1,
          0,
          w * 0.18,
          h * 0.1,
          h * 0.9
        );
        skyGrad.addColorStop(0, "rgba(186, 230, 253, 0.22)");
        skyGrad.addColorStop(0.6, "rgba(186, 230, 253, 0.04)");
        skyGrad.addColorStop(1, "rgba(186, 230, 253, 0)");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);
      }

      let emitDust = false;
      if (allowFx) {
        const dx = cx - pcx;
        const dy = cy - pcy;
        const vel = Math.hypot(dx, dy);
        if (cx > -9000 && vel < 30 && vel > 0.3 && now - lastEmit > 120) {
          emitDust = true;
          lastEmit = now;
        }
        pcx = cx;
        pcy = cy;
      }

      for (let i = 0; i < motes.length; i++) {
        const s = motes[i];
        if (!reduced) s.tw += dt * s.twSpeed;
        const tw = reduced ? 0.85 : 0.6 + 0.4 * Math.sin(s.tw);
        const px = s.x + mx * (8 + s.z * 28);
        const py = s.y + my * (5 + s.z * 18);

        let alphaBoost = 1;
        if (allowFx && cx > -9000) {
          const ddx = px - cx;
          const ddy = py - cy;
          if (ddx * ddx + ddy * ddy < LENS_R2) alphaBoost = 1.4;
        }

        let color: string;
        if (theme === "light") {
          /* Warm dust motes: amber / soft cream / pollen */
          if (s.tint > 0.86)
            color = `rgba(180, 83, 9, ${Math.min(0.55, 0.42 * tw * alphaBoost)})`;
          else if (s.tint > 0.6)
            color = `rgba(202, 138, 4, ${Math.min(0.5, 0.36 * tw * alphaBoost)})`;
          else
            color = `rgba(120, 113, 108, ${Math.min(0.42, (0.18 + 0.26 * s.z) * tw * alphaBoost)})`;
        } else {
          /* Dark: cosmic stars — cyan / amber / white */
          if (s.tint > 0.93)
            color = `rgba(255, 226, 168, ${Math.min(1, 0.8 * tw * alphaBoost)})`;
          else if (s.tint > 0.86)
            color = `rgba(165, 243, 252, ${Math.min(1, 0.8 * tw * alphaBoost)})`;
          else
            color = `rgba(255, 255, 255, ${Math.min(1, (0.45 + 0.55 * s.z) * tw * alphaBoost)})`;
        }

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (s.r > 1.1 && tw > 0.78) {
          ctx.beginPath();
          ctx.fillStyle = color.replace(/[\d.]+\)$/, "0.06)");
          ctx.arc(px, py, s.r * 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (allowFx) {
        if (emitDust && dust.length < DUST_CAP) {
          dust.push({ x: cx, y: cy, life: 0, max: 1.5 });
        }
        for (let i = dust.length - 1; i >= 0; i--) {
          const d = dust[i];
          d.life += dt;
          if (d.life >= d.max) {
            dust.splice(i, 1);
            continue;
          }
          d.y -= 8 * dt;
          const a = 0.6 * (1 - d.life / d.max);
          ctx.beginPath();
          ctx.fillStyle =
            theme === "light"
              ? `rgba(180, 83, 9, ${a})`
              : `rgba(34, 211, 238, ${a})`;
          ctx.arc(d.x, d.y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove as EventListener);
      window.removeEventListener("touchmove", onMove as EventListener);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
}
