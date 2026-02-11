# Affirmations Positives

## Overview

A daily motivational quotes app ("Citations Motivantes") that delivers inspirational quotes based on the user's mood. Built as a mobile-first PWA with Capacitor support for native Android deployment. The app is bilingual (French/English), features an onboarding flow, mood tracking, favorites, streak tracking, category browsing, and statistics with mood history charts. All user preferences (favorites, mood history, streaks) are stored client-side in localStorage, while quotes are served from a PostgreSQL database via a REST API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React SPA)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router) with 4 main pages: Home, Categories, Favorites, Stats
- **State Management**: TanStack React Query for server state; React useState/useEffect with localStorage for client-side user state (favorites, mood history, streaks, onboarding status)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Animations**: Framer Motion for page transitions, mood overlay, onboarding steps, and UI polish
- **Charts**: Recharts for mood history visualization on the Stats page
- **Internationalization**: Custom context-based i18n system supporting French (default) and English, with translation files in `client/src/locales/`
- **Styling**: Tailwind CSS with CSS variables for theming (dark mode by default), custom gradient CSS classes in `client/src/styles/gradients.css`, Google Fonts (DM Sans + Playfair Display)
- **PWA**: Service worker (`client/public/sw.js`) with network-first caching strategy, web manifest for installability, notification support
- **Mobile**: Capacitor configured for Android builds (`capacitor.config.ts`), output to `dist/public`

### Key Frontend Patterns
- **Onboarding flow**: Multi-step wizard (welcome → personalize → age → name → gender → notifications → theme → widget → complete) gated before main app access
- **Mood-based quotes**: Users select their mood daily, which maps to a quote category (e.g., "tired" → "support" category)
- **Client-side persistence**: `useUserState` hook manages favorites, streaks, mood history, and daily quote in localStorage
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`, `@assets/` maps to `attached_assets/`

### Backend (Express + Node.js)
- **Runtime**: Node.js with Express, TypeScript compiled via tsx (dev) or esbuild (production)
- **API Design**: RESTful JSON API under `/api/` prefix
- **Key Endpoints**:
  - `GET /api/quotes` — List quotes with optional `category`, `search`, `limit` filters
  - `GET /api/quotes/random` — Random quote, optionally filtered by category
  - `GET /api/quotes/:id` — Single quote by ID
  - `GET /api/quotes/count-by-category` — Quote counts grouped by category
  - `POST /api/quotes` — Create a new quote (admin/seed)
- **API Contract**: Defined in `shared/routes.ts` using Zod schemas
- **Database seeding**: Quotes are seeded on server startup via `storage.seedQuotes()`
- **Dev server**: Vite dev server integrated as middleware with HMR via `server/vite.ts`
- **Production**: Static files served from `dist/public` with SPA fallback

### Database
- **Database**: PostgreSQL via `DATABASE_URL` environment variable
- **ORM**: Drizzle ORM with `drizzle-kit` for schema management
- **Schema** (`shared/schema.ts`): Single `quotes` table with columns: `id` (serial PK), `content` (French text), `content_en` (English translation), `author`, `category` (varchar 50), `background_image` (optional), `created_at`
- **Categories**: work, love, sport, confidence, support, breakup, philosophy, success
- **Schema push**: Run `npm run db:push` (uses drizzle-kit push)
- **Migrations**: Output directory is `./migrations`

### Build System
- **Dev**: `npm run dev` — runs tsx with Vite middleware for HMR
- **Build**: `npm run build` — runs `script/build.ts` which builds client with Vite and server with esbuild, outputting to `dist/`
- **Production**: `npm start` — runs the built `dist/index.cjs`
- **Server bundling**: Key dependencies are bundled (allowlisted in `script/build.ts`) to reduce cold start syscalls; others are externalized

### Shared Code (`shared/`)
- `schema.ts` — Drizzle table definitions, Zod insert schemas, TypeScript types (Quote, Mood, MoodLog, UserState)
- `routes.ts` — API contract with Zod validation schemas for each endpoint

## External Dependencies

### Database
- **PostgreSQL** — Primary data store, connected via `DATABASE_URL` environment variable, accessed through `pg` Pool and Drizzle ORM

### Key NPM Packages
- **Drizzle ORM + drizzle-kit** — Database ORM and schema management
- **Express** — HTTP server framework
- **TanStack React Query** — Server state management and caching
- **Framer Motion** — Animations and transitions
- **Recharts** — Chart library for mood history
- **Radix UI** — Headless UI primitives (extensive set of components)
- **shadcn/ui** — Pre-styled component library
- **Wouter** — Lightweight client-side routing
- **Capacitor** — Native mobile app wrapper (Android configured)
- **canvas-confetti** — Celebration effects for streak milestones
- **Zod** — Schema validation for API contracts
- **Google Fonts** — DM Sans (body) and Playfair Display (headings) loaded via CDN

### Browser APIs Used
- **Service Workers** — Offline caching and push notifications
- **Web Notifications API** — Daily quote reminders
- **Web Share API** — Native sharing of quotes
- **localStorage** — All client-side user state persistence