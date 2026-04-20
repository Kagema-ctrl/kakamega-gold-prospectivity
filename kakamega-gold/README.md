# KakamegaGold — Mineral Prospectivity Intelligence Platform

A professional geospatial intelligence web application for gold mineral prospectivity mapping in Kakamega County, Kenya. Built with React + TypeScript + MapLibre GL JS.

---

## Quick Start

```bash
cd kakamega-gold
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
kakamega-gold/
├── public/
│   └── data/                         ← GeoJSON data files (drop yours here)
│       ├── rf_results.geojson        ← Random Forest prospectivity output
│       ├── svm_results.geojson       ← SVM prospectivity output
│       └── active_licenses.geojson  ← Active mining licences
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx              ← Story Map (6 scroll sections)
│   │   ├── GeologicalDashboard.tsx  ← Analytical dashboard for geoscientists
│   │   └── InvestorDashboard.tsx    ← Executive dashboard for investors
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── MapSwipe.tsx             ← RF vs SVM swipe comparison map
│   │   ├── ProspectivityMap.tsx     ← Interactive MapLibre GL dashboard map
│   │   ├── ModelToggle.tsx          ← RF / SVM toggle button
│   │   ├── StatCard.tsx             ← Animated count-up stat card
│   │   ├── ConfusionMatrix.tsx
│   │   ├── Legend.tsx
│   │   └── LoadingSpinner.tsx
│   ├── contexts/
│   │   └── ModelContext.tsx         ← Global RF/SVM toggle state
│   ├── hooks/
│   │   └── useGeoData.ts            ← Fetches all three GeoJSON files
│   ├── utils/
│   │   └── dataUtils.ts             ← All data computations from GeoJSON
│   └── styles/
│       └── theme.ts                 ← Gold colour tokens + MapLibre expressions
```

---

## GeoJSON Data Files

Place your three GeoJSON files in `public/data/`:

| Filename | Description |
|---|---|
| `rf_results.geojson` | Random Forest model output (4,230 features) |
| `svm_results.geojson` | SVM model output |
| `active_licenses.geojson` | Active mining licences (4 features) |

**Expected schema for `rf_results.geojson` / `svm_results.geojson`:**

| Field | Type | Description |
|---|---|---|
| `gridcode` | number | Prospectivity class 0–4 |
| `Pros_Class` | string | "Very Low" / "Low" / "Moderate" / "High" / "Very High" |
| `Area_km2` | number | Cell area in km² |
| `As_Mn`, `Sb_Mn`, `W_Mn`, `Bi_Mn`, `Cu_Mn`, `Pb_Mn`, `Zn_Mn`, `Mn_Mn`, `FebyMn_Mn`, `Ag_Mn` | number | Pathfinder element means |
| `Lic_Overla` | 0 or 1 | 1 = overlaps active licence |
| `Lic_Name`, `Lic_Comp`, `Lic_Grant`, `Lic_Expir` | string | Licence details |
| `adm2_name` | string | Sub-county name |
| `Litho_Name` | string | Lithology name |
| `Rock_Type`, `Group_Syst` | string | Rock classification |

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Home — Story Map | Cinematic scroll narrative with swipe map |
| `/geological` | Geological Dashboard | Confusion matrix, lithology charts, pathfinder heatmap |
| `/investor` | Investor Dashboard | KPIs, licence coverage, sub-county opportunity table |

---

## Swapping in Images

In `HomePage.tsx`, find the comment `USER_IMAGE_PLACEHOLDER` and update the `src` attribute:

```tsx
// Section 2 — "The Golden Belt"
<img src="/images/kakamega_geology.jpg" ... />
```

Drop your image at `public/images/kakamega_geology.jpg`. If the image is missing, a placeholder with instructions is shown automatically.

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| Vite | 8 | Build tool |
| MapLibre GL JS | 5 | Interactive maps (no API key) |
| Recharts | 3 | Charts |
| Tailwind CSS | 4 | Utility styling |
| React Router | 7 | Client-side routing |

---

## Map Base Style

The app uses Carto Dark Matter tiles (free, no API key):
```
https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json
```

To switch to MapLibre's demo tiles, edit the `BASE_STYLE` constant in:
- `src/components/MapSwipe.tsx`
- `src/components/ProspectivityMap.tsx`

---

## Build for Production

```bash
npm run build
npm run preview
```

The `dist/` folder is production-ready. Note: the GeoJSON files (≈12 MB total) will be served as static assets.
