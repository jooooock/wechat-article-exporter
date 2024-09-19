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
        <div v-else-if="selectedAccount">
          <div class="sticky top-0 z-50 bg-white flex justify-between items-center  px-4 h-[40px]">
            <div class="flex items-center space-x-4">
              <span>过滤条件:</span>
              <UInput v-model="query.title" placeholder="请输入标题过滤" color="blue" />

              <UPopover :popper="{ placement: 'bottom-start' }">
                <UButton icon="i-heroicons-calendar-days-20-solid" color="gray">
                  {{ format(query.dateRange.start, 'yyyy-MM-dd') }} - {{ format(query.dateRange.end, 'yyyy-MM-dd') }}
                </UButton>

                <template #panel="{ close }">
                  <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">
                    <div class="hidden sm:flex flex-col py-4">
                      <UButton
                          v-for="(range, index) in ranges"
                          :key="index"
                          :label="range.label"
                          color="gray"
                          variant="ghost"
                          class="rounded-none px-6"
                          :class="[isRangeSelected(range.duration) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
                          truncate
                          @click="selectRange(range.duration)"
                      />
                    </div>

                    <DatePicker v-model="query.dateRange" @close="close" />
                  </div>
                </template>
              </UPopover>

              <USelectMenu class="w-40" v-model="query.authors" :options="articleAuthors" multiple placeholder="选择作者" />

              <USelect v-model="query.isOriginal" :options="originalOptions" color="blue"/>

              <UButton color="gray" variant="solid" @click="search">搜索</UButton>
            </div>
            <div>
              <UButton color="black" variant="solid" :disabled="!downloadBtnEnabled" @click="download">批量下载</UButton>
            </div>
          </div>
          <table class="w-full border-collapse border rounded-md">
            <thead class="sticky top-[40px] z-10 bg-white">
            <tr>
              <th>
                <UCheckbox class="justify-center" :indeterminate="isIndeterminate" v-model="checkAll" @change="onCheckAllChange" color="blue" />
              </th>
              <th>序号</th>
              <th>标题</th>
              <th>发布日期</th>
              <th>作者</th>
              <th>是否原创</th>
              <th>是否删除</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(article, index) in articles.filter(article => article.display)" :key="article.aid">
              <td class="text-center" @click="toggleArticleCheck(article)">
                <UCheckbox class="justify-center" v-model="article.checked" color="blue" />
              </td>
              <td class="text-center font-mono">{{index+1}}</td>
              <td class="px-4 font-mono">{{maxLen(article.title)}}</td>
              <td class="text-center font-mono">{{formatTimeStamp(article.update_time)}}</td>
              <td class="text-center">{{article.author_name || '--'}}</td>
              <td class="text-center">{{article.copyright_stat === 1 && article.copyright_type === 1 ? '原创' : ''}}</td>
              <td class="text-center">{{article.is_deleted ? '已删除' : ''}}</td>
            </tr>
            </tbody>
          </table>
        </div>
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
import { sub, format, isSameDay, type Duration } from 'date-fns'

interface Article extends AppMsgEx {
  checked: boolean
  display: boolean
}

const date = ref(new Date())

useHead({
  title: '数据导出 | 微信公众号文章导出'
});

const infos = await getAllInfo()
const selectedAccount = ref('')
const articles = reactive<Article[]>([])
const loading = ref(false)

const checkAll = ref(false)
const isIndeterminate = ref(false)

async function selectAccount(info: Info) {
  selectedAccount.value = info.fakeid
  switchTableData(info.fakeid).catch(() => {})
}

const downloadBtnEnabled = computed(() => {
  return articles.filter(article => article.checked && article.display).length > 0
})

async function switchTableData(fakeid: string) {
  checkAll.value = false
  isIndeterminate.value = false

  loading.value = true
  articles.length = 0
  const data = await getArticleCache(fakeid, Date.now())
  articles.push(...data.map(article => ({...article, checked: false, display: true })))
  await sleep(500)
  loading.value = false

  query.title = ''
  query.authors = []
  query.isOriginal = '所有'
  query.dateRange = {
    start: new Date(articles[articles.length - 1].update_time * 1000),
    end: new Date(),
  }
}

function maxLen(text: string, max = 35): string {
  if (text.length > max) {
    return text.slice(0, max) + '...'
  }
  return text
}

function toggleArticleCheck(article: Article) {
  article.checked = !article.checked

  if (articles.every(article => article.checked)) {
    // 全部选中
    checkAll.value = true
    isIndeterminate.value = false
  } else if (articles.every(article => !article.checked)) {
    // 全部取消选中
    checkAll.value = false
    isIndeterminate.value = false
  } else {
    //
    isIndeterminate.value = true
    checkAll.value = false
  }
}
function onCheckAllChange(evt: InputEvent) {
  if (checkAll.value) {
    articles.forEach(article => {
      article.checked = true
      isIndeterminate.value = false
    })
  } else {
    articles.forEach(article => {
      article.checked = false
      isIndeterminate.value = false
    })
  }
}

const articleAuthors = computed(() => {
  const authors = [...new Set(articles.map(article => article.author_name).filter(author => !!author))]
  authors.push('--')
  return authors
})

function isRangeSelected (duration: Duration) {
  return isSameDay(query.dateRange.start, sub(new Date(), duration)) && isSameDay(query.dateRange.end, new Date())
}

function selectRange (duration: Duration) {
  query.dateRange = { start: sub(new Date(), duration), end: new Date() }
}
const ranges = [
  { label: '最近7天', duration: { days: 7 } },
  { label: '最近14天', duration: { days: 14 } },
  { label: '最近30天', duration: { days: 30 } },
  { label: '最近3个月', duration: { months: 3 } },
  { label: '最近6个月', duration: { months: 6 } },
  { label: '最近1年', duration: { years: 1 } }
]
const originalOptions = ['原创', '非原创', '所有']

interface ArticleQuery {
  title: string
  dateRange: {start: Date, end: Date}
  authors: string[]
  isOriginal: '原创' | '非原创' | '所有'
}
const query = reactive<ArticleQuery>({
  title: '',
  dateRange: {start: sub(new Date(), { days: 14 }), end: new Date()},
  authors: [],
  isOriginal: '所有',
})
function search() {
  checkAll.value = false
  isIndeterminate.value = false

  articles.forEach(article => {
    article.display = true
    article.checked = false

    if (query.title && !article.title.includes(query.title)) {
      article.display = false
    }
    if (query.authors.length > 0 && !query.authors.includes(article.author_name)) {
      article.display = false
    }
    if (query.isOriginal === '原创' && (article.copyright_stat !== 1 || article.copyright_type !== 1)) {
      article.display = false
    }
    if (query.isOriginal === '非原创' && (article.copyright_stat === 1 && article.copyright_type === 1)) {
      article.display = false
    }
    if (new Date(article.update_time * 1000) < query.dateRange.start || new Date(article.update_time * 1000) > query.dateRange.end) {
      article.display = false
    }
  })
}

function download() {
  alert('敬请期待')
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
tr:nth-child(even) {
  background-color: #00005506;
}
tr:hover {
  background-color: #00005506;
}
</style>
