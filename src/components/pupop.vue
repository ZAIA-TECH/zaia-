<template>
  <van-popup v-model:show="showPop" round @closed="closed">
    <div class="pop_body">
      <span class="pop_close" @click="cancel"><van-icon name="cross" /></span>
      <div class="pop_title" v-if="title">{{ title }}</div>
      <div class="pop_content">
        <slot></slot>
      </div>
      <div class="pop_footer" v-if="!slots.footer">
        <van-button round type="comfirm" @click="confirm">{{ confirmText }}</van-button>
      </div>
      <template v-else>
        <slot name="footer"></slot>
      </template>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, watch, useSlots } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '确定'
  }
})

const slots = useSlots()

const emits = defineEmits(['update:show', 'cancel', 'confirm'])

const showPop = ref(false)

watch(
  () => props.show,
  () => {
    showPop.value = props.show
  },
  { immediate: true }
)

const confirm = () => {
  emits('confirm')
}

const closed = () => {
  showPop.value = false
  emits('update:show', showPop.value)
  emits('cancel')
}

const cancel = () => {
  showPop.value = false
}
</script>

<style lang="scss" scoped>
.pop_body {
  width: 320px;
  padding: 20px;
  padding-top: 26px;
  position: relative;
  .pop_close {
    position: absolute;
    right: 10px;
    top: 10px;
    line-height: 1;
    padding: 8px;
    text-align: center;
    font-size: 16px;
    box-sizing: content-box;
    color: #999;
  }
  .pop_title {
    font-size: 16px;
    font-weight: bold;
    color: #464646;
    text-align: center;
  }
  .van-button--comfirm {
    border: none;
    background: linear-gradient(to bottom, #77eed8 0%, #4cb19e 100%);
    color: #fff;
    height: 40px;
    width: 100%;
    font-size: 15px;
    &:before {
      display: none;
    }
  }
  .pop_content {
    padding: 20px 0;
  }
}
</style>
