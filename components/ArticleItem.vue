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
        <button class="hover:text-blue-800" @click="download(link)">下载</button>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import dayjs from "dayjs";

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

function download(link: string) {
  // const iframe = document.createElement('iframe')
  // iframe.src = link
  // iframe.style.display = 'none'
  // document.body.appendChild(iframe)
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
