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
import type {AppMsgEx, AppMsgPublishResponse, PublishInfo, PublishPage} from "~/types/types";
import {sleep} from "@antfu/utils";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import mime from "mime";

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
      data = await getArticleList(page.value)
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
        article.html = await downloadHTML(article)
        await sleep(4000)
      } catch (e: any) {
        console.warn(e.message)
      }
    }
  } while (articles.filter(article => !article.is_deleted && !article.html).length > 0)


  phase.value = '打包'
  const zip = new JSZip()
  for (const article of downloadedArticles.value) {
    try {
      await packArticle(article, zip.folder(article.title.replace(/\//g, '+'))!)
      article.packed = true
    } catch (e: any) {
      console.warn(e.message)
    }
  }

  const blob = await zip.generateAsync({type: 'blob'})
  saveAs(blob, 'results.zip')

  loading.value = false
}

async function getArticleList(page = 1) {
  const resp = await $fetch<AppMsgPublishResponse>('/api/appmsgpublish', {
    method: 'GET',
    query: {
      id: activeAccount.value?.fakeid,
      page: page,
      size: 20,
      token: token.value,
    }
  })

  if (resp.base_resp.ret === 0) {
    const publish_page: PublishPage = JSON.parse(resp.publish_page)
    const publish_list = publish_page.publish_list.filter(item => !!item.publish_info)

    if (publish_list.length === 0) {
      // 全部加载完毕
      return []
    }
    return publish_list.flatMap(item => {
      const publish_info: PublishInfo = JSON.parse(item.publish_info)
      return publish_info.appmsgex
    })
  } else if (resp.base_resp.ret === 200003) {
    throw new Error('session expired')
  } else {
    throw new Error(resp.base_resp.err_msg)
  }
}

async function downloadHTML(article: AppMsgEx) {
  const fullHTML = await $fetch<string>('/api/download?url=' + encodeURIComponent(article.link))

  const parser = new DOMParser()
  const document = parser.parseFromString(fullHTML, 'text/html')
  const $pageContent = document.querySelector('#page-content')
  if (!$pageContent) {
    throw new Error('下载失败，请重试')
  }
  return fullHTML
}

async function packArticle(article: AppMsgExWithHTML, zip: JSZip) {
  try {
    const parser = new DOMParser()
    const document = parser.parseFromString(article.html!, 'text/html')
    const $pageContent = document.querySelector('#page-content')!
    $pageContent.querySelector('#js_content')?.removeAttribute('style')

    const imgs = $pageContent.querySelectorAll('img')
    zip.folder('assets')
    for (const img of imgs) {
      const imgData = await $fetch<Blob>(img.src)
      const uuid = new Date().getTime() + Math.random().toString()
      const ext = mime.getExtension(imgData.type)
      zip.file(`assets/${uuid}.${ext}`, imgData)

      // 重写路径，指向本地图片文件
      img.src = `./assets/${uuid}.${ext}`
    }

    // 处理背景图片
    const map = new Map<string, string>()
    let pageContentHTML = $pageContent.outerHTML

    // 收集背景图片
    const bgImages = new Set<string>()
    pageContentHTML.replaceAll(/((?:background|background-image): url\((?:&quot;)?)((?:https?|\/\/)[^)]+?)((?:&quot;)?\))/gs, (match, p1, url, p3) => {
      bgImages.add(url)
      return `${p1}${url}${p3}`
    })
    for (const url of bgImages) {
      const imgData = await $fetch<Blob>(url)
      const uuid = new Date().getTime() + Math.random().toString()
      const ext = mime.getExtension(imgData.type)

      zip.file(`assets/${uuid}.${ext}`, imgData)
      map.set(url, `assets/${uuid}.${ext}`)
    }

    pageContentHTML = pageContentHTML.replaceAll(/((?:background|background-image): url\((?:&quot;)?)((?:https?|\/\/)[^)]+?)((?:&quot;)?\))/gs, (match, p1, url, p3) => {
      if (map.has(url)) {
        const path = map.get(url)!
        return `${p1}./${path}${p3}`
      } else {
        console.warn('背景图片丢失')
        return `${p1}${url}${p3}`
      }
    })


    const indexHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport"
          content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0,viewport-fit=cover">
    <link rel="stylesheet" href="//res.wx.qq.com/mmbizappmsg/zh_CN/htmledition/js/assets/index.lyzn48mo196f5b68.css">
    <link rel="stylesheet" href="//res.wx.qq.com/mmbizappmsg/zh_CN/htmledition/js/assets/cover_next.lyzn48mo6e86e161.css">
    <link rel="stylesheet" href="//res.wx.qq.com/mmbizappmsg/zh_CN/htmledition/js/assets/interaction.lyzn48mo9570c58b.css">
    <link rel="stylesheet" href="//res.wx.qq.com/mmbizappmsg/zh_CN/htmledition/js/assets/qqmail_tpl_vite_entry.lyzn48moe171b81c.css">
    <link rel="stylesheet" href="//res.wx.qq.com/mmbizappmsg/zh_CN/htmledition/js/assets/tencent_portfolio_light.lyzn48mo0cd74df8.css">
    <style>
#page-content {
max-width: 667px;
margin: 0 auto;
}
img {
max-width: 100%;
}
    </style>
</head>
<body>
${pageContentHTML}
</body>
</html>`

    zip.file('index.html', indexHTML)
  } finally {

  }
}
</script>
