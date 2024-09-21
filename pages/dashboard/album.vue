<template>
  <div class="flex flex-col h-full">
    <Teleport defer to="#title">
      <h1 class="text-[28px] leading-[34px] text-slate-12 font-bold">合集下载 <span class="text-sm text-slate-10">合集数据来自于已缓存文章</span>
      </h1>
    </Teleport>
    <div class="flex flex-1 overflow-hidden">

      <ul class="flex flex-col h-full w-fit overflow-y-scroll divide-y">
        <li v-for="accountInfo in cachedAccountInfos" :key="accountInfo.fakeid" class="relative px-4 pr-16 py-4"
            :class="{'bg-slate-3': selectedAccount?.fakeid === accountInfo.fakeid}"
            @click="toggleSelectedAccount(accountInfo)">
          <p>公众号:
            <span v-if="accountInfo.nickname" class="text-xl font-medium">{{ accountInfo.nickname }}</span>
          </p>
          <p>ID: <span class="font-mono">{{ accountInfo.fakeid }}</span></p>
          <UBadge variant="subtle" color="red" class="absolute top-4 right-2">
            <Loader v-if="!accountInfo.albums" :size="28" class="animate-spin text-slate-500"/>
            <span v-else>{{ accountInfo.albums.length }}</span>
          </UBadge>
        </li>
      </ul>

      <ul v-if="selectedAccount" class="flex flex-col h-full w-72 overflow-y-scroll divide-y">
        <li v-for="(album, index) in selectedAccount.albums" :key="album.id" class="p-4"
            :class="{'bg-slate-3': selectedAlbum?.id === album.id}" @click="toggleSelectedAlbum(album)">
          {{ index + 1 }}. {{ album.title }}
        </li>
      </ul>

      <main class="flex-1 h-full overflow-y-scroll bg-[#ededed]" v-if="selectedAccount && selectedAlbum">
        <div v-if="albumLoading" class="flex justify-center items-center mt-5">
          <Loader :size="28" class="animate-spin text-slate-500"/>
        </div>
        <div v-else-if="albumBaseInfo" class="max-w-2xl mx-auto bg-white">
          <!-- banner -->
          <div class="px-5 pt-7 pb-14 banner">
            <h2 class="text-2xl text-white font-bold"># {{ albumBaseInfo.title }}</h2>
          </div>
          <div class="relative rounded-xl -mt-4 z-50 bg-white px-4 py-6">
            <!-- 头部信息 -->
            <div class="pb-10">
              <p class="flex items-center space-x-2 mb-2">
                <img class="size-5" :src="albumBaseInfo.brand_icon" alt="">
                <span>{{ albumBaseInfo.nickname }}</span>
              </p>
              <p class="text-sm text-slate-10">
                <span>{{ albumBaseInfo.article_count }}篇内容</span>
                <span v-if="albumBaseInfo.description"> · {{ albumBaseInfo.description }}</span>
              </p>
              <div class="flex mt-8 space-x-2 w-fit" @click="toggleReverse">
                <ArrowUpNarrowWide v-if="isReverse" />
                <ArrowDownNarrowWide v-else />
                <span>{{isReverse ? '倒序' : '正序'}}</span>
              </div>

              <UButton color="black" variant="solid" class="absolute right-5 top-2 disabled:bg-slate-4 disabled:text-slate-12"
                       :disabled="albumArticles.length === 0 || batchDownloadLoading" @click="batchDownload(albumArticles, downloadFileName)">
                <Loader v-if="batchDownloadLoading" :size="20" class="animate-spin"/>
                <span v-if="batchDownloadLoading">{{ batchDownloadPhase }}:
                  <span
                      v-if="batchDownloadPhase === '下载文章内容'">{{ batchDownloadedCount }}/{{ albumArticles.length }}</span>
                  <span
                      v-if="batchDownloadPhase === '打包'">{{ batchPackedCount }}/{{ batchDownloadedCount }}</span>
                </span>
                <span v-else>批量下载</span>
              </UButton>
            </div>

            <!-- 文章列表 -->
            <ul class="divide-y">
              <li class="flex justify-between items-center py-5 px-1" v-for="article in albumArticles"
                  :key="article.key">
                <div class="flex-1">
                  <h3 class="text-lg mb-2">
                    <span v-if="article.pos_num">{{ article.pos_num }}. </span>
                    <span>{{ article.title }}</span>
                  </h3>
                  <time class="text-sm text-slate-10">{{ article.create_time }}</time>
                </div>
                <img class="size-16 ml-4 flex-shrink-0" :src="article.cover_img_1_1" alt="">
              </li>
            </ul>
            <div v-element-visibility="onElementVisibility"></div>
            <p v-if="articleLoading" class="flex justify-center items-center mt-2 py-2">
              <Loader :size="28" class="animate-spin text-slate-500"/>
            </p>
            <p v-else-if="noMoreData" class="text-center mt-2 py-2 text-slate-400">已全部加载完毕</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {getAllInfo, type Info} from "~/store/info";
import {getArticleCache} from "~/store/article";
import type {AppMsgAlbumInfo} from "~/types/types";
import {Loader} from "lucide-vue-next";
import type {AppMsgAlbumResult, ArticleItem, BaseInfo} from "~/types/album";
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-vue-next';
import {vElementVisibility} from "@vueuse/components"
import {useDownloadAlbum} from '~/composables/useBatchDownload'


useHead({
  title: '合集下载 | 微信公众号文章导出'
});

interface AccountInfo extends Info {
  albums?: AppMsgAlbumInfo[]
}

// 已缓存的公众号信息
const cachedAccountInfos: AccountInfo[] = reactive(await getAllInfo())
cachedAccountInfos.forEach(async accountInfo => {
  accountInfo.albums = await getAllAlbums(accountInfo.fakeid)
})

// 已选择的公众号
const selectedAccount = ref<AccountInfo | null>(null)
const downloadFileName = computed(() => {
  return (selectedAccount.value!.nickname || selectedAccount.value!.fakeid) + '-' + selectedAlbum.value!.title
})

// 切换公众号
async function toggleSelectedAccount(info: AccountInfo) {
  if (info.fakeid !== selectedAccount.value?.fakeid) {
    selectedAccount.value = info
  }
}

// 已选择的合集
const selectedAlbum = ref<AppMsgAlbumInfo | null>(null)

// 切换合集
function toggleSelectedAlbum(album: AppMsgAlbumInfo) {
  if (album.id !== selectedAlbum.value?.id) {
    selectedAlbum.value = album

    isReverse.value = false
    getFirstPageAlbumData().catch(() => {})
  }
}

// 获取公众号下所有的合集数据（根据已缓存的文章数据）
async function getAllAlbums(fakeid: string) {
  const articles = await getArticleCache(fakeid, Date.now())
  const albums: AppMsgAlbumInfo[] = []
  articles.flatMap(article => article.appmsg_album_infos).forEach(album => {
    if (!albums.some(a => a.id === album.id)) {
      albums.push(album)
    }
  })

  return albums
}


const albumArticles: ArticleItem[] = reactive([])
const albumBaseInfo = ref<BaseInfo | null>(null)

const isReverse = ref(false)
const albumLoading = ref(false)
const articleLoading = ref(false)


// 加载合集第一页数据
async function getFirstPageAlbumData() {
  albumLoading.value = true
  albumArticles.length = 0

  const data = await $fetch<AppMsgAlbumResult>('/api/appmsgalbum', {
    method: 'GET',
    query: {
      fakeid: selectedAccount.value!.fakeid,
      album_id: selectedAlbum.value!.id,
      is_reverse: isReverse.value ? '1' : '0',
    }
  })
  albumLoading.value = false

  if (data.base_resp.ret === 0) {
    albumBaseInfo.value = data.getalbum_resp.base_info
    albumArticles.push(...data.getalbum_resp.article_list)
    noMoreData.value = data.getalbum_resp.continue_flag === '0'
  }
}

// 切换正序/倒序
function toggleReverse() {
  isReverse.value = !isReverse.value

  albumArticles.length = 0
  noMoreData.value = false
  if (parseInt(albumBaseInfo.value!.article_count) <= 20) {
    loadMoreData()
  }
}

// 加载合集后续数据
async function loadMoreData() {
  articleLoading.value = true

  const lastArticle = albumArticles[albumArticles.length - 1]
  const data = await $fetch<AppMsgAlbumResult>('/api/appmsgalbum', {
    method: 'GET',
    query: {
      fakeid: selectedAccount.value!.fakeid,
      album_id: selectedAlbum.value!.id,
      is_reverse: isReverse.value ? '1' : '0',
      begin_msgid: lastArticle?.msgid,
      begin_itemidx: lastArticle?.itemidx,
    }
  })
  articleLoading.value = false

  if (data.base_resp.ret === 0) {
    albumArticles.push(...data.getalbum_resp.article_list)
    noMoreData.value = data.getalbum_resp.continue_flag === '0'
  }
}

const noMoreData = ref(false)
// 判断是否触底
const bottomElementIsVisible = ref(false)

function onElementVisibility(visible: boolean) {
  bottomElementIsVisible.value = visible
  if (visible && !noMoreData.value) {
    loadMoreData()
  }
}

const {
  loading: batchDownloadLoading,
  phase: batchDownloadPhase,
  downloadedCount: batchDownloadedCount,
  packedCount: batchPackedCount,
  download: batchDownload,
} = useDownloadAlbum()
</script>

<style scoped>
.banner {
  background: linear-gradient(rgb(9, 9, 9), rgb(35, 35, 35));
}
</style>
