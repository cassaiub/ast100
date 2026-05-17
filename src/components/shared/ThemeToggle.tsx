import { useCallback, useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "theme";

function readDomTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const v = document.documentElement.getAttribute("data-theme");
  return v === "light" ? "light" : "dark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readDomTheme());
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  /* Show the *current* theme on the button — moon = night/dark,
     sun = day/light. Click flips to the other.  Until React mounts,
     render neutral to match the SSR-rendered DOM and avoid a flicker. */
  const label = !mounted ? "theme" : theme === "dark" ? "night" : "day";
  const Icon = theme === "light" ? SunIcon : MoonIcon;

  return (
    <button
      type="button"
      className="theme-btn"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "currently night — switch to day" : "currently day — switch to night"}
      data-theme-current={theme}
    >
      <Icon />
      <span className="theme-btn-label">{label}</span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}
