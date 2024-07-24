<template>
  <header
      class="sticky top-0 z-20 flex-none py-3 pl-5 pr-3 sm:pl-6 sm:pr-4 md:pr-3.5 lg:px-6 flex items-center space-x-4 antialiased">
    <div class="flex-auto flex items-center min-w-0 space-x-6">
      <div class="text-md">当前选择公众号: <span class="text-sky-400 font-semibold">{{activeAccount?.nickname}}</span></div>
      <button @click="isOpen = true"
              class="rounded-md text-sm font-semibold leading-6 py-1 px-3 hover:bg-sky-400 bg-sky-500 text-white shadow-sm dark:shadow-highlight/20">
        切换
      </button>
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
      <div class="flex-1 px-4 py-5 sm:p-6">
        <ul>
          <li v-for="account in accountList"
              :key="account.fakeid"
              class="flex mb-3"
              :class="{active: account.fakeid === activeAccount?.fakeid}"
              @click="selectAccount(account)"
          >
            <img class="w-20 h-20 rounded mr-1" :src="proxyImage(account.round_head_img)" alt="">
            <div class="flex-1">
              <div class="flex justify-between">
                <p class="nickname">{{ account.nickname }}</p>
                <p class="type">{{ AccountTypeMap[account.service_type] }}</p>
              </div>
              <p class="text-gray-500">微信号: {{ account.alias || '未设置' }}</p>
              <p class="signature">{{ account.signature }}</p>
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

function proxyImage(url: string) {
  return `https://service.champ.design/api/proxy?url=${encodeURIComponent(url)}`
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

const emit = defineEmits(['select'])

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
