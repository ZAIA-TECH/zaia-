<template>
  <div class="vip">
    <div class="top_card">
      <div class="view_exp" @click="imgView">查看示例</div>
      <div :class="['v_card', userVipInfo.vipStatus == 0 ? 'not_vip' : '']">
        <div class="u_phone">{{userVipInfo.phone}} <span class="vip_agre" @click="toVipAgr">会员协议</span></div>
        <div class="expiry_data" v-if="userVipInfo.vipStatus != 0">有效期至 {{userVipInfo.vipEndTime}}</div>
      </div>
    </div>
    <div class="vip_content">
      <div class="swip_txt_out">
        <div class="swip_txt">
          <div class="swip_txt_in">
            <span>【8846】开通了年卡会员 </span>
            <span>【7450】开通了年卡会员 </span>
            <span>【5590】开通了年卡会员 </span>
            <span>【8846】开通了年卡会员 </span>
            <span>【7450】开通了年卡会员 </span>
            <span>【5590】开通了年卡会员 </span>
          </div>
        </div>
        <div class="right_fixed">月售800+</div>
      </div>
      <div class="vip_pay">
        <img class="img_hyzx_by" src="@img/img_hyzx_by@2x.png" alt="">
        <div class="price_list">
          <div :class="['price_item', item.id == vipType.id ? 'active' : '']" v-for="(item, index) in userVipInfo.productResponseVos" :key="index" @click="selectVipType(item)">
            <div class="vip_type">{{vipTypes[item.productCode].name}}</div>
            <div class="c_price AlibabaPuHuiTi">¥<span>{{turnMoney(item.currentPrice) - 0}}</span></div>
            <div class="o_price" v-if="item.currentPrice < item.originalPrice">¥<span>{{turnMoney(item.originalPrice) - 0}}</span></div>
            <div class="per_day">¥{{item.perDay}}/天</div>
          </div>
        </div>
        <div class="balance_time">
          <div class="time_out" v-if="userVipInfo.vipStatus == 0">新人折扣：<van-icon name="clock-o" /> <span style="font-weight: bold;">{{ timeBalance }}</span> 后恢复原价</div>
          <div class="balance" @click="tocz">您有学币：{{ userVipInfo.balance }} <img src="@img/cz@2x.png" alt=""></div>
        </div>
        <div class="pay_type_title">支付方式</div>
        <payWaySelectVue ref="payWaySelect">
          <div class="payway_list">
            <div class="payway_item" v-for="item in payWayList" :key="item.payWay" @click="selectWay(item.payWay)">
              <img src="@img/btn_hyzx_yx@2x.png" class="select_icon" v-if="item.payWay == payWay"  alt="">
              <img src="@img/btn_hyzx_wx@2x.png" class="select_icon" v-else alt="">
              <img :src="item.icon" alt="" class="way_icon">
              {{item.name}}
              <div v-if="item.payWay == 'xb'" class="mark">优惠</div>
            </div>
          </div>
        </payWaySelectVue>
        <div class="pay_btn" @click="pay"></div>
        <div class="pay_btn_tip">会员有效期，自开通后首次批改起算</div>
        <div class="pay_bot_tip">会员专享权益</div>
      </div>
      <div class="guide_b">
        <img src="@img/vip_p1@2x.png" alt="">
        <img src="@img/vip_p2@2x.png" alt="">
        <!-- <img src="@img/vip_p3@2x.png" alt=""> -->
      </div>
      <div class="comment_b">
        <div class="comment_btn" @click="comment"></div>
        <img src="@img/vip_comment.png" alt="">
      </div>
    </div>
    <template v-if="showBot">
      <div class="bot_btn">
        <div class="pay_btn" @click="pay"></div>
      </div>
      <img src="@img/btn_hyzx_fhdb@2x.png" class="back_top" @click="backTop" alt="">
    </template>
    <van-popup v-model:show="commentPop" round>
      <div class="comment_pop">
        <div class="comment_title">发布评论</div>
        <van-field v-model="commentTxt" type="textarea" rows="5" autosize label="" placeholder="请输入您的评论，被审核通过后被优先展示在评论区（根据相关规定，您的评论将展示IP地址）" />
        <div class="comment_pop_btn">
          <div class="cancel" @click="comment('cancel')">取消</div>
          <div class="comfirm" @click="comment('comfirm')">确定</div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { useStore } from '../../stores';
import { desensitizePhoneNumber, turnMoney, getAssetURL, fitUnitPx } from '@/utils/utils'
import { memberCenter, createVip, goldPayVip } from '@/api/index'
import { ref, onMounted, getCurrentInstance, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import payWaySelectVue from '@/components/payWaySelect.vue';
import { showToast, showConfirmDialog } from 'vant';
import { showImagePreview } from 'vant';
import moment from 'moment'

const router = useRouter();
const route = useRoute();
const store = useStore();
const userVipInfo = ref({})
const vipTypes = {
  "vip-annual-card": { name: '年卡会员', days: 365 },
  "vip-monthly-card": { name: '月卡会员', days: 30 },
  "vip-season-card": { name: '季卡会员', days: 90 },
}

const videoLink = ref('https://composition-assist.oss-cn-shenzhen.aliyuncs.com/2024-09/composition-portal/03-%E6%BC%94%E7%A4%BA%E6%9D%90%E6%96%99.mp4')

const getVipInfo = async () => {
  const res = await memberCenter()
  userVipInfo.value = res.data;
  userVipInfo.value.balance = turnMoney(userVipInfo.value.balance)
  userVipInfo.value.productResponseVos.forEach(val => {
    val.perDay = turnMoney(val.currentPrice / vipTypes[val.productCode].days) - 0
    val.productCode == "vip-annual-card" && (vipType.value = val);
  });
  store.isVip = res.data.vipStatus != 0;
  let loginInfo = localStorage.getItem('loginInfo')
  loginInfo = JSON.parse(loginInfo);
  loginInfo.vipStatus = res.data.vipStatus;
  localStorage.setItem('loginInfo', JSON.stringify(loginInfo))
}

const vm = getCurrentInstance()
const isWechat = vm.appContext.config.globalProperties.isWechat
const payDomin = vm.appContext.config.globalProperties.payDomin
const payWay = ref('wx')
const payWaySelect = ref(null)
const vipType = ref({})

const payWayList = [
  { icon: getAssetURL('icon_hyzx_wx@2x.png'), name: '微信', payWay: 'wx' },
  { icon: getAssetURL('icon_hyzx_zfb@2x.png'), name: '支付宝', payWay: 'zfb', hide: isWechat },
  { icon: getAssetURL('icon_hyzx_xb@2x.png'), name: '学币', payWay: 'xb', hide: isWechat },
]

const selectWay = (way) => {
  payWay.value = way;
  payWaySelect.value.selectPay(way)
}

const selectVipType = (item) => {
  vipType.value = item
}

const backIndex = () => {
  if(store.isApp) {
    window.android.backIndex() 
  } else {
    router.push('/tabs/index')
  }
}

const pay = async () => {
  const res = await createVip({ productCode: vipType.value.productCode, source: store.source })
  if(payWay.value == 'xb') {
    showConfirmDialog({
      title: '确认',
      message: '您正使用学币续费作文说会员，继续操作吗',
    }).then(async () => {
      const goldPayRes = await goldPayVip({ orderNo: res.data })
      if(goldPayRes.code == 200) {
        await getVipInfo();
        showToast({
          message: '祝贺你加入作文说会员大家庭！即刻启程，开启自我提升的精彩旅程',
          onClose: () => {
            // router.push('/tabs/index')
            backIndex();
          }
        })
      }
      if(goldPayRes.code == 878) {
        setTimeout(() => {
          router.push({ path: '/myWallet', query: { backPath: encodeURIComponent(`/vip?status=xbpay`) } })
        }, 2000)
      }
    }).catch(() => {})
  } else {
    payWaySelect.value.pay(res.data, `/vip?payState=success${store.isApp ? '&platform=android' : ''}`)
  }
}

const tocz = () => {
  router.push({ path: '/myWallet', query: { backPath: encodeURIComponent(`/vip`) } })
}

const showBot = ref(false)
const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  showBot.value = scrollTop > fitUnitPx(560)
}

const backTop = () => {
  window.scrollTo({
    behavior: 'smooth',
    top: 0
  })
}

const imgView = () => {
  window.location.href = videoLink.value;
  // showImagePreview({
  //   images: [getAssetURL('vipEx/1.jpg'), getAssetURL('vipEx/2.jpg'), getAssetURL('vipEx/3.jpg'), getAssetURL('vipEx/4.jpg'), getAssetURL('vipEx/5.jpg')],
  //   loop: false
  // })
}

const commentPop = ref(false)
const commentTxt = ref('')
const comment = (operate) => {
  if(operate== 'comfirm') {
    showToast("您的评论已提交")
  }
  commentPop.value = !commentPop.value;
  commentTxt.value = '';
}

const toVipAgr = () => {
  router.push('/vipAgreement')
}

const timeBalance = ref('23:59:59')
let timer = null

const countTimeOut = () => {
  const start = localStorage.getItem('timeBalance') || 24 * 60 * 60
  const hours = moment.duration(start, 'seconds').hours() + '';
  const minutes = moment.duration(start, 'seconds').minutes() + '';
  const seconds = moment.duration(start, 'seconds').seconds() + '';
  timeBalance.value = (`${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`)
  localStorage.setItem('timeBalance', start - 1)
}

const timeOut = () => {
  clearInterval(timer)
  countTimeOut()
  timer = setInterval(countTimeOut, 1000)
}

onBeforeUnmount(() => {
  clearInterval(timer)
})

onMounted(async () => {
  timeOut();
  document.addEventListener('scroll', handleScroll)
  await getVipInfo();
  if(route.query.payState == 'success') {
    showToast({
      message: '祝贺你加入作文说会员大家庭！即刻启程，开启自我提升的精彩旅程',
      onClose: () => {
        // router.push('/tabs/index')
        backIndex()
      }
    })
  }
})
</script>

<style lang="scss" scoped>
  .vip {
    min-height: inherit;
    position: relative;
    padding-top: 145px;
    padding-bottom: 129px;
    .top_card {
      width: 375px;
      height: 200px;
      background: linear-gradient( 180deg, #60DBAB 0%, #D2F0EA 100%);
      padding: 8px 7px;
      position: absolute;
      top: 0;
      left: 0;
    }
    .view_exp {
      width: 80px;
      padding-right: 8px;
      font-weight: 600;
      font-size: 15px;
      color: #FFFFFF;
      line-height: 21px;
      text-shadow: 0px 1px 2px #00D080;
      float: right;
      text-align: right;
      cursor: pointer;
    }
    .v_card {
      @include hor-center(361px);
      height: 153px;
      background: url('@img/banner_hyzx_card_sxz@2x.png') no-repeat 0 0 / 361px 153px;
      clear: both;
      padding: 20px 28px;
    }
    .not_vip {
      background: url('@img/banner_hyzx_card_ygq@2x.png') no-repeat 0 0 / 361px 153px;
      .u_phone {
        color: #999;
      }
    }
    .u_phone {
      font-weight: 600;
      font-size: 17px;
      color: #CC970A;
      line-height: 24px;
      margin-bottom: 53px;
      @include flex-between;
    }
    .vip_agre {
      font-size: 12px;
      line-height: 1;
    }
    .expiry_data {
      font-size: 12px;
      color: #D2B054;
      line-height: 17px;
      text-align: center;
    }
    
    .vip_content {
      position: relative;
      z-index: 2;
    }
    .swip_txt_out {
      width: 375px;
      height: 26px;
      background: linear-gradient( 90deg, rgba(255,248,239,0.7) 0%, #FFF8EF 51%, rgba(255,248,239,0.7) 100%);
      @include flex-between;
    }
    .swip_txt {
      position: relative;
      width: 100%;
      overflow: hidden;
      height: 13px;
    }
    .right_fixed {
      width: 85px;
      text-align: center;
      flex-shrink: 0;
      font-weight: 400;
      font-size: 13px;
      color: #483321;
      line-height: 1;
    }
    .swip_txt_in {
      font-size: 13px;
      color: #FF9B00;
      line-height: 1;
      word-break:keep-all;
      white-space:nowrap;
      position: absolute;
      animation: swipeTxt 10s linear infinite;
    }
    .vip_pay {
      width: 375px;
      background: linear-gradient( 180deg, #F3FFFA 0%, #FFFFFF 100%);
      padding: 30px 15px 0;
    }
    .img_hyzx_by {
      @include hor-center(263px);
      height: 72px;
      margin-bottom: 28px;
    }
    .price_list {
      @include flex-between;
      margin-bottom: 8px;
    }
    .balance_time {
      @include flex-between;
      margin-bottom: 4px;
    }
    .time_out {
      font-size: 12px;
      color: #f36262;
    }
    .balance {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #333;
      img {
        width: 45px;
        height: 25px;
      }
    }
    .price_item {
      width: 107px;
      height: 141px;
      border-radius: 8px;
      border: 1px solid #E2E2E2;
      text-align: center;
      padding-top: 21px;
      position: relative;
      cursor: pointer;
      &.active {
        background: #FEFBF0;
        border: 1px solid #E4BE78;
      }
    }
    .vip_type {
      font-weight: 600;
      font-size: 17px;
      color: #483321;
      line-height: 24px;
      margin-bottom: 12px;
    }
    .c_price {
      font-size: 12px;
      color: #F95151;
      font-weight: bold;
      line-height: 17px;
      span {
        font-size: 22px;
      }
    }
    .o_price {
      font-weight: 400;
      font-size: 13px;
      color: #CCCCCC;
      line-height: 19px;
      text-decoration-line: line-through;
    }
    .per_day {
      height: 20px;
      background: #F95151;
      border-radius: 0px 0px 8px 8px;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      font-weight: 600;
      font-size: 11px;
      color: #FFFFFF;
      line-height: 1;
      padding-top: 4.5px;
    }
    .pay_type_title {
      font-weight: 600;
      font-size: 16px;
      color: #333333;
      line-height: 23px;
      margin-bottom: 12px;
    }
    .payway_list {
      padding: 0 9px;
      @include flex-between;
    }
    .payway_item {
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 14px;
      color: #333333;
      line-height: 1;
      position: relative;
      cursor: pointer;
    }
    .select_icon {
      width: 18px;
      height: 18px;
    }
    .way_icon {
      width: 28px;
      height: 28px;
      margin: 0 4px 0 8px;
    }
    .mark {
      width: 30px;
      height: 14px;
      background: linear-gradient( 180deg, #FF686F 0%, #EA5555 100%);
      border-radius: 7px;
      font-weight: 400;
      font-size: 9px;
      color: #FFFFFF;
      line-height: 1;
      padding-top: 2.5px;
      text-align: center;
      position: absolute;
      top: -8px;
      right: -9px;
    }
    .pay_btn {
      @include hor-center(315px);
      height: 58px;
      margin-top: 30px;
      background: url('@img/btn_hyzx_ljxf@2x.png') no-repeat 0 0 / 315px 58px;
      margin-bottom: 16px;
      cursor: pointer;
    }
    .pay_btn_tip {
      text-align: center;
      font-size: 13px;
      color: #666;
      margin-bottom: 30px;
    }
    .pay_bot_tip {
      width: 375px;
      height: 40px;
      background: url('@img/img_hyzxqy@2x.png') no-repeat 0 0 / 375px 40px;
      font-weight: 400;
      font-size: 13px;
      color: #FF9B00;
      line-height: 1;
      margin-left: -15px;
      @include flex-center;
      &:before, &:after {
        content: '';
        width: 30px;
        height: 1px;
        background: #FF9B00;
        margin: 0 8px;
      }
    }
    .guide_b {
      width: 375px;
      background: #CEF2E4;
      padding: 30px 0 10px;
      img {
        @include hor-center(355px);
        pointer-events: none;
        margin-bottom: 34px;
      }
    }
    .bot_btn {
      width: 375px;
      position: fixed;
      left: calc(50% - 187.5px);
      bottom: 0;
      height: 129px;
      background: linear-gradient( 180deg, rgba(255,255,255,0) 0%, #FFFFFF 100%);
      padding-top: 36px;
      z-index: 3;
      .pay_btn {
        margin-top: 0;
        margin-bottom: 0;
      }
    }
    .back_top {
      width: 68px;
      height: 68px;
      position: fixed;
      right: calc(50% - 178px);
      bottom: 104px;
      z-index: 4;
      cursor: pointer;
    }
    .comment_b {
      position: relative;
      img {
        @include hor-center(375px);
        pointer-events: none;
      }
    }
    .comment_btn {
      position: absolute;
      width: 100px;
      height: 30px;
      right: 8px;
      top: 22px;
    }
    .comment_pop {
      width: 345px;
      padding: 20px;
      .van-cell {
        padding: 12px 15px;
        background: #F9F9F9;
        border-radius: 12px;
        border: 1px solid #D8D8D8;
      }
    }
    .comment_title {
      font-weight: 600;
      font-size: 17px;
      color: #333333;
      line-height: 24px;
      margin-bottom: 12px;
    }
    .comment_pop_btn {
      margin-top: 20px;
      @include flex-between;
      justify-content: flex-end;
      div {
        width: 107px;
        height: 38px;
        background: #F7F7F7;
        border-radius: 8px;
        font-weight: 400;
        font-size: 14px;
        color: #999;
        line-height: 1;
        text-align: center;
        padding-top: 12px;
      }
      .cancel {
        margin-right: 12px;
      }
      .comfirm {
        background: linear-gradient( 90deg, #5DFDAD 0%, #5EF1F6 100%);
        color: #333;
      }
    }
  }

  @keyframes swipeTxt {
    0% {
      transform: translate(0);
    }
    100% {
      transform: translate(-448px);
    }
  }
</style>