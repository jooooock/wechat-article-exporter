<template>
  <button
      @click="batchDownload"
      :disabled="loading"
      class="bg-sky-900 hover:bg-sky-700 disabled:bg-sky-900 min-w-24 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-sky-50 text-white font-semibold h-10 px-4 rounded flex items-center justify-center">
    <Loader v-if="loading" :size="20" class="animate-spin"/>
    <span v-if="loading">{{phase}}:
      <span v-if="phase === '抓取文章链接'">{{validArticles.length}}</span>
      <span v-if="phase === '下载文章内容'">{{downloadedArticles.length}}/{{validArticles.length}}</span>
      <span v-if="phase === '打包'">{{packedArticles.length}}/{{validArticles.length}}</span>
    </span>
    <span v-else>批量下载</span>
  </button>
</template>

<script setup lang="ts">
import {Loader} from "lucide-vue-next";
import type {AppMsgEx} from "~/types/types";
import {sleep} from "@antfu/utils";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import {downloadArticleHTML, packHTMLAssets, getArticleList} from '~/utils'
import {ARTICLE_LIST_PAGE_SIZE} from "~/config";
import {getArticleCache, hitCache} from "~/store/article";
import {getInfoCache} from "~/store/info";


type AppMsgExWithHTML = AppMsgEx & {
  html?: string
  packed?: boolean
};

const loginAccount = useLoginAccount()
const activeAccount = useActiveAccount()

const begin = ref(0)
const articleList: AppMsgExWithHTML[] = reactive([])
const loading = ref(false)
const phase = ref()

// 未删除的文章列表
const validArticles = computed(() => articleList.filter(article => !article.is_deleted))
// 已下载的文章列表
const downloadedArticles = computed(() => validArticles.value.filter(article => !!article.html))
// 已打包的文章列表
const packedArticles = computed(() => validArticles.value.filter(article => !!article.packed))


async function batchDownload() {
  loading.value = true
  begin.value = 0

  const fakeid = activeAccount.value?.fakeid!
  try {
    phase.value = '抓取文章链接'
    let completed = false
    do {
      await sleep(5 * 1000)

      const [articles, _completed] = await getArticleList(fakeid, loginAccount.value.token, begin.value)
      articleList.push(...articles)
      completed = _completed
      begin.value += ARTICLE_LIST_PAGE_SIZE

      await sleep(5 * 1000)
      if (await handleArticleCache(articles, fakeid)) {
        completed = true
      }

      await sleep(10 * 1000)
    } while (!completed)
  } catch (e: any) {
    console.warn(e.message)
  }


  phase.value = '下载文章内容'
  do {
    for (const article of validArticles.value.filter(article => !article.html)) {
      try {
        article.html = await downloadArticleHTML(article.link, article.title)
        await sleep(200)
      } catch (e: any) {
        console.warn(e.message)
      }
    }
  } while (validArticles.value.filter(article => !article.html).length > 0)


  phase.value = '打包'
  const zip = new JSZip()
  for (const article of downloadedArticles.value) {
    try {
      await packHTMLAssets(article.html!, zip.folder(article.title.replace(/\//g, '+'))!)
      article.packed = true
    } catch (e: any) {
      console.warn(e.message)
    }
  }

  const blob = await zip.generateAsync({type: 'blob'})
  saveAs(blob, `${activeAccount.value?.nickname}.zip`)

  loading.value = false
}

/**
 * 基于接口数据处理本地缓存逻辑
 * @param articles 接口获取的文章列表
 * @param fakeid 公众号id
 */
async function handleArticleCache(articles: AppMsgEx[], fakeid: string) {
  const lastArticle = articles.at(-1)
  if (lastArticle) {
    // 检查是否存在比 lastArticle 更早的缓存数据
    if (await hitCache(fakeid, lastArticle.create_time)) {
      const cachedArticles = await getArticleCache(fakeid, lastArticle.create_time)

      articleList.push(...cachedArticles)

      // 更新 begin 参数
      const count = articleList.filter(article => article.itemidx === 1).length
      begin.value += count

      const cachedInfo = await getInfoCache(fakeid)
      if (cachedInfo && cachedInfo.completed) {
        return true
      }
    }
  }
}

</script>
