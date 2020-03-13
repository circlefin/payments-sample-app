<template>
  <v-app dark>
    <h1 v-if="error.statusCode === 404">
      Page not found
    </h1>

    <h1 v-else class="title">
      An error occurred
    </h1>

    <p>
      {{ error.message }}
    </p>

    <NuxtLink to="/">
      Back to home
    </NuxtLink>
  </v-app>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class ErrorLayoutsClass extends Vue {
  @Prop({ type: Object, default: {} }) error!: Object
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
