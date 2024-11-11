<template>
  <div class="mine">
    <img src="@img/setting.png" @click="toSetting" class="set" alt="">
    <div class="top_module">
      <div class="u_avater">
        <img src="@img/u_avater.png" alt="" v-if="!store.isLogin" @click="toLogin">
        <img src="@img/u_avater_active.png" alt="" v-else>
      </div>
      <span class="to_login" v-if="!store.isLogin" @click="toLogin">点击登录</span>
      <div v-else class="user_info">
        <div class="u_phone">{{userInfo.phone}}</div>
        <div class="u_age">笔龄：{{userInfo.experience}}天</div>
      </div>
    </div>
    <div @click="toVip" :class="{'vip_card': 1, 'de_vip_card': !store.isVip, 'unlogin_vip_card': !store.isLogin }">
      <div class="vip_u">
        <span v-if="!store.isVip || !store.isLogin">作文说会员中心</span>
        <div v-else class="v_phone"><img src="@img/crown.png" alt="">{{userInfo.phone}}</div>
        <div class="vip_btn" alt="">{{ store.isVip && store.isLogin ? '立即续费' : '立即开通' }}</div>
      </div>  
      <div class="vip_tip" v-if="!store.isVip || !store.isLogin">会员有效期，自开通后首次批改起算</div>

      <div class="end_data" v-else>
        <template v-if="!userInfo.vipActivate">
          会员有效期，自开通后首次批改起算
        </template>
        <template v-else>
          有效期至：{{userInfo.vipEndTime}}
        </template>
        </div>
      <div class="bi_num" v-if="store.isLogin">
        已持有<span>{{ store.isLogin ? turnMoney(userInfo.balance) : 0 }}</span>学币
        <div class="q_icon" @click.stop="showXbTips = !showXbTips">
          <div class="xb_tips" v-show="showXbTips">学币可用于购买会员及其他服务</div>
        </div>
      </div>
    </div>

    <div class="operate_list">
      <template v-for="(item, index) in operateList" :key="index">
        <div class="operate_item" @click="routeLink(item.route, item.query, item.method, item.outLink)" v-if="!item.hide">
          <div class="item_name">
            <img class="item_icon" :src="item.icon" alt="">
            {{ item.name }}
            <div class="dot" v-if="item.hideDot"></div>
          </div>
          <img src="@img/arrow.png" alt="" class="right_arrow">
        </div>
      </template>
    </div>

    <van-popup v-model:show="showPop" round>
      <div class="pop_content">
        <div class="qr_top" v-if="popType == 'serve'">请关注公众号“作文说”获取联系方式</div>
        <img src="@img/qrcode.png" class="qrcode" alt="">
        <div class="qr_bot" v-if="popType == 'serve'">已申请相关知识产权，抄袭必诉</div>
        <div class="pop_btn" @click="showPop=false">确定</div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { getAssetURL, removeLoginInfo } from '@/utils/utils'
import { useRouter } from 'vue-router'
import { useStore } from '../../stores';
import { userFind } from '@/api/index'

const router = useRouter();
const store = useStore();

const operateItemHide = computed(() => {
  return !store.isLogin
})

const showPop = ref(false)
const popType = ref('serve')

const operateList = ref([
  { name: '我的报告', route: '/report', icon: getAssetURL('report_icon.png') },
  { name: '学币钱包', route: '/myWallet', icon: getAssetURL('package_icon.png') },
  { name: '领会员', route: '/freeAccessCoin', icon: getAssetURL('vip_icon.png'), hideDot: !store.hideDot && store.isLogin},
  { name: '联系我们', route: '', icon: getAssetURL('serve_icon.png'), method: () => {
    showPop.value = true;
    popType.value = 'serve';
  } },
  { name: '公众号', route: '', icon: getAssetURL('offical_icon.png'), method: () => {
    showPop.value = true;
    popType.value = 'offical';
  } },
  { name: '下载APP', route: '', icon: getAssetURL('app_icon.png'), outLink: 'https://a.app.qq.com/o/simple.jsp?pkgname=cn.zakj.zws' },
])

const routeLink = (path, query={}, method, outLink) => {
  if(typeof method == 'function') method();
  if(outLink) window.open(outLink, '_blank')
  if(!path) return;
  if(path.indexOf('http') > -1) {
    window.location.href = path;
  } else {
    router.push({ path, query })
  }
}

const toLogin = () => {
  router.push({path: '/login', query: { backPath: encodeURIComponent('/tabs/mine') }})
}

const userInfo = ref({})

const getUseInfo = async() => {
  if(store.isLogin) {
    const res = await userFind();
    userInfo.value = res.data;
  }
}

const toVip = () => {
  router.push({path: '/vip'})
}

const toSetting = () => {
  router.push({path: '/setting'})
}

watch(
  () => store.isLogin,
  (newV) => {
    if(newV) getUseInfo();
  }
)

const showXbTips = ref(false);

onMounted(async () => {
  store.showLogin = !store.isLogin; 
  getUseInfo();
})

</script>

<style lang="scss" scoped>
  .mine {
    position: relative;
    min-height: inherit;
    width: 375px;
    overflow: hidden;
    background: #FCFEFE url('@img/ming_bg@2x.png') no-repeat 0 0 / 375px auto;
    padding: 43px 13px calc(105px + env(safe-area-inset-bottom));
    padding-bottom: calc(105px + env(safe-area-inset-bottom));
    .set {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 36px;
      height: 36px;
      cursor: pointer;
    }
    .user_avater {
      @include hor-center(88px);
      height: 88px;
      border-radius: 50%;
      border: 1px solid  $primaryColor;
      background: #fff;
      position: relative;
      @include flex-center;
      z-index: 1;
      margin-bottom: 60px;
      img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
      }
    }
    .vip_card {
      cursor: pointer;
      @include hor-center(357px);
      height: 153px;
      background: url('@img/card_bg.png') no-repeat 0 0 / 357px 153px;
      padding: 19px 21px 0 25px;
      margin-bottom: 30px;
      &.de_vip_card {
        background: url('@img/de_card_bg.png') no-repeat 0 0 / 357px 153px;
        .vip_u {
          color: #817E7A;
        }
        .vip_tip {
          color: #DEDEDE;
        }
      }
      &.unlogin_vip_card {
        height: 140px;
        padding-top: 26px;
        background: url('@img/unlogin_card_bg.png') no-repeat 0 0 / 357px 140px;
        .vip_tip {
          font-size: 13px;
          line-height: 15px;
        }
      }
    }
    .vip_u {
      @include flex-between;
      font-weight: bold;
      font-size: 20px;
      color: #F2BB68;
      line-height: 23px;
      margin-bottom: 14px;
    }
    .v_phone {
      font-weight: bold;
      font-size: 20px;
      color: #F2BB68;
      line-height: 1;
      @include flex-center;
      img {
        width: 42px;
        height: 37px;
        margin-right: 6px;
      }
    }
    .vip_btn {
      cursor: pointer;
      width: 88px;
      height: 40px;
      background: url('@img/vip_btn_bg.png') no-repeat 0 0 / 88px 40px;
      font-weight: bold;
      font-size: 14px;
      color: #5C3D2B;
      padding-top: 13px;
      line-height: 1;
      text-align: center;
    }
    .vip_tip {
      font-size: 10px;
      color: #DEDEDE;
      line-height: 12px;
      margin-bottom: 26px;
    }
    .end_data {
      font-weight: 400;
      font-size: 12px;
      color: #F2BB68;
      line-height: 14px;
      margin-bottom: 24px;
    }
    .bi_num {
      font-size: 14px;
      color: #AD7045;
      line-height: 16px;
      text-align: left;
      display: flex;
      align-items: center;
      position: relative;
      .q_icon {
        width: 11px;
        height: 11px;
        transform: translate(6px, -4px);
        background: url('@img/q_icon.png') no-repeat 0 0 / 11px 11px;
        cursor: pointer;
        position: relative;
      }
      span {
        font-weight: bold;
        font-size: 22px;
        color: #C78C60;
        line-height: 1;
        margin: 0 4px;
      }
      .xb_tips {
        width: 172px;
        height: 32px;
        background: url('@img/tippop_bg.png') no-repeat 0 0 / 172px 32px;
        font-size: 10px;
        color: #000000;
        line-height: 1;
        position: absolute;
        left: -12px;
        top: 13px;
        padding-top: 14px;
        text-align: center;
      }
    }
    
    .operate_list {
      @include hor-center(352px);
      background: #fff;
      border-radius: 16px;
      padding: 24px;
    }
    .operate_item {
      cursor: pointer;
      @include flex-between;
      font-size: 14px;
      &:not(:last-child) {
        margin-bottom: 22px;
      }
      .right_arrow {
        width: 10px;
        height: 20px;
      }
    }
    .item_name {
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #000000;
      position: relative;
    }
    .dot {
      width: 10px;
      height: 10px;
      background: #D9001B;
      border-radius: 50%;
      position: absolute;
      top: 14px;
      left: 102px;
    }
    .item_icon {
      width: 38px;
      height: 38px;
      margin-right: 10px;
    }
    .pop_content {
      padding: 24px;
      text-align: center;
    }
    .qrcode {
      @include hor-center(110px);
      margin-bottom: 12px;
    }
    .qr_top {
      font-weight: bold;
      font-size: 14px;
      color: #000000;
      line-height: 16px;
      margin-bottom: 12px;
    }
    .qr_bot {
      font-size: 12px;
      color: #ADADAD;
      line-height: 14px;
      margin-bottom: 10px;
    }
    .pop_btn {
      width: 230px;
      height: 36px;
      background: url('@img/qr_btn.png') no-repeat 0 0 / 230px 36px;
      font-weight: bold;
      font-size: 15px;
      color: #000000;
      line-height: 1;
      padding-top: 9px;
    }
    .top_module {
      display: flex;
      align-items: center;
      margin-bottom: 22px;
    }
    .u_avater {
      width: 71px;
      height: 71px;
      background: url('@img/u_avater_out.png') no-repeat 0 0 / 71px 71px;
      @include flex-center;
      margin-right: 17px;
      img {
        width: 57px;
        height: 57px;
      }
    }
    .to_login {
      font-weight: bold;
      font-size: 20px;
      color: #000;
      line-height: 23px;
      cursor: pointer;
    }
    .u_phone {
      font-weight: bold;
      font-size: 15px;
      color: #000000;
      line-height: 18px;
      margin-bottom: 9px;
    }
    .u_age {
      font-size: 14px;
      color: #000000;
      line-height: 18px;
    }
  }
</style>

