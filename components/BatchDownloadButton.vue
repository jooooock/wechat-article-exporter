<template>
  <button
      @click="batchDownload"
      :disabled="loading"
      class="bg-sky-900 hover:bg-sky-700 disabled:bg-sky-900 min-w-24 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-sky-50 text-white font-semibold h-10 px-4 rounded flex items-center justify-center">
    <Loader v-if="loading" :size="20" class="animate-spin"/>
    <span v-if="loading">{{phase}}:
      <span v-if="phase === '抓取文章链接'">{{articles.length}}/{{page}}</span>
      <span v-if="phase === '下载文章内容'">{{downloadedArticles.length}}/{{articles.length}}</span>
      <span v-if="phase === '打包'">{{packedArticles.length}}/{{downloadedArticles.length}}</span>
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

type AppMsgExWithHTML = AppMsgEx & {
  html?: string
  packed?: boolean
};

const token = useToken()
const activeAccount = useActiveAccount()

const page = ref(1)
const articles: AppMsgExWithHTML[] = reactive([])
const loading = ref(false)
const phase = ref()
const downloadedArticles = computed(() => articles.filter(article => !!article.html))
const packedArticles = computed(() => articles.filter(article => !!article.packed))

async function batchDownload() {
  loading.value = true

  try {
    phase.value = '抓取文章链接'
    let data = []
    do {
      data = await getArticleList(activeAccount.value?.fakeid!, token.value, page.value)
      articles.push(...data)
      await sleep(8000)
      page.value++
    } while (data.length > 0)
  } catch (e: any) {
    console.warn(e.message)
  }


  phase.value = '下载文章内容'
  do {
    for (const article of articles.filter(article => !article.is_deleted && !article.html)) {
      try {

        article.html = await downloadArticleHTML(article.link, article.title)
        await sleep(6000)
      } catch (e: any) {
        console.warn(e.message)
      }
    }
  } while (articles.filter(article => !article.is_deleted && !article.html).length > 0)


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
  saveAs(blob, 'results.zip')

  loading.value = false
}

</script>
