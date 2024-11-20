<template>
  <div class="pay_way_select">
    <div id="payForm"></div>
    <template v-if="!slots.default">
      <template v-for="(item, index) in payWayList">
        <div class="pay_way_item" :key="index" v-if="!item.hide"  @click="selectPay(item.payWay)">
          <div class="item_right"> <img :src="item.icon" alt="">{{ item.name }} </div>
          <img class="select_icon" :src="getAssetURL('select_btn.png')" alt="" v-if="item.payWay == payWay">
          <img class="select_icon" :src="getAssetURL('unselect_btn.png')" alt="" v-else>
        </div>
      </template>
    </template>
    <slot></slot>
  </div>
</template>

<script setup>
  import { getAssetURL } from '@/utils/utils'
  import { ref, getCurrentInstance, defineSlots } from 'vue';
  import payJS from '@/mixins/pay'  

  const slots = defineSlots();
  console.log(slots.default)

  const vm = getCurrentInstance()
  const isWechat = vm.appContext.config.globalProperties.isWechat
  const payDomin = vm.appContext.config.globalProperties.payDomin
  
  const payWayList = [
    { icon: getAssetURL('wx_icon.png'), name: '微信', payWay: 'wx' },
    { icon: getAssetURL('zfb_icon.png'), name: '支付宝', payWay: 'zfb', hide: isWechat },
  ]

  const payWay = ref('wx')

  const selectPay = (way) => {
    payWay.value = way;
  }

  const pay = (orderNo, successUrl) => {
    const payMethod = payJS(orderNo, payDomin, vm.appContext.config.globalProperties.$route);
    if(payWay.value == 'wx') {
      payMethod.handleWechatPay(successUrl);
    } else {
      payMethod.handleAliPay(successUrl);
    }
  }

  defineExpose({
    selectPay,
    payWay,
    pay
  })
</script>

<style lang="scss" scoped>
  .pay_way_select {
    .pay_way_item {
      @include flex-between;
      font-size: 14px;
      padding: 14px 0;
      border-bottom: $thinBorder;
    }
    .item_right {
      @include flex-center;
      img {
        width: 28px;
        height: 28px;
        margin-right: 8px;
      }
    }
    .select_icon {
      width: 20px;
      height: 20px;
    }
  }
</style>