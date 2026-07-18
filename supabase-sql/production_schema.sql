-- Pacific Yacht Lines production schema and Row Level Security policies.
-- Run once in Supabase SQL Editor, then follow ADMIN_SETUP.md.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.service_models (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '' check (char_length(description) <= 2000),
  category text not null default 'Günübirlik' check (char_length(category) between 1 and 60),
  created_at timestamptz not null default now()
);

create table if not exists public.boats (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  type text not null check (char_length(type) between 1 and 60),
  length numeric not null check (length > 0 and length <= 200),
  guests integer not null check (guests between 1 and 500),
  cabins integer not null default 0 check (cabins between 0 and 100),
  service_model_ids uuid[] not null default '{}',
  images text[] not null default '{}' check (cardinality(images) <= 4),
  video_url text not null default '' check (char_length(video_url) <= 1000),
  captain text not null default '' check (char_length(captain) <= 120),
  price numeric not null default 0 check (price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 5000),
  images text[] not null default '{}' check (cardinality(images) <= 4),
  coves text[] not null default '{}',
  best_time text not null default '',
  history text not null default '',
  highlights text[] not null default '{}',
  activities text[] not null default '{}',
  best_season text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.headings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (char_length(key) between 1 and 100),
  title_tr text not null default '' check (char_length(title_tr) <= 500),
  title_en text not null default '' check (char_length(title_en) <= 500),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 7 and 40),
  email text not null check (char_length(email) between 5 and 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  contact_method text not null check (contact_method in ('phone', 'whatsapp', 'email')),
  boat_type text not null default '' check (char_length(boat_type) <= 100),
  service text not null default '' check (char_length(service) <= 150),
  duration text not null default '' check (char_length(duration) <= 60),
  date date,
  estimated_price numeric check (estimated_price is null or estimated_price between 0 and 100000000),
  language text not null check (language in ('tr', 'en', 'de', 'ru', 'ar')),
  status text not null default 'Yeni' check (status in ('Yeni', 'Onaylandı', 'İptal')),
  created_at timestamptz not null default now()
);

-- Existing installations may have older table versions. These additions are
-- intentionally non-destructive and preserve imported data.
alter table public.routes add column if not exists images text[] not null default '{}';
alter table public.routes add column if not exists coves text[] not null default '{}';
alter table public.routes add column if not exists best_time text not null default '';
alter table public.routes add column if not exists history text not null default '';
alter table public.routes add column if not exists highlights text[] not null default '{}';
alter table public.routes add column if not exists activities text[] not null default '{}';
alter table public.routes add column if not exists best_season text not null default '';
alter table public.headings add column if not exists title_tr text not null default '';
alter table public.headings add column if not exists title_en text not null default '';
alter table public.headings add column if not exists is_active boolean not null default true;
alter table public.boats add column if not exists is_active boolean not null default true;
alter table public.boats add column if not exists service_model_ids uuid[] not null default '{}';
alter table public.boats add column if not exists images text[] not null default '{}';
alter table public.boats add column if not exists video_url text not null default '';
alter table public.bookings add column if not exists status text not null default 'Yeni';
alter table public.bookings add column if not exists created_at timestamptz not null default now();

alter table public.service_models enable row level security;
alter table public.boats enable row level security;
alter table public.routes enable row level security;
alter table public.headings enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "public read service models" on public.service_models;
create policy "public read service models" on public.service_models for select using (true);
drop policy if exists "admin manage service models" on public.service_models;
create policy "admin manage service models" on public.service_models for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read active boats" on public.boats;
create policy "public read active boats" on public.boats for select using (is_active or public.is_admin());
drop policy if exists "admin manage boats" on public.boats;
create policy "admin manage boats" on public.boats for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read routes" on public.routes;
create policy "public read routes" on public.routes for select using (true);
drop policy if exists "admin manage routes" on public.routes;
create policy "admin manage routes" on public.routes for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read headings" on public.headings;
create policy "public read headings" on public.headings for select using (true);
drop policy if exists "admin manage headings" on public.headings;
create policy "admin manage headings" on public.headings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public create booking" on public.bookings;
create policy "public create booking" on public.bookings for insert to anon, authenticated
with check (status = 'Yeni' and created_at between now() - interval '1 minute' and now() + interval '1 minute');
drop policy if exists "admin manage bookings" on public.bookings;
create policy "admin manage bookings" on public.bookings for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public Read Access" on storage.objects;
drop policy if exists "Authenticated Upload Access" on storage.objects;
drop policy if exists "Authenticated Update Access" on storage.objects;
drop policy if exists "Authenticated Delete Access" on storage.objects;
drop policy if exists "public read uploads" on storage.objects;
create policy "public read uploads" on storage.objects for select using (bucket_id = 'uploads');
drop policy if exists "admin insert uploads" on storage.objects;
create policy "admin insert uploads" on storage.objects for insert with check (bucket_id = 'uploads' and public.is_admin());
drop policy if exists "admin update uploads" on storage.objects;
create policy "admin update uploads" on storage.objects for update using (bucket_id = 'uploads' and public.is_admin()) with check (bucket_id = 'uploads' and public.is_admin());
drop policy if exists "admin delete uploads" on storage.objects;
create policy "admin delete uploads" on storage.objects for delete using (bucket_id = 'uploads' and public.is_admin());

grant select on public.service_models, public.boats, public.routes, public.headings to anon, authenticated;
grant insert on public.bookings to anon, authenticated;
grant select, insert, update, delete on public.service_models, public.boats, public.routes, public.headings, public.bookings to authenticated;
