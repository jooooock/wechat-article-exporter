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
          <h3 class="text-2xl font-semibold">Credentials</h3>
        </template>

        <UForm :schema="schema" :state="state" class="space-y-4 max-w-lg" @submit="onSubmit">
          <UFormGroup label="__biz" name="__biz">
            <UInput v-model="state.__biz" placeholder="请输入 __biz" />
          </UFormGroup>
          <UFormGroup label="uin" name="uin">
            <UInput v-model="state.uin" placeholder="请输入 uin" />
          </UFormGroup>
          <UFormGroup label="key" name="key">
            <UInput v-model="state.key" placeholder="请输入 key" />
          </UFormGroup>
          <UFormGroup label="pass_ticket" name="pass_ticket">
            <UInput v-model="state.pass_ticket" placeholder="请输入 pass_ticket" />
          </UFormGroup>
          <UFormGroup label="wap_sid2" name="wap_sid2">
            <UInput v-model="state.wap_sid2" placeholder="请输入 wap_sid2" />
          </UFormGroup>
          <UButton type="submit" color="black" class="mx-auto w-20 justify-center">{{saveBtnText}}</UButton>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

useHead({
  title: '设置 | 微信公众号文章导出'
});

const schema = z.object({
  __biz: z.string(),
  uin: z.string(),
  pass_ticket: z.string(),
  key: z.string(),
  wap_sid2: z.string(),
})

type Schema = z.output<typeof schema>

const state = reactive({
  __biz: undefined,
  uin: undefined,
  pass_ticket: undefined,
  key: undefined,
  wap_sid2: undefined,
})
onMounted(() => {
  try {
    const credentials = JSON.parse(window.localStorage.getItem('credentials')!)
    state.__biz = credentials.__biz
    state.uin = credentials.uin
    state.pass_ticket = credentials.pass_ticket
    state.key = credentials.key
    state.wap_sid2 = credentials.wap_sid2
  } catch (e) {
  }
})
const saveBtnText = ref('保存')
async function onSubmit(event: FormSubmitEvent<Schema>) {
  window.localStorage.setItem('credentials', JSON.stringify(event.data))
  saveBtnText.value = '保存成功'
  setTimeout(() => {
    saveBtnText.value = '保存'
  }, 1000)
}
</script>
