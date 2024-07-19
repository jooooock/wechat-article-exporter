<template>
  <li>
    <img class="avatar" :src="proxyImage(round_head_img)" alt="">
    <div class="content">
      <div class="row">
        <p class="nickname">{{ nickname }}</p>
        <p class="alias">微信号: {{ alias || '未设置' }}</p>
        <p class="type">{{ AccountTypeMap[service_type] }}</p>
      </div>
      <p class="signature">{{ signature }}</p>
    </div>
  </li>
</template>

<script setup lang="ts">
import type {AccountInfo} from "~/types/types";

defineProps<AccountInfo>()

const AccountTypeMap: Record<number, string> = {
  0: '订阅号',
  1: '订阅号',
  2: '服务号'
}
function proxyImage(url: string) {
  return `https://service.champ.design/api/proxy?url=${encodeURIComponent(url)}`
}
</script>

<style scoped>
li {
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
</style>
