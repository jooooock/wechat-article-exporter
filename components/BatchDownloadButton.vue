<template>
  <button
      @click="batchDownload"
      :disabled="loading"
      class="bg-sky-900 hover:bg-sky-700 disabled:bg-sky-900 min-w-24 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-sky-50 text-white font-semibold h-10 px-4 rounded flex items-center justify-center">
    <Loader v-if="loading" :size="20" class="animate-spin"/>
    <span v-else>批量下载</span>
  </button>
</template>

<script setup lang="ts">
import {Loader} from "lucide-vue-next";


const loading = ref(false)
function batchDownload() {
  alert('敬请期待')

  // loading.value = true
  //
  // setTimeout(() => {
  //   loading.value = false
  // }, 2000)
}
</script>
