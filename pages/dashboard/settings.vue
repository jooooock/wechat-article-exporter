<template>
  <div class="flex flex-col h-full">
    <Teleport defer to="#title">
      <h1 class="text-[28px] leading-[34px] text-slate-12 font-bold">设置</h1>
    </Teleport>
    <div class="flex-1 overflow-scroll">
      <div class="sticky top-0 z-50 pt-4 px-4 mb-4 bg-white">
        <UAlert
            icon="i-heroicons-shield-check"
            description="为了保护您的安全，所有设置均保存在本地，不会上传给后台及任何第三方，请放心使用。"
            class="flex-shrink-0 text-green-500"
        />
      </div>

      <UCard class="mx-4">
        <template #header>
          <h3 class="text-2xl font-semibold">Cookie</h3>
        </template>

        <p>pass_ticket</p>
        <UInput v-model="cookieSettings.pass_ticket" placeholder="请输入 pass_ticket" />

        <p>wap_sid2</p>
        <UInput v-model="cookieSettings.wap_sid2" placeholder="请输入 wap_sid2" />

        <p>key</p>
        <UInput v-model="cookieSettings.key" placeholder="请输入 key" />

        <UButton color="black">保存</UButton>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '设置 | 微信公众号文章导出'
});

interface CookieSettings {
  pass_ticket: string
  wap_sid2: string
  key: string
}

const cookieSettings = reactive<CookieSettings>({
  pass_ticket: '',
  wap_sid2: '',
  key: '',
})
</script>
