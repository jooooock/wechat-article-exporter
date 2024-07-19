<template>
  <div class="pb-24">
    <div class="sticky top-0 z-10 px-5 bg-white rounded border border-b flex items-center">
      <div>当前选择公众号: <span class="text-sky-400">{{ activeAccount?.nickname }}</span> (共有 {{ totalCount }} 条)
      </div>
      <PageSizer v-model="pageSize" />
      <mp-search v-model="articleQuery" @search="searchArticle" placeholder="选择公众号，搜索文章"/>
    </div>
    <ul id="articles">
      <ArticleItem
          v-for="(article, index) in articleList"
          :key="article.appmsgid"
          :index="index + 1"
          :title="article.title"
          :cover="article.cover_img || article.cover"
          :digest="article.digest"
          :is-deleted="article.is_deleted"
          :link="article.link"
          :updatedAt="article.update_time"
      />
    </ul>
    <p v-if="loading" class="text-center mt-2 py-2">loading...</p>
    <p v-else-if="noMoreArticle" class="text-center mt-2 py-2">全部加载完毕</p>
    <button v-else class="block mx-auto border-2 w-1/4 hover:border-amber-700 rounded py-1 px-3 mt-2"
            @click="nextArticlePage" v-if="articleList.length > 0">下一页
    </button>
  </div>
</template>

<script setup lang="ts">
import type {AppMsgEx, AppMsgPublishResponse, PublishInfo, PublishPage} from "~/types/types";
import {activeAccount} from "~/composables/useActiveAccount";
import PageSizer from "~/components/PageSizer.vue";

const articleQuery = ref('')
const articleList = reactive<AppMsgEx[]>([])
let articlePageNo = 1

const totalCount = ref<string>('-')

const token = useToken()

const pageSize = ref(5)

defineExpose({
  init,
})

const loading = ref(false)
const noMoreArticle = ref(false)

async function getArticleList() {
  loading.value = true
  const resp = await $fetch<AppMsgPublishResponse>('/api/appmsgpublish', {
    method: 'GET',
    query: {
      id: activeAccount.value?.fakeid,
      keyword: articleQuery.value,
      page: articlePageNo,
      size: pageSize.value,
      token: token.value,
    }
  }).finally(() => {
    loading.value = false
  })

  if (resp.base_resp.ret === 0) {
    const publish_page: PublishPage = JSON.parse(resp.publish_page)

    totalCount.value = publish_page.total_count.toString()

    if (publish_page.publish_list.length === 0) {
      // 全部加载完毕
      noMoreArticle.value = true
    }
    publish_page.publish_list.forEach(item => {
      const publish_info: PublishInfo = JSON.parse(item.publish_info)
      articleList.push(...publish_info.appmsgex)
    })
  } else if (resp.base_resp.ret === 200003) {
    navigateTo('/login')
  } else {
    console.log(resp.base_resp.err_msg)
  }
}

function searchArticle() {
  if (!activeAccount.value) {
    alert('请先选择公众号')
    return
  }

  articlePageNo = 1
  articleList.length = 0
  getArticleList()
}

function nextArticlePage() {
  articlePageNo++
  getArticleList()
}

/**
 * 初始化
 */
function init() {
  articleList.length = 0
  articlePageNo = 1
  totalCount.value = '-'
  noMoreArticle.value = false

  getArticleList()
}
</script>
