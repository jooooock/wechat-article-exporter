<template>
  <header class="sticky top-0 z-20 flex-none px-5 border-b flex items-center justify-between antialiased">
    <div class="flex-auto flex items-center min-w-0 space-x-6">
      <div class="text-md">当前选择公众号: <span class="text-sky-400 font-semibold">{{ activeAccount?.nickname }}</span>
      </div>
      <button @click="isOpen = true"
              class="rounded-md text-sm font-semibold leading-6 py-1 px-3 hover:bg-sky-400 bg-sky-500 text-white shadow-sm">
        切换
      </button>
    </div>
    <div class="flex items-center space-x-3">
      <BatchDownloadButton v-if="activeAccount"/>
      <BaseSearch v-model="articleQuery" @search="searchArticle" placeholder="搜索文章标题"/>
    </div>
  </header>

  <USlideover v-model="isOpen" side="left">
    <div
        class="rounded-lg divide-y divide-gray-100 dark:divide-gray-800 shadow bg-white dark:bg-gray-900 flex flex-col flex-1 overflow-y-scroll">
      <div class="sticky top-0 bg-white shadow">
        <BaseSearch v-model="accountQuery" @search="searchAccount" placeholder="搜索公众号名称"/>
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
import {Loader} from "lucide-vue-next";


const AccountTypeMap: Record<number, string> = {
  0: '订阅号',
  1: '订阅号',
  2: '服务号'
}

const isOpen = ref(false)
const token = useToken()
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
      token: token.value,
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
