<template>
  <form class="search" @submit.prevent="search">
    <input type="text" v-model="query" autocomplete="off" :placeholder="placeholder">
    <button type="submit">搜索</button>
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
<style scoped>
.search {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 10;
  padding: .5em 1em;
  background: white;
  border-bottom: 1px solid lightgray;

  & input {
    flex: 1;
    border: 1px solid lightgray;
    border-radius: 3px;
    padding: .25em .5em;
  }

  & button {
    margin-left: 10px;
  }
}
</style>
