<template>
  <div class="my_wallet">
    <div class="top_text">公测限时特惠中，活动结束后涨价~</div>
    <div class="my_have">
      <div class="balance_t">余额</div>
      <div class="balance_num">
        <img :src="getAssetURL('taojinbi_2.svg')" alt="" class="coin_icon"> {{ turnMoney(balanceCoin) }}
      </div>
      <div class="invitation">邀请已获学币：<span>{{ turnMoney(invitationGold) }}</span> 学币</div>
    </div>
    <div class="product_list">
      <div :class="['detail_item', selectedIndex == index ? 'selected' : '']" v-for="(item, index) in productDetails" :key="index" @click="choseProduct(item, index)">
        <div class="yh_k" v-if="(item.yh - 0) < 10">{{ item.yh - 0 }}折优惠</div>
        <div class="curr_price"><i>￥</i>{{turnMoney(item.currentPrice)}}</div>
        <div class="original_price"><i>￥</i>{{turnMoney(item.originalPrice)}}</div>
      </div>
    </div>

    <payWaySelectVue ref="payWaySelect"></payWaySelectVue>

    <div class="pay_bot">
      <div class="bot_left">总计：<i>￥</i><span>{{ turnMoney(currProduct.currentPrice) }}</span></div>
      <div class="pay_btn" @click="toPay">立即支付</div>
    </div>

  </div>
</template>

<script setup>
  import { getAssetURL } from '@/utils/utils'
  import { productFindWallet, orderCreateGold } from '@/api/index'
  import { ref, onMounted, computed } from 'vue';
  import payWaySelectVue from '@/components/payWaySelect.vue';
  import { useRoute } from 'vue-router';
  import { useStore } from '../../stores';
  
  const balanceCoin = ref(0) 
  const invitationGold = ref(0) 
  const productDetails = ref([])

  const route = useRoute();

  const selectedIndex = ref(0)

  const currProduct = ref({});

  const payWaySelect = ref(null)

  const store = useStore();

  const choseProduct = (item, index) => {
    selectedIndex.value = index;
    currProduct.value = productDetails.value[index]
  }

  const toPay = async () => {
    const res = await orderCreateGold({ productCode: currProduct.value.productCode, source: store.source });
    const redirectPath = route.query.backPath ? decodeURIComponent(route.query.backPath) : route.query.orderNo ? '/correctComposition' + location.search : '/myWallet?payState=success';
    payWaySelect.value.pay(res.data, redirectPath);
    // if(store.isApp) {
    //   payWaySelect.value.pay(res.data, `/appPaysuccess?redirectPath=${redirectPath}`)
    // } else {
    //   payWaySelect.value.pay(res.data, redirectPath);
    // }
  }

  onMounted(async () => {
    const res = await productFindWallet();
    invitationGold.value = res.data.invitationGoldCoinCount;
    balanceCoin.value = res.data.balance;
    productDetails.value = res.data.productDetails;
    currProduct.value = productDetails.value[0]
    productDetails.value.forEach(val => {
      val.yh = ((val.currentPrice / val.originalPrice) * 10).toFixed(1);
    })
  })

</script>

<style lang="scss" scoped>
  .my_wallet {
    min-height: inherit;
    padding: 20px 24px calc(20px + env(safe-area-inset-bottom));
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
    position: relative;
    .top_text {
      width: 375px;
      margin-left: -24px;
      margin-top: -20px;
      background: #EF95A0;
      font-size: 12px;
      text-align: center;
      line-height: 1;
      padding: 4px 0;
      color: #fff;
      margin-bottom: 12px;
    }
    .my_have {
      border-radius: $primaryRadius;
      background: $primaryColorThin7;
      padding: 24px;
      text-align: center;
      .balance_t {
        font-size: 18px;
        color: $primaryColor;
        font-weight: bold;
      }
      .balance_num {
        margin: 10px 0;
        color: $biColor;
        @include flex-center;
        align-items: flex-end;
        font-size: 30px;
        line-height: 24px;
        font-weight: bold;
      }
      .coin_icon {
        width: 20px;
        height: 20px;
        margin-right: 4px;
      }
    }
    .invitation {
      color: $primaryColor;
      // font-size: 14px;
      span {
        color: $biColor;
        font-weight: bold;
        font-size: 16px;
      }
    }
    .product_list {
      @include flex-between;
      flex-flow: row wrap;
      margin: 30px 0 10px;
      .detail_item {
        text-align: center;
        width: 92px;
        padding: 12px 0;
        margin-bottom: 20px;
        border-radius: $primaryRadius;
        border: $thinBorder;
        background: #efefef;
        position: relative;
        &.selected {
          background: $primaryColorThin7;
          border: 1px solid $primaryColor;
          .original_price {
            text-decoration: line-through;
          }
        }
        .yh_k {
          position: absolute;
          right: -14px;
          top: -8px;
          width: 56px;
          height: 18px;
          color: #fff;
          font-size: 10px;
          background: url('@img/yh_k.png') no-repeat 0 0 / 56px 18px;
        }
      }
      .curr_price {
        font-size: 18px;
        color: $biColor;
      }
      .original_price {
        text-decoration: line-through;
        color: #aaa;
      }
    }
    .pay_bot {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 12px 12px calc(12px + env(safe-area-inset-bottom));
      padding-bottom: calc(12px + env(safe-area-inset-bottom));
      border-top: $thinBorder;
      @include flex-between;
      .pay_btn {
        @include primaryBtn(100px);
        font-size: 15px;
        font-weight: bold;
      }
    }
    .bot_left {
      font-size: 14px;
      line-height: 1;
      span, i {
        font-weight: bold;
        color: $biColor;
      }
      span {
        line-height: 18px;
        font-size: 20px;
      }
    }
  }
</style>