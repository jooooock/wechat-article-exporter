<template>
  <div class="pb-24">
    <ul class="flex flex-col space-y-3 container mx-auto">
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


const articleQuery = ref('')
const articleList = reactive<AppMsgEx[]>([])
let articlePageNo = 1

const totalCount = ref<string>('-')

const token = useToken()
const activeAccount = useActiveAccount()

const pageSize = ref(20)

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
    const publish_list = publish_page.publish_list.filter(item => !!item.publish_info)

    totalCount.value = publish_page.total_count.toString()

    if (publish_list.length === 0) {
      // 全部加载完毕
      noMoreArticle.value = true
    }
    publish_list.forEach(item => {
      const publish_info: PublishInfo = JSON.parse(item.publish_info)
      articleList.push(...publish_info.appmsgex)
    })
  } else if (resp.base_resp.ret === 200003) {
    navigateTo('/login')
  } else {
    alert(resp.base_resp.err_msg)
  }
}

function nextArticlePage() {
  articlePageNo++
  getArticleList()
}

/**
 * 初始化
 */
function init(query: string) {
  articleList.length = 0
  articlePageNo = 1
  totalCount.value = '-'
  noMoreArticle.value = false
  articleQuery.value = query

  getArticleList()
}
</script>
