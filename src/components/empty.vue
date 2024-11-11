<template>
  <div class="empty">
    <img :src="getAssetURL('empty.png')" alt="">
    <div class="bot_text">{{ props.text || '暂无数据' }}</div>
  </div>
</template>

<script setup>
import { getAssetURL } from '@/utils/utils'

const props = defineProps(['text'])


</script>

<style lang="scss" scoped>
  .empty {
    img{
      @include hor-center(200px)
    }
    .bot_text {
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  }
</style>
