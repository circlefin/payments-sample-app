# Mondo setup

Mondo is a consumer wallet app: sign up, create a wallet, send and
receive USDC, and see activity. The original Circle developer tools are still
here under `/developers` and `/debug`.

It runs in **test mode only**. It accepts Circle test API keys, and test USDC
has no value.

## How it fits together

- **Sign-in:** Supabase Auth (email and password), called from the browser.
- **Database:** Supabase stores which Circle wallet belongs to which user.
- **Wallet actions:** server routes in `server/api` call Circle with your API
  key and entity secret. These secrets never reach the browser. Every route
  checks the user's sign-in token and only touches that user's own wallet.

## 1. Supabase

1. Create a project at supabase.com.
2. Open **SQL Editor -> New query**, paste the contents of
   `supabase/schema.sql`, and click **Run**.
3. Open **Project Settings -> API** and copy the project URL, the `anon`
   key, and the `service_role` key.
4. Open **Authentication -> Providers -> Email**. For quick testing you can
   switch off "Confirm email". For a real launch, keep it on and set a proper
   site URL under **Authentication -> URL Configuration**.

## 2. Circle

1. In the Circle Console, create a **test** API key.
2. Set up **Developer-Controlled Wallets**: generate an entity secret, register
   it, and **save the recovery file somewhere safe**. Circle's quickstart at
   developers.circle.com walks through this. The secret is 64 hex characters.

## 3. Vercel settings

Add every variable from `.env.example` under **Settings -> Environment
Variables**, then **redeploy**. The Supabase values are baked in when the site
is built, so a redeploy is needed after any change.

Build settings: this app now has server routes, so it must be built as a
normal Nuxt app.

- Framework preset: **Nuxt**
- Build command: leave the **default** (do **not** use `yarn generate`)
- Output directory: leave the **default** (do **not** use `.output/public`)
- Node.js version: **22.x**

## 4. Try it

1. Open the site, click **Sign up**, then **Create wallet**.
2. Copy your address from the wallet page and request test USDC at
   faucet.circle.com (pick the same network the wallet page shows).
3. Press **Refresh**, then try **Send**.

## Notes and limits

- Default network is Polygon Amoy (test). Change it with `CIRCLE_BLOCKCHAIN`.
- Wallets are smart-contract accounts (`SCA`). On test networks Circle's gas
  sponsorship can cover fees. If a send fails with a fee error, check the
  Circle Console gas settings for your network.
- Per-transfer cap is set by `MAX_SEND_USDC`. If it is not set, it is 100 USDC with a
  test key and 20 USDC with a live key.
- Going live with real money needs far more than this sample: compliance and
  KYC, a real rate limiter, monitoring, and a security review.

## Going live (real money)

Read this whole section before you change anything.

**What is and is not confirmed.** Circle's docs say testnet and mainnet use
separate keys, and that sponsored gas fees on mainnet are charged to the
developer's credit card, not to end users. They also say that if your platform
holds assets for end users, regulatory licensing may apply where you operate.
The docs reviewed did not say how to get mainnet access, what a live key looks
like, or whether live needs its own entity secret. Check Circle Console, or ask
Circle, for those.

**Before you flip the switch**

1. Get live access in Circle Console and create a **live** API key. It will not
   start with `TEST_API_KEY:`.
2. Register an entity secret for the live environment, and save its recovery
   file somewhere safe. Use a different secret from the test one.
3. In Circle Console, set up gas sponsorship (Gas Station) and a payment method
   for the network you choose, or sends will fail.
4. In Supabase, switch **Confirm email back on** (Authentication, Providers,
   Email), and set a real site URL.
5. Decide on licensing and compliance (KYC, sanctions screening, terms). This
   sample app has none of that, and no two-step login.

**Switching**

1. Upload the latest package so the screens show live-mode labels.
2. In Supabase SQL Editor, run `supabase/go-live-reset.sql`. It removes saved
   test wallets (they only hold test tokens).
3. In Vercel, for the **Production** environment only, set:
   `CIRCLE_API_KEY` (live key), `CIRCLE_ENTITY_SECRET` (live secret),
   `CIRCLE_BLOCKCHAIN` (a mainnet code such as `BASE` or `MATIC`; confirm the
   exact code in Circle's docs), `ALLOW_LIVE_FUNDS` = `true`, and
   `MAX_SEND_USDC` = a small number such as `10`.
4. Redeploy. The top bar should now say "Live mode".
5. Test with a very small amount first. Raise `MAX_SEND_USDC` slowly.

**Switching back**: put the test key and test secret back, remove
`ALLOW_LIVE_FUNDS`, set `CIRCLE_BLOCKCHAIN` to a testnet, run
`go-live-reset.sql` again, and redeploy.
