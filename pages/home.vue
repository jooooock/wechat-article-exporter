<template>
  <div id="app">
    <div class="left">
      <form class="search" id="account-search" @submit.prevent="searchAccount">
        <input type="text" v-model="accountQuery" autocomplete="off" placeholder="搜索公众号">
        <button type="submit">搜索</button>
      </form>
      <ul id="accounts">
        <li
            v-for="account in accountList"
            :key="account.fakeid"
            :data-fakeid="account.fakeid"
            :class="{active: account.fakeid === activeAccountFakeID}"
            @click="selectAccount(account)"
        >
          <img class="avatar" :src="proxyImage(account.round_head_img)" alt="">
          <div class="content">
            <div class="row">
              <p class="nickname">{{ account.nickname }}</p>
              <p class="alias">微信号: {{ account.alias || '未设置' }}</p>
              <p class="type">{{ AccountTypeMap[account.service_type] }}</p>
            </div>
            <p class="signature">{{ account.signature }}</p>
          </div>
        </li>
      </ul>
      <button @click="nextAccountPage" v-if="accountList.length > 0">下一页</button>
      <a :href="'/api/logout?token='+token">退出</a>
    </div>
    <div class="right">
      <form class="search" id="article-search" @submit.prevent="searchArticle">
        <input type="text" v-model="articleQuery" autocomplete="off" placeholder="选择公众号，搜索文章">
        <button type="submit">搜索</button>
      </form>
      <ul id="articles">
        <li v-for="article in articleList" :key="article.appmsgid" :class="{isDeleted: article.is_deleted}">
          <img :src="proxyImage(article.cover || article.cover_img)" alt="" class="cover">
          <div class="content">
            <div class="head">
              <p class="title">{{article.title}}</p>
              <p class="time">{{articleUpdateTime(article.update_time)}}</p>
            </div>
            <p class="digest">{{article.digest}}</p>
            <div class="actions">
              <a :href="article.link" class="link" target="_blank">查看全文</a>
              <a href="javascript:void 0" class="download" @click="download(article.link)">下载</a>
            </div>
          </div>
        </li>
      </ul>
      <button @click="nextArticlePage" v-if="articleList.length > 0">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  AccountInfo,
  AppMsgEx,
  AppMsgPublishResponse,
  PublishInfo,
  PublishPage,
  SearchBizResponse
} from "~/types/types";

definePageMeta({
  layout: false
})

const AccountTypeMap: Record<number, string> = {
  0: '订阅号',
  1: '订阅号',
  2: '服务号'
}
const token = window.localStorage.getItem('token')

function proxyImage(url: string) {
  return `https://service.champ.design/api/proxy?url=${encodeURIComponent(url)}`
}


const accountQuery = ref('')
const accountList = reactive<AccountInfo[]>([])
let accountPageNo = 1
const activeAccountFakeID = ref('')

async function getAccountList() {
  const resp = await $fetch<SearchBizResponse>('/api/searchbiz', {
    method: 'GET',
    query: {
      keyword: accountQuery.value,
      page: accountPageNo,
      token: token,
    }
  })

  if (resp.base_resp.ret === 0) {
    accountList.push(...resp.list)
  } else if (resp.base_resp.ret === 200003) {
    navigateTo('/login')
  } else {
    console.log(resp.base_resp.err_msg)
  }
}

const articleQuery = ref('')
const articleList = reactive<AppMsgEx[]>([])
let articlePageNo = 1
async function getArticleList() {
  const resp = await $fetch<AppMsgPublishResponse>('/api/appmsgpublish', {
    method: 'GET',
    query: {
      id: activeAccountFakeID.value,
      keyword: articleQuery.value,
      page: articlePageNo,
      token: token,
    }
  })

  if (resp.base_resp.ret === 0) {
    const publish_page: PublishPage = JSON.parse(resp.publish_page)

    publish_page.publish_list.forEach(item => {
      const publish_info: PublishInfo = JSON.parse(item.publish_info)
      articleList.push(...publish_info.appmsgex)
    })
  } else if (resp.base_resp.ret === 200003) {
    navigateTo('/login')
  } else {
    console.log(resp.base_resp.err_msg)
  }
}

function selectAccount(account: AccountInfo) {
  activeAccountFakeID.value = account.fakeid
  articleList.length = 0
  articlePageNo = 1

  getArticleList()
}
function articleUpdateTime(update_time: number) {
  return new Date(update_time * 1000).toISOString().replace('T', ' ').replace('.000Z', '')
}

function searchAccount() {
  accountPageNo = 1
  accountList.length = 0
  getAccountList()
}
function searchArticle() {
  if (!activeAccountFakeID.value) {
    alert('请先选择公众号')
    return
  }

  articlePageNo = 1
  articleList.length = 0
  getArticleList()
}

function nextAccountPage() {
  accountPageNo++
  getAccountList()
}
function nextArticlePage() {
  articlePageNo++
  getArticleList()
}

function download(link: string) {
  // const iframe = document.createElement('iframe')
  // iframe.src = link
  // iframe.style.display = 'none'
  // document.body.appendChild(iframe)
}
</script>

<style scoped>
#app {
  display: flex;
  height: 100vh;
  overflow: hidden;

  & > .left {
    width: 600px;
    border-right: 1px solid lightgray;
    overflow-y: scroll;
    overflow-x: hidden;

    & > .search {
      display: flex;
      position: sticky;
      top: 0;

      & input {
        flex: 1;
      }
    }
  }

  & > .right {
    flex: 1;
    overflow-y: scroll;
    overflow-x: hidden;

    & > .search {
      display: flex;
      position: sticky;
      top: 0;

      & input {
        flex: 1;
      }
    }
  }
}

ul {
  padding: 0;
}

#accounts > li {
  display: flex;
  border-bottom: 1px solid lightgray;
  padding: 10px 20px;
  align-items: center;
  cursor: pointer;

  &:hover, &.active {
    background-color: cornsilk;
  }

  & > .avatar {
    display: block;
    width: 100px;
    height: 100px;
    margin-right: 10px;
  }

  & > .content {
    flex: 1;

    & > .row {
      display: flex;
      margin-bottom: 20px;

      & > .nickname {
        margin-right: 30px;
        color: #333;
      }

      & > .alias {
        flex: 1;
        font-size: 14px;
        color: darkgray;
      }

      & > .type {

      }
    }

    & > .signature {
      font-size: 14px;
    }
  }
}

#articles > li {
  position: relative;
  display: flex;
  border: 1px solid lightgray;
  border-radius: 8px;
  margin: 20px;
  padding: 10px 20px;
  align-items: center;

  &.isDeleted::after {
    content: '已删';
    color: red;
    position: absolute;
    right: 20px;
    bottom: 20px;
  }

  & > .cover {
    display: block;
    width: 100px;
    height: 100px;
    margin-right: 10px;
  }

  & > .content {
    flex: 1;

    & > .head {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      & > .title {
        font-size: 18px;
        font-weight: bold;
        color: darkblue;
      }

      .highlight {
        color: red;
      }

      & > .time {
        font-size: 14px;
      }
    }

    & > .digest {
      font-size: 14px;
    }

    & > .actions {
      margin-top: 10px;
      display: flex;
      gap: 10px;
      font-size: 14px;
    }
  }
}

</style>
