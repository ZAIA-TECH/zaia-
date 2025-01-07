<template>
  <div class="back_index" @click="backIndex">
    <van-icon name="revoke" class="revoke" size="20" color="#fff" />
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router';
  import { useStore } from '../stores';
  
  const router = useRouter();

  const store = useStore();

  const backIndex = () => {
    if(store.isApp) {
      window.android.backIndex() 
    } else {
      router.push('/')
    }
  }

</script>

<style lang="scss" scoped>
  .back_index {
    position: fixed;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #1989FA;
    right: 15px;
    bottom: 80px;
    @include flex-center;
    .revoke {
      font-weight: bold;
    }
  }
</style>