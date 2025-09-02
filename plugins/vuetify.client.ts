import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import colors from 'vuetify/util/colors'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
    },
    defaults: {
      global: {
        ripple: false,
      },
      VSheet: {
        elevation: 0,
      },
      VCard: {
        flat: false,
        elevation: 1,
      },
      VBtn: {
        color: 'primary',
        style: 'text-transform: none; font-family: Roboto, sans-serif;',
      },
      VTextField: {
        variant: 'outlined',
      },
      VSelect: {
        variant: 'outlined',
      },
    },
    theme: {
      themes: {
        light: {
          colors: {
            primary: colors.teal.lighten1,
            accent: colors.cyan.lighten1,
            secondary: colors.teal.lighten3,
            info: colors.teal.lighten3,
            warning: colors.amber.base,
            error: colors.deepOrange.accent4,
            success: colors.green.accent3,
          },
        },
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
