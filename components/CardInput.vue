<template>
  <v-text-field
    v-mask="vMask"
    :value="value"
    :rules="rules"
    :label="label"
    type="tel"
    :append-icon="defaultIcon"
    inputmode="numeric"
    name="cardnumber"
    autocomplete="cc-number"
    validate-on-blur
    @input="onInput"
  >
    <font-awesome-icon
      v-if="icon.length"
      slot="append"
      class="ccIcon"
      :icon="icon"
    />
  </v-text-field>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { mask } from 'vue-the-mask'
import valid from 'card-validator'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCcJcb } from '@fortawesome/free-brands-svg-icons/faCcJcb'
import { faCcVisa } from '@fortawesome/free-brands-svg-icons/faCcVisa'
import { faCcAmex } from '@fortawesome/free-brands-svg-icons/faCcAmex'
import { faCcDiscover } from '@fortawesome/free-brands-svg-icons/faCcDiscover'
import { faCcMastercard } from '@fortawesome/free-brands-svg-icons/faCcMastercard'
import { faCcDinersClub } from '@fortawesome/free-brands-svg-icons/faCcDinersClub'
import { EventBus } from '@/lib/eventBus.js'

library.add(
  faCcJcb,
  faCcVisa,
  faCcAmex,
  faCcDiscover,
  faCcMastercard,
  faCcDinersClub
)
Vue.component('font-awesome-icon', FontAwesomeIcon)

@Component({
  directives: {
    mask,
  },
})
export default class CardInput extends Vue {
  @Prop({ type: String }) value!: string
  @Prop({ type: String, default: 'Card Number' }) label!: string

  mask16 = '#### #### #### ####'
  mask15 = '#### ###### #####'
  vMask = this.mask16
  defaultIcon = 'mdi-credit-card'
  icon: string[] = []
  formattedValue = ''

  trimValue(value: string) {
    if (!value) {
      return ''
    }
    return value.trim().replace(/\D/g, '')
  }

  ruleFunctions = {
    isValid: (v: string) => {
      const trimmed = this.trimValue(v)
      return valid.number(trimmed).isValid || 'Please enter a valid card number'
    },
    isRequired: (v: string) => {
      return v.trim() !== '' || 'Please enter a credit card number'
    },
  }

  updateIcon(value: string) {
    const trimmedValue = this.trimValue(value)

    if (trimmedValue === '') {
      this.defaultIcon = 'mdi-credit-card'
    } else {
      this.defaultIcon = ''
    }

    const cardInfo = valid.number(trimmedValue)
    if (cardInfo.card !== null) {
      switch (cardInfo.card.type) {
        case 'visa':
          this.icon = ['fab', 'cc-visa']
          break
        case 'mastercard':
          this.icon = ['fab', 'cc-mastercard']
          break
        case 'diners-club':
          this.icon = ['fab', 'cc-diners-club']
          break
        case 'discover':
          this.icon = ['fab', 'cc-discover']
          break
        case 'american-express':
          this.icon = ['fab', 'cc-amex']
          break
        case 'jcb':
          this.icon = ['fab', 'cc-jcb']
          break
        case null:
          this.icon = []
          break
        case 'default':
        default:
          this.icon = []
      }

      if (cardInfo.card.gaps[1] === 10) {
        this.vMask = this.mask15
      } else {
        this.vMask = this.mask16
      }

      // CVVInput listens to this event and updates the label and input length accordingly
      EventBus.$emit('cardSecurity', cardInfo.card.code)
    } else {
      this.icon = []
      this.vMask = this.mask16
    }

    if (!cardInfo.isValid) {
      this.icon = []
    }
  }

  // When value is set by the parent the input event is not triggered
  @Watch('value', { immediate: true })
  onValueChange(value: string) {
    this.formattedValue = value
    this.updateIcon(value)
  }

  onInput(value: string) {
    const formattedValue = value
    this.formattedValue = formattedValue
    this.$emit('input', formattedValue)
  }

  get rules() {
    return [this.ruleFunctions.isValid, this.ruleFunctions.isRequired]
  }
}
</script>
<style scoped>
.ccIcon {
  width: 1.5em !important;
  height: 1.5em;
}
</style>
