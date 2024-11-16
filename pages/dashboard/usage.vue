<template>
  <div class="flex flex-col h-full">
    <Teleport defer to="#title">
      <h1 class="text-[28px] leading-[34px] text-slate-12 font-bold">资源额度</h1>
    </Teleport>
    <div class="px-6 flex-1 overflow-scroll">
      <p>公共代理使用情况</p>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '资源额度 | 微信公众号文章导出'
});
</script>
