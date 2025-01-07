<template>
  <div class="user_sign_out">
    <p class="title">请确认注销账号</p>
    <p class="paragraph">{{ route.query.phone }}</p>
    <p class="paragraph">如您注销账号，将面临以下后果:</p>
    <p class="paragraph">账号内数据被全部清除，钱包内的优惠券、积分等虚拟权益失效，已绑定的第三方账号自动解绑，且您注销账号的行为是不可逆的，您无法通过注册新的账号找回原有账号数据。</p>
    <div class="paragraph">
      <p>您申请注销账号，需要同时满足以下条件：</p>
      <p>您申请注销的账号为您本人的账号；</p>
      <p>钱包内无已实际支付但未消费的费用；</p>
      <p>账号内不存在未完成的订单和服务；</p>
      <p>账号不存在未解决的纠纷；</p>
    </div>
    <p class="paragraph">如您仍决定注销账号，请仔细阅读并充分了解以下《用户账号注销协议》</p>
    <van-checkbox v-model="agSelect" icon-size="14px">
      <div class="agreement">我已阅读并同意<span @click.stop="toAgreement">《用户账号注销协议》</span></div>
    </van-checkbox>
    <div class="bot_btn" @click="confirm">确认注销</div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '../../stores';
import { ref } from 'vue';
import { showToast, showConfirmDialog  } from 'vant';
import { userSignOut, findUserId } from '@/api'
import { removeLoginInfo } from '@/utils/utils'
import Cookies from 'js-cookie'

const agSelect= ref(false)
const route = useRoute();
const router = useRouter();
const store = useStore();

const confirm = () => {
  if(!agSelect.value) {
    showToast('请先阅读并同意相关协议和政策')
    return
  }
  showConfirmDialog({
    title: '确认注销',
    message: '注销操作不可逆，为防止误操作，请最后确认',
  }).then(async res => {
    await userSignOut();
    await removeLoginInfo();
    showToast({
      message: '注销成功',
      forbidClick: true,
      duration: 2000,
      onClose() {
        router.push('/')
      }
    })
    console.log(res);
  }).catch(() => {})
}

const toAgreement = () => {
  window.location.href = 'https://www.zuowenshuo.cn/agreement/logoutAgreement.html';
}

</script>

<style lang="scss" scoped>
.user_sign_out {
  min-height: inherit;
  padding: 18px;
  background: #2c2148 url('@img/wechat_accounts.jpg') no-repeat 0 0 / 375px 603px;
  color: #fff;
  font-size: 14px;
  .title {
    font-size: 16px;
    font-weight: bold;
  }
  .paragraph {
    line-height: 24px;
    padding: 4px 0;
  }
  .agreement {
    color: #fff;
    font-size: 12px;
    text-align: center;
    line-height: 1;
    span {
      color: #e95954;
    }
  }
  .bot_btn {
    @include primaryBtn(240px);
    margin: 20px auto 0;
  }
}
</style>

<style lang="scss">
.user_sign_out {
  .van-checkbox {
    margin-top: 60px;
    justify-content: center;
  }
}
</style>