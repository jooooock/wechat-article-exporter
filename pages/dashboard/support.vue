<template>
  <div class="flex flex-col h-full">
    <Teleport defer to="#title">
      <h1 class="text-[28px] leading-[34px] text-slate-12 font-bold">技术支持</h1>
    </Teleport>
    <div class="px-6 py-4 flex-1 overflow-scroll">
      <p class="my-2">感谢您使用我们的开源工具！</p>
      <p class="">为了更好地支持项目的持续发展，我们提供以下付费服务：</p>
      <p class="text-sm pb-2">注：以下服务皆为一次性付费，永久服务。</p>
      <ul>
        <li>1) <span class="text-rose-400">私有部署支持</span>，帮助您将工具部署到自己的服务器；</li>
        <li>2) <span class="text-rose-400">代理节点搭建</span>，优化使用效果；</li>
        <li>3) <span class="text-rose-400">代码解读与技术指导</span>，助您深入了解工具原理。</li>
      </ul>

      <p class="my-4">此外，成为我们的赞助者还可享受 <span class="text-rose-400">优先问题处理服务</span>，确保您在使用中遇到的问题能第一时间得到解决。</p>
      <p>您的支持是我们坚持的最大动力！</p>

      <img class="w-96" src="~/assets/wechat-support.png" alt="">

      <p>付费后可添加私人微信号(<code>champkeh</code>，备注: 公众号文章下载)，一对一帮您解决问题。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '技术支持 | 微信公众号文章导出'
});
</script>
