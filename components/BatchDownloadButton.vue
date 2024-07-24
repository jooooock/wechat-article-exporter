<template>
  <button
      @click="batchDownload"
      :disabled="loading"
      class="bg-sky-900 hover:bg-sky-700 disabled:bg-sky-900 min-w-24 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-sky-50 text-white font-semibold h-10 px-4 rounded flex items-center justify-center">
    <Loader v-if="loading" :size="20" class="animate-spin"/>
    <span v-if="loading">{{page}}: {{articles.length}}</span>
    <span v-else>批量下载</span>
  </button>
</template>

<script setup lang="ts">
import {Loader} from "lucide-vue-next";
import type {AppMsgEx, AppMsgPublishResponse, PublishInfo, PublishPage} from "~/types/types";
import {sleep} from "@antfu/utils";


const token = useToken()
const activeAccount = useActiveAccount()

const page = ref(1)
const articles: AppMsgEx[] = reactive([])
const loading = ref(false)

async function batchDownload() {
  loading.value = true

  try {
    let data = []
    do {
      data = await getArticleList(page.value)
      articles.push(...data)
      await sleep(5000)
      page.value++
    } while (data.length > 0)
  } catch (e: any) {
    alert(e.message)
  }

  loading.value = false
  console.log(articles)
}

async function getArticleList(page = 1) {
  const resp = await $fetch<AppMsgPublishResponse>('/api/appmsgpublish', {
    method: 'GET',
    query: {
      id: activeAccount.value?.fakeid,
      page: page,
      size: 20,
      token: token.value,
    }
  })

  if (resp.base_resp.ret === 0) {
    const publish_page: PublishPage = JSON.parse(resp.publish_page)
    const publish_list = publish_page.publish_list.filter(item => !!item.publish_info)

    if (publish_list.length === 0) {
      // 全部加载完毕
      return []
    }
    return publish_list.flatMap(item => {
      const publish_info: PublishInfo = JSON.parse(item.publish_info)
      return publish_info.appmsgex
    })
  } else if (resp.base_resp.ret === 200003) {
    throw new Error('session expired')
  } else {
    throw new Error(resp.base_resp.err_msg)
  }
}
</script>
