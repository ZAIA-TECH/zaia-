<template>
  <div class="lazy_load">
    <template v-if="props.total">
      <slot></slot>
      <div v-if="isEnd" class="lazy_loading">没有更多了</div>
      <van-loading size="24px" class="lazy_loading" v-else>加载中...</van-loading>
      <van-back-top :offset="store.innerHeight" class="lazy_back_top" />
    </template>
    <van-empty :description="emptyText" v-else></van-empty>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed, defineExpose } from 'vue';
import { executeFirstInTime } from '@/utils/utils'
import { useStore } from '../stores';

const store = useStore();

const props = defineProps({
  total: {
    type: Number,
    default: 0
  },
  scrollEl: {
    type: Object,
    default: () => document
  },
  threshold: {
    type: Number,
    default: 200
  },
  pageSize: {
    type: Number,
    default: 10
  },
  emptyText: {
    type: String,
    default: '暂无数据',
  }
})

const emit = defineEmits(['loadList'])

let scrollHeight = 0;
const pageNum = ref(1);

const totalPage = computed(() => {
  return Math.ceil(props.total / props.pageSize)
})

const isEnd = computed(() => {
  return totalPage.value <= pageNum.value;
})

const isDocument = props.scrollEl === document;

const init = () => {
  setTimeout(() => {
    scrollHeight = document.documentElement.scrollHeight - ( isDocument ? window.innerHeight : props.scrollEl.offsetHeight );
  }, 10) 
}

const isLoading = ref(false);

const handleScroll = executeFirstInTime(() => {
  scrollHeight = document.documentElement.scrollHeight - ( isDocument ? window.innerHeight : props.scrollEl.offsetHeight );
  console.log(scrollHeight);
  if(isLoading.value || isEnd.value) return;
  const scrollTop = isDocument ? (document.documentElement.scrollTop || document.body.scrollTop) : props.scrollEl.scrollTop;
  if(scrollHeight - scrollTop <= props.threshold) {
    isLoading.value = true;
    emit('loadList', () => {
      pageNum.value ++;
      setTimeout(() => {
        isLoading.value = false;
      }, 100)
    })
  }
}, 100)

const reset = () => {
  isLoading.value = false;
  pageNum.value = 1;
  init();
}

onMounted(() => {
  init()
  props.scrollEl.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  props.scrollEl.removeEventListener('scroll', handleScroll)
})

defineExpose({
  reset,
})

</script>

<style lang="scss" scoped>
  .lazy_load {
    .lazy_loading {
      color: #969799;
      text-align: center;
      padding: 10px 0;
      font-size: 12px;
    }
  }
</style>

<style lang="scss">
.lazy_load {
  .lazy_loading {
    .van-loading__text {
      font-size: 12px;
    }
  }
}
.lazy_back_top {
  left: calc(50% + 117px);
}
</style>