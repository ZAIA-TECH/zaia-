<template>
  <div class="agreement_list">
    <div class="list">
      <div v-for="(item, index) in agreementList" :key="index" class="list_item" @click="routeLink(item.href)">
        <div class="">
          {{ item.name }}
        </div>
        <img :src="getAssetURL('arrow-right.svg')" alt="" class="right_arrow" v-if="!item.hideArrow">
        <span v-if="item.name == '绑定手机'">{{userInfo.phone}}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getAssetURL } from '@/utils/utils'

const agreementList = [
  { name: '用户协议', href: 'https://www.zuowenshuo.cn/agreement/agreement.html' },
  { name: '隐私协议', href: 'https://www.zuowenshuo.cn/agreement/privacyPolicy.html' },
  { name: '个人信息清单', href: 'https://www.zuowenshuo.cn/agreement/userInfoListAgreement.html' },
  { name: '账号注销协议', href: 'https://www.zuowenshuo.cn/agreement/logoutAgreement.html' },
  { name: '第三方SDK清单', href: 'https://www.zuowenshuo.cn/agreement/thrSDKlistAgreement.html' },
]

const routeLink = (href) => {
  window.location.href = href;
}

</script>

<style lang="scss" scoped>
.agreement_list {
  min-height: inherit;
  padding: 18px;
  .list_item {
    cursor: pointer;
    @include flex-between;
    padding: 12px;
    border-bottom: $thinBorder;
    font-size: 14px;
    .right_arrow {
      width: 16px;
      height: 16px;
    }
  }
}
</style>