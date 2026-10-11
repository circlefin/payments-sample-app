-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- One row per user: which Circle wallet belongs to them.
create table if not exists public.wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  circle_wallet_id text not null unique,
  address text not null,
  blockchain text not null,
  created_at timestamptz not null default now()
);

-- Small key/value table the server uses (for example, the Circle wallet set id).
create table if not exists public.app_settings (
  key text primary key,
  value text not null
);

-- Lock both tables. With no policies, browsers cannot read or write them.
-- Only the server, using the service role key, can.
alter table public.wallets enable row level security;
alter table public.app_settings enable row level security;
