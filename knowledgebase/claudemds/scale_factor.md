# Scale factor a(t) — interactive cosmology visualizer

## Goal
Build a self-contained, interactive web page that plots the **scale factor a(t)** of the universe from the Big Bang (t ≈ 0) to t = 100 Gyr using the flat ΛCDM cosmological model. The page should run entirely in the browser with no backend.

---

## Physics

### Model parameters
| Parameter | Symbol | Value |
|---|---|---|
| Hubble constant | H₀ | 67.4 km/s/Mpc = **0.06897 Gyr⁻¹** |
| Matter density | Ω_m | 0.315 |
| Radiation density | Ω_r | 9.4 × 10⁻⁵ |
| Dark energy density | Ω_Λ | 0.685 |

### Friedmann equation
The expansion rate is:

```
da/dt = H₀ × sqrt( Ω_r / a² + Ω_m / a + Ω_Λ × a² )
```

Integrate this ODE from an initial condition of `a(t₀) ≈ 1e-6` forward in time using **RK4** (4th-order Runge-Kutta) with ~2000 steps over [0, 100 Gyr].

### Reference scaling laws (overlay as dashed lines)
- **Matter domination** (valid for t ≲ 7 Gyr): `a(t) = a₀ × (t / t₀)^(2/3)` where t₀ = 13.8 Gyr, a₀ = 1
- **Dark energy domination** (valid for t ≳ 7 Gyr): `a(t) = exp( H_de × (t − t_today) )` where `H_de = H₀ × sqrt(Ω_Λ)` and `t_today = 13.8 Gyr`

---

## Features

### Summary cards (row of 4)
Display these stats above the chart:
1. **Today (13.8 Gyr)** — a = 1.00
2. **At 1 Gyr** — a ≈ 0.145 (compute from integration)
3. **At 100 Gyr** — a ≈ 7.5 (compute from integration)
4. **Late-time regime** — label "a ∝ e^(Ht)"

### Chart
- **X axis**: Cosmic time in Gyr
- **Y axis**: Scale factor a(t)
- **Main curve**: ΛCDM numerical solution (solid blue line)
- **Dashed overlay 1**: Matter domination power law (orange dashed, t = 0 to 7 Gyr)
- **Dashed overlay 2**: Dark energy exponential (green dashed, t = 7 to 100 Gyr)
- **Tooltip** on hover showing: `t = X.XX Gyr`, `a = X.XXX`, `z = X.XX` (redshift z = 1/a − 1)

### X-axis toggle
Two buttons — **Linear** and **Log** — that switch the x-axis scale. In log mode, x range is [0.001, 100] Gyr so the CMB epoch (~0.00038 Gyr) is visible.

### Custom legend (below chart)
- Blue solid line — Scale factor a(t)
- Orange dashed line — Matter dom. (a ∝ t²/³)
- Green dashed line — Dark energy dom. (a ∝ e^Ht)
- Right-aligned note: `ΛCDM: H₀=67.4, Ωₘ=0.315, Ω_Λ=0.685`

---

## Tech stack

Use whichever stack you prefer. A simple single-file approach works well:

**Option A — plain HTML + Chart.js**
```
index.html   (everything inline: HTML, CSS, JS)
```
Load Chart.js from CDN: `https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js`

**Option B — React + Recharts (or Chart.js)**
```
src/
  App.jsx
  CosmologyChart.jsx
  physics.js      ← RK4 integrator lives here
```

---

## Implementation notes

### RK4 integrator
```js
function adot(a, H0, Om, Or, OL) {
  if (a <= 0) return 0;
  const h2 = Or / (a * a) + Om / a + OL * a * a;
  return H0 * Math.sqrt(Math.max(h2, 0));
}

function integrate(tMax, nSteps) {
  let a = 1e-6, t = 0;
  const dt = tMax / nSteps;
  const results = [{ t, a }];
  for (let i = 0; i < nSteps; i++) {
    const k1 = adot(a);
    const k2 = adot(a + 0.5 * dt * k1);
    const k3 = adot(a + 0.5 * dt * k2);
    const k4 = adot(a + dt * k3);
    a += (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t += dt;
    results.push({ t, a });
  }
  return results;
}
```

### Key computed values to surface
- Find the array index where `t` is closest to 1.0 Gyr → read off `a`
- Find the array index where `t` is closest to 13.8 Gyr → should be ≈ 1.0 (sanity check)
- Last element → a at 100 Gyr

### Redshift
`z = (1 / a) - 1`. For a < 1 (past), z > 0. For a > 1 (future), z is negative.

### Log x-axis caveat
Chart.js logarithmic axes cannot include 0. Set `min: 0.001` and filter out any data points with `t < 0.001` when in log mode.

---

## Styling notes
- Clean, minimal UI — white/light-gray backgrounds, no gradients
- Dark mode support via CSS `prefers-color-scheme`
- Chart height: ~380px
- Summary cards: flex row, equal width, muted background, 12px label + 20px value
- Responsive: works at 375px mobile width

---

## Deliverable
A working page where:
1. The chart loads immediately with the ΛCDM curve
2. Toggling Linear/Log re-renders the x-axis smoothly
3. Hovering shows the tooltip with t, a, and z
4. All three summary values (a at 1 Gyr, today, 100 Gyr) are computed from the integration, not hardcoded
