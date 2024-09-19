// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@vueuse/nuxt', "@nuxt/ui", "nuxt-gtag"],
  ssr: false,
  gtag: {
    id: 'G-8V3EBLSR2X'
  },
})
