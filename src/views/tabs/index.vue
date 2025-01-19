<template>
  <div class="tab_index">
    <div class="top_bar">
      <div class="left_bar" @click="toIdentity">
        <template v-if="!isLogin"> 请登录 <img src="@img/index/sanjiao@2x.png" alt="" /> </template>
        <template v-else-if="isSelectIdentity">
          {{ grades[identity.userGrade].grade }}（{{ identitys[identity.userIdentities].identity }}）
          <img src="@img/index/sanjiao@2x.png" alt="" />
        </template>
        <template v-else> 请选择 <img src="@img/index/sanjiao@2x.png" alt="" /> </template>
      </div>
      <div class="right_bar">
        <div class="exp" @click="playExp">说明示例</div>
        <img class="jli" src="@img/index/jli@2x.png" alt="" @click="toAccessCoin" />
        <img class="order_icon" src="@img/index/order_icon.png" alt="" @click="toReport" />
        <div class="dot" v-if="!store.hideDot && isLogin"></div>
      </div>
    </div>
    <van-swipe class="banner_swipe" :autoplay="3000" indicator-color="#000" v-if="swipeList && swipeList.length">
      <van-swipe-item v-for="(item, index) in swipeList" :key="index" @click="toBannerHref(item)">
        <img :src="item.bannerLink" alt="" class="swipe_img" />
      </van-swipe-item>
    </van-swipe>
    <div class="mid_bar">
      <!-- <img src="@img/index/ls@2x.png" class="mid_left" alt="" @click="aiChat"> -->
      <img src="@img/index/class_entry@2x.png" class="mid_left" alt="" @click="classList" />
      <img src="@img/index/zw@2x.png" class="mid_right" alt="" @click="choseType" />
    </div>
    <div class="mid_tips" v-if="!isLogin">登录后可领取<span>3</span>篇作文精批</div>
    <img src="@img/index/gr@2x.png" class="p_center" alt="" @click="toMine" />
    <orderCard v-if="orderDetail" :orderItem="orderDetail"></orderCard>
    <img v-else src="@img/index_no_order.png" class="index_no_order" alt="" />

    <van-popup v-model:show="showType" round>
      <div class="sel_type">
        <img src="@img/x@2x.png" @click="close" class="close" alt="" />
        <div class="sel_b">
          <img src="@img/yw@2x.png" alt="" @click="toCorrect('cn-article-rectify', 'zh', 'index')" />
          <img src="@img/yy@2x.png" alt="" @click="toCorrect('en-article-rectify', 'en', 'index')" />
        </div>
        <div class="sel_bot_tip">保持专注和思考，在批改中学习高分方法与技巧</div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAssetURL } from '@/utils/utils'
import { useRouter } from 'vue-router'
import { useStore } from '../../stores'
import dictionary from '@/utils/dictionary.js'
import { orderHomepageFind, checkCorrection } from '@/api/index'
import orderCard from '@/components/orderCard.vue'
import { showToast } from 'vant'

const swipeList = ref([
  // { img: getAssetURL('index/gz@2x.png'), href: 'https://docs.qq.com/doc/DT2p0and5YVlzbWJn' },
  // { img: getAssetURL('index/xb@2x.png'), href: 'https://www.wjx.cn/vm/tLbwYDK.aspx#' },
])

const store = useStore()
const isLogin = store.isLogin
const isSelectIdentity = ref(false)
const identity = ref({})

const gradeIdent = dictionary.getUserIdentityObj()

const grades = gradeIdent.grades
const identitys = gradeIdent.identitys

const showType = ref(false)

const choseType = () => {
  if (!isLogin) {
    router.push('/login')
    return
  }
  if (!isSelectIdentity) {
    router.push('/identity')
    return
  }
  if (grades[identity.value.userGrade].type == 'university') {
    toCorrect('en-article-rectify', 'en', 'index')
  } else {
    showType.value = true
  }
}

let aiTutor = false
const aiChat = () => {
  if (store.isVip || !store.isLogin || aiTutor) {
    router.push('/aiChat')
  } else {
    showToast({
      message: '该功能为VIP专享，请开通后使用哦',
      forbidClick: true,
      onClose: () => {
        router.push('/vip')
      }
    })
  }
}

const classList = () => {
  router.push('/classList')
}

const toBannerHref = (item) => {
  window.location.href = item.jumpLink
}

const botTipImg = getAssetURL('guangbo.svg')

const router = useRouter()
const toCorrect = async (productCode, type, from) => {
  const res = await checkCorrection()
  if (res.code == 888) {
    setTimeout(() => {
      router.push('/vip')
    }, 2000)
  } else if (res.data) {
    router.push({ path: '/selectFiles', query: { productCode, type, from } })
  }
}

const toIdentity = () => {
  if (isLogin) {
    router.push('/identity')
  } else {
    router.push('/login')
  }
}

const toMine = () => {
  router.push('/tabs/mine')
}

const close = () => {
  showType.value = false
}

const orderDetail = ref(null)

const toAccessCoin = () => {
  router.push('/freeAccessCoin')
}

const toReport = () => {
  router.push('/report')
}

const videoLink = ref(
  'https://composition-assist.oss-cn-shenzhen.aliyuncs.com/2024-09/composition-portal/03-%E6%BC%94%E7%A4%BA%E6%9D%90%E6%96%99.mp4'
)

onMounted(async () => {
  const res = await orderHomepageFind()
  if (res.data) {
    orderDetail.value = res.data.orderFindResponseVo
    store.isSelectIdentity = !!res.data.userGrade
    isSelectIdentity.value = !!res.data.userGrade
    aiTutor = !!res.data.aiTutor
    if (res.data.userGrade) {
      store.identity = {
        userGrade: res.data.userGrade,
        userIdentities: res.data.userIdentities
      }
      identity.value = store.identity
      localStorage.setItem('identity', JSON.stringify(store.identity))
    }
    if (res.data.illustrativeExampleResponseVo?.videoLink) {
      videoLink.value = res.data.illustrativeExampleResponseVo.videoLink
    }
    swipeList.value = res.data.bannerResponseVos
  }
})

const playExp = () => {
  window.location.href = videoLink.value
}
</script>

<style lang="scss" scoped>
.tab_index {
  padding: 20px 20px calc(80px + env(safe-area-inset-bottom));
  min-height: inherit;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
  background: #d9f1ed url('@img/index/bg@2x.png') no-repeat 0 0 / 375px auto;
  .top_bar {
    @include flex-between;
    margin-bottom: 26px;
  }
  .left_bar {
    font-family: FZB;
    img {
      width: 14px;
      height: 9px;
    }
  }
  .right_bar {
    @include flex-between;
    position: relative;
    .exp {
      font-size: 14px;
      margin-right: 20px;
      font-weight: bold;
      color: #136871;
      text-decoration: underline;
    }
    .dot {
      width: 10px;
      height: 10px;
      background: #d9001b;
      border-radius: 50%;
      position: absolute;
      top: -3px;
      left: 92px;
    }
  }
  .jli {
    width: 20px;
    // height: 27px;
  }
  .order_icon {
    width: 17px;
    // height: 24px;
    margin-left: 20px;
  }
  .banner_swipe {
    margin-bottom: 14px;
  }
  .swipe_img {
    @include hor-center(336px);

    // width: 200px;
  }
  .b_btn {
    padding: 18px 0;
    text-align: center;
    line-height: 1;
    color: #fff;
    background: $primaryColor;
    border-radius: 8px;
    font-size: 20px;
    font-weight: bold;
    margin: 0 12px 12px;
    &.y_btn {
      border: 1px solid $primaryColor;
      background: $primaryColorThin9;
      color: $primaryColor;
    }
    &.r_btn {
      border: 1px solid #069080;
      color: #069080;
      background: #e0f2f2;
    }
  }
  .sec_title {
    font-size: 14px;
    margin-top: 8px;
  }
  .operate_btn {
    @include hor-center(315px);
    @include flex-between;
    flex-flow: row wrap;
    .operate_item {
      line-height: 1;
      font-size: 14px;
      width: 150px;
      padding: 12px 0;
      @include flex-center;
      border-radius: 4px;
      margin-bottom: 14px;
      img {
        width: 24px;
        margin-right: 4px;
      }
    }
  }
  .bot_tip {
    @include flex-center;
    align-items: flex-end;
    font-size: 12px;
    line-height: 1;
    color: #e2433e;
    padding-top: 6px;
    img {
      width: 18px;
      margin-right: 4px;
    }
  }
  .mid_bar {
    display: flex;
    position: relative;
    padding-top: 3px;
    padding-bottom: 14px;
  }

  .mid_tips {
    text-align: right;
    font-size: 12px;
    color: #999;
    span {
      color: lightcoral;
    }
  }
  .mid_left {
    width: 206px;
    height: 208px;
  }
  .mid_right {
    position: absolute;
    width: 150px;
    height: 211px;
    top: 0;
    right: 0;
  }
  .p_center {
    @include hor-center(306px);
    margin-top: 14px;
    margin-bottom: 16px;
  }
  .index_no_order {
    @include hor-center(335px);
  }
  .sel_type {
    padding: 50px 18px 30px;
    position: relative;
    background: #fff;
    border-radius: 12px;
    width: 335px;
  }
  .sel_b {
    @include flex-between;
    margin-bottom: 14px;
    img {
      width: 141px;
      height: 103px;
    }
  }
  .sel_bot_tip {
    font-size: 12px;
    color: #898989;
    text-align: center;
    line-height: 1;
  }
  .close {
    position: absolute;
    width: 35px;
    height: 33px;
    top: -8px;
    right: 0;
  }
}
</style>

<style lang="scss">
.tab_index {
  .van-swipe__indicators {
    bottom: 6px;
  }
  .van-swipe__indicator:not(.van-swipe__indicator--active) {
    background: #fff;
    opacity: 1;
  }
  .van-popup {
    background: transparent;
    padding: 10px 0;
  }
}
</style>
