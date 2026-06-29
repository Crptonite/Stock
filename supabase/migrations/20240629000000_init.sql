-- ============================================================
-- StockPro / SIFT — Initial Schema
-- Project: eqlciekgwngkubqprvsd
-- ============================================================

-- ── Profiles (extends auth.users) ────────────────────────────
create table if not exists public.profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  email      text unique not null,
  full_name  text,
  avatar_url text,
  plan       text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

-- ── Portfolio positions (per user) ───────────────────────────
create table if not exists public.portfolio_positions (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  ticker         text not null,
  name           text not null default '',
  shares         numeric not null check (shares > 0),
  avg_cost       numeric not null check (avg_cost >= 0),
  current_price  numeric not null check (current_price >= 0),
  dividend_yield numeric not null default 0,
  sector         text not null default 'Other',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Watchlist (per user) ─────────────────────────────────────
create table if not exists public.watchlist (
  id       uuid default gen_random_uuid() primary key,
  user_id  uuid references auth.users(id) on delete cascade not null,
  ticker   text not null,
  name     text not null default '',
  added_at timestamptz not null default now(),
  unique (user_id, ticker)
);

-- ── Row Level Security ────────────────────────────────────────
alter table public.profiles           enable row level security;
alter table public.portfolio_positions enable row level security;
alter table public.watchlist           enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- portfolio_positions
create policy "portfolio_all_own" on public.portfolio_positions
  for all using (auth.uid() = user_id);

-- watchlist
create policy "watchlist_all_own" on public.watchlist
  for all using (auth.uid() = user_id);

-- ── Auto-create profile on signup ────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── updated_at trigger ────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolio_positions_updated_at on public.portfolio_positions;
create trigger portfolio_positions_updated_at
  before update on public.portfolio_positions
  for each row execute function public.set_updated_at();
