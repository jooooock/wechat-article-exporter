<template>
  <header class="sticky top-0 z-20 flex-none px-5 py-2 border-b flex items-center justify-between antialiased">
    <div class="flex-auto flex items-center min-w-0">
      <div class="text-md">当前选择公众号: <span class="text-sky-400 font-semibold">{{ activeAccount?.nickname }}</span>
      </div>
      <button @click="isOpen = true"
              class="flex rounded text-sm leading-6 py-1 px-3 hover:bg-zinc-100 text-slate-500">
        <span class="sr-only">切换</span>
        <ArrowRightLeft :size="20" />
      </button>
    </div>
    <div class="hidden space-x-5 lg:flex lg:items-center">
      <BaseSearch v-model="articleQuery" @search="searchArticle" placeholder="搜索文章标题"/>
      <BatchDownloadButton v-if="activeAccount"/>
      <a href="https://github.com/jooooock/wechat-article-exporter" class="ml-6 block text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
        <span class="sr-only">Wechat Article Exporter on GitHub</span>
        <svg viewBox="0 0 16 16" class="size-8" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
      </a>
    </div>
    <div v-if="loginAccount" class="flex items-center space-x-2 ml-10">
      <img v-if="loginAccount.head_img" :src="loginAccount.head_img" alt="" class="rounded-full size-10">
      <span v-if="loginAccount.nick_name">{{loginAccount.nick_name}}</span>
    </div>
  </header>

  <USlideover v-model="isOpen" side="left">
    <div
        class="rounded-lg divide-y divide-gray-100 dark:divide-gray-800 shadow bg-white dark:bg-gray-900 flex flex-col flex-1 overflow-y-scroll">
      <div class="sticky top-0 bg-white py-4 px-2 shadow">
        <BaseSearch v-model="accountQuery" @search="searchAccount" required placeholder="搜索公众号名称"/>
      </div>
      <div class="flex-1">
        <ul class="divide-y antialiased">
          <li v-for="account in accountList"
              :key="account.fakeid"
              class="flex items-center px-2 py-4 hover:bg-slate-50 hover:cursor-pointer"
              :class="{active: account.fakeid === activeAccount?.fakeid}"
              @click="selectAccount(account)"
          >
            <img class="size-20 mr-2" :src="proxyImage(account.round_head_img)" alt="">
            <div class="flex-1">
              <div class="flex justify-between">
                <p class="font-semibold">{{ account.nickname }}</p>
                <p class="text-sky-500 font-medium">{{ AccountTypeMap[account.service_type] }}</p>
              </div>
              <p class="text-gray-500 text-sm">微信号: {{ account.alias || '未设置' }}</p>
              <p class="text-sm mt-2">{{ account.signature }}</p>
            </div>
          </li>
        </ul>

        <p v-if="loading" class="flex justify-center items-center my-2 py-2">
          <Loader :size="28" class="animate-spin text-slate-500"/>
        </p>
        <button
            v-else-if="accountList.length > 0"
            @click="nextAccountPage"
            class="block mx-auto my-2 h-10 px-6 font-semibold rounded-md border border-slate-200 text-slate-900 hover:border-slate-400"
            type="button"
        >
          下一页
        </button>
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import type {AccountInfo, SearchBizResponse} from "~/types/types";
import {Loader, ArrowRightLeft} from "lucide-vue-next";


const AccountTypeMap: Record<number, string> = {
  0: '订阅号',
  1: '订阅号',
  2: '服务号'
}

const isOpen = ref(false)
const loginAccount = useLoginAccount()
const activeAccount = useActiveAccount()

const emit = defineEmits(['select', 'search'])


const articleQuery = ref('')

function searchArticle() {
  if (!activeAccount.value) {
    alert('请先选择公众号')
    return
  }

  emit('search', articleQuery.value)
}


const accountQuery = ref('')
const accountList = reactive<AccountInfo[]>([])
let pageNo = 1

async function searchAccount() {
  pageNo = 1
  accountList.length = 0
  await getAccountList()
}

const loading = ref(false)

async function getAccountList() {
  loading.value = true
  const resp = await $fetch<SearchBizResponse>('/api/searchbiz', {
    method: 'GET',
    query: {
      keyword: accountQuery.value,
      page: pageNo,
      token: loginAccount.value.token,
    }
  }).finally(() => {
    loading.value = false
  })

  if (resp.base_resp.ret === 0) {
    accountList.push(...resp.list)
  } else if (resp.base_resp.ret === 200003) {
    navigateTo('/login')
  } else {
    console.log(resp.base_resp.err_msg)
  }
}

function selectAccount(account: AccountInfo) {
  isOpen.value = false
  activeAccount.value = account

  nextTick(() => {
    emit('select', account)
  })
}

function nextAccountPage() {
  pageNo++
  getAccountList()
}
</script>
