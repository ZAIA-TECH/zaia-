<template>
  <div class="tabs">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <van-tabbar v-model="active" route>
      <van-tabbar-item replace v-for="(item, index) in tabs" :icon=" active == item.name ? item.activeIcon : item.deActiveIcon" :name="item.name" :key="index" :to="item.name">{{item.title}}</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { getAssetURL } from '@/utils/utils'
import { useRoute } from 'vue-router';

const route = useRoute();
const active = ref(route.path)

watch(route, (newV) => {
  active.value = newV.path;
})

const tabs = ref([
  { name: '/tabs/index', activeIcon: getAssetURL('home_active.png'), deActiveIcon: getAssetURL('home.png'), title: '首页' },
  { name: '/tabs/mine', activeIcon: getAssetURL('mine_active.png'), deActiveIcon: getAssetURL('mine.png'), title: '我的' },
])

</script>

<style lang="scss" scoped>
.tabs {
  min-height: inherit;
  background: #fff;
  .van-tabbar {
    width: 375px;
    left: 50%;
    transform: translate(-50%);
    height: 60px;
  }
}
</style>

<style lang="scss">
.tabs {
  .van-icon__image {
    width: 24px;
    height: 26px;
  }
  .van-tabbar-item--active {
    color: #4f91a0;
  }
}
</style>