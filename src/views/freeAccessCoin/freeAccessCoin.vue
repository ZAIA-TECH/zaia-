<template>
  <div class="free_access_coin">
    <div class="module">
      <div class="module_title">输入邀请码，领取学币</div>
      <van-field v-model="detail.bindInvitationCode" disabled label="绑定邀请码" placeholder="未绑定">
        <template #button>
          <div class="bind_btn" @click="showBind = true" v-if="!detail.bindInvitationCode">去绑定</div>
        </template>
      </van-field>
      <div class="module_tips">输入好友的邀请码，即可立即领取{{detail.invitedCreditsNumber}}学币奖励！学币可以用于会员续费、购买学习资料以及辅导服务</div>
    </div>

    <div class="module">
      <div class="module_title">邀请好友领学币</div>
      <van-field class="hight_light" v-model="detail.myInvitationCode" center disabled label="我的邀请码" placeholder="">
        <template #button>
          <div class="bind_btn" @click="toggleQr">去邀请</div>
          <!-- <div class="bind_btn" id="copy_code" @click="copyCode($event)">复制</div> -->
        </template>
      </van-field>
      <van-field class="hight_light" v-model="detail.invitationUserCount" center disabled label="已邀请用户数" placeholder="">
      </van-field>
      <van-field class="hight_light" v-model="detail.commissionRatio" center disabled label="佣金比例" placeholder="">
      </van-field>
      <van-field class="hight_light" v-model="detail.invitationGoldCoinCount" center disabled label="邀请已获学币" placeholder="">
      </van-field>
      <div class="module_tips">
        邀请好友绑定你的专属邀请码<br />
        1、您将直接获得 {{detail.invitationCreditsNumber}} 学币奖励，同时您的朋友也将获得 {{detail.invitedCreditsNumber}} 学币！<br />
        2、当您的朋友充值学币时，您还将额外获得充值金额 {{detail.commissionRatio}} 的学币奖励！
      </div>
    </div>

    <div class="module record_module">
      <div class="record_module_title">学币发放记录</div>
      <div class="record_module_tip">你会获赠绑定你的邀请码用户充值学币的20%</div>
      <div class="record_list">
        <LazyLoad @loadList="loadList" :total="total" :emptyText="'还没有记录哦~'">
          <div v-for="(item, index) in record" :key="index" class="record_item">
            <div class="balance">{{ turnMoney(item.balance) }}</div>
            <div class="change_type">{{changeTypes[item.changeType]}}</div>
            <div class="sys_time">{{ item.sysCreateTime }}</div>
          </div>
        </LazyLoad>
      </div>
    </div>

    <van-dialog v-model:show="showBind" title="绑定邀请码" show-cancel-button class="bind_pop" :before-close="beforeClose">
      <van-field v-model="invitationCode" center label="邀请码" placeholder="请输入邀请码">
      </van-field>
    </van-dialog>

    <van-popup v-model:show="showQrPop">
      <div class="close" @click="toggleQr"></div>
      <div class="qr_b">
        <img class="qr_img" :src="qrImgUrl" v-if="qrImgUrl" alt="">
        <template v-else>
          <div class="qr_title">加入作文说</div>
          <div class="qr_top_tip">立享名师作文精批提分方案</div>
          <div class="in_code">
            <span>邀请码</span>
            {{ detail.myInvitationCode }}</div>
          <div class="in_code_tip">填写邀请码，即可获得作文说会员</div>
          <p class="code_pro">邀请码填写流程：</p>
          <p class="code_pro_1" data-index="1">应用商店搜索或扫码下载作文说APP</p>
          <p class="code_pro_1" data-index="2">点击【我的】-【领会员】</p>
          <p class="code_pro_1" data-index="3">填写邀请码</p>
          <img class="invita_qr" src="@img/invita_qr.png" alt="">
          <p class="bot_tip">扫描二维码，下载作文说<br />（也可在公众号与各大应用商店自行搜索下载)</p>
        </template>
      </div>
      <div class="bot_icon">
        <template v-if="!store.isWechat">
          <div class="bot_item" v-for="(item, index) in qrBotOperate" :key="index" @click="operate($event, item)">
            <img :src="item.icon" alt="">
            <div>{{ item.name }}</div>
          </div>
        </template>
        <div v-else class="bot_icon_tip">长按上面图片保存或转发给好友</div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { userDetail, bindInvitationCode } from '@/api'
import { copy, turnMoney, getAssetURL } from '@/utils/utils'
import { showToast } from 'vant';
import LazyLoad from '../../components/lazyLoad.vue';
import { useStore } from '../../stores';
import html2canvas from 'html2canvas'

const pointer = {
  pageSize: 10,
  pageNum: 0
}

const store = useStore();
localStorage.setItem('hideDot', '1')
store.hideDot = true;

const detail = ref({})

const showBind = ref(false)

const invitationCode = ref('')

const beforeClose =(action) => new Promise(async (resolve) => {
  if (action === 'confirm') {
    if(!invitationCode.value) {
      showToast('请输入邀请码')
      resolve(false)
      return;
    }
    try {
      await bindInvitationCode({ invitationCode: invitationCode.value })
      detail.value.bindInvitationCode = invitationCode.value;
      showToast('绑定成功')
      resolve(true)
    } catch (err) {
      resolve(false)
    }
  } else {
    // 拦截取消操作
    resolve(true);
  }    
});

const showQrPop = ref(false);
const qrImgUrl = ref('');
const toggleQr = () => {
  if(store.isApp) {
    try {
      window.android.showShareDialog() 
    } catch (err) {
      console.log(err);
    }
    return
  }
  showQrPop.value = !showQrPop.value;
  if(showQrPop.value && !qrImgUrl.value) {
    setTimeout(() => {
      createQrimg();
    }, 10)
  }
}


const copyCode = (event) => {
  copy(`下载名师作文精批方案，领会员\n打开作文说APP，点击【我的】——【领会员】，填写邀请码【${detail.value.myInvitationCode}】，领取会员\nAPP下载地址：https://a.app.qq.com/o/simple.jsp?pkgname=cn.zakj.zws`, 'copy_code', event, '邀请码已复制，快去粘贴吧')
}

const record = ref([])
const total = ref(0)
const changeTypes = [ '充值', '充值退款', '消费', '消费退款', '好友充值获赠学币', '使用学币购买会员', '邀请奖励', '被邀请奖励' ]

const loadList = async (callBack) => {
  pointer.pageNum ++;
  const res = await userDetail({ pointer })
  detail.value = res.data;
  detail.value.commissionRatio = ((detail.value.commissionRatio * 100).toFixed(2) - 0) + '%';
  detail.value.invitationGoldCoinCount = turnMoney(detail.value.invitationGoldCoinCount);
  detail.value.invitationCreditsNumber = turnMoney(detail.value.invitationCreditsNumber);
  detail.value.invitedCreditsNumber = turnMoney(detail.value.invitedCreditsNumber);
  record.value = record.value.concat(res.data.userDetailMsgResponseVo.list);
  total.value = res.data.userDetailMsgResponseVo.total - 0;
  callBack && callBack();
}

const createQrimg = () => {
  const content = document.querySelector('.qr_b');
  html2canvas(content, {
    useCORS: true,
    allowTaint: true,
    width: content.clientWidth * 1.005,
    height: content.clientHeight * 1.005
  }).then(async function(canvas) {
    qrImgUrl.value = canvas.toDataURL('image/png')
    // if(store.isWechat) return;
    // const filename = 'zuoWenShuoQrCode.png'
    // const link = document.createElement('a')
    // link.href = qrImgUrl.value;
    // link.download = filename
    // document.body.appendChild(link)
    // link.click()
    // document.body.removeChild(link)
  })
}

const toWx = (event, item) => {
  if(store.isWechat) {
    if(item.shareType == 'wx') {
      wx.updateAppMessageShareData({
        title: '分享标题', // 分享标题
        desc: '分享描述', // 分享描述
        link: `${window.location.origin}/${import.meta.env.VITE_APP_OUTPUTDIR}`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: getAssetURL('zuoWenShuoQrCode.png'), // 分享图标
        success: function () {
          showToast('分享成功！')
        }
      })
    } else {
      wx.updateTimelineShareData({ 
        title: '分享标题', // 分享标题
        link: `${window.location.origin}/${import.meta.env.VITE_APP_OUTPUTDIR}`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: getAssetURL('zuoWenShuoQrCode.png'), // 分享图标
        success: function () {
          showToast('分享成功！')
        }
      })
    }
  } else {
    window.location.href = 'weixin://'
  }
}

const qrBotOperate = [
  // { icon: getAssetURL('icon_hyzx_wx@2x.png'), name: '微信', fn: (event, item) => toWx(event, item), shareType: 'wx' },
  // { icon: getAssetURL('friend_circle.png'), name: '朋友圈', fn: (event, item) => toWx(event, item), shareType: 'friendCircle' },
  // { icon: getAssetURL('save_qrcode.png'), name: '保存图片', fn: createQrimg },
  { icon: getAssetURL('copy_qrcode.png'), name: '复制文案', fn: (event) => copyCode(event) },
]

const operate = (event, item) => {
  typeof item.fn == 'function' && item.fn(event, item);
}


onMounted(() => {
  loadList();
})

</script>

<style lang="scss" scoped>
.free_access_coin {
  min-height: inherit;
  padding: 18px 18px calc(18px + env(safe-area-inset-bottom));
  padding-bottom: calc(18px + env(safe-area-inset-bottom)); 
  background: #f6f6f6;
  .module {
    background: #fff;
    border-radius: $primaryRadius;
    margin-bottom: 18px;
    overflow: hidden;
    .bind_btn {
      @include primaryBtn(60px);
      font-size: 12px;
      padding: 6px 0;
    }
  }
  .module_title {
    padding: 12px 16px 0;
    font-weight: bold;
    color: #333;
  }
  .module_tips {
    font-size: 11px;
    padding: 8px 16px 12px;
    line-height: 16px;
    color: #999;
  }
  .record_module {
    padding: 10px 16px;
    background: #fff;
    .record_module_title {
      font-weight: bold;
    }
    .record_module_tip {
      font-size: 12px;
      color: #666;
    }
  }
  .record_item {
    font-size: 13px;
    line-height: 1;
    @include flex-between;
    padding: 10px 0;
    &:not(:first-child) {
      border-top: $thinBorder;
    }
  }
  .balance {
    width: 40px;
    white-space: nowrap;
  }
  .change_type {
    width: 106px;
    text-align: center;
    white-space: nowrap;
  }
  .sys_time {
    color: #999;
  }
  .qr_b {
    padding: 32px 30px;
    border-radius: 24px;
    background: #fff;
    width: 330px;
    height: 512px;
    position: relative;
  }
  .close {
    width: 45px;
    height: 45px;
    background: url('@img/x@2x.png') no-repeat 0 0 / 45px 45px;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 3;
  }
  .qr_title {
    font-family: FZB;
    font-weight: 400;
    font-size: 20px;
    color: #36704D;
    line-height: 23px;
    text-align: center;
    margin-bottom: 6px;
  }
  .qr_top_tip {
    font-weight: 400;
    font-family: FSJ;
    font-size: 16px;
    color: #4F8263;
    line-height: 19px;
    text-align: center;
    margin-bottom: 20px;
  }
  .in_code {
    @include hor-center(270px);
    height: 100px;
    background: url('@img/in_code.png') no-repeat 0 0 / 270px 100px;
    font-size: 22px;
    color: #C3BEA8;
    line-height: 1;
    font-weight: bold;
    padding: 34px 0 0 44px;
    span {
      color: #FEAF39;
      margin-right: 36px;
    }
  }
  .in_code_tip {
    font-weight: bold;
    font-size: 12px;
    color: #B6B6B6;
    line-height: 14px;
    text-align: center;
    margin: 4px 0 20px;
  }
  .code_pro {
    font-weight: bold;
    font-size: 14px;
    color: #000000;
    line-height: 1;
    margin-bottom: 12px;
  }
  .code_pro_1 {
    font-weight: bold;
    font-size: 10px;
    color: #000000;
    line-height: 1;
    margin-bottom: 12px;
    @include flex-center;
    justify-content: flex-start;
    &::before {
      content: attr(data-index);
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #000;
      color: #fff;
      text-align: center;
      font-size: 8px;
      line-height: 1;
      padding-top: 2px;
      margin-right: 4px;
      box-sizing: border-box;
      transform: translateY(-1px);
    }
  }
  .invita_qr {
    @include hor-center(120px);
    height: 120px;
  }
  .bot_tip {
    font-weight: bold;
    font-size: 12px;
    color: #B6B6B6;
    line-height: 14px;
    text-align: center;
  }
  .bot_icon {
    @include flex-center;
    padding: 0 30px;
    margin-top: 12px;
    font-size: 12px;
    color: #FFFFFF;
    line-height: 14px;
    img {
      width: 40px;
      height: 40px;
      margin-bottom: 4px;
    }
  }
  .bot_icon_tip {
    text-align: center;
    font-weight: bold;
    width: 100%;
  }
  .bot_item {
    text-align: center;
    font-weight: bold;
    font-size: 12px;
    color: #FFFFFF;
    line-height: 14px;
    margin: 0 20px;
  }
  .qr_img {
    width: 330px;
    height: 512px;
    border-radius: 24px;
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>

<style lang="scss">
.free_access_coin {
  .van-field--disabled .van-field__label {
    color: #333;
  }
  .van-field__control:disabled {
    width: 140px;
    text-align: center;
  }
  .hight_light {
    .van-field__control:disabled {
      color: #333;
      -webkit-text-fill-color: #333;
    }
  }
  .bind_pop {
    .van-dialog__content {
      padding: 0 20px;
    }
    .van-field__label {
      width: 60px;
    }
  }
  .van-list__finished-text {
    line-height: 1;
    font-size: 12px;
  }
  .van-popup.van-popup--center:not(.bind_pop) {
    background: transparent;
  }
}
</style>