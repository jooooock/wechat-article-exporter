<template>
  <div class="pb-24 pt-2">
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
    <p v-if="loading" class="flex justify-center items-center mt-2 py-2">
      <Loader :size="28" class="animate-spin text-slate-500"/>
    </p>
    <p v-else-if="noMoreData" class="text-center mt-2 py-2 text-slate-400">已全部加载完毕</p>
    <div v-element-visibility="onElementVisibility"></div>
  </div>
</template>

<script setup lang="ts">
import type {AppMsgEx} from "~/types/types";
import {getArticleList} from '~/utils'
import {Loader} from "lucide-vue-next";
import { vElementVisibility } from "@vueuse/components"


const keyword = ref('')
let pageNo = 0
const articleList = reactive<AppMsgEx[]>([])


const token = useToken()
const activeAccount = useActiveAccount()


defineExpose({
  init,
})

const loading = ref(false)
const noMoreData = ref(false)

async function loadData() {
  loading.value = true
  try {
    const articles = await getArticleList(activeAccount.value?.fakeid!, token.value, pageNo, keyword.value)
    if (articles.length > 0) {
      articleList.push(...articles)
    } else {
      // 全部加载完毕
      noMoreData.value = true
    }
  } catch (e: any) {
    alert(e.message)
    if (e.message === 'session expired') {
      navigateTo('/login')
    }
  } finally {
    loading.value = false
  }
}

function nextArticlePage() {
  pageNo++
  loadData()
}

/**
 * 初始化
 */
function init(query: string) {
  articleList.length = 0
  pageNo = 0
  noMoreData.value = false
  keyword.value = query

  if (bottomElementIsVisible.value) {
    nextArticlePage()
  }
}


// 判断是否触底
const bottomElementIsVisible = ref(false)
function onElementVisibility(visible: boolean) {
  bottomElementIsVisible.value = visible
  if (visible) {
    nextArticlePage()
  }
}
</script>
