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

if (!useLoginAccount().value) {
  navigateTo('/login', {replace: true})
}

useHead({
  script: [
    {
      src: '/unregister.js',
    }
  ]
})
</script>

<style>
.highlight {
  color: red;
}
</style>
