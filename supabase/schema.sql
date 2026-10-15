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

-- ---------------------------------------------------------------------------
-- Bank accounts (Bridge). Safe to run again: everything uses "if not exists".
-- ---------------------------------------------------------------------------

-- One row per user: their Bridge identity check.
create table if not exists public.bank_customers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  kyc_link_id text not null unique,
  customer_id text,
  customer_type text not null default 'individual',
  created_at timestamptz not null default now()
);

-- One row per user per currency: their USD, EUR or GBP account details.
create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  currency text not null check (currency in ('usd', 'eur', 'gbp')),
  bridge_account_id text not null unique,
  deposit_instructions jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, currency)
);

alter table public.bank_customers enable row level security;
alter table public.bank_accounts enable row level security;
