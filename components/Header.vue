<template>
  <header class="sticky top-0 z-20 flex-none px-5 border-b flex items-center justify-between antialiased">
    <div class="flex-auto flex items-center min-w-0 space-x-6">
      <div class="text-md">当前选择公众号: <span class="text-sky-400 font-semibold">{{activeAccount?.nickname}}</span></div>
      <button @click="isOpen = true"
              class="rounded-md text-sm font-semibold leading-6 py-1 px-3 hover:bg-sky-400 bg-sky-500 text-white shadow-sm">
        切换
      </button>
    </div>
    <div class="flex items-center">
      <mp-search v-model="articleQuery" @search="searchArticle" placeholder="搜索文章标题"/>
    </div>
  </header>

  <USlideover v-model="isOpen" side="left">
    <div
        class="rounded-lg divide-y divide-gray-100 dark:divide-gray-800 shadow bg-white dark:bg-gray-900 flex flex-col flex-1 overflow-y-scroll">
      <div class="px-4 py-5 sm:px-6 sticky top-0 bg-white">
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <div class="flex">
            <UFormGroup label="" name="query" class="flex-1">
              <UInput v-model="state.query" placeholder="搜索公众号" autocomplete="off"/>
            </UFormGroup>
            <UButton type="submit" class="ml-2">搜索</UButton>
          </div>
        </UForm>
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
        <p v-if="loading" class="text-center mt-2 py-2">loading...</p>
        <button v-else class="block mx-auto border-2 w-1/4 hover:border-amber-700 rounded py-1 px-3 mt-2"
                @click="nextAccountPage" v-if="accountList.length > 0">下一页
        </button>
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import {z} from 'zod'
import type {FormSubmitEvent} from '#ui/types'
import type {AccountInfo, SearchBizResponse} from "~/types/types";
import {activeAccount} from "~/composables/useActiveAccount";

const AccountTypeMap: Record<number, string> = {
  0: '订阅号',
  1: '订阅号',
  2: '服务号'
}

const articleQuery = ref('')
function searchArticle() {
  if (!activeAccount.value) {
    alert('请先选择公众号')
    return
  }

  emit('search', articleQuery.value)
}

const isOpen = ref(false)

const schema = z.object({
  query: z.string(),
})

type Schema = z.output<typeof schema>

const state = reactive({
  query: undefined,
})

const accountQuery = ref('')
const accountList = reactive<AccountInfo[]>([])
let pageNo = 1

async function onSubmit(event: FormSubmitEvent<Schema>) {
  accountQuery.value = event.data.query
  pageNo = 1
  accountList.length = 0
  getAccountList()
}


const token = useToken()

const emit = defineEmits(['select', 'search'])

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
  emit('select', account)
  isOpen.value = false
}

function nextAccountPage() {
  pageNo++
  getAccountList()
}
</script>
