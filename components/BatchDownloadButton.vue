<template>
  <button
      @click="batchDownload"
      :disabled="loading"
      class="bg-sky-900 hover:bg-sky-700 disabled:bg-sky-900 min-w-24 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-sky-50 text-white font-semibold h-10 px-4 rounded flex items-center justify-center">
    <Loader v-if="loading" :size="20" class="animate-spin"/>
    <span v-if="loading">{{phase}}:
      <span v-if="phase === '抓取文章链接'">{{validArticles.length}}</span>
      <span v-if="phase === '下载文章内容'">{{downloadedArticles.length}}/{{validArticles.length}}</span>
      <span v-if="phase === '打包'">{{packedArticles.length}}/{{downloadedArticles.length}}</span>
    </span>
    <span v-else>批量下载</span>
  </button>
</template>

<script setup lang="ts">
import {Loader} from "lucide-vue-next";
import type {AppMsgExWithHTML} from "~/types/types";
import {sleep} from "@antfu/utils";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import {downloadArticleHTMLs, packHTMLAssets} from '~/utils'
import {getArticleCache} from "~/store/article";
import {uploadProxy} from "~/store/proxy";


const activeAccount = useActiveAccount()

const articleList: AppMsgExWithHTML[] = reactive([])
const loading = ref(false)
const phase = ref()

// 未删除的文章列表
const validArticles = computed(() => articleList.filter(article => !article.is_deleted))
// 已下载的文章列表
const downloadedArticles = computed(() => validArticles.value.filter(article => !!article.html))
// 已打包的文章列表
const packedArticles = computed(() => validArticles.value.filter(article => !!article.packed))


/**
 * 批量导出
 */
async function batchDownload() {
  loading.value = true

  const fakeid = activeAccount.value?.fakeid!
  try {
    phase.value = '抓取文章链接'

    const articles = await getArticleCache(fakeid, new Date().getTime())
    articleList.push(...articles)
    await sleep(1000)
  } catch (e: any) {
    console.info('抓取文章链接失败:')
    console.warn(e.message)
  }

  phase.value = '下载文章内容'
  await downloadArticleHTMLs(validArticles.value.map(article => ({
    title: article.title,
    url: article.link,
  })))

  phase.value = '打包'
  const zip = new JSZip()
  for (const article of downloadedArticles.value) {
    try {
      await packHTMLAssets(article.html!, article.title, zip.folder(article.title.replace(/\//g, '+'))!)
      article.packed = true
    } catch (e: any) {
      console.info('打包失败:')
      console.warn(e.message)
    }
  }

  const blob = await zip.generateAsync({type: 'blob'})
  saveAs(blob, `${activeAccount.value?.nickname}.zip`)

  await uploadProxy()

  loading.value = false
}

</script>
