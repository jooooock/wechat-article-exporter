<template>
  <li class="group relative flex border hover:border-slate-300 shadow hover:shadow-md rounded-md overflow-hidden">
    <img v-if="isDeleted" src="~/assets/deleted.png" alt="" class="absolute size-[100px] right-0 bottom-0">
    <div v-if="cover" class="w-36 overflow-hidden">
      <img
          :src="proxyImage(cover)"
          alt=""
          class="h-full object-cover group-hover:scale-105 transition">
    </div>
    <div class="p-4 flex-1 space-y-2">
      <div class="flex">
        <div class="flex-1">
          <span class="text-rose-600 font-mono">#{{index}}.</span>
          <h3 class="inline-block text-xl text-blue-800 font-semibold" v-html="title"></h3>
        </div>
        <p class="whitespace-nowrap text-sm text-gray-500">{{ formatTimeStamp(updatedAt) }}</p>
      </div>
      <p class="text-slate-600 text-sm">{{ digest }}</p>
      <div class="space-x-3">
        <a :href="link" class="underline text-blue-500 underline-offset-4" target="_blank">查看原文</a>
        <button class="hover:text-blue-800" @click="copyLink(link)" :disabled="copyBtnDisabled">{{copyBtnText}}</button>
        <button class="hover:text-blue-800" @click="download(link, title)" :disabled="downloading">{{downloading ? '下载中' : '下载'}}</button>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import {saveAs} from 'file-saver'
import {formatTimeStamp, proxyImage} from "~/utils";

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
