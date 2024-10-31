<template>
  <div class="flex">
    <nav>
      <aside
          class="hidden md:flex flex-col h-screen w-[250px] flex-shrink-0 justify-between border-r border-slate-4 bg-slate-1 px-4 pb-6">
        <div class="flex items-center h-[60px]">
          <NuxtLink to="/dashboard" class="px-2 font-bold text-xl">微信公众号文章导出</NuxtLink>
        </div>

        <!-- 导航菜单 -->
        <nav class="flex-1 mt-6">
          <ul class="flex flex-col gap-2">
            <li v-for="item in items" :key="item.name">
              <NuxtLink
                  :to="item.href"
                  class="flex h-8 items-center gap-2 rounded-md px-2 text-sm"
                  :class="{
                    'text-slate-11 hover:bg-slate-4 hover:text-slate-12': item.href !== route.fullPath,
                    'text-slate-12 bg-slate-3 font-bold': item.href === route.fullPath,
                  }"
              >
                <div class="text-slate-11 opacity-80 w-[18px] h-[18px]">
                  <component :is="item.icon" class="w-full h-full"/>
                </div>
                {{ item.name }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- footer -->
        <footer v-if="loginAccount" class="flex flex-col space-y-2 pt-3 border-t">
          <div class="flex items-center space-x-2">
            <img v-if="loginAccount.avatar" :src="loginAccount.avatar" alt="" class="rounded-full size-10">
            <UTooltip v-if="loginAccount.nickname" class="flex-1 overflow-hidden"
                      :popper="{ placement: 'top-start', offsetDistance: 16 }">
              <template #text>
                <span>{{ loginAccount.nickname }}</span>
              </template>
              <span class="whitespace-nowrap text-ellipsis overflow-hidden">{{ loginAccount.nickname }}</span>
            </UTooltip>

            <UButton icon="i-heroicons-arrow-left-start-on-rectangle-16-solid" :loading="logoutBtnLoading"
                     class="bg-slate-10 hover:bg-rose-500 disabled:bg-rose-500" @click="logout">退出
            </UButton>
          </div>
          <div class="mb-4 text-sm">
            <span>token过期时间还剩: </span>
            <span class="font-mono" :class="warning ? 'text-rose-500' : 'text-green-500'">{{ distance }}</span>
          </div>
        </footer>
      </aside>
    </nav>
    <div class="flex flex-col w-full h-screen">
      <div class="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-slate-6 px-6">
        <div id="title"></div>

        <div class="hidden md:flex items-center gap-4">
          <NuxtLink to="/"
                    class="font-semibold inline-flex items-center justify-center border select-none border-slate-6 bg-slate-2 text-slate-12 hover:bg-slate-4 text-sm h-8 px-3 rounded-md gap-1">
            拉取文章缓存
          </NuxtLink>
          <a href="https://github.com/jooooock/wechat-article-exporter/blob/master/docs/faq.md" target="_blank"
             class="font-semibold inline-flex items-center justify-center border select-none border-slate-6 bg-slate-2 text-slate-12 hover:bg-slate-4 text-sm h-8 px-3 rounded-md gap-1">
            <span class="inline-flex items-center justify-center gap-1 truncate visible">FAQ</span>
          </a>
          <a href="https://github.com/jooooock/wechat-article-exporter" target="_blank"
             class="font-semibold inline-flex items-center justify-center border select-none border-slate-6 bg-slate-2 text-slate-12 hover:bg-slate-4 text-sm h-8 px-3 rounded-md gap-1">
            <svg class="w-[18px] h-[18px]" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>
              GitHub</title>
              <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            <span class="inline-flex items-center justify-center gap-1 truncate visible">GitHub</span>
          </a>
        </div>
      </div>
      <div class="flex-1 overflow-hidden">
        <NuxtPage/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Album, ChartNoAxesCombined, Download, Globe, Settings} from 'lucide-vue-next';
import {formatDistance} from "date-fns";
import type {LogoutResponse} from "~/types/types";


const route = useRoute()

definePageMeta({
  layout: false
})

const loginAccount = useLoginAccount()

const items = ref([
  {name: '文章导出', icon: Download, href: '/dashboard/download'},
  {name: '合集下载', icon: Album, href: '/dashboard/album'},
  {name: '缓存分析', icon: ChartNoAxesCombined, href: '/dashboard/analytics'},
  {name: '资源额度', icon: Globe, href: '/dashboard/usage'},
  {name: '设置', icon: Settings, href: '/dashboard/settings'},
])

const expire = loginAccount.value.expires
const now = ref(new Date())
const distance = computed(() => {
  return formatDistance(new Date(expire), now.value, {
    includeSeconds: true,
    locale: {
      formatDistance: function (token, count, options) {
        if (now.value >= new Date(expire)) {
          window.clearInterval(timer)
          return '已过期'
        }

        switch (token) {
          case "aboutXHours":
            return '大约' + count + '个小时'
          case "aboutXMonths":
            return '大约' + count + '个月'
          case "aboutXWeeks":
            return '大约' + count + '周'
          case "aboutXYears":
            return '大约' + count + '年'
          case "lessThanXMinutes":
            return '小于' + count + '分钟'
          case "almostXYears":
            return '接近' + count + '年'
          case "halfAMinute":
            return '半分钟'
          case "lessThanXSeconds":
            return '小于' + count + '秒'
          case "overXYears":
            return '超过' + count + '年'
          case "xDays":
            return count + '天'
          case "xHours":
            return count + '个小时'
          case "xMinutes":
            return count + '分钟'
          case "xMonths":
            return count + '个月'
          case "xSeconds":
            return count + '秒'
          case "xWeeks":
            return count + '周'
          case "xYears":
            return count + '年'
          default:
            return 'unknown'
        }
      }
    },
  })
})
const warning = computed(() => {
  const value = distance.value
  return value === '已过期' || value.includes('分钟') || value.includes('秒')
})

let timer: number
onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})
onUnmounted(() => {
  window.clearInterval(timer)
})

const logoutBtnLoading = ref(false)

async function logout() {
  logoutBtnLoading.value = true
  const {statusCode, statusText} = await $fetch<LogoutResponse>('/api/logout?token=' + loginAccount.value.token)
  if (statusCode === 200) {
    loginAccount.value = null
    navigateTo('/login', {replace: true})
  } else {
    alert(statusText)
  }
  logoutBtnLoading.value = false
}
</script>
