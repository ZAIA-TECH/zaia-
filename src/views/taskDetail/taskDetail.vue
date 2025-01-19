<template>
  <div class="task_detail">
    <div class="top_btns">
      <span></span>
      <div class="right_btns">
        <div class="refresh" id="refresh" @click="copyReport">复制报告</div>
      </div>
    </div>
    <div class="report_content">
      <div class="top_nav">
        <span
          v-for="(item, index) in topNav"
          :key="index + 's'"
          :class="{ active: activeNav == index }"
          @click="changeNav(index)"
        >
          {{ item }}
        </span>
      </div>
      <div class="error_content" v-if="activeNav == 0">
        <template v-if="!isLoading">
          <div class="edit_title">{{ orderContent.title }}</div>
          <div class="comment_module" v-for="(item, index) in answerList" :key="item.agentId">
            <div class="module_title">
              {{ item.agentName }}
            </div>
            <div class="module_content" v-html="item.parseAnswer"></div>
          </div>
        </template>
      </div>

      <div v-show="activeNav == 1" class="touch_msg">
        <div class="touch_title">{{ orderContent.title }}</div>
        <div v-html="orderContent.content" class="touch_txt"></div>
      </div>
    </div>

    <backIndex></backIndex>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { taskGetAnswer } from '@/api'
import { useRoute } from 'vue-router'
import { copy } from '@/utils/utils'
import { parse } from 'marked'
import backIndex from '@/components/backIndex.vue'

const route = useRoute()

let orderContent = ref({})

let answerList = ref([])

const topNav = ref(['精批报告', '查看原文'])
const activeNav = ref(0)

const orderDetailInfo = ref({})

const copyTxt = (txt, id, event) => {
  copy(txt, id, event)
}

const changeNav = (index) => {
  activeNav.value = index
}

const isLoading = ref(true)

const getOrderDetail = async () => {
  const res = await taskGetAnswer({ id: route.query.id })
  isLoading.value = false
  orderDetailInfo.value = res.data
  orderContent.value = res.data.orderContentPo
  answerList.value = res.data.answerResponseVos
  answerList.value.forEach((val) => {
    val.parseAnswer = parse(val.answer)
    val.isOverride = false
  })
}

const copyReport = (event) => {
  const txt = answerList.value.map((val) => `${val.agentName}\n${val.answer}`).join('\n\n')
  copyTxt(`${orderContent.value.title}\n\n${txt}`, 'refresh', event)
}

onMounted(async () => {
  getOrderDetail()
})
</script>

<style lang="scss" scoped>
.task_detail {
  min-height: inherit;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  position: relative;
  font-size: 14px;
  background: #fff url('@img/report_bg@2x.png') no-repeat 0 0 / 375px auto;
  .top_btns {
    @include flex-between;
    padding: 10px 15px;
  }
  .right_btns {
    @include flex-between;
  }
  .view_origin {
    width: 70px;
    height: 32px;
    background: url('@img/view_origin.png') no-repeat 0 0 / 70px 32px;
    margin-right: 12px;
  }
  .refresh {
    font-size: 14px;
    font-weight: normal;
    color: #fff;
    line-height: 1;
    padding: 8px 16px;
    border-radius: 6px;
    background-color: #84bd93;
    &.forbid {
      color: #999;
    }
  }
  .top_nav {
    width: 375px;
    @include flex-between;
    align-items: flex-end;
    text-align: center;
    background: #dcf6f2;
    height: 40px;
    font-weight: bold;
    span {
      background: #dcf6f2;
      padding: 14px 0;
      font-size: 14px;
      color: #000;
      line-height: 1;
      width: 100%;
      &:nth-child(1) {
        &.active {
          border-radius: 0 14px 0 0;
        }
      }
      &:nth-child(2) {
        &.active {
          border-radius: 14px 14px 0 0;
        }
      }
      &:nth-child(3) {
        &.active {
          border-radius: 14px 0 0 0;
        }
      }
      &.active {
        background: #fff;
        padding: 18px 0 14px;
      }
    }
  }
  .report_content {
    // background: #fff;
  }
  .error_content {
    padding: 16px 16px 0;
    min-height: 400px;
    background: #fff;
  }
  .edit_title {
    color: #333;
    font-weight: bold;
    @include flex-center;
    font-size: 16px;
    .edit {
      margin-left: 4px;
    }
    .van-icon-edit {
      font-size: 16px;
      font-weight: bold;
    }
  }
  .title_bot_tip {
    font-size: 12px;
    color: #999;
    margin-top: 6px;
  }

  .comment_module {
    margin-top: 18px;
  }

  .module_content {
    padding-left: 8px;
    color: #666;
  }
  .module_title {
    padding-left: 14px;
    font-size: 14px;
    position: relative;
    font-weight: bold;
    margin-bottom: 8px;
    color: #309e73;
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      height: 18px;
      width: 6px;
      background: #60dbab;
      transform: translateY(-50%);
    }
  }
  .module_operate {
    @include flex-between;
  }
  .operate_group {
    display: flex;
    img {
      width: 18px;
    }
  }
  .operate_item {
    height: 24px;
    line-height: 24px;
    font-size: 12px;
    @include flex-center;
    color: #309e73;
    padding: 0 6px;
    .van-icon {
      font-size: 14px;
      margin-right: 3px;
    }
  }
  .pop_title {
    font-size: 15px;
    text-align: center;
    font-weight: bold;
    padding: 16px 0;
  }
  .edit_feed_b {
    .van-cell {
      border: 1px solid #ccc;
      border-radius: 6px;
    }
    margin: 0 20px 20px;
  }
  .feed_bot_btn {
    @include flex-between;
    margin: 0 20px 20px;
    > div {
      width: 140px;
      text-align: center;
      padding: 9px 0;
      font-size: 13px;
      margin: 0 16px;
      line-height: 1;
      border-radius: 25px;
      cursor: pointer;
    }
    .use_btn {
      border: 1px solid #62c7b4;
      color: #62c7b4;
    }
    .comfirm_btn {
      background: #62c7b4;
      color: #fff;
    }
  }
  .load_txt {
    padding-top: 20px;
    padding-bottom: 20px;
    text-align: center;
  }
  .touch_msg {
    min-height: calc(100vh - 116px);
    background: #fff;
    padding: 16px 16px 0;
    .touch_title {
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .touch_txt {
      font-size: 14px;
      line-height: 1.8;
    }
  }
  .menu {
    position: fixed;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #1989fa;
    right: 15px;
    bottom: 100px;
    @include flex-center;
    img {
      width: 20px;
    }
  }
}
</style>

<style lang="scss">
.task_detail {
  .van-tab {
    position: relative;
  }
  .edit_feed_b .van-field__control {
    height: 50vh;
  }
  .module_content {
    p,
    li {
      margin-bottom: 12px;
    }
    h2 {
      margin-bottom: 6px;
    }
    li {
      list-style: auto;
    }
    ul li {
      list-style: disc;
    }
    ul,
    ol {
      padding-left: 20px;
    }
  }
}
</style>
