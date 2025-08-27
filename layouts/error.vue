<template>
  <v-app dark>
    <v-container class="fill-height">
      <v-row justify="center" align="center">
        <v-col cols="12" md="6" class="text-center">
          <v-card class="pa-8">
            <v-card-title class="justify-center">
              <h1 v-if="error.statusCode === 404">Page not found</h1>
              <h1 v-else class="title">An error occurred</h1>
            </v-card-title>
            <v-card-text>
              <p>{{ error.message }}</p>
            </v-card-text>
            <v-card-actions class="justify-center">
              <v-btn to="/" color="primary">Back to home</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
interface Props {
  error: {
    statusCode: number
    message: string
  }
}

defineProps<Props>()
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
