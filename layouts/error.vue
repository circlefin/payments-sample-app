<template>
  <v-app dark>
    <h1 v-if="error.statusCode === 404">
      {{ pageNotFound }}
    </h1>
    <h1 v-else>
      {{ otherError }}
    </h1>
    <NuxtLink to="/">
      Home page
    </NuxtLink>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({
  head(this: ErrorLayoutsClass): object {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  }
})
export default class ErrorLayoutsClass extends Vue {
  layout = 'empty'
  props = {
    error: {
      type: Object,
      default: null
    }
  }
  error = {
    statusCode: 200
  }
  pageNotFound = '404 Not Found'
  otherError = 'An error occurred'
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
