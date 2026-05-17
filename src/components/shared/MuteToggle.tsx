import { useCallback, useEffect, useRef, useState } from "react";

/* Ambient drone with mute toggle.
   - Lazy-initialises a Web Audio context on the first user gesture (iOS unlock).
   - Default: OFF. Persisted in localStorage as 'ch0-audio-on'.
   - Two oscillators (A1 + E2) → lowpass → master gain → destination.
   - Slow tremolo via LFO on master gain. */

const KEY = "ch0-audio-on";
const TARGET_GAIN = 0.035;

function makeDrone() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let toneGain: GainNode | null = null;
  let started = false;

  function start() {
    if (started) return;
    started = true;
    const AC: typeof AudioContext | undefined =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    /* Two-stage gain chain:
       osc → filter → toneGain (LFO modulates THIS, the breath layer)
                    → master  (the on/off silencer)
       Master sits last so master.gain=0 is true silence — the LFO
       can't leak through because it never touches master. */
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    toneGain = ctx.createGain();
    toneGain.gain.value = 1;
    toneGain.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    filter.Q.value = 0.4;
    filter.connect(toneGain);

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 55;
    osc1.detune.value = -6;
    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.value = 82.4;
    osc2.detune.value = 4;
    osc1.connect(filter);
    osc2.connect(filter);
    osc1.start();
    osc2.start();

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.015;
    lfo.connect(lfoGain);
    lfoGain.connect(toneGain.gain);
    lfo.start();
  }

  function fadeTo(v: number, ms = 800) {
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(v, t + ms / 1000);
  }

  return {
    unmute() {
      start();
      if (ctx && ctx.state === "suspended") ctx.resume();
      fadeTo(TARGET_GAIN, 900);
    },
    mute() {
      /* 60 ms instead of 700 ms — fast enough to feel like a stop,
         long enough to avoid an audible click. */
      fadeTo(0, 60);
      if (ctx && master) {
        /* Hard pin to 0 after the ramp so we never get stuck at
           an inaudibly-low-but-nonzero gain. */
        const t = ctx.currentTime;
        master.gain.setValueAtTime(0, t + 0.08);
      }
    },
  };
}

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function MuteToggle() {
  const droneRef = useRef<ReturnType<typeof makeDrone> | null>(null);
  const [on, setOn] = useState<boolean>(false);

  // Read persisted preference on mount (avoid SSR localStorage access).
  useEffect(() => {
    try {
      setOn(localStorage.getItem(KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  // Lazy drone construction at first user gesture only (iOS unlock).
  useEffect(() => {
    let armed = false;
    function arm() {
      if (armed) return;
      armed = true;
      if (!droneRef.current) droneRef.current = makeDrone();
      if (on && !reduced()) droneRef.current.unmute();
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    }
    window.addEventListener("pointerdown", arm, { passive: true });
    window.addEventListener("keydown", arm);
    return () => {
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, [on]);

  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      if (!droneRef.current) droneRef.current = makeDrone();
      if (next && !reduced()) droneRef.current.unmute();
      else droneRef.current.mute();
      return next;
    });
  }, []);

  return (
    <button
      type="button"
      className="mute-btn pointer-events-auto"
      onClick={toggle}
      data-on={on ? "true" : "false"}
      aria-label={on ? "Mute ambient drone" : "Unmute ambient drone"}
      title={on ? "sound on" : "sound off"}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: on ? "#22d3ee" : "rgba(255,255,255,0.25)",
          boxShadow: on ? "0 0 8px rgba(34,211,238,0.85)" : "none",
          display: "inline-block",
        }}
      />
      <span className="mute-btn-label">{on ? "sound · on" : "sound · off"}</span>
    </button>
  );
}
