-- FitPortal schema for Supabase (Postgres).
--
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- Design notes:
--   * Users live in Supabase Auth (auth.users). `profiles` holds our own fields
--     (name, role) and is keyed by the auth user id.
--   * An order's items, containers and packing result are stored as jsonb rather
--     than separate tables. They are always read and written as a whole document,
--     and keeping them as one blob means the JSON the API returns is byte-for-byte
--     what FitVisualizer already expects. Splitting them into rows would buy us
--     nothing and would risk changing that contract.
--   * Row Level Security is on everywhere. The API talks to Postgres with the
--     service_role key, which bypasses RLS, so these policies are what protects
--     the data if anyone ever queries Supabase directly with an anon key.

-- ---------------------------------------------------------------- profiles

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  name        text not null default '',
  role        text not null default 'operator'
                check (role in ('operator', 'supervisor', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A signed-in user may read their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- ---------------------------------------------------------------- containers

create table if not exists public.containers (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null unique,
  width         numeric not null check (width >= 0),
  length        numeric not null check (length >= 0),
  depth         numeric not null check (depth >= 0),
  max_weight    numeric check (max_weight >= 0),
  box_weight    numeric check (box_weight >= 0),
  active        boolean not null default true,
  maximum_boxes integer check (maximum_boxes >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists containers_active_idx on public.containers (active);

alter table public.containers enable row level security;

-- The carton catalogue is shared reference data; any signed-in user may read it.
drop policy if exists "containers_select_authenticated" on public.containers;
create policy "containers_select_authenticated"
  on public.containers for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------- orders

create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  reference  text not null,
  owner      uuid not null references auth.users (id) on delete cascade,
  status     text not null default 'draft'
               check (status in ('draft', 'packing', 'packed', 'failed')),

  -- [{ itemCode, itemReference, width, length, depth, weight, boxGroup, quantity }]
  items      jsonb not null default '[]'::jsonb,

  -- [{ reference, width, length, depth, maxWeight, boxWeight, active, maximumBoxes }]
  containers jsonb not null default '[]'::jsonb,

  -- { status, message, boxes[], unpacked[], solvedAt, solverMs, source } or null
  result     jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_owner_idx      on public.orders (owner);
create index if not exists orders_status_idx     on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Orders are a shared work queue: an operator raises one and a supervisor packs
-- it, so every signed-in user can read every order. `owner` records who raised
-- it, and the API restricts deletion to that person or a supervisor.
drop policy if exists "orders_select_own" on public.orders;
drop policy if exists "orders_modify_own" on public.orders;

drop policy if exists "orders_select_authenticated" on public.orders;
create policy "orders_select_authenticated"
  on public.orders for select
  to authenticated
  using (true);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = owner);

drop policy if exists "orders_update_authenticated" on public.orders;
create policy "orders_update_authenticated"
  on public.orders for update
  to authenticated
  using (true);

-- ---------------------------------------------------------------- updated_at

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists containers_touch_updated_at on public.containers;
create trigger containers_touch_updated_at
  before update on public.containers
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();
