<template>
  <div class="order_card" @click="toReport">
    <div class="order_top">
      <div class="order_title">{{orderItem.title || '无标题'}}</div>
      <!-- <div class="order_score">{{score}}/{{fullScore}}分</div> -->
    </div>
    <div class="order_grade">{{orderItem.grade}}</div>
    <div class="order_content">{{orderItem.content}}</div>
    <div class="order_bot">
      <div class="order_time"><img src="@img/zhong@2x.png" alt="">{{orderItem.finishPayDate}}</div>
      <!-- <div class="order_ordinal">批改次数：{{orderItem.refreshNum}}</div> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from "vue-router"

const { orderItem } = defineProps({
  orderItem: {
    type: Object,
    default: () => ({})
  }
})

const detail = orderItem.answer ? JSON.parse(Array.isArray(orderItem.answer) ? orderItem.answer[orderItem.answer.length - 1] : orderItem.answer) : '';
const score = ref(0);
const fullScore = ref(100);
if(detail && detail.errorCode == '0') {
  const result = detail.Result || detail._rawValue.Result;
  if(orderItem.productCode == 'en-article-rectify') {
    score.value = result.totalScore;
    fullScore.value = result.fullScore;
  } else {
    score.value = result.scoreCollection.score;
  }
}

const router = useRouter();

const toReport = () => {
  router.push({ path: '/correctionReport', query: { orderNo: orderItem.orderNo, productCode: orderItem.productCode, type: orderItem.productCode == 'en-article-rectify' ? 'en' : 'zh' } })
}

</script>

<style lang="scss" scoped>
.order_card {
  background: #fff;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, .1);
  border-radius: 12px;
  padding: 30px 16px;
  .order_top {
    @include flex-between;
    line-height: 1;
  }
  .order_title {
    width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 22px;
    font-weight: bold;
    font-family: Dutch801 XBd BT;
    color: #000;
  }
  .order_score {
    font-size: 18px;
    font-family: Dutch801 XBd BT;
    font-weight: normal;
    color: #F59E2A;
  }
  .order_grade {
    font-size: 14px;
    font-family: DengXian;
    color: #CECCCC;
    margin: 2px 0 12px;
  }
  .order_content {
    line-height: 22px;
    width: 303px;
    height: 22px;
    font-size: 17px;
    font-weight: 400;
    color: #999999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 14px;
  }
  .order_bot {
    @include flex-between;
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }
  .order_time {
    @include flex-between;
    img {
      width: 17px;
      height: 17px;
      margin-right: 4px;
    }
  }
}
</style>
