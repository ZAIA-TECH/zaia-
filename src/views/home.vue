<template>
<<<<<<< HEAD
  <div :style="{ minHeight: `${innerHeight}px` }" class="home" v-if="!isCrash">
=======
  <div :style="{ minHeight: `${innerHeight}px` }" class="home">
>>>>>>> 43159515d1f2eb79c99faf0fa60135e3b1f66445
    <router-view v-slot="{ Component }" v-if="!isLoading">
      <transition name="fade" mode="out-in">
        <keep-alive :include="keepAliveInclude" :max="2">
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { useStore } from '@/stores/index'
import { onMounted, ref } from 'vue'
import { getBrowserInterfaceSize } from '@/utils/utils'
import { showToast } from 'vant'
import { findUserId } from '@/api/index'
import Cookies from 'js-cookie'
import { useRoute } from 'vue-router'
import { onBeforeRouteUpdate } from 'vue-router'

const keepAliveInclude = ref([])
const store = useStore()

onBeforeRouteUpdate((to) => {
  if (['FeedBackList', 'SelectFiles', 'CustomFeedBack', 'classCorrect'].indexOf(to.name) == -1) {
    keepAliveInclude.value = []
    store.checkedAgents = []
  } else {
    keepAliveInclude.value = ['SelectFiles', 'classCorrect']
  }
})

const route = useRoute()

if (route.query.userId && route.query.token) {
  Cookies.set('userId', route.query.userId)
  Cookies.set('token', route.query.token)
  store.userId = route.query.userId
  store.isLogin = true
}
route.query.platform == 'android' && (store.isApp = true)

const isLoading = ref(!store.userId)
isLoading.value &&
  findUserId().then((res) => {
    Cookies.set('userId', res.data)
    store.userId = res.data
    isLoading.value = false
  })

const innerHeight = ref(0)

const resizeList = () => {
  setTimeout(() => {
    innerHeight.value = getBrowserInterfaceSize()
    store.innerHeight = innerHeight.value
  }, 50)
}
window.addEventListener('resize', resizeList)

onMounted(() => {
  innerHeight.value = getBrowserInterfaceSize()
  store.innerHeight = innerHeight.value
  setTimeout(() => {
    innerHeight.value = getBrowserInterfaceSize()
    store.innerHeight = innerHeight.value
  }, 300)
})
</script>

<style lang="scss" scoped>
.home {
  background: #fff;
  overflow-x: hidden;
}

.login_main {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  margin: 16px 0;

  .cut_time {
    color: #aaa;
  }

  .agreement {
    font-size: 12px;
    display: flex;
    line-height: 1;

    span {
      color: #eb5a55;
    }
  }
}
</style>

<style lang="scss">
.login_pop {
  .van-cell {
    width: 270px;
    height: 40px;
    background: transparent;
    border: 1px solid #bbb;
    border-radius: 20px;
    padding: 0 16px;
    margin-bottom: 16px;

    .van-field__control {
      height: 38px;
      font-size: 15px;
    }

    &::after {
      border: none;
    }
  }

  .van-field__button {
    font-size: 15px;
    color: #1989fa;
  }
}
</style>
