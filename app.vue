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
console.log(websiteID)

if (!useLoginAccount().value) {
  navigateTo('/login', {replace: true})
}

useHead({
  meta: [
    {
      name: 'referrer',
      content: 'no-referrer',
      tagPriority: -20,
    }
  ],
  script: [
    {
      src: '/unregister.js',
    },
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
