# Russia–Ukraine War Analytics Dashboard

A professional, production-ready conflict analytics dashboard powered by ACLED data.

## 🚀 Getting Started

```bash
npm install --legacy-peer-deps
npm run dev
```

Then open: http://localhost:5173

## 📂 Data Files

The cleaned data files should be in `public/data/`:

| File | Description |
|------|-------------|
| `events_cleaned.csv` | 191,954 ACLED events (main dataset) |
| `monthly_summary_cleaned.csv` | 38 monthly aggregated rows |
| `quick_stats.json` | Pre-computed summary statistics |

Run data cleaning from `scripts/clean_data.py` if you update the source CSVs.

## 🗺️ Map

Uses **React-Leaflet** with free **OpenStreetMap** tiles — no API key required.

Three tile layers:
- **Standard** — Carto dark map (default)
- **Light** — OpenStreetMap standard
- **Terrain** — OpenTopoMap

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `D` | Dashboard |
| `M` | Map |
| `T` | Timeline |
| `E` | Equipment Losses |
| `R` | Regions |
| `/` | Focus search |

## 🏗️ Tech Stack

React 19 · TypeScript · Vite · Tailwind CSS · Recharts · React-Leaflet · PapaParse · Framer Motion
