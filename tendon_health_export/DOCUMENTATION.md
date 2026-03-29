# TendonCare — Complete Project Documentation

## Overview

TendonCare is a Next.js 14 web application for tendon rehabilitation and maintenance, informed by evidence-based isometric loading protocols. Users select tendons, available equipment, and rehab/maintenance mode to generate personalized exercise routines. Progress is tracked via browser localStorage (no backend/auth required).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.2 |
| Styling | TailwindCSS 3.3 + CSS variables (teal/emerald theme) |
| Animations | Framer Motion 10 |
| Charts | Recharts 2.15 |
| Icons | Lucide React 0.446 |
| UI Library | shadcn/ui components (Radix primitives) |
| Persistence | Browser localStorage |
| Package Manager | Yarn |

---

## Project Structure

```
nextjs_space/
├── app/
│   ├── layout.tsx              # Root layout (metadata, fonts, global scripts)
│   ├── page.tsx                # Entry point → renders <AppShell />
│   ├── globals.css             # Tailwind + CSS custom properties (color theme)
│   ├── types.ts                # All TypeScript interfaces & constants
│   ├── hooks/
│   │   ├── use-local-storage.ts  # Generic localStorage hook with hydration safety
│   │   └── use-exercise-db.ts    # Fetches /data/exercise_database.json
│   ├── lib/
│   │   └── routine-generator.ts  # Core algorithm: greedy set-cover routine builder
│   └── components/
│       ├── app-shell.tsx         # Main orchestrator (state, tabs, callbacks)
│       ├── setup-screen.tsx      # Tendon/equipment selection UI
│       ├── routine-view.tsx      # Exercise cards, session tracking, video links
│       ├── progress-view.tsx     # Stats, heatmap calendar, session history
│       ├── progress-chart.tsx    # Dynamic import wrapper (SSR-safe)
│       ├── progress-chart-inner.tsx  # Recharts bar chart
│       └── loading-screen.tsx    # Splash screen while data loads
├── public/
│   ├── data/
│   │   └── exercise_database.json  # Complete exercise & tendon database
│   ├── favicon.svg
│   └── og-image.png
├── components/                 # shadcn/ui component library (50+ components)
│   ├── ui/                     # Radix-based primitives (button, dialog, etc.)
│   └── theme-provider.tsx
├── lib/
│   ├── utils.ts                # cn() utility for Tailwind class merging
│   ├── types.ts                # Base types
│   └── db.ts                   # Database placeholder (unused — app is localStorage-only)
├── hooks/
│   └── use-toast.ts            # Toast notification hook
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind theme (colors, animations, radii)
├── tsconfig.json               # TypeScript config
├── postcss.config.js           # PostCSS (Tailwind + Autoprefixer)
├── components.json             # shadcn/ui configuration
└── package.json → symlinked    # Dependencies (see Tech Stack)
```

---

## Architecture & Data Flow

### State Management

All user state lives in a single `UserData` object persisted in localStorage under the key `tendoncare-data`:

```typescript
interface UserData {
  selectedTendons: TendonSelection[];  // [{tendon: "Achilles Tendon", mode: "rehab"}]
  selectedEquipment: string[];         // ["bodyweight", "resistance bands"]
  routine: RoutineExercise[];          // Generated exercise list
  sessions: SessionLog[];              // [{date: "2026-03-28", exercisesCompleted: [...], allCompleted: true}]
  setupComplete: boolean;
}
```

### Component Hierarchy

```
page.tsx
  └── AppShell (state manager + tab router)
        ├── SetupScreen (tendon/equipment selection → calls onGenerate)
        ├── RoutineView (exercise cards, completion tracking → calls onSessionComplete)
        └── ProgressView (stats, heatmap, chart, history)
              └── ProgressChart → ProgressChartInner (Recharts, SSR-disabled)
```

### Routine Generation Algorithm

File: `app/lib/routine-generator.ts`

1. **Filter** — Remove exercises that don't match user's equipment or selected tendons
2. **Mode Assignment** — If any matched tendon is in "rehab", assign rehab mode to that exercise
3. **Greedy Set-Cover** — Pick exercises that cover the most uncovered tendons first (minimizes routine size)
4. **Variety Pass** — Add extra exercises until each tendon has ≥2 exercises in the routine

---

## Exercise Database Schema

File: `public/data/exercise_database.json`

```json
{
  "tendons": [
    {
      "name": "Achilles Tendon",
      "anatomical_description": "...",
      "common_issues": "..."
    }
  ],
  "exercises": [
    {
      "exercise_name": "Isometric Wall Sit",
      "target_tendons": ["Patellar Tendon", "Quadriceps Tendon"],
      "protocol_type": "rehab",        // "rehab" | "maintenance" | "both"
      "equipment_needed": ["bodyweight"],
      "hold_duration": "30-45 seconds",
      "sets": "4-5",
      "frequency": "Daily or near-daily",
      "joint_angle": "60 degrees of knee flexion",
      "load_guidance": "...",
      "progression_steps": "...",
      "form_cues": "...",
      "safety_notes": "...",
      "video_url": "https://www.youtube.com/watch?v=..."
    }
  ],
  "metadata": {
    "progress_indicators": ["Pain reduction", "Increased load tolerance", ...],
    "transition_criteria": {
      "rehab_to_maintenance": ["Pain < 3/10", "8+ weeks consistent training", ...],
      "maintenance_protocol_details": "Reduce frequency to 2-3x/week..."
    }
  }
}
```

### Current Tendons (11)

1. Achilles Tendon
2. Patellar Tendon
3. Quadriceps Tendon
4. Hamstring Tendons
5. Hip Flexor Tendons
6. Rotator Cuff Tendons
7. Biceps Tendon
8. Tennis Elbow (Lateral Epicondyle)
9. Golfer's Elbow (Medial Epicondyle)
10. Hand Tendons
11. Foot Tendons

### Current Exercises (19)

All exercises are isometric-focused. Each has equipment variations, protocol details, and a YouTube video link.

### Equipment Types (6)

- Bodyweight
- Resistance bands
- Dumbbells
- Kettlebells
- Barbell
- Cable machine

---

## Key Design Decisions

1. **No backend/auth** — All data in localStorage for simplicity and offline capability
2. **Direct YouTube links** — Not embedded players (user preference to avoid bugs)
3. **Greedy set-cover** — Efficient routine generation that minimizes exercises while maximizing tendon coverage
4. **No attribution to specific researchers** — App is branded neutrally as "evidence-based"
5. **Mobile-first responsive** — All grids collapse to single column on small screens, nav labels hidden on mobile
6. **Hydration-safe** — Dynamic imports for Recharts, `mounted` state guards for date-dependent rendering

---

## CSS Theme (globals.css)

The app uses HSL CSS custom properties with a teal/emerald palette:

| Variable | HSL Value | Usage |
|---|---|---|
| `--primary` | 166 72% 40% | Buttons, active states, brand color |
| `--background` | 0 0% 98% | Page background |
| `--foreground` | 210 20% 15% | Primary text |
| `--muted` | 210 15% 95% | Inactive backgrounds |
| `--destructive` | 0 84% 60% | Error states |
| `--radius` | 0.625rem | Border radius base |

---

## How to Run Locally

```bash
cd nextjs_space
yarn install
yarn dev
# → http://localhost:3000
```

## How to Build

```bash
cd nextjs_space
yarn build
yarn start
```

---

## Areas for Improvement / Fine-Tuning

1. **Protocol type filtering** — Currently, rehab-only exercises aren't excluded for maintenance-mode tendons. Could add stricter filtering.
2. **Joint angle diversity** — Algorithm doesn't ensure different joint angles are covered per tendon.
3. **Exercise difficulty progression** — No beginner/intermediate/advanced filtering.
4. **Timer functionality** — Could add built-in isometric hold timers.
5. **Pain tracking** — Could add 0-10 pain scale to support evidence-based rehab→maintenance transitions.
6. **Export/import data** — Allow users to backup/restore their localStorage data.
7. **More exercises** — Database can be expanded with additional exercises per tendon/equipment combination.
8. **Maintenance protocol details** — The `protocol_type` field in `types.ts` only allows `'rehab' | 'both'` — the `'maintenance'` value used in some database entries should be added to the union type.
