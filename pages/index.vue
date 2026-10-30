<template>
  <div>
    <section class="fm-wrap fm-hero">
      <div>
        <h1>Send money in minutes.</h1>
        <p class="fm-lede">
          Open a USDC wallet or a bank account (USD, GBP, EUR) in one tap. Then send money to anyone with a
          wallet address or bank details, and receive it the same way.
        </p>

        <div class="fm-cta-row">
          <template v-if="session">
            <v-btn size="x-large" to="/wallet" color="primary" variant="flat">
              Open my wallet
            </v-btn>
            <v-btn size="x-large" to="/bank" color="primary" variant="flat">
              Open a bank account
            </v-btn>
            <v-btn size="x-large" to="/send" variant="outlined" color="secondary">
              Send money
            </v-btn>
          </template>
          <template v-else>
            <v-btn size="x-large" to="/signup" color="primary" variant="flat">
              Sign up free
            </v-btn>
            <v-btn
              size="x-large"
              to="/login"
              variant="outlined"
              color="secondary"
            >
              Log in
            </v-btn>
          </template>
        </div>

        <p v-if="mode.loaded" class="fm-notice">
          {{
            mode.live
              ? 'Live mode: transfers move real money and cannot be undone.'
              : 'Test mode: this app uses a test network, so no real money moves.'
          }}
        </p>
      </div>

      <div class="fm-slip-wrap fm-print" aria-hidden="true">
        <div class="fm-slip">
          <p class="fm-slip-title">You sent</p>
          <p class="fm-slip-amount">25.00 USD</p>
          <div class="fm-slip-row">
            <span>To</span>
            <span>0x71C7…976F</span>
          </div>
          <div class="fm-slip-row">
            <span>Network</span>
            <span>Wallet or bank</span>
          </div>
          <div class="fm-slip-row">
            <span>Status</span>
            <span>Complete</span>
          </div>
          <p class="fm-slip-sample">Sample receipt</p>
        </div>
      </div>
    </section>

    <section class="fm-wrap fm-actions" aria-label="What you can do">
      <NuxtLink :to="walletLink" class="fm-tile fm-tile-wallet">
        <div>
          <h3>Create wallet or bank account</h3>
          <p>Get your own USDC wallet or a USD/GBP/EUR bank account in one step.</p>
        </div>
        <v-icon size="28" aria-hidden="true">mdi-wallet-outline</v-icon>
      </NuxtLink>

      <NuxtLink to="/send" class="fm-tile fm-tile-send">
        <div>
          <h3>Send money</h3>
          <p>Pay anyone with a wallet address or bank details. Review before it goes.</p>
        </div>
        <v-icon size="28" aria-hidden="true">mdi-arrow-top-right</v-icon>
      </NuxtLink>

      <NuxtLink to="/receive" class="fm-tile fm-tile-receive">
        <div>
          <h3>Receive</h3>
          <p>Share your address or bank details and get paid.</p>
        </div>
        <v-icon size="28" aria-hidden="true">mdi-arrow-bottom-left</v-icon>
      </NuxtLink>

      <NuxtLink to="/activity" class="fm-tile fm-tile-activity">
        <div>
          <h3>Activity</h3>
          <p>See everything you sent and received, with its status.</p>
        </div>
        <v-icon size="28" aria-hidden="true">mdi-receipt-text-outline</v-icon>
      </NuxtLink>
    </section>

    <section class="fm-band">
      <div class="fm-wrap">
        <h2>Three steps from sign up to sent.</h2>
        <ol class="fm-steps">
          <li>
            <span class="fm-step-number" aria-hidden="true">1</span>
            <h3>Sign up</h3>
            <p>Use your email and a password. It takes under a minute.</p>
          </li>
          <li>
            <span class="fm-step-number" aria-hidden="true">2</span>
            <h3>Create your wallet or bank account</h3>
            <p>One tap gives you an address or bank details that are yours to share.</p>
          </li>
          <li>
            <span class="fm-step-number" aria-hidden="true">3</span>
            <h3>Send and receive</h3>
            <p>Move money (USDC or bank transfers) and watch it arrive.</p>
          </li>
        </ol>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })
useHead({ title: 'Send and receive money' })

const { session, load } = useAuth()
const { mode, loadMode } = useAppMode()
load()
loadMode()

const walletLink = computed(() => (session.value ? '/wallet' : '/signup'))
</script>
