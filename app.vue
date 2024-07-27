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

const loginAccount = useLoginAccount()

onMounted(() => {
  if (!loginAccount.value) {
    navigateTo('/login')
  }
})
</script>

<style>
.highlight {
  color: red;
}
</style>
