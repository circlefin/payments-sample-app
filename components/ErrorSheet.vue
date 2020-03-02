<template>
  <v-bottom-sheet v-model="bottomSheetValue">
    <v-sheet class="text-center" height="200px">
      <v-btn class="mt-6" @click="bottomSheetValue = !bottomSheetValue">
        close
      </v-btn>
      <br />
      <br />
      <p v-if="status">Status: {{ status }}</p>
      <p v-if="message">Message: {{ message }}</p>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'nuxt-property-decorator'

interface Error {
  status?: string
  message?: string
  data?: {
    code: number
    message: string
  }
}

@Component
export default class ErrorSheet extends Vue {
  @Prop({ type: Object, default: () => {} })
  error!: Error

  @Prop({ type: Boolean })
  showError!: boolean

  status = ''
  message = ''

  get bottomSheetValue() {
    return this.showError
  }

  set bottomSheetValue(bottomSheetValue) {
    this.$emit('onChange', bottomSheetValue)
  }

  @Watch('error', { immediate: true })
  onErrorChange(error: Error) {
    this.status = error.status || ''

    if (error.data) {
      this.message = error.data.message || ''
    } else {
      this.message = error.message || ''
    }
  }
}
</script>
