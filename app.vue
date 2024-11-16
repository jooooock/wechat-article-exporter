<template>
  <div :class="isDev ? 'debug-screens' : ''">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UNotifications />
  </div>
</template>

<script setup lang="ts">
const isDev = !import.meta.env.PROD
const runtimeConfig = useRuntimeConfig()

const websiteID = runtimeConfig.public.umamiWebsiteID

if (!useLoginAccount().value) {
  navigateTo('/login', {replace: true})
}

useHead({
  script: [
    websiteID ?
    {
      src: 'https://cloud.umami.is/script.js',
      defer: true,
      'data-website-id': websiteID
    } : '',
  ]
})
</script>

<style>
.highlight {
  color: red;
}
</style>
