# Wando Hair Ventures

A portable Vite + React wig storefront with a light-pink liquid-glass interface, product details, WhatsApp ordering, customer love notes, and a single-user Supabase admin dashboard.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The app also renders a demo catalog before Supabase is configured, so the visual storefront can be reviewed immediately.

## Deploy

Use the repository root as the project root.

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

The included `vercel.json` and `public/_redirects` preserve the `/product/:id` and `/admin` SPA routes on direct visits.

## Supabase

Follow [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) to create the tables, row-level security policies, public `site-assets` bucket, and the one-user `admin_users` allowlist. Use a publishable/anon browser key only; never expose a service-role key in Vite.
