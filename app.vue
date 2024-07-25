<template>
  <div :class="isDev ? 'debug-screens' : ''">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const isDev = !import.meta.env.PROD
</script>

<style>
.highlight {
  color: red;
}
</style>
