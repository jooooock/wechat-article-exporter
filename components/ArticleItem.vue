<template>
  <li class="group relative flex border hover:border-slate-300 shadow hover:shadow-md rounded-md overflow-hidden">
    <img v-if="isDeleted" src="~/assets/deleted.png" alt="" class="absolute size-[100px] right-0 bottom-0 translate-x-full drop-shadow-[-100px_0_red]">
    <div v-if="cover" class="w-36 overflow-hidden">
      <img
          :src="proxyImage(cover)"
          alt=""
          class="h-full object-cover group-hover:scale-105 transition">
    </div>
    <div class="p-4 flex flex-col flex-1 space-y-2">
      <div class="flex">
        <div class="flex-1">
          <span class="text-rose-600 font-mono">#{{ index }}.</span>
          <h3 class="inline-block text-xl text-blue-800 font-semibold" v-html="title"></h3>
        </div>
        <p class="hidden whitespace-nowrap text-sm text-gray-500 md:block">{{ formatTimeStamp(updatedAt) }}</p>
      </div>
      <p class="flex-1 text-slate-600 text-sm">{{ digest }}</p>
      <div class="flex space-x-3 antialiased">
        <a :href="link" class="h-8 px-4 font-semibold rounded border border-slate-200 text-sm text-slate-900 hover:border-slate-400 flex items-center justify-center" target="_blank">查看原文</a>
        <button
            class="h-8 px-4 font-semibold rounded-md border border-slate-200 text-sm text-slate-900 hover:border-slate-400 flex items-center justify-center"
            @click="copyLink(link)" :disabled="copyBtnDisabled">{{ copyBtnText }}
        </button>
        <button
            :disabled="downloading"
            @click="download(link, title)"
            class="bg-sky-900 hover:bg-sky-700 disabled:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-sky-50 text-white text-sm font-semibold h-8 px-4 rounded flex items-center justify-center"
        >
          <Loader v-if="downloading" :size="20" class="animate-spin"/>
          <span v-else>下载</span>
        </button>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import {saveAs} from 'file-saver'
import {Loader} from 'lucide-vue-next';
import {formatTimeStamp, proxyImage, downloadArticleHTML, packHTMLAssets} from "~/utils";


interface Props {
  index: number
  cover: string
  title: string
  updatedAt: number
  digest: string
  link: string
  isDeleted: boolean
}

defineProps<Props>()


const downloading = ref(false)
async function download(link: string, title: string) {
  try {
    downloading.value = true

    const fullHTML = await downloadArticleHTML(link)
    const zip = await packHTMLAssets(fullHTML)

    const blob = await zip.generateAsync({type: 'blob'})
    saveAs(blob, title)
  } catch (e: any) {
    console.warn(e.message)
    alert(e.message)
  } finally {
    downloading.value = false
  }
}


const copyBtnText = ref('复制链接')
const copyBtnDisabled = ref(false)
function copyLink(link: string) {
  window.navigator.clipboard.writeText(link)

  copyBtnText.value = '已复制'
  copyBtnDisabled.value = true
  setTimeout(() => {
    copyBtnText.value = '复制链接'
    copyBtnDisabled.value = false
  }, 1000)
}
</script>
