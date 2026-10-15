<template>
  <div class="mo-bank">
    <h1 class="fm-page-title">Bank accounts</h1>
    <p class="fm-lede">
      Get US, euro and pound bank details. Money paid in is turned into USDC
      and lands in your Mondo wallet.
    </p>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="my-4"
      role="alert"
    >
      {{ error }}
    </v-alert>

    <p v-if="loading" role="status" class="fm-balance-label">Loading…</p>

    <div v-else-if="!configured" class="mo-card mo-empty-card mt-4">
      <h2>Bank accounts are not switched on yet</h2>
      <p class="mo-muted mt-2">
        The site owner needs to finish setting them up. Please check back soon.
      </p>
    </div>

    <div v-else-if="!wallet && live" class="mo-card mo-empty-card mt-4">
      <h2>Create your wallet first</h2>
      <p class="mo-muted mt-2 mb-4">
        Bank deposits are delivered to your wallet, so you need one before you
        can open an account.
      </p>
      <v-btn to="/wallet" color="primary" variant="flat">Go to my wallet</v-btn>
    </div>

    <template v-else>
      <v-alert
        v-if="!live"
        type="info"
        variant="tonal"
        class="my-4"
      >
        Test mode: no real bank details or money are involved.
      </v-alert>

      <v-alert
        v-if="!live && !wallet"
        type="info"
        variant="tonal"
        class="mb-4"
      >
        You don't have a wallet yet, so test accounts use a placeholder
        destination. Nothing real is sent. Create your wallet later and press
        "Connect my wallet" to point them at it.
      </v-alert>

      <v-alert
        v-if="wallet && hasPlaceholder"
        type="warning"
        variant="tonal"
        class="mb-4"
      >
        <div class="mo-bank-row">
          <span>Your test accounts are not connected to your wallet yet.</span>
          <v-btn
            size="small"
            color="primary"
            variant="flat"
            :loading="busy"
            @click="connect"
          >
            Connect my wallet
          </v-btn>
        </div>
      </v-alert>

      <!-- Step 1: start verification -->
      <section v-if="!status" class="mo-card mo-empty-card mt-4">
        <h2>First, verify who you are</h2>
        <p class="mo-muted mt-2 mb-4">
          Banks require an identity check before giving you account details.
          It is done on Bridge's secure page, so your ID is never stored by
          Mondo.
        </p>
        <v-form class="fm-form" @submit.prevent="start">
          <v-text-field
            v-model="fullName"
            label="Full legal name"
            autocomplete="name"
            maxlength="100"
          />
          <v-radio-group v-model="type" label="This account is for">
            <v-radio label="Me, personally" value="individual" />
            <v-radio label="A business" value="business" />
          </v-radio-group>
          <v-btn
            type="submit"
            color="primary"
            variant="flat"
            size="large"
            :loading="busy"
            :disabled="fullName.trim().length < 2"
          >
            Start verification
          </v-btn>
        </v-form>
      </section>

      <!-- Step 2: finish verification -->
      <section v-else-if="!status.approved" class="mo-card mo-empty-card mt-4">
        <div class="mo-card-head">
          <h2>Finish verification</h2>
          <span class="mo-muted">{{ headline }}</span>
        </div>

        <ol class="mo-bank-steps">
          <li>
            <div>
              <strong>Accept the terms</strong>
              <span class="mo-muted">
                {{ status.tosStatus === 'approved' ? 'Done' : 'Not done yet' }}
              </span>
            </div>
            <v-btn
              v-if="status.tosStatus !== 'approved' && status.tosLink"
              :href="status.tosLink"
              target="_blank"
              rel="noopener"
              variant="outlined"
              color="secondary"
            >
              Open terms
            </v-btn>
          </li>
          <li>
            <div>
              <strong>Verify your identity</strong>
              <span class="mo-muted">{{ kycText }}</span>
            </div>
            <v-btn
              v-if="status.kycStatus !== 'approved' && status.kycStatus !== 'under_review' && status.kycLink"
              :href="status.kycLink"
              target="_blank"
              rel="noopener"
              variant="outlined"
              color="secondary"
            >
              Open verification
            </v-btn>
          </li>
        </ol>

        <p v-if="status.kycStatus === 'rejected'" class="fm-notice">
          Your verification was not approved. Please contact support.
        </p>

        <div class="mo-bank-row mt-4">
          <v-btn
            color="primary"
            variant="flat"
            :loading="busy"
            @click="check"
          >
            Check my status
          </v-btn>
          <v-btn
            v-if="!live"
            variant="text"
            color="secondary"
            :loading="busy"
            @click="approveTest"
          >
            Approve test verification
          </v-btn>
        </div>
      </section>

      <!-- Step 3: accounts -->
      <template v-else>
        <div class="mo-bank-grid mt-4">
          <section
            v-for="item in currencies"
            :key="item.currency"
            class="mo-card"
          >
            <div class="mo-card-head">
              <h2>{{ item.info.code }} account</h2>
              <span class="mo-muted">{{ item.info.how }}</span>
            </div>

            <template v-if="item.account">
              <dl class="mo-dep">
                <div v-for="row in rows(item.account)" :key="row.key">
                  <dt>{{ row.label }}</dt>
                  <dd>
                    <span>{{ row.value }}</span>
                    <v-btn
                      v-if="row.copyable"
                      size="x-small"
                      variant="text"
                      :icon="copiedKey === item.currency + row.key ? 'mdi-check' : 'mdi-content-copy'"
                      :aria-label="`Copy ${row.label}`"
                      @click="copyRow(item.currency + row.key, row.value)"
                    />
                  </dd>
                </div>
              </dl>
              <p class="mo-muted mt-3">
                <template v-if="item.account.placeholder">
                  Test account. Not connected to a wallet yet.
                </template>
                <template v-else>
                  {{ item.info.name }} sent here are converted to USDC and
                  delivered to your Mondo wallet.
                </template>
              </p>
              <p v-if="item.info.note" class="mo-muted mt-2">
                {{ item.info.note }}
              </p>
              <div v-if="!live" class="mo-bank-row mt-3">
                <v-btn
                  size="small"
                  variant="tonal"
                  color="secondary"
                  :loading="busyCurrency === item.currency"
                  @click="fakeDeposit(item.currency)"
                >
                  Simulate a 100 {{ item.info.code }} deposit
                </v-btn>
              </div>
            </template>

            <template v-else>
              <p class="mo-muted mb-4">
                Get {{ item.info.name }} bank details of your own.
              </p>
              <p v-if="item.info.note" class="mo-muted mb-4">
                {{ item.info.note }}
              </p>
              <v-btn
                color="primary"
                variant="flat"
                :loading="busyCurrency === item.currency"
                @click="open(item.currency)"
              >
                Open {{ item.info.code }} account
              </v-btn>
            </template>
          </section>
        </div>

        <section v-if="deposits.length > 0" class="mo-card mt-5">
          <div class="mo-card-head">
            <h2>Recent deposits</h2>
          </div>
          <div class="fm-list">
            <div v-for="d in deposits" :key="d.id" class="fm-list-item">
              <div class="fm-who">
                <strong>{{ d.currency.toUpperCase() }} deposit</strong>
                <span>{{ formatDate(d.date) }} · {{ d.type.replace(/_/g, ' ') }}</span>
              </div>
              <span class="fm-amount-in">{{ d.amount }} {{ d.currency.toUpperCase() }}</span>
            </div>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { errorText } from '~/composables/useAuth'
import { formatDate, useWallet } from '~/composables/useWallet'
import {
  CURRENCY_INFO,
  depositRows,
  kycHeadline,
  type BankCurrency,
} from '~/utils/bank'

definePageMeta({ layout: 'dash', middleware: 'auth' })
useHead({ title: 'Bank accounts' })

const { wallet, loadWallet } = useWallet()
const {
  configured,
  live,
  status,
  accounts,
  deposits,
  load,
  loadDeposits,
  startVerification,
  openAccount,
  connectWallet,
  simulateApproval,
  simulateDeposit,
} = useBank()

const loading = ref(true)
const busy = ref(false)
const busyCurrency = ref('')
const error = ref('')
const fullName = ref('')
const type = ref<'individual' | 'business'>('individual')
const copiedKey = ref('')

const headline = computed(() =>
  status.value
    ? kycHeadline(status.value.kycStatus, status.value.tosStatus, status.value.approved)
    : '',
)

const kycText = computed(() => {
  switch (status.value?.kycStatus) {
    case 'approved':
      return 'Done'
    case 'under_review':
      return 'Being reviewed. This can take a little while.'
    case 'incomplete':
      return 'Some details are missing. Open it to finish.'
    case 'rejected':
      return 'Not approved'
    default:
      return 'Not done yet'
  }
})

const currencies = computed(() =>
  (['usd', 'eur', 'gbp'] as BankCurrency[]).map((currency) => ({
    currency,
    info: CURRENCY_INFO[currency],
    account: accounts.value.find((a) => a.currency === currency) || null,
  })),
)

function rows(account: { instructions: Record<string, unknown> }) {
  return depositRows(account.instructions)
}

async function run(task: () => Promise<void>) {
  error.value = ''
  busy.value = true
  try {
    await task()
  } catch (err: any) {
    error.value = errorText(err)
  } finally {
    busy.value = false
  }
}

const start = () => run(() => startVerification(fullName.value.trim(), type.value))
const check = () => run(load)
const approveTest = () => run(simulateApproval)
const connect = () => run(connectWallet)
const hasPlaceholder = computed(() =>
  accounts.value.some((a) => a.placeholder),
)

async function open(currency: BankCurrency) {
  error.value = ''
  busyCurrency.value = currency
  try {
    await openAccount(currency)
  } catch (err: any) {
    error.value = errorText(err)
  } finally {
    busyCurrency.value = ''
  }
}

async function fakeDeposit(currency: BankCurrency) {
  error.value = ''
  busyCurrency.value = currency
  try {
    await simulateDeposit(currency, '100')
    await loadDeposits()
  } catch (err: any) {
    error.value = errorText(err)
  } finally {
    busyCurrency.value = ''
  }
}

async function copyRow(key: string, value: string) {
  try {
    await navigator.clipboard.writeText(value)
    copiedKey.value = key
    setTimeout(() => {
      if (copiedKey.value === key) {
        copiedKey.value = ''
      }
    }, 1800)
  } catch {
    // Clipboard can be blocked. The value is still on screen to copy by hand.
  }
}

onMounted(async () => {
  try {
    await loadWallet()
    await load()
    if (status.value?.approved) {
      await loadDeposits()
    }
  } catch (err: any) {
    error.value = errorText(err)
  } finally {
    loading.value = false
  }
})
</script>
