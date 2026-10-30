-- Run ONCE in the Supabase SQL Editor (New query -> paste -> Run) before using
-- bank accounts. It only adds two tables and does not touch your wallets.

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

-- Test accounts can be opened before a wallet exists (Bridge sandbox only).
-- This flag marks them until they are connected to the user's real wallet.
alter table public.bank_accounts
  add column if not exists placeholder boolean not null default false;
