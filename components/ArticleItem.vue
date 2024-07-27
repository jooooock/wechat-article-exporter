<template>
  <li class="group relative flex flex-col mb-4 bg-white w-full 2xl:w-[500px] xl:w-[400px] lg:w-[500px] shadow-md rounded-md overflow-hidden">
    <img v-if="isDeleted" src="~/assets/deleted.png" alt="" class="absolute z-10 size-[100px] right-0 top-64 translate-x-full drop-shadow-[-116px_0_red]">
    <div v-if="cover" class="h-60 overflow-hidden" :style="{backgroundColor: themeColor(coverTheme!)}">
      <img
          :src="proxyImage(cover)"
          alt=""
          class="object-contain size-full group-hover:scale-110 ease-in-out transition duration-300">
    </div>
    <div class="p-6 flex flex-col flex-1 space-y-2">
      <span class="absolute top-0 right-0 rounded text-zinc-600 bg-[rgba(255,255,255,.8)] py-1 px-2 font-mono">#{{ index }}</span>
      <h3 class="text-xl text-blue-800 font-semibold" v-html="title"></h3>
      <time class="hidden whitespace-nowrap text-sm text-gray-500 md:block">{{ formatTimeStamp(updatedAt) }}</time>
      <p class="flex-1 text-zinc-400 text-sm pb-4">{{ digest }}</p>
      <div class="flex space-x-3 border-t pt-4 antialiased">
        <a :href="link" class="h-8 px-4 font-semibold rounded border border-slate-200 text-sm text-slate-900 hover:border-slate-400 flex items-center justify-center" target="_blank">查看原文</a>
        <button
            class="h-8 px-4 font-semibold rounded-md border border-slate-200 text-sm text-slate-900 hover:border-slate-400 flex items-center justify-center"
            @click="copyLink(link)" :disabled="copyBtnDisabled">{{ copyBtnText }}
        </button>

        <!-- 删除的文章不显示下载按钮-->
        <button
            v-if="!isDeleted"
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
import type {RGB} from "~/types/types";


interface Props {
  index: number
  cover: string
  title: string
  updatedAt: number
  digest: string
  link: string
  isDeleted: boolean
  coverTheme?: RGB
}

defineProps<Props>()

function themeColor(rgb?: RGB) {
  if (!rgb) {
    return 'white'
  }
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

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
