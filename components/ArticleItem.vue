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
      <div class="flex space-x-3">
        <a :href="link" class="bg-sky-900 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-sky-50 text-white text-sm font-semibold h-8 px-4 rounded flex items-center justify-center" target="_blank">查看原文</a>
        <button
            class="bg-sky-900 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-sky-50 text-white text-sm font-semibold h-8 px-4 rounded flex items-center justify-center"
            @click="copyLink(link)" :disabled="copyBtnDisabled">{{ copyBtnText }}
        </button>
        <button
            :disabled="downloading"
            @click="download(link, title)"
            class="bg-sky-900 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-sky-50 text-white text-sm font-semibold h-8 px-4 rounded flex items-center justify-center"
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
import {formatTimeStamp, proxyImage} from "~/utils";
import {Loader} from 'lucide-vue-next';

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
  downloading.value = true
  const html = await $fetch<string>('/api/download?url=' + encodeURIComponent(link)).finally(() => {
    downloading.value = false
  })

  // const buffer = Uint8Array.from(atob(html), (c) => c.charCodeAt(0))

  const parser = new DOMParser()
  const document = parser.parseFromString(html, 'text/html')
  const $jsContent = document.querySelector('#js_content')
  if (!$jsContent) {
    alert('下载失败，请重试')
    return
  }

  $jsContent.removeAttribute('style')
  const pageContent = document.querySelector('#page-content')!.outerHTML

  const result = `<!DOCTYPE html>
<html class="">
<head>
    <meta name="wechat-enable-text-zoom-em" content="true">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="light dark">
    <meta name="viewport"
          content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0,viewport-fit=cover">
    <style>
#page-content {
max-width: 667px;
margin: 0 auto;
}
img {
max-width: 100%;
}
    </style>
</head>
<body>
${pageContent}
</body>
</html>`

  const blob = new Blob([result], {
    type: "text/html;charset=utf-8",
  });
  saveAs(blob, title)
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

<style scoped>
::v-global(.highlight) {
  color: red;
}
</style>
