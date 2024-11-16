<template>
  <UCard class="mx-4 mt-10">
    <template #header>
      <h3 class="text-2xl font-semibold">私有代理</h3>
      <p class="text-sm text-slate-10 font-serif">配置的私有代理地址仅供您本人使用</p>
      <p><a href="https://github.com/jooooock/wechat-article-exporter/blob/master/docs/private-proxy.md" target="_blank" class="underline text-blue-600 text-sm">查看搭建私有代理节点教程</a></p>
    </template>

    <div class="flex space-x-10">
      <textarea class="h-[400px] flex-1 p-2 border rounded resize-none" v-model="textareaValue" spellcheck="false" placeholder="请填写私有部署的代理地址，一行一个"></textarea>
      <div class="flex-1 flex-shrink-0">
        <div class="mb-3">
          <p>代理地址要求：</p>
          <ol>
            <li>
              <p>1. 以 <code class="text-rose-500 font-mono">http/https</code> 开头的绝对路径地址。</p>
              <p>2. 该地址在使用时后面会自动拼接 <code class="text-rose-500 font-mono">?url=</code> 等参数，请确保格式正确。</p>
            </li>
          </ol>
          <p class="mt-3">代理示例：</p>
          <p><code class="text-rose-500 font-mono">https://wproxy-01.deno.dev</code></p>
          <p><code class="text-rose-500 font-mono">https://wproxy-01.deno.dev/</code></p>
        </div>
        <UButton type="submit" @click="save" color="black" class="w-20 mt-5 justify-center disabled:bg-slate-10" :disabled="proxyList.length === 0">{{saveBtnText}}</UButton>
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
