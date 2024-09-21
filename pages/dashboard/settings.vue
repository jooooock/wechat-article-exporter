<template>
  <div class="flex flex-col h-full">
    <Teleport defer to="#title">
      <h1 class="text-[28px] leading-[34px] text-slate-12 font-bold">设置</h1>
    </Teleport>
    <div class="px-6 py-4 flex-1 overflow-scroll">
      <UCard>
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
