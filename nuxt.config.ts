// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@vueuse/nuxt', "@nuxt/ui"],
  ssr: false,
  nitro: {
    vercel: {
      functions: {
        maxDuration: 60,
      }
    }
  }
})
