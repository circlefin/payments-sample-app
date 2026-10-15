<template>
  <v-app class="fm mo" theme="wallet">
    <v-main>
      <div class="mo-shell">
        <nav class="mo-rail" aria-label="Main">
          <NuxtLink to="/" class="mo-rail-logo" :aria-label="`${appName} home`">
            <span class="fm-logo-mark" aria-hidden="true"></span>
          </NuxtLink>

          <NuxtLink
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            class="mo-rail-link"
            :class="item.className"
            :title="item.label"
          >
            <v-icon size="24" aria-hidden="true">{{ item.icon }}</v-icon>
            <span class="mo-rail-text">{{ item.label }}</span>
          </NuxtLink>

          <button
            type="button"
            class="mo-rail-link mo-rail-out"
            title="Log out"
            @click="logOut"
          >
            <v-icon size="24" aria-hidden="true">mdi-logout</v-icon>
            <span class="mo-rail-text">Log out</span>
          </button>
        </nav>

        <div class="mo-content">
          <header class="mo-top">
            <span
              v-if="mode.loaded"
              class="mo-test-pill"
              :class="{ 'mo-live-pill': mode.live }"
            >
              {{ mode.live ? 'Live mode · real money' : 'Test mode · test network' }}
            </span>
            <span v-else></span>
            <span v-if="session" class="mo-user">{{ session.email }}</span>
          </header>

          <slot />
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { APP_NAME, useAuth } from '~/composables/useAuth'
import { useWallet } from '~/composables/useWallet'

const appName = APP_NAME
useHead({
  titleTemplate: (title) => (title ? `${title} - ${appName}` : appName),
})

const { session, load, signOut } = useAuth()
const { reset } = useWallet()
const { reset: resetBank } = useBank()
const { mode, loadMode } = useAppMode()
load()
loadMode()

const items = [
  { to: '/wallet', label: 'Home', icon: 'mdi-home-outline', className: '' },
  { to: '/send', label: 'Send', icon: 'mdi-arrow-top-right', className: '' },
  {
    to: '/receive',
    label: 'Receive',
    icon: 'mdi-arrow-bottom-left',
    className: '',
  },
  {
    to: '/bank',
    label: 'Bank',
    icon: 'mdi-bank-outline',
    className: '',
  },
  {
    to: '/activity',
    label: 'Activity',
    icon: 'mdi-receipt-text-outline',
    className: '',
  },
  {
    to: '/developers',
    label: 'Developer tools',
    icon: 'mdi-code-tags',
    className: 'mo-rail-dev',
  },
]

async function logOut() {
  await signOut()
  reset()
  resetBank()
  await navigateTo('/')
}
</script>
