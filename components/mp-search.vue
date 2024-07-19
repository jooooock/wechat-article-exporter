<template>
  <form class="search flex flex-1 py-2 px-4" @submit.prevent="search">
    <input class="flex-1 rounded border py-1 px-2" type="text" v-model="query" autocomplete="off" :placeholder="placeholder">
    <button type="submit" class="ml-1">搜索</button>
  </form>
</template>

<script setup lang="ts">
interface Props {
  placeholder: string
}
defineProps<Props>()

const query = defineModel<string>()
const emit = defineEmits(['search'])

function search() {
  emit('search', query.value)
}
</script>
