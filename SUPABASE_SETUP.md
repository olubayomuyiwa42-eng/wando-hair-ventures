# Supabase setup for Wando Hair Ventures

The app is intentionally portable: it is a Vite static frontend and only reads the two browser-safe variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

## 1. Create the database objects

Open the Supabase SQL editor and run the following:

```sql
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
create policy "Admin can read own allowlist row" on public.admin_users for select to authenticated using (id = auth.uid());

create table if not exists public.site_settings (
  id bigint primary key default 1,
  brand_name text not null default 'Wando Hair Ventures',
  logo_url text default '',
  announcement text default 'Soft glam, bold confidence — enjoy 15% off selected units this week',
  address text default '',
  whatsapp_number text default '',
  socials jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Collection',
  description text not null default '',
  price numeric not null default 0,
  length text default '',
  texture text default '',
  cap_size text default '',
  images text[] not null default '{}',
  featured boolean not null default false,
  rating numeric not null default 5,
  review_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;

create policy "Public can read settings" on public.site_settings for select using (true);
create policy "Signed-in admin can manage settings" on public.site_settings for all to authenticated using (exists (select 1 from public.admin_users where id = auth.uid())) with check (exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Public can read products" on public.products for select using (true);
create policy "Signed-in admin can manage products" on public.products for all to authenticated using (exists (select 1 from public.admin_users where id = auth.uid())) with check (exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Public can read approved reviews" on public.reviews for select using (approved = true or exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Anyone can submit a review" on public.reviews for insert with check (approved = false);
create policy "Signed-in admin can moderate reviews" on public.reviews for update to authenticated using (exists (select 1 from public.admin_users where id = auth.uid())) with check (exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Signed-in admin can delete reviews" on public.reviews for delete to authenticated using (exists (select 1 from public.admin_users where id = auth.uid()));

insert into storage.buckets (id, name, public) values ('site-assets', 'site-assets', true)
on conflict (id) do update set public = true;

create policy "Public can view site assets" on storage.objects for select using (bucket_id = 'site-assets');
create policy "Signed-in admin can upload site assets" on storage.objects for insert to authenticated with check (bucket_id = 'site-assets' and exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Signed-in admin can update site assets" on storage.objects for update to authenticated using (bucket_id = 'site-assets' and exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Signed-in admin can delete site assets" on storage.objects for delete to authenticated using (bucket_id = 'site-assets' and exists (select 1 from public.admin_users where id = auth.uid()));
```

## 2. Create the one admin user

In Supabase Dashboard → Authentication → Users, create the one email/password user who should manage the shop. The dashboard does not create a second user; the RLS policies make authenticated access the write boundary.

Copy that user's UUID and run this once in the SQL editor, replacing the placeholder:

```sql
insert into public.admin_users (id) values ('AUTH_USER_UUID') on conflict (id) do nothing;
```

This allowlist is what enforces the single-user admin boundary. Authenticated accounts not present in `admin_users` cannot create or edit products, settings, reviews, or assets.

## 3. Configure deployment

Add these two variables in Vercel, Cloudflare Pages, or a local `.env` file, then redeploy:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Use the Supabase publishable/anon browser key, never a service-role key. Product and logo uploads use the `site-assets` public bucket, while persistent catalog/settings/reviews data stays in Postgres.
