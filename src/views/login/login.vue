<template>
  <div class="login" :style="{ minHeight: innerHeight + 'px' }">
    <img src="@img/jiantou@2x.png" class="back_icon" alt="" @click="backIndex">
    <img src="@img/logp@2x.png" class="logp" alt="">
    <div class="word">教师省心批改、家长轻松辅导</div>
    <!-- <img src="@img/word@2x.png" class="word" alt=""> -->
    <div class="word_bot_txt">若该手机号未登录，我们将自动为您注册</div>

    <div class="login_main">
      <van-field v-model="phone" type="number" maxlength="11" placeholder="请输入您的手机号" />
      <div class="code">
        <van-field v-model="verificationCode" type="number" placeholder="请输入验证码" maxlength="4">
          <template #button>
            <span v-if="canReget" class="get_btn" @click="getCode">获取验证码</span>
            <span v-else class="cut_time">重新获取({{cutTime}})</span>
          </template>
        </van-field>
      </div>
      <div class="commit_btn" @click="comfirBtn">登录</div>
      <van-checkbox v-model="agSelect" icon-size="14px" class="check_arg">
        <div class="agreement">我已阅读并同意<span @click.stop="toAgreement">《用户协议》</span>和<span @click.stop="toPrivacyPolicy">《隐私协议》</span></div>
        <template #icon="props">
          <img class="check_icon" :src="props.checked ? activeIcon : inactiveIcon" />
        </template>
      </van-checkbox>
    </div>
    <van-popup v-model:show="showCheckPop" round>
      <div class="check_pop">
        <div class="pop_title">用户协议及隐私条款</div>
        <div class="mid_txt">先阅读再同意</div>
        <div class="to_arg" @click.stop="toAgreement">《用户服务协议》</div>
        <div class="to_arg" @click.stop="toPrivacyPolicy">《隐私保护协议》</div>
        <div class="btn_group">
          <img src="@img/no@2x.png" alt="" @click="showCheckPop = false">
          <img src="@img/yes@2x.png" alt="" @click="agree">
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
  import { useStore } from '@/stores/index'
  import { onMounted, ref } from 'vue';
  import { loginCutTime, setLoginInfo, removeLoginInfo } from '@/utils/utils'
  import { showToast } from 'vant'
  import { sendVerificationCode, userLogin, findUserId } from '@/api/index'
  import { useRoute, useRouter } from 'vue-router';
  import { getAssetURL } from '@/utils/utils'
  
  const phone = ref('');
  const verificationCode = ref('');
  const canReget = ref(true)
  const cutTime = ref(59)
  const agSelect = ref(true)
  const store = useStore();
  const showCheckPop = ref(false)
  const route = useRoute()
  const router = useRouter();
  const innerHeight = window.innerHeight;

  const activeIcon = getAssetURL('saise@2x.png');
  const inactiveIcon = getAssetURL('huigou@2x.png');

  const vaildTel = () => {
    if(!phone.value) {
      showToast('请先输入手机号')
      return false;
    }
    if(!/^1[3456789]\d{9}$/.test(phone.value)) {
      showToast('手机号格式不正确')
      return false;
    }
    return true;
  }

  const getCode = async () => {
    // 未填号码 或 未勾选协议
    if(!vaildTel()) return;
    if(!agSelect.value) {
      showToast('请先勾选协议')
      return
    }
    const res = await sendVerificationCode({ phone: phone.value });
    if(res.code == 200) {
      canReget.value = false;
      cutTime.value = 59;
      cutTimer();
    }
  }

  const cutTimer = () => {
    loginCutTime((diff) => {
      cutTime.value = diff;
      canReget.value = !diff;
    });
  }

  const comfirBtn = async () => {
    if(!vaildTel()) return false;
    if(!agSelect.value) {
      showToast('请先勾选协议')
      showCheckPop.value = true;
      return false
    }
    if(!verificationCode.value) {
      showToast('请输入验证码');
      return false;
    }
    userLogin({
      code: verificationCode.value,
      phoneNumber: phone.value
    }).then(res => {
      setLoginInfo({
        ...res.data,
        phoneNumber: phone.value
      })
      store.showLogin = false;
      store.isLogin = true;
      showToast({
        message: '登录成功',
        onClose: () => {
          localStorage.removeItem('hideDot');
          localStorage.removeItem('hideImagesExample');
          store.hideDot = false;
          if(res.data.userGrade) {
            if(route.query.backPath) {
              router.replace(decodeURIComponent(route.query.backPath))
            } else{
              router.replace('/')
            }
          } else {
            router.replace({ path: '/identity', query: { ...route.query } })
          }
        }
      })
      phone.value = '';
      verificationCode.value = '';
      canReget.value = true;
      cutTime.value = 59;
    }).catch(res => {
      console.log(res);
    })
  }

  
  const toAgreement = () => {
    window.location.href = 'https://www.zuowenshuo.cn/agreement/agreement.html';
  }

  const toPrivacyPolicy = () => {
    window.location.href = 'https://www.zuowenshuo.cn/agreement/privacyPolicy.html';
  }

  const agree = () => {
    showCheckPop.value = false;
    agSelect.value = true;
  }

  const backIndex = () => {
    history.go(-1);
  }

  onMounted(() => {
    removeLoginInfo()
  })
</script>

<style lang="scss" scoped>
.login {
  // min-height: inherit;
  width: 375px;
  background: #fff url('@img/bg@2x.png') no-repeat 0 0 / 375px auto;
  padding: 38px 0 48px;
  position: relative;
  .back_icon {
    width: 19px;
    height: 11px;
    margin-left: 21px;
    margin-bottom: 64px;
  }
  .logp {
    @include hor-center(120px);
    height: 120px;
    margin-bottom: 10px;
  }
  .word {
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    color: #444;
  }
  .word_bot_txt {
    color: #B5B4B9;
    font-size: 12px;
    text-align: center;
    margin: 76px 0 20px;
  }
  .login_main {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    margin: 16px 0;
    .cut_time {
      color:#aaa
    }
    .agreement {
      font-size: 12px;
      display: flex;
      line-height: 1;
      color: #B7B6BB;
      span {
        color: #ABD1ED;
      }
    }
  }
  .get_btn {
    color: #85A7E4;
  }
  .commit_btn {
    width: 306px;
    height: 50px;
    // background: url('@img/commit_bg@2x.png') no-repeat 0 0 / 305px 49px;
    background: linear-gradient(90deg, #60C8A5, #B9F0F0);
    border-radius: 20px;
    font-weight: bold;
    color: #fff;
    font-size: 24px;
    line-height: 1;
    text-align: center;
    padding-top: 13px;
    margin-top: 15px;
  }
  .check_icon {
    width: 13px;
    height: 13px;
  }
  .check_pop {
    width: 275px;
    height: 204px;
    padding: 24px 20px 16px;
  }
  .pop_title {
    text-align: center;
    font-family: FZB;
  }
  .mid_txt {
    font-size: 12px;
    color: #A2A2A2;
    text-align: center;
    margin: 8px 0 12px;
  }
  .check_arg {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translate(-50%);
    white-space: nowrap;
  }
  .to_arg {
    font-size: 12px;
    text-align: center;
    color: #497568;
    margin-bottom: 6px;
  }
  .btn_group {
    margin-top: 20px;
    @include flex-between;
    img {
      height: 37px;
      width: 108px;
    }
  }
}
</style>

<style lang="scss">
  .login {
    .van-cell {
      width: 308px;
      height: 50px;
      // background: transparent url('@img/textbox@2x.png') no-repeat 0 0 / 307px 49px;
      border: 1px solid #BAD9F1;
      border-radius: 20px;
      padding: 0 14px;
      margin-bottom: 15px;
      .van-field__control {
        height: 48px;
        font-size: 15px;
      }
      &::after {
        border: none;
      }
    }
    .van-field__button {
      font-size: 15px;
      color: #1989FA;
    }
  }
</style>