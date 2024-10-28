<template>
  <div class="relative pb-24 pt-2 bg-zinc-200">
    <ul class="flex justify-between container mx-auto flex-wrap">
      <ArticleItem
          v-for="(article, index) in articleList.filter(article => hideDeleted ? !article.is_deleted : true)"
          :key="article.aid"
          :index="index + 1"
          :title="article.title"
          :cover="article.pic_cdn_url_235_1 || article.pic_cdn_url_16_9 || article.cover_img || article.cover"
          :cover-theme="article.cover_img_theme_color"
          :digest="article.digest"
          :is-deleted="article.is_deleted"
          :link="article.link"
          :updatedAt="article.update_time"
          :is-original="article.copyright_stat === 1 && article.copyright_type === 1"
          :album-infos="article.appmsg_album_infos"
          :item-show-type="article.item_show_type"
      />
    </ul>
    <div v-element-visibility="onElementVisibility"></div>
    <p v-if="loading" class="flex justify-center items-center mt-2 py-2">
      <Loader :size="28" class="animate-spin text-slate-500"/>
    </p>
    <p v-else-if="noMoreData" class="text-center mt-2 py-2 text-slate-400">已全部加载完毕</p>

    <span class="fixed right-[15px] bottom-0 z-50 font-mono bg-zinc-700 text-sm text-white p-2 rounded" v-if="totalPages > 0">加载进度: {{loadedPages}}/{{totalPages}}</span>
  </div>
</template>

<script setup lang="ts">
import type {AppMsgEx} from "~/types/types";
import {Loader} from "lucide-vue-next";
import {vElementVisibility} from "@vueuse/components"
import {getArticleList} from '~/apis'
import {getArticleCache, hitCache} from "~/store/article";
import {getInfoCache} from "~/store/info";
import {ARTICLE_LIST_PAGE_SIZE} from "~/config";

interface Props {
  hideDeleted?: boolean
}
withDefaults(defineProps<Props>(), {
  hideDeleted: false,
})

const toast = useToast()

const keyword = ref('')
let begin = ref(0)
const articleList = reactive<AppMsgEx[]>([])

// 总页码
const totalPages = ref(0)
// 已加载页码数
const loadedPages = computed(() => Math.ceil(begin.value / ARTICLE_LIST_PAGE_SIZE))

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
    const [articles, completed, totalCount] = await getArticleList(fakeid, loginAccount.value.token, begin.value, keyword.value)
    articleList.push(...articles)
    noMoreData.value = completed
    const count = articles.filter(article => article.itemidx === 1).length
    begin.value += count

    totalPages.value = Math.ceil(totalCount / ARTICLE_LIST_PAGE_SIZE)


    // 加载可用的缓存
    const lastArticle = articles.at(-1)
    if (lastArticle && !keyword.value) {
      // 检查是否存在比 lastArticle 更早的缓存数据
      if (await hitCache(fakeid, lastArticle.create_time)) {
        await loadArticlesFromCache(fakeid, lastArticle.create_time)
      }
    }
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
async function loadArticlesFromCache(fakeid: string, create_time: number) {
  const articles = await getArticleCache(fakeid, create_time)

  articleList.push(...articles)

  // 更新 begin 参数
  const count = articles.filter(article => article.itemidx === 1).length
  begin.value += count

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
 * 初始化
 */
function init(query: string) {
  articleList.length = 0
  begin.value = 0
  noMoreData.value = false
  keyword.value = query

  if (bottomElementIsVisible.value) {
    loadData()
  }
}


// 判断是否触底
const bottomElementIsVisible = ref(false)

function onElementVisibility(visible: boolean) {
  bottomElementIsVisible.value = visible
  if (visible && !noMoreData.value) {
    loadData()
  }
}
</script>
