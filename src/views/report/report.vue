<template>
  <div class="report">
    <van-tabs v-model:active="activeBar" sticky @change="changeBar" :offset-top="offsetTop">
      <van-tab :title="item.title" v-for="(item, index) in navBar" :key="index" :name="item.product"></van-tab>
    </van-tabs>
    <div class="report_list">
      <LazyLoad @loadList="loadList" :total="total" :emptyText="'你还没有报告哦~'" ref="lazyLoad">
        <template v-for="(item, index) in reportList" :key="index">
          <orderCard :orderItem="item" class="report_item"></orderCard>
        </template>
      </LazyLoad>
    </div>
  </div>
</template>

<script setup>
import { orderFind } from '@/api/index'
import { ref, onMounted } from 'vue';
import LazyLoad from '../../components/lazyLoad.vue';
import { getAssetURL, fitUnitPx } from '@/utils/utils'
import { useRouter } from 'vue-router';
import orderCard from '@/components/orderCard.vue'

const pointer = ref({
  pageNum: 0,
  pageSize: 10
})

const navBar = [
  { title: '中文批改记录', product: '1' },
  { title: '英文批改记录', product: '2' },
]

const offsetTop = fitUnitPx(44) + 'px';

const activeBar = ref('1');

const router = useRouter();

const total = ref(0);

const reportList = ref([])
const lazyLoad = ref(null)

const changeBar = () => {
  reportList.value = [];
  pointer.value = {
    pageNum: 0,
    pageSize: 10
  }
  lazyLoad.value.reset();
  loadList();
}

const loadList = async (callBack) => {
  pointer.value.pageNum ++
  const res = await orderFind({ pointer: pointer.value, product: activeBar.value });
  reportList.value = reportList.value.concat(res.data.list);
  total.value = res.data.total - 0;
  callBack && callBack();
}

const toOrder = (item) => {
  router.push({ path: '/correctionReport', query: { orderNo: item.orderNo, productCode: item.productCode, type: item.productCode == 'en-article-rectify' ? 'en' : 'zh' } })
}

onMounted(async() => {
  loadList();
})

</script>

<style lang="scss" scoped>
.report {
  background: #f6f6f6;
  min-height: inherit;
  .report_list { 
    padding: 18px;
    padding-bottom: calc(18px + env(safe-area-inset-bottom));
  }
  .report_item {
    margin-bottom: 12px;
  }
}
</style>


<style lang="scss">
.report {
  .van-tab__text--ellipsis {
    font-size: 15px;
  }
}
</style>