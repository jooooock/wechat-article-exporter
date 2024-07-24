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
import {Loader} from 'lucide-vue-next';
import {formatTimeStamp, proxyImage} from "~/utils";
import JSZip from "jszip";
import mime from "mime";

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

    const fullHTML = await $fetch<string>('/api/download?url=' + encodeURIComponent(link))

    const parser = new DOMParser()
    const document = parser.parseFromString(fullHTML, 'text/html')
    const $pageContent = document.querySelector('#page-content')
    if (!$pageContent) {
      alert('下载失败，请重试')
      return
    }
    $pageContent.querySelector('#js_content')?.removeAttribute('style')


    const zip = new JSZip()

    const imgs = $pageContent.querySelectorAll('img')
    zip.folder('assets')
    for (const img of imgs) {
      const imgData = await $fetch<Blob>(img.src)
      const uuid = new Date().getTime() + Math.random().toString()
      const ext = mime.getExtension(imgData.type)
      zip.file(`assets/${uuid}.${ext}`, imgData)

      // 重写路径，指向本地图片文件
      img.src = `./assets/${uuid}.${ext}`
    }

    // 处理背景图片
    const map = new Map<string, string>()
    let pageContentHTML = $pageContent.outerHTML

    // 收集背景图片
    const bgImages = new Set<string>()
    pageContentHTML.replaceAll(/((?:background|background-image): url\((?:&quot;)?)((?:https?|\/\/)[^)]+?)((?:&quot;)?\))/gs, (match, p1, url, p3) => {
      bgImages.add(url)
      return `${p1}${url}${p3}`
    })
    for (const url of bgImages) {
      const imgData = await $fetch<Blob>(url)
      const uuid = new Date().getTime() + Math.random().toString()
      const ext = mime.getExtension(imgData.type)

      zip.file(`assets/${uuid}.${ext}`, imgData)
      map.set(url, `assets/${uuid}.${ext}`)
    }

    pageContentHTML = pageContentHTML.replaceAll(/((?:background|background-image): url\((?:&quot;)?)((?:https?|\/\/)[^)]+?)((?:&quot;)?\))/gs, (match, p1, url, p3) => {
      if (map.has(url)) {
        const path = map.get(url)!
        return `${p1}./${path}${p3}`
      } else {
        console.warn('背景图片丢失')
        return `${p1}${url}${p3}`
      }
    })



    const indexHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport"
          content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0,viewport-fit=cover">
    <link rel="stylesheet" href="//res.wx.qq.com/mmbizappmsg/zh_CN/htmledition/js/assets/index.lyzn48mo196f5b68.css">
    <link rel="stylesheet" href="//res.wx.qq.com/mmbizappmsg/zh_CN/htmledition/js/assets/cover_next.lyzn48mo6e86e161.css">
    <link rel="stylesheet" href="//res.wx.qq.com/mmbizappmsg/zh_CN/htmledition/js/assets/interaction.lyzn48mo9570c58b.css">
    <link rel="stylesheet" href="//res.wx.qq.com/mmbizappmsg/zh_CN/htmledition/js/assets/qqmail_tpl_vite_entry.lyzn48moe171b81c.css">
    <link rel="stylesheet" href="//res.wx.qq.com/mmbizappmsg/zh_CN/htmledition/js/assets/tencent_portfolio_light.lyzn48mo0cd74df8.css">
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
${pageContentHTML}
</body>
</html>`

    zip.file('index.html', indexHTML)

    const blob = await zip.generateAsync({type: 'blob'})
    saveAs(blob, title)
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
