# ReFAN Website

Vite + React + TypeScript single-page application built with shadcn/ui and Tailwind CSS. Uses Supabase for authentication, database, and storage.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ and npm

## Local development

```sh
# Clone and enter the project
git clone <YOUR_GIT_URL>
cd trusty-hearth-build

# Install dependencies
npm install

# Start the dev server (http://localhost:8080)
npm run dev
```

## Production build

```sh
# Build for production (output in dist/)
npm run build

# Preview the production build locally (http://localhost:4173)
npm run preview
```

### All scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests (Vitest) |

## Environment variables

If Supabase is enabled, create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

These values come from your Supabase project dashboard under **Settings → API**.

## Routing

The app uses **HashRouter** (React Router v6). All URLs include a `#` fragment — for example `/#/about`, `/#/programs`, `/#/admin`.

This means the server always serves `index.html` regardless of the URL path. Routing is handled entirely client-side by React Router, so **page refresh and direct URL access work on any hosting platform** without server-side rewrite rules.

### Deploy

Because HashRouter is hosting-independent, no special server configuration is needed. Upload the contents of `dist/` to any static file host (Vercel, Netlify, GitHub Pages, S3, etc.) and it works out of the box.

### Routes

| URL | Page |
|-----|------|
| `/#/` | Home |
| `/#/about` | About |
| `/#/programs` | Programs |
| `/#/stories` | Stories |
| `/#/gallery` | Gallery |
| `/#/blog` | Blog |
| `/#/donate` | Donate |
| `/#/get-involved` | Get Involved |
| `/#/contact` | Contact |
| `/#/admin-login` | Admin Login |
| `/#/admin` | Admin Dashboard (protected) |

## Project rules

- **Do not redesign the UI** unless explicitly requested.
- **Routing must not break on refresh or direct URL access.**
- Keep navbar links consistent with route definitions in `App.tsx`.
- Admin routes must remain protected (email whitelist via Supabase).

## Tech stack

- **Vite** — build tool
- **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** — styling & components
- **React Router v6** (HashRouter) — client-side routing
- **Supabase** — auth, database, storage
- **Tanstack React Query** — data fetching
- **Recharts** — charts
