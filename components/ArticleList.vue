<template>
  <div class="pb-24">
    <mp-search v-model="articleQuery" @search="searchArticle" placeholder="选择公众号，搜索文章"/>
    <ul id="articles">
      <ArticleItem v-for="article in articleList" :key="article.appmsgid" v-bind="article"/>
    </ul>
    <p v-if="loading" class="text-center mt-2 py-2">loading...</p>
    <button v-else class="block mx-auto border-2 w-1/4 hover:border-amber-700 rounded py-1 px-3 mt-2" @click="nextArticlePage" v-if="articleList.length > 0">下一页</button>
  </div>
</template>

<script setup lang="ts">
import type {AppMsgEx, AppMsgPublishResponse, PublishInfo, PublishPage} from "~/types/types";
import {activeAccountFakeID} from "~/composables/useActiveAccount";

const articleQuery = ref('')
const articleList = reactive<AppMsgEx[]>([])
let articlePageNo = 1

const token = useToken()

defineExpose({
  init,
})

const loading = ref(false)
async function getArticleList() {
  loading.value = true
  const resp = await $fetch<AppMsgPublishResponse>('/api/appmsgpublish', {
    method: 'GET',
    query: {
      id: activeAccountFakeID.value,
      keyword: articleQuery.value,
      page: articlePageNo,
      token: token.value,
    }
  }).finally(() => {
    loading.value = false
  })

  if (resp.base_resp.ret === 0) {
    const publish_page: PublishPage = JSON.parse(resp.publish_page)

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
  if (!activeAccountFakeID.value) {
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

  getArticleList()
}
</script>
