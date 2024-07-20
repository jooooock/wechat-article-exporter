<template>
  <li :class="{isDeleted: isDeleted}">
    <img v-if="cover" :src="proxyImage(cover)" alt="" class="cover">
    <div class="content">
      <div class="head">
        <p class="title">
          <span class="text-rose-600">#{{index}}. </span>
          <span v-html="title"></span>
        </p>
        <p class="time whitespace-nowrap">{{ articleUpdateTime(updatedAt) }}</p>
      </div>
      <p class="digest">{{ digest }}</p>
      <div class="actions">
        <a :href="link" class="link underline text-blue-500" target="_blank">查看原文</a>
        <button class="hover:text-blue-800" @click="copyLink(link)" :disabled="copyBtnDisabled">{{copyBtnText}}</button>
        <button class="hover:text-blue-800" @click="download(link, title)" :disabled="downloading">{{downloading ? '下载中' : '下载'}}</button>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import {saveAs} from 'file-saver'

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

function proxyImage(url: string) {
  return `https://service.champ.design/api/proxy?url=${encodeURIComponent(url)}`
}

function articleUpdateTime(update_time: number) {
  return dayjs.unix(update_time).format('YYYY-MM-DD HH:mm')
}

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
li {
  position: relative;
  display: flex;
  border: 1px solid lightgray;
  border-radius: 8px;
  margin: 20px;
  padding: 10px 20px;
  align-items: center;

  &.isDeleted {
    background-image: url("~/assets/deleted.png");
    background-repeat: no-repeat;
    background-position: right bottom;
    background-size: 100px 100px;
    background-blend-mode: lighten;
  }

  & > .cover {
    display: block;
    width: 100px;
    height: 100px;
    margin-right: 10px;
    border-radius: 5px;
  }

  & > .content {
    flex: 1;

    & > .head {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      & > .title {
        font-size: 18px;
        font-weight: bold;
        color: darkblue;
      }

      & > .time {
        font-size: 14px;
      }
    }

    & > .digest {
      font-size: 14px;
    }

    & > .actions {
      margin-top: 10px;
      display: flex;
      gap: 10px;
      font-size: 14px;
    }
  }
}

::v-global(.highlight) {
  color: red;
}
</style>
