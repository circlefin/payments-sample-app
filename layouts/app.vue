<template>
  <v-app class="fm" theme="wallet">
    <v-main>
      <div class="fm-wrap fm-topbar">
        <NuxtLink to="/" class="fm-logo" aria-label="Home">
          <span class="fm-logo-mark" aria-hidden="true"></span>
          {{ appName }}
        </NuxtLink>

        <nav class="fm-nav" aria-label="Main">
          <template v-if="session">
            <v-btn variant="text" to="/wallet" color="secondary">Wallet</v-btn>
            <v-btn variant="text" to="/send" color="secondary">Send</v-btn>
            <v-btn variant="text" to="/receive" color="secondary">Receive</v-btn>
            <v-btn variant="text" to="/activity" color="secondary">
              Activity
            </v-btn>
            <v-btn variant="outlined" color="secondary" @click="logOut">
              Log out
            </v-btn>
          </template>
          <template v-else>
            <v-btn variant="text" to="/login" color="secondary">Log in</v-btn>
            <v-btn variant="flat" to="/signup" color="primary">Sign up</v-btn>
          </template>
        </nav>
      </div>

      <slot />

      <footer class="fm-wrap fm-footer">
        <p v-if="mode.loaded && mode.live">
          {{ appName }} moves real money. Check every wallet address and network
          carefully before you send, because transfers cannot be undone.
        </p>
        <p v-else-if="mode.loaded">
          {{ appName }} runs in test mode on a test network. No real money is
          moved, and test USDC has no value.
        </p>
        <p>
          <NuxtLink to="/developers">Developer tools</NuxtLink>
        </p>
      </footer>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const appName = APP_NAME
useHead({ titleTemplate: (title) => (title ? `${title} - ${appName}` : appName) })
const { session, load, signOut } = useAuth()
const { reset } = useWallet()
const { mode, loadMode } = useAppMode()

load()
loadMode()

async function logOut() {
  await signOut()
  reset()
  await navigateTo('/')
}
</script>

<style scoped>
.fm-topbar {
  flex-wrap: wrap;
}

.fm-nav {
  flex-wrap: wrap;
  justify-content: flex-end;
}
</style>
