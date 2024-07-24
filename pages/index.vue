<template>
  <div id="app" class="flex flex-col">
    <Header @select="selectAccount" @search="searchArticle"/>
    <ArticleList ref="articleListRef" class="right"/>
  </div>
</template>

<script setup lang="ts">
import type {AccountInfo} from "~/types/types";
import {activeAccount} from "~/composables/useActiveAccount";
import type ArticleList from "~/components/ArticleList.vue";


definePageMeta({
  layout: false
})

useHead({
  title: '微信公众号文章导出'
})


const articleListRef = ref<typeof ArticleList | null>(null)

function selectAccount(account: AccountInfo) {
  activeAccount.value = account
  articleListRef.value?.init()
}
function searchArticle(query: string) {
  articleListRef.value?.init(query)
}
</script>

<style scoped>
#app {
  display: flex;
  height: 100vh;
  overflow: hidden;

  & > .right {
    flex: 1;
    overflow-y: scroll;
    overflow-x: hidden;
  }
}
</style>
