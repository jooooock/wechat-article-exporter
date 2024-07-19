<template>
  <div class="">
    <mp-search v-model="accountQuery" @search="searchAccount" placeholder="搜索公众号" />
    <ul>
      <AccountItem
          v-for="account in accountList"
          :key="account.fakeid"
          :class="{active: account.fakeid === activeAccountFakeID}"
          v-bind="account"
          @click="selectAccount(account)"
      />
    </ul>
    <p v-if="loading" class="text-center">loading...</p>
    <button v-else class="block mx-auto border-2 w-1/4 hover:border-amber-700 rounded py-1 px-3 mt-2" @click="nextAccountPage" v-if="accountList.length > 0">下一页</button>
  </div>
</template>

<script setup lang="ts">
import type {AccountInfo, SearchBizResponse} from "~/types/types";
import {activeAccountFakeID} from "~/composables/useActiveAccount";

const accountQuery = ref('')
const accountList = reactive<AccountInfo[]>([])
let accountPageNo = 1

const token = useToken()

const emit = defineEmits(['select'])

const loading = ref(false)

async function getAccountList() {
  loading.value = true
  const resp = await $fetch<SearchBizResponse>('/api/searchbiz', {
    method: 'GET',
    query: {
      keyword: accountQuery.value,
      page: accountPageNo,
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
function searchAccount() {
  accountPageNo = 1
  accountList.length = 0
  getAccountList()
}
function selectAccount(account: AccountInfo) {
  emit('select', account)
}

function nextAccountPage() {
  accountPageNo++
  getAccountList()
}
</script>
