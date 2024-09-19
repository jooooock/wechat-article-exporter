<template>
  <div class="flex flex-col h-full">
    <Teleport defer to="#title">
      <h1 class="text-[28px] leading-[34px] text-slate-12 font-bold">数据导出</h1>
    </Teleport>
    <div class="flex flex-1 overflow-hidden">
      <ul class="flex flex-col h-full w-[300px] overflow-y-scroll">
        <li v-for="info in infos" :key="info.fakeid" class="px-4 py-4" :class="{'bg-slate-4': selectedAccount === info.fakeid}" @click="selectAccount(info)">
          <p>公众号: {{info.fakeid}}</p>
          <p>昵称: {{info.nickname || 'unknown'}}</p>
          <p>缓存文章数: {{info.articles}}</p>
        </li>
      </ul>
      <main class="flex-1 h-full overflow-y-scroll">
        <div v-if="loading" class="flex justify-center items-center mt-5">
          <Loader :size="28" class="animate-spin text-slate-500"/>
        </div>
        <table v-else-if="selectedAccount" class="w-full border-collapse border rounded-md">
          <thead class="sticky top-0 bg-white">
          <tr>
            <th>序号</th>
            <th>标题</th>
            <th>发布日期</th>
            <th>作者</th>
            <th>是否原创</th>
            <th>是否删除</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(article, index) in articles" :key="article.aid">
            <td class="text-center font-mono">{{index+1}}</td>
            <td class="px-4 font-mono">{{maxLen(article.title)}}</td>
            <td class="text-center font-mono">{{formatTimeStamp(article.update_time)}}</td>
            <td class="text-center">{{article.author_name || '--'}}</td>
            <td class="text-center">{{article.copyright_stat === 1 && article.copyright_type === 1 ? '原创' : ''}}</td>
            <td class="text-center">{{article.is_deleted ? '已删除' : ''}}</td>
          </tr>
          </tbody>
        </table>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {getAllInfo, type Info} from '~/store/info'
import {getArticleCache} from "~/store/article";
import type {AppMsgEx} from "~/types/types";
import {formatTimeStamp} from "~/utils";
import {Loader} from "lucide-vue-next";
import {sleep} from "@antfu/utils";


useHead({
  title: '数据导出 | 微信公众号文章导出'
});

const infos = await getAllInfo()
const selectedAccount = ref('')
const articles = reactive<AppMsgEx[]>([])
const loading = ref(false)

async function selectAccount(info: Info) {
  selectedAccount.value = info.fakeid
  switchTableData(info.fakeid).catch(() => {})
}

async function switchTableData(fakeid: string) {
  loading.value = true
  articles.length = 0
  articles.push(...await getArticleCache(fakeid, Date.now()))
  await sleep(500)
  loading.value = false
}

function maxLen(text: string, max = 35): string {
  if (text.length > max) {
    return text.slice(0, max) + '...'
  }
  return text
}
</script>

<style scoped>
table {
  border-collapse: collapse;
}
table th {
  padding: 0.5rem 0.25rem;
}
table th,
table td {
  border: 1px solid #00002d17;
  padding: 0.25rem 0.5rem;
}
</style>
