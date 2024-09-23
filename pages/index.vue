<template>
  <div id="app" class="flex flex-col h-screen overflow-hidden">
    <div class="bg-violet-400 text-white font-bold py-2 text-center">
      <NuxtLink to="/dashboard" class="cursor-pointer">体验新版UI</NuxtLink>
    </div>
    <Header
        @select:account="selectAccount"
        @search:article="searchArticle"
        @toggle:deleted="toggleDeleted"
    />
    <ArticleList v-if="activeAccount" :hide-deleted="hideDeleted" ref="articleListRef" class="flex-1 overflow-y-scroll"/>
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

const activeAccount = useActiveAccount()
const articleListRef = ref<typeof ArticleList | null>(null)

const hideDeleted = ref(false)
function toggleDeleted(hide: boolean) {
  hideDeleted.value = hide
}

function selectAccount() {
  articleListRef.value?.init()
}
function searchArticle(query: string) {
  articleListRef.value?.init(query)
}
</script>
