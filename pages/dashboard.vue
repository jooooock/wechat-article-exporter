<template>
  <div class="flex">
    <nav>
      <aside class="hidden md:flex flex-col h-screen w-[250px] flex-shrink-0 justify-between border-r border-slate-4 bg-slate-1 px-4 pb-6">
        <div class="flex items-center h-[60px]">
          <NuxtLink to="/dashboard" class="px-2">微信公众号文章导出</NuxtLink>
        </div>
        <nav class="flex-1 mt-6">
          <ul class="flex flex-col gap-2">
            <li v-for="item in items" :key="item.name">
              <NuxtLink
                  :to="item.href"
                  class="flex h-8 items-center gap-2 rounded-md px-2 text-sm"
                  :class="{
                    'text-slate-11 hover:bg-slate-4 hover:text-slate-12': item.href !== $route.fullPath,
                    'text-slate-12 bg-slate-3': item.href === $route.fullPath,
                  }"
              >
                <div class="text-slate-11 opacity-80 w-[18px] h-[18px]">
                  <component :is="item.icon" class="w-full h-full" />
                </div>
                {{item.name}}
              </NuxtLink>
            </li>
          </ul>
        </nav>
        <button class="font-semibold inline-flex items-center border select-none text-slate-11 hover:bg-slate-5 text-sm h-8 px-3 rounded-md">
          <span>jock</span>
        </button>
      </aside>
    </nav>
    <div class="flex flex-col w-full h-screen">
      <div class="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-slate-6 px-6">
        <div id="title"></div>

        <div class="hidden md:flex items-center gap-4">
          <NuxtLink to="/" class="font-semibold inline-flex items-center justify-center border select-none border-slate-6 bg-slate-2 text-slate-12 hover:bg-slate-4 text-sm h-8 px-3 rounded-md gap-1">旧版UI</NuxtLink>
          <a href="https://github.com/jooooock/wechat-article-exporter/blob/master/docs/faq.md" target="_blank" class="font-semibold inline-flex items-center justify-center border select-none border-slate-6 bg-slate-2 text-slate-12 hover:bg-slate-4 text-sm h-8 px-3 rounded-md gap-1">
            <span class="inline-flex items-center justify-center gap-1 truncate visible">FAQ</span>
          </a>
          <a href="https://github.com/jooooock/wechat-article-exporter/issues/new" target="_blank" class="font-semibold inline-flex items-center justify-center border select-none border-slate-6 bg-slate-2 text-slate-12 hover:bg-slate-4 text-sm h-8 px-3 rounded-md gap-1">
            <MessageCircleQuestion :size="18"/>
            <span class="inline-flex items-center justify-center gap-1 truncate visible">Feedback</span>
          </a>
          <a href="https://github.com/jooooock/wechat-article-exporter" target="_blank" class="font-semibold inline-flex items-center justify-center border select-none border-slate-6 bg-slate-2 text-slate-12 hover:bg-slate-4 text-sm h-8 px-3 rounded-md gap-1">
            <svg class="w-[18px] h-[18px]" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            <span class="inline-flex items-center justify-center gap-1 truncate visible">GitHub</span>
          </a>
        </div>
      </div>
      <div class="flex-1 overflow-hidden">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Newspaper, Download, ChartNoAxesCombined, Cookie, MessageCircleQuestion, Globe, Album, Settings } from 'lucide-vue-next';

definePageMeta({
  layout: false
})

const items = ref([
  {name: '文章获取', icon: Newspaper, href: '/dashboard/fetch'},
  {name: '数据导出', icon: Download, href: '/dashboard/download'},
  {name: '合集下载', icon: Album, href: '/dashboard/album'},
  {name: '缓存分析', icon: ChartNoAxesCombined, href: '/dashboard/analytics'},
  {name: '代理使用额度', icon: Globe, href: '/dashboard/proxy'},
  {name: '设置', icon: Settings, href: '/dashboard/settings'},
])
</script>
