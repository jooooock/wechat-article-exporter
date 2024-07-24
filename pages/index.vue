<template>
  <div id="app" class="flex flex-col h-screen overflow-hidden">
    <Header @select="selectAccount" @search="searchArticle"/>
    <ArticleList ref="articleListRef" class="flex-1 overflow-y-scroll"/>
  </div>
</template>

<script setup lang="ts">
import type ArticleList from "~/components/ArticleList.vue";


definePageMeta({
  layout: false
})

useHead({
  title: '微信公众号文章导出'
})

onMounted(() => {
  selectAccount()
})


const articleListRef = ref<typeof ArticleList | null>(null)

function selectAccount() {
  articleListRef.value?.init()
}
function searchArticle(query: string) {
  articleListRef.value?.init(query)
}
</script>
