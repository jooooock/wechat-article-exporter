<template>
  <UCard class="mx-4 mt-4">
    <template #header>
      <h3 class="text-2xl font-semibold">私有代理</h3>
      <p class="text-sm text-slate-10 font-serif">私有代理仅您本人使用</p>
      <p><a href="https://github.com/jooooock/wechat-article-exporter/blob/master/docs/credentials.md" target="_blank" class="underline text-blue-600 text-sm">查看搭建教程</a></p>
    </template>

    <div class="flex space-x-10">
      <textarea class="h-[400px] flex-1 p-2 border rounded resize-none" v-model="textareaValue" spellcheck="false" placeholder="请填写私有部署的代理地址，一行一个"></textarea>
      <div class="flex-1 flex-shrink-0">
        <div class="mb-3">
          <h4 class="">说明：</h4>
          <p>代理地址要求：</p>
        </div>
        <UButton type="submit" @click="save" color="black" class="w-20 justify-center disabled:bg-slate-10" :disabled="proxyList.length === 0">{{saveBtnText}}</UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const textareaValue = ref('')
const proxyList = computed(() => {
  return textareaValue.value.split('\n').map((line) => line.trim()).filter((line) => line.length > 0 && line.startsWith('http'))
})

onMounted(() => {
  try {
    const proxy = JSON.parse(window.localStorage.getItem('wechat-proxy')!)
    if (Array.isArray(proxy) && proxy.length > 0) {
      textareaValue.value = proxy.join('\n')
    }
  } catch (e) {
  }
})

const saveBtnText = ref('保存')
async function save() {
  window.localStorage.setItem('wechat-proxy', JSON.stringify(proxyList.value))
  saveBtnText.value = '保存成功'
  setTimeout(() => {
    saveBtnText.value = '保存'
  }, 1000)
}
</script>
