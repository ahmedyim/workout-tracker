# Workout Tracker

A full-stack workout tracker built with Next.js. Plan sessions, log sets and reps, review progress on a dashboard and reports page, and use AI to generate training plans and post-workout summaries. It works as an installable PWA on phones.

## Features

- **Dashboard:** Quick actions, key stats, a 7-day volume chart, and upcoming sessions.
- **Workouts:** Plan upcoming sessions, view completed ones, and open any workout to see its exercises, sets, and reps.
- **Exercise library:** Browse exercises grouped by muscle group.
- **Reports:** Totals for completed workouts, sets, and volume, plus volume by muscle group.
- **AI plan generator:** Pick a goal, training days, equipment, and experience level. Gemini builds a weekly plan from your own exercise library. You can remove exercises, regenerate, or accept the plan, which creates one scheduled workout per training day.
- **AI session summary:** After a workout is completed, Gemini compares it with your recent sessions and reports what improved, what stalled, and what to focus on next.
- **Responsive layout:** A sidebar on desktop and a slide-out menu on phones, with logout on both.
- **Installable PWA:** Add the app to your phone's home screen with its own icon and full-screen display.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui, lucide-react icons |
| Database | PostgreSQL with Prisma ORM |
| Validation | Zod |
| AI | Google Gemini via `@google/genai` |
| Auth | Cookie-based session with JWT (`lib/auth/session.ts`) |
| PWA | Web app manifest, service worker, offline fallback page |

## Next.js Component Types

This project uses several kinds of components. Knowing which is which explains most of the code.

| Type | Where | How it's marked | Purpose |
| --- | --- | --- | --- |
| **Server Component** (default) | Pages, layouts, `StatsCards`, `WeeklyVolume`, `UpcomingWorkouts` | No directive | Reads the database and session on the server. Nothing extra is sent to the browser. |
| **Async Server Component** | `WorkoutsList`, `DashboardContent`, `WorkoutDetail` | `async function` | Reads the session and data. Always wrapped in `<Suspense>` so the page shell can prerender. |
| **Client Component** | `Sidebar`, `MobileMenu`, `PlanGenerator`, `WorkoutSummaryCard`, `ServiceWorkerRegister`, `InstallButton` | `'use client'` | Needs state, effects, or browser APIs such as `usePathname`, `useState`, or `onClick`. |
| **Server Action** | `actions/auth.ts`, `app/(app)/plans/actions.ts`, `app/(app)/workouts/summary-actions.ts` | `'use server'` at the top of the file | Runs on the server when called from a form or a client component. Only async functions are exported. |
| **Layout** | `app/layout.tsx`, `app/(app)/layout.tsx` | Default export | Shared wrapper. The root layout holds `<html>` and `<body>`. The app layout adds the sidebar and mobile menu. |
| **Route group** | `(app)`, `(auth)` | Folder name in parentheses | Groups routes under a shared layout without changing the URL. |

**Why `Suspense` is used:** Reading cookies or the database during render prevents Next.js from prerendering a page. Moving those reads into an async child inside `<Suspense>` lets the static page shell render first.

## Project Structure

```
workout-tracker/
├── app/
│   ├── layout.tsx                    # Root layout: html, body, fonts, metadata
│   ├── manifest.ts                   # PWA manifest (served at /manifest.webmanifest)
│   ├── (auth)/
│   │   └── login/page.tsx            # Login page, no sidebar
│   └── (app)/                        # Logged-in area
│       ├── layout.tsx                # Sidebar + mobile menu
│       ├── dashboard/page.tsx
│       ├── workouts/
│       │   ├── page.tsx              # Upcoming and completed lists
│       │   ├── new/page.tsx
│       │   ├── [id]/page.tsx         # Workout detail + AI summary card
│       │   └── summary-actions.ts    # Server action: AI session summary
│       ├── plans/
│       │   ├── new/page.tsx          # AI plan generator page
│       │   └── actions.ts            # Server actions: generate and save plans
│       ├── reports/page.tsx
│       └── exercises/page.tsx
├── actions/
│   └── auth.ts                       # Login and logout server actions
├── components/
│   ├── brand/Logo.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx               # Desktop navigation (client)
│   │   ├── MobileMenu.tsx            # Phone navigation (client)
│   │   └── Footer.tsx
│   ├── dashboard/
│   │   ├── StatsCards.tsx            # Server
│   │   ├── WeeklyVolume.tsx          # Server
│   │   └── UpcomingWorkouts.tsx      # Server
│   ├── workouts/
│   │   ├── WorkoutActions.tsx
│   │   └── WorkoutSummaryCard.tsx    # Client: generate and show AI summary
│   ├── plans/
│   │   └── PlanGenerator.tsx         # Client: preferences, preview, accept
│   ├── pwa/
│   │   ├── ServiceWorkerRegister.tsx # Client: registers /sw.js in production
│   │   └── InstallButton.tsx         # Client: Android install prompt
│   └── ui/                           # shadcn/ui components
├── lib/
│   ├── db.ts                         # Prisma client
│   ├── auth/session.ts               # getSession()
│   ├── ai/
│   │   ├── gemini.ts                 # Gemini client, retries, JSON parsing
│   │   ├── planSchema.ts             # Zod schemas for plan input and output
│   │   └── summarySchema.ts          # Zod schema for session summaries
│   ├── data/dashboard.ts             # Cached data helpers
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── icons/                        # PWA and Apple touch icons
│   ├── sw.js                         # Service worker (static files only)
│   └── offline.html
├── .env                              # Local secrets (never commit)
└── package.json
```

## AI Features

### 1. Workout plan generator

- **Route:** `/plans/new`
- **Flow:** The user chooses preferences. The server loads the user's exercises, sends them to Gemini with the preferences, and validates the JSON response with Zod.
- **Safety:** Exercise IDs the model invents are dropped. The plan is validated again on save, and every database write is scoped to the logged-in user.
- **Output:** Accepting a plan creates one `PENDING` workout per training day, in a single transaction.

### 2. Post-workout session summary

- **Where:** The detail page of a completed workout (`/workouts/[id]`).
- **Flow:** The server calculates volume, top weight, and reps for each exercise, compares them with up to three earlier sessions, and sends that data to Gemini. The model only writes text, so the numbers come from the code, not the AI.
- **Caching:** The result is saved in the `aiSummary` field, so it loads instantly. Gemini runs only when the user clicks Generate or Regenerate.

### Model reliability

`lib/ai/gemini.ts` tries models in order and retries only on temporary errors (503 and 429). Model names are kept in one list so they can be updated when Google retires a model.

## Getting Started

### Prerequisites

- Node.js 20.6 or newer
- PostgreSQL running locally, or a hosted database
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env in the project root
```

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/workout
JWT_SECRET=replace-with-a-long-random-string
GEMINI_API_KEY=your-gemini-api-key
```

```bash
# 3. Apply database migrations and generate the Prisma client
npx prisma migrate dev

# 4. Start the development server
npm run dev
```

Open http://localhost:3000.

### Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm start` | Run the production build |
| `npx prisma studio` | Browse and edit database records |
| `npx prisma migrate dev --name <name>` | Create and apply a migration after a schema change |
| `npx prisma generate` | Regenerate the Prisma client |

## Installing as an App

- **Android (Chrome):** Open the menu and tap **Install app**.
- **iPhone (Safari):** Tap **Share → Add to Home Screen**.

Installation needs HTTPS, except on `localhost`. To test on a phone, deploy the app or expose it through a tunnel such as ngrok.

## Security Notes

- Secrets live in `.env`, which must stay out of Git. Keep `.env*` in `.gitignore`.
- Every workout, report, and AI request is filtered by the logged-in user's ID.
- The service worker caches only static assets, never pages or API responses.
- Rotate any API key that has been shared in chat, email, or a screenshot.

## Roadmap

- [ ] Finish-workout button that sets the status and timestamp
- [ ] Bottom tab bar for phones
- [ ] Offline workout logging with IndexedDB and sync
- [ ] Exercise editing and custom exercises per user
- [ ] Progress charts per exercise

## License

Add your license here, for example MIT.
