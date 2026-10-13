# FIXORA — School Maintenance Admin Dashboard

A responsive React + TypeScript dashboard for a school maintenance mini-capstone. The visual language follows the supplied FIXORA sign-in reference: deep navy surfaces, teal accents, compact typography, rounded cards, and a clean operations-oriented layout.

## Requirements
- Node.js 20.19+ (or a supported current LTS)
- npm

## Run locally
```bash
npm install
npm run dev
```

## Quality checks
```bash
npm run lint
npm run build
```

## Included
- React 18, TypeScript, Vite, React Router, ESLint
- Responsive overview with KPIs, CSS charts, request status summary, recent requests, and today's schedule
- Request management with search, status filtering, status updates, CSV export, and a create-request modal
- Facility condition cards, staff assignments, maintenance schedule, and workspace settings
- Reusable layout, typed request data, accessible labels, responsive CSS

## Demo data and backend
This version intentionally runs without a backend and uses sample data in `src/data/requests.ts`. Updates exist in browser memory only and reset after a refresh. For a production capstone, connect the request actions to your Laravel API and use server-side authentication/authorization. Do not treat the demo interface as a security boundary.

## Main structure
```
src/
  components/  Brand.tsx, Layout.tsx
  data/        requests.ts
  pages/       Dashboard.tsx, Requests.tsx, Sections.tsx
  App.tsx
  main.tsx
  styles.css
  types.ts
```
