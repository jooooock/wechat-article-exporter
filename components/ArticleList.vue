<template>
  <div class="pb-24 pt-2 bg-zinc-200">
    <ul class="flex justify-between container mx-auto flex-wrap">
      <ArticleItem
          v-for="(article, index) in articleList"
          :key="article.appmsgid"
          :index="index + 1"
          :title="article.title"
          :cover="article.pic_cdn_url_235_1 || article.pic_cdn_url_16_9 || article.cover_img || article.cover"
          :cover-theme="article.cover_img_theme_color"
          :digest="article.digest"
          :is-deleted="article.is_deleted"
          :link="article.link"
          :updatedAt="article.update_time"
      />
    </ul>
    <div v-element-visibility="onElementVisibility"></div>
    <p v-if="loading" class="flex justify-center items-center mt-2 py-2">
      <Loader :size="28" class="animate-spin text-slate-500"/>
    </p>
    <p v-else-if="noMoreData" class="text-center mt-2 py-2 text-slate-400">已全部加载完毕</p>
  </div>
</template>

<script setup lang="ts">
import type {AppMsgEx} from "~/types/types";
import {Loader} from "lucide-vue-next";
import {vElementVisibility} from "@vueuse/components"
import {getArticleList} from '~/utils'
import {getArticleCache, hitCache} from "~/store/article";
import {getInfoCache} from "~/store/info";
import {ARTICLE_LIST_PAGE_SIZE} from "~/config";

const toast = useToast()
const initialPageSize = -1 * ARTICLE_LIST_PAGE_SIZE

const keyword = ref('')
let begin = initialPageSize
const articleList = reactive<AppMsgEx[]>([])


const loginAccount = useLoginAccount()
const activeAccount = useActiveAccount()


defineExpose({
  init,
})

const loading = ref(false)
const noMoreData = ref(false)

async function loadData() {
  loading.value = true
  try {
    const fakeid = activeAccount.value?.fakeid!
    const [articles, completed] = await getArticleList(fakeid, loginAccount.value.token, begin, keyword.value)
    articleList.push(...articles)
    // 全部加载完毕
    noMoreData.value = completed

    await handleArticleCache(articles, fakeid)
  } catch (e: any) {
    alert(e.message)
    console.error(e)
    if (e.message === 'session expired') {
      navigateTo('/login')
    }
  } finally {
    loading.value = false
  }
}

/**
 * 从缓存加载当前公众号的历史文章
 */
async function loadArticlesFromCache(fakeid: string) {
  const lastArticle = articleList.at(-1)!
  const articles = await getArticleCache(fakeid, lastArticle.create_time)

  console.info(`从缓存中加载了${articles.length}条数据`)

  articleList.push(...articles)

  // 更新 begin 参数
  const count = articles.filter(article => article.itemidx === 1).length
  console.info('消息数:', count)
  begin += count

  const cachedInfo = await getInfoCache(fakeid)
  if (cachedInfo && cachedInfo.completed) {
    noMoreData.value = true
  }

  toast.add({
    title: `成功从缓存中加载了${articles.length}条数据`,
    timeout: 5000,
  })
}

/**
 * 基于接口数据处理本地缓存逻辑
 * @param articles 接口获取的文章列表
 * @param fakeid 公众号id
 */
async function handleArticleCache(articles: AppMsgEx[], fakeid: string) {
  if (keyword.value) {
    // 如果是搜索请求，则忽略缓存处理
    return
  }

  const lastArticle = articles.at(-1)
  if (lastArticle) {
    // 检查是否存在比 lastArticle 更早的缓存数据
    if (await hitCache(fakeid, lastArticle.create_time)) {
      await loadArticlesFromCache(fakeid)
      // toast.add({
      //   icon: 'i-heroicons-circle-stack-20-solid',
      //   title: '是否从缓存加载历史文章？',
      //   description: '基于你的浏览记录，当前公众号的历史文章存在缓存，从缓存加载可以节省接口调用次数',
      //   timeout: 0,
      //   actions: [
      //     {
      //       label: '确定',
      //       variant: 'solid',
      //       color: 'black',
      //       size: 'md',
      //       block: true,
      //       click: () => {
      //         loadArticlesFromCache(fakeid)
      //       }
      //     }
      //   ]
      // })
    }
  }
}

/**
 * 加载下一页
 */
function nextArticlePage() {
  begin += ARTICLE_LIST_PAGE_SIZE
  loadData()
}

/**
 * 初始化
 */
function init(query: string) {
  articleList.length = 0
  begin = initialPageSize
  noMoreData.value = false
  keyword.value = query

  if (bottomElementIsVisible.value) {
    nextArticlePage()
  }
}


// 判断是否触底
const bottomElementIsVisible = ref(false)

function onElementVisibility(visible: boolean) {
  bottomElementIsVisible.value = visible
  if (visible && !noMoreData.value) {
    nextArticlePage()
  }
}
</script>
