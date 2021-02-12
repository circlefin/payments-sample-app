<template>
  <v-row>
    <v-col cols="12" md="5">
      <v-card :loading="loading" outlined>
        <v-list-item v-if="!showSuccessMessage" three-line>
          <v-list-item-content>
            <Environment />
            <v-list-item-title class="headline mb-1">
              Enter card details
            </v-list-item-title>
          </v-list-item-content>
          <v-menu>
            <template v-slot:activator="{ on }">
              <v-btn
                v-if="isSandbox"
                class="mt-n8"
                small
                color="blue-grey lighten-1"
                dark
                v-on="on"
              >
                Prefill form
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(item, index) in prefillItems"
                :key="index"
                @click="prefillForm(index)"
              >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item>
        <v-card-text>
          <div v-if="showSuccessMessage" class="subtitle-1 black--text">
            <Environment />
            <v-list-item-title class="headline mb-1">
              Card was added
            </v-list-item-title>
            <b>Card id:</b> {{ cardId }}
          </div>
          <div v-if="showSuccessMessage" class="text-center mt-8">
            <v-btn depressed small @click.prevent="addNewCard()">
              Add another card
            </v-btn>
          </div>
          <CreateCardForm
            v-if="!showSuccessMessage"
            :collapse="true"
            :prefill-data="prefillFormData"
            @loading="onLoading"
            @success="onSuccess"
          />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="5">
      <div class="pa-4">
        <h1 class="headline">Add card flow</h1>
        <p class="mt-6">
          If you intend on reusing a card for repeated payments in the future,
          then it makes sense to complete card verification before making a
          payment request.
        </p>
        <p>
          Creating a card will respond with an id value that can be stored on
          your side to refer to this end -user's card in future payment
          requests.
        </p>
        <p>
          The card creation response also contains the result of the different
          verification checks performed.
        </p>
        <p>
          For implementation details please see our
          <a
            href="https://developers.circle.com/docs/accept-card-payments-online"
            rel="noopener"
            target="_blank"
          >
            API guide.
          </a>
        </p>
        <p class="subtitle-2">
          You can test the form by entering your personal api key in the
          settings on the right (Caution: When using a production api key it
          will charge your card).
          <br /><br />
          For demo purposes card ids are saved in local storage.
        </p>
      </div>
    </v-col>
  </v-row>
</template>
<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { exampleCards } from '@/lib/cardTestData'
import CreateCardForm from '@/components/CreateCardForm.vue'
import Environment from '@/components/Environment.vue'
import { getLive } from '@/lib/apiTarget'

@Component({
  components: {
    CreateCardForm,
    Environment,
  },
})
export default class CreateCardClass extends Vue {
  loading: boolean = false
  showSuccessMessage: boolean = false
  cardId: string = ''
  isSandbox: Boolean = !getLive()
  prefillItems = exampleCards
  prefillFormData = {}

  prefillForm(index: number) {
    this.prefillFormData = this.prefillItems[index].formData
  }

  onLoading(value: boolean) {
    this.loading = value
  }

  onSuccess(card: any) {
    this.cardId = card.id
    this.showSuccessMessage = true
    this.loading = false
  }

  addNewCard() {
    this.cardId = ''
    this.loading = false
    this.showSuccessMessage = false
  }
}
</script>
