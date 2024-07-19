<template>
  <span class="ml-4">每页</span>
  <select @change="onChange">
    <option v-for="size in options" :key="size" :value="size" :selected="pageSize === size">{{ size }}</option>
  </select>
  <span>条</span>
</template>

<script setup lang="ts">
const pageSize = defineModel<number>()
const options = [5, 10, 20]

function onChange(evt: Event) {
  pageSize.value = parseInt((evt.target as HTMLSelectElement).value)
}
</script>
