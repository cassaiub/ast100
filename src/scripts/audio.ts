/* AmbientDrone — soft sub-bass + perfect-fifth carrier, slow breath modulation.
   Lazy-initialised on the first user gesture (Safari/iOS unlock requirement).
   Mute state persisted as 'ast100.muted' (default: muted — no surprise audio). */

const KEY = "ast100.muted";
const TARGET_GAIN = 0.04;

let muted = localStorage.getItem(KEY) !== "false";
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let breathOsc: OscillatorNode | null = null;
let initStarted = false;
let firstHintShown = false;

function ensureCtx(): AudioContext | null {
  if (ctx) return ctx;
  const C: typeof AudioContext | undefined =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!C) return null;
  ctx = new C();
  return ctx;
}

function init() {
  if (initStarted) return;
  initStarted = true;
  const c = ensureCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();

  master = c.createGain();
  master.gain.value = 0;

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 600;
  lp.Q.value = 0.7;

  const sub = c.createOscillator();
  sub.type = "sine";
  sub.frequency.value = 80;

  const fifth = c.createOscillator();
  fifth.type = "sine";
  fifth.frequency.value = 120;

  const fifthGain = c.createGain();
  fifthGain.gain.value = 0.5;

  sub.connect(lp);
  fifth.connect(fifthGain);
  fifthGain.connect(lp);
  lp.connect(master);
  master.connect(c.destination);

  const breathDepth = c.createGain();
  breathDepth.gain.value = 0.015;
  breathOsc = c.createOscillator();
  breathOsc.type = "sine";
  breathOsc.frequency.value = 0.07;
  breathOsc.connect(breathDepth);
  breathDepth.connect(master.gain);

  sub.start();
  fifth.start();
  breathOsc.start();

  applyMute(false);
}

function applyMute(animated: boolean) {
  if (!master || !ctx) return;
  const now = ctx.currentTime;
  const target = muted ? 0.0001 : TARGET_GAIN;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
  if (animated === false) {
    master.gain.setValueAtTime(target, now);
  } else {
    master.gain.exponentialRampToValueAtTime(target, now + 0.4);
  }
}

function paintIcon(btn: HTMLElement) {
  const svg = btn.querySelector("svg");
  if (!svg) return;
  if (muted) {
    svg.innerHTML =
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
      '<line x1="23" y1="9" x2="17" y2="15"></line>' +
      '<line x1="17" y1="9" x2="23" y2="15"></line>';
  } else {
    svg.innerHTML =
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
      '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>' +
      '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>';
  }
  btn.setAttribute("aria-pressed", muted ? "true" : "false");
}

function setMuted(next: boolean, fromUser: boolean) {
  muted = next;
  localStorage.setItem(KEY, muted ? "true" : "false");
  const btn = document.getElementById("mute-btn");
  if (btn) paintIcon(btn);
  if (!muted && !initStarted) init();
  else applyMute(true);
  if (fromUser) {
    const hint = document.getElementById("mute-hint");
    if (hint) hint.classList.remove("is-on");
  }
}

function onFirstGesture() {
  if (!ctx) ensureCtx();
  if (ctx && ctx.state === "suspended") ctx.resume();
  window.removeEventListener("pointerdown", onFirstGesture);
  window.removeEventListener("touchstart", onFirstGesture);
  window.removeEventListener("keydown", onFirstGesture);
  window.removeEventListener("scroll", onFirstGesture);
}

function showFirstLoadHint() {
  if (firstHintShown) return;
  firstHintShown = true;
  const hint = document.getElementById("mute-hint");
  if (!hint) return;
  if (!muted) return;
  setTimeout(() => hint.classList.add("is-on"), 4000);
  setTimeout(() => hint.classList.remove("is-on"), 12000);
}

function boot() {
  const btn = document.getElementById("mute-btn");
  if (!btn) return;
  paintIcon(btn);
  btn.addEventListener("click", () => setMuted(!muted, true));

  window.addEventListener("pointerdown", onFirstGesture, { passive: true });
  window.addEventListener("touchstart", onFirstGesture, { passive: true });
  window.addEventListener("keydown", onFirstGesture);
  window.addEventListener("scroll", onFirstGesture, { passive: true });

  showFirstLoadHint();
}

if ("requestIdleCallback" in window) {
  requestIdleCallback(boot, { timeout: 800 });
} else {
  setTimeout(boot, 200);
}
