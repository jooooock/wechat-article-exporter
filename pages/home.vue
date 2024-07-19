<template>
  <div id="app">
    <AccountList class="left" @select="selectAccount"/>
    <ArticleList ref="articleListRef" class="right"/>
  </div>
</template>

<script setup lang="ts">
import type {AccountInfo} from "~/types/types";
import {activeAccountFakeID} from "~/composables/useActiveAccount";
import type ArticleList from "~/components/ArticleList.vue";


definePageMeta({
  layout: false
})

useHead({
  title: '微信公众号文章导出'
})

const token = useToken()
const logoutHref = `/api/logout?token=${token.value}`

const articleListRef = ref<typeof ArticleList | null>(null)

function selectAccount(account: AccountInfo) {
  activeAccountFakeID.value = account.fakeid
  articleListRef.value?.init()
}
</script>

<style scoped>
#app {
  display: flex;
  height: 100vh;
  overflow: hidden;

  & > .left {
    width: 600px;
    border-right: 1px solid lightgray;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  & > .right {
    flex: 1;
    overflow-y: scroll;
    overflow-x: hidden;
  }
}
</style>
