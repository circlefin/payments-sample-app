<template>
  <div class="fm-auth">
    <div class="fm-auth-card">
      <h1>Create your account</h1>
      <p class="fm-lede">
        Sign up with your email. Next you can create your wallet.
      </p>

      <v-alert
        v-if="notice"
        type="success"
        variant="tonal"
        class="mb-4"
        role="status"
      >
        {{ notice }}
      </v-alert>
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
        role="alert"
      >
        {{ error }}
      </v-alert>

      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          autocomplete="email"
          inputmode="email"
          :disabled="busy"
        />
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          hint="At least 8 characters"
          persistent-hint
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :disabled="busy"
          @click:append-inner="showPassword = !showPassword"
        />
        <v-btn
          type="submit"
          block
          size="x-large"
          color="primary"
          variant="flat"
          class="mt-6"
          :loading="busy"
        >
          Sign up
        </v-btn>
      </v-form>

      <p class="mt-6">
        Already have an account? <NuxtLink to="/login">Log in</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })
useHead({ title: 'Sign up' })

const { session, load, signUp } = useAuth()
load()
if (session.value) {
  await navigateTo('/wallet')
}

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const busy = ref(false)
const error = ref('')
const notice = ref('')

async function submit() {
  error.value = ''
  notice.value = ''

  const address = email.value.trim()
  if (!/^\S+@\S+\.\S+$/.test(address)) {
    error.value = 'Enter a valid email address.'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Your password needs at least 8 characters.'
    return
  }

  busy.value = true
  try {
    const result = await signUp(address, password.value)
    if (result.confirmed) {
      await navigateTo('/wallet')
    } else {
      notice.value =
        'Almost done. We sent a confirmation link to your email. Open it, then log in.'
    }
  } catch (err: any) {
    error.value = errorText(err)
  } finally {
    busy.value = false
  }
}
</script>
