<template>
  <form class="flex justify-between space-x-2 h-[40px]" @submit.prevent="search">
    <label class="relative flex-1">
      <input
          class="rounded-md border pl-8 outline-none hover:border-slate-300 focus:ring ring-sky-200 w-full h-full"
          type="text"
          v-model="query"
          autocomplete="off"
          :required="required"
          :placeholder="placeholder"
      >
      <svg width="24" height="24" fill="none" aria-hidden="true"
           class="absolute text-slate-400 top-1/2 left-1 -translate-y-1/2">
        <path d="m19 19-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round"></path>
        <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round"></circle>
      </svg>
    </label>
    <button type="submit" class="px-4 rounded shadow bg-sky-500 text-white hover:bg-sky-400">搜索</button>
  </form>
</template>

<script setup lang="ts">
interface Props {
  placeholder?: string
  required?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: '请输入...',
  required: false,
})

const query = defineModel<string>()
const emit = defineEmits(['search'])

function search() {
  emit('search', query.value)
}
</script>
