<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-2">
      <Teleport defer to="#title">
        <h1 class="text-[28px] leading-[34px] text-slate-12 font-bold">文章获取</h1>
      </Teleport>
      <div class="flex items-center">
        <span class="text-sky-400 font-semibold">{{ activeAccount?.nickname }}</span>
        <button @click="openSwitcher" title="切换"
                class="flex rounded text-sm leading-6 py-1 px-3 hover:bg-zinc-100 text-slate-500">
          <span class="sr-only">切换</span>
          <ArrowRightLeft :size="20" />
        </button>
      </div>
      <button>下一页</button>
    </div>
    <div class="px-6 flex-1 overflow-scroll">
      <ArticleList v-if="activeAccount" ref="articleListRef" class="flex-1 overflow-y-scroll"/>
    </div>
  </div>

  <AccountSwitcher ref="accountSwitcherRef" />
</template>

<script setup lang="ts">
import type ArticleList from "~/components/ArticleList.vue";
import {ArrowRightLeft} from "lucide-vue-next";
import AccountSwitcher from "~/components/AccountSwitcher.vue";

useHead({
  title: '文章获取 | 微信公众号文章导出'
});

const accountSwitcherRef = ref<typeof AccountSwitcher | null>(null)

const loginAccount = useLoginAccount()
const activeAccount = useActiveAccount()
const articleListRef = ref<typeof ArticleList | null>(null)

function openSwitcher() {
  accountSwitcherRef.value!.openSwitcher()
}
</script>
