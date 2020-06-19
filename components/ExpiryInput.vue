<template>
  <v-text-field
    ref="expiry"
    v-model="vModel"
    v-mask="'## / ##'"
    placeholder="01 / 23"
    type="tel"
    label="Expiry"
    :required="required"
    :disabled="disabled"
    :rules="[validate]"
    validate-on-blur
    name="cc-exp"
    autocomplete="cc-exp"
    @input="onInput"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'nuxt-property-decorator'
import { mask } from 'vue-the-mask'

@Component({
  directives: {
    mask,
  },
})
export default class ExpiryInput extends Vue {
  @Prop({ type: Object, default: { month: '', year: '' } }) labels!: {
    month: string
    year: string
  }

  @Prop({ type: Object, default: { month: '', year: '' } }) value!: {
    month: string
    year: string
  }

  @Prop({ type: Boolean, default: false }) disabled!: boolean
  @Prop({ type: Boolean, default: false }) required!: boolean

  expiry = {
    month: '',
    year: '',
  }

  vModel = ''

  onInput(value: string) {
    const split = value.split(' / ')
    this.expiry.month = split[0]
    this.expiry.year = split[1]
    this.$emit('input', this.expiry)
  }

  @Watch('value', { immediate: true })
  onValueChange(expiry: { month: string; year: string }) {
    this.expiry = expiry
  }

  @Watch('expiry', { immediate: true })
  onExpiryChange(expiry: { month: string; year: string }) {
    this.vModel = `${expiry.month} / ${expiry.year}`
  }

  data() {
    return {
      validate: () => {
        const expMonth = parseInt(this.expiry.month)
        const expYear = parseInt(this.expiry.year)
        // checks for NaN and non-zero at the same time
        if (!expMonth || !expYear) {
          return 'Please enter a valid date'
        }
        if (expMonth > 12) {
          return 'Please enter a valid date'
        }
        const expiryDate = new Date(2000 + expYear, expMonth)
        if (isNaN(expiryDate.getFullYear())) {
          return 'Please enter a valid date'
        }
        if (expiryDate < new Date()) {
          return 'Date has expired'
        }
        return true
      },
    }
  }
}
</script>
