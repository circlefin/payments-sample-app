-- Run ONCE in the Supabase SQL Editor, right before you switch Vercel from
-- Circle test keys to live keys (and again if you ever switch back).
--
-- Why: wallets made with a test key exist only in Circle's test environment.
-- A live key cannot see them, so every existing user would hit errors. This
-- removes the saved test wallets and the saved test wallet set, so each user
-- creates a fresh live wallet the next time they press "Create wallet".
--
-- Test wallets hold test tokens with no value. Do NOT run this once real money
-- is in live wallets: it would disconnect users from them.

delete from public.wallets;
delete from public.app_settings where key = 'circle_wallet_set_id';
