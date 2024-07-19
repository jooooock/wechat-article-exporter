<template>
  <li :class="{isDeleted: isDeleted}">
    <img :src="proxyImage(cover)" alt="" class="cover">
    <div class="content">
      <div class="head">
        <p class="title">
          <span class="text-rose-600">#{{index}}. </span>
          <span v-html="title"></span>
        </p>
        <p class="time">{{ articleUpdateTime(updatedAt) }}</p>
      </div>
      <p class="digest">{{ digest }}</p>
      <div class="actions">
        <a :href="link" class="link underline text-blue-500" target="_blank">查看原文</a>
        <a href="javascript:void 0" class="download" @click="download(link)">下载</a>
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

      .highlight {
        color: red;
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
