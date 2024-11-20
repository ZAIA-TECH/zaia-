<template>
  <div class="ai_chat" :style="{ height: aiHeight + 'px' }">
    <div class="ai_top"><img src="@img/chat_avater.png" alt=""> 全科家教-小雅老师</div>
    <div class="chat_msg_list" :style="{ paddingBottom: botHeight + 'px' }">
      <div class="msg_list">
        <div class="msg_item">
          Halo，我是你的专属作文教师小雅，我已经仔细阅读了同学你的作文，你有任何疑惑都可以向我提问（包括但不限于素材推荐、写作技法指导、句子段落赏析和优化）
        </div>
        <div v-for="(item, index) in convert" :key="item.sid" :class="item.role == 'user' ? 'user_msg_item' : ''">
          <template v-if="item.role == 'user'">
            <div class="msg_item">{{item.message.txt}}</div>
          </template>
          <template  v-if="item.role == 'assistant'">
            <div class="msg_item">
              <div v-html="item.message.txt"></div>
              <div class="tools" v-if="evaluatList[index]">
                <img src="@img/copy.png" alt="" :id="`copy_${item.sid}`" @click="copyTxt(val.content, `copy_${item.sid}`, $event)">
                <img src="@img/poor_rating.png" alt="" @click="changeEvaluation(-1, evaluatList[index])" v-show="evaluatList[index].evaluation != -1">
                <img src="@img/poor_rating_active.png" alt="" @click="changeEvaluation(0, evaluatList[index])" v-show="evaluatList[index].evaluation == -1">
                <img src="@img/thumb_up.png" alt="" @click="changeEvaluation(1, evaluatList[index])" v-show="evaluatList[index].evaluation != 1">
                <img src="@img/thumb_up_active.png" alt="" @click="changeEvaluation(0, evaluatList[index])" v-show="evaluatList[index].evaluation == 1">
              </div>
            </div>
          </template>
        </div>
        
      </div>
    </div>
    <div class="bot_bar">
      <van-field v-model="message" :disabled="isAskNumMax" rows="1" :maxlength="msgMaxLength" autosize type="textarea" :placeholder="isAskNumMax ? '您已达到提问限额' : '请输入...'" />
      <div class="send_btn" @click="sendMsg">
        <img src="@img/send.png" alt="">
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, withScopeId, watch, onBeforeUnmount, defineProps, defineExpose } from 'vue'
  import { aiChartSend, paramContentReplace, aiChartTxt, enAiChartTxt } from '@/api/aiApi'
  import { chatMessageSave, chatEvaluation } from '@/api/index'
  import { fitUnitPx, copy, randomNum } from '@/utils/utils'
  import { showToast } from 'vant'
  import { parse } from 'marked'
  import { useStore } from '@/stores'
  import { useRoute } from 'vue-router';


  const aiHeight = ref(window.innerHeight - fitUnitPx(116))
  const innerHiehgt = ref(window.innerHeight)

  let botSafeHeight = 0;
  
  const store = useStore();
  const route = useRoute();
  const corType = route.query.type;

  const props = defineProps(['orderDetailInfo', 'dicDetailDesc', 'activeNav'])
  const convert = ref([])
  props.orderDetailInfo.convert && props.orderDetailInfo.convert.forEach(val => {
    convert.value.push(JSON.parse(val.answer))
  })

  let askQuestionsNum = props.orderDetailInfo.askQuestionsNum;
  const isAskNumMax = ref(false)

  const evaluatList = ref([])
  const message = ref('')
  
  let wSocket = '';

  let replyList = [];
  let replyState = 'end'
  
  let isReceive = false;
  let autoBot = true;

  const msgMaxLength = 2000;

  const sendMsg = async () => {
    if(isReceive) {
      showToast('正在接收回答中，请稍后再试')
      return;
    }
    if(isAskNumMax.value) {
      showToast('您已达到提问限额')
      return
    };
    if(!message.value) return;
    const replaceContent = paramContentReplace({
      dicDetailDesc: props.dicDetailDesc,
      message: message.value,
      convert: convert.value,
      ...props.orderDetailInfo.orderContentPo,
    }, corType == 'en' ? enAiChartTxt : aiChartTxt);
    convert.value.push({
      role: 'user',
      sid: randomNum(),
      message: { txt: message.value, replaceTxt: replaceContent },
    })
    scrollToPos();
    askQuestionsNum++;
    isAskNumMax.value = askQuestionsNum == props.orderDetailInfo.askYaNumber;
    isReceive = true;
    await chatMessageSave({
      answer: JSON.stringify(convert.value[convert.value.length -1]),
      evaluation: 0,
      orderNo: route.query.orderNo,
      userId: store.userId,
    })
    message.value = '';
    await aiChartSend({
      dicDetailDesc: props.dicDetailDesc,
      message: message.value,
      convert: convert.value,
      ...props.orderDetailInfo.orderContentPo,
      stream: true,
      callBack(aiRes) {
        if(aiRes.firstStream) {
          autoBot = true;
          convert.value.push({
            role: 'assistant',
            sid: randomNum(),
            message: { txt: '' },
          })
        }
        if(!aiRes.done) {
          convert.value[convert.value.length - 1].message.txt += aiRes.message;
        } else {
          isReceive = false;
          convert.value[convert.value.length - 1].message.txt = parse(convert.value[convert.value.length - 1].message.txt)
        }
        autoBot && scrollToPos();
      }
    })
    chatMessageSave({
      answer: JSON.stringify(convert.value[convert.value.length -1]),
      evaluation: 0,
      orderNo: route.query.orderNo,
      userId: 0,
    })
  }

  const forbidAutoBot = () => {
    autoBot = false;
    console.log('------------------123231')
  }

  const scrollToPos = (pos) => {
    setTimeout(() => {
      document.querySelector('.ai_chat').scrollTo({
        behavior: 'smooth',
        top: props.activeNav == 2 ? (pos || 10000000) : 0,
      });
    }, 50)
  } 

  const copyTxt = (text, id, event) => {
    copy(text, id, event)
  }

  const botHeight = ref(fitUnitPx(60))
  let lastWindowHeight = 0;
  // 处理键盘弹出时的高度问题
  const resizeList = () => {
    setTimeout(() => {
      innerHiehgt.value = window.innerHeight;
      aiHeight.value = window.innerHeight - fitUnitPx(116);
      if(Math.abs(innerHiehgt.value - lastWindowHeight) > 50) {
        scrollToPos();
      }
      console.log('------------------234234342')
      console.log(innerHiehgt.value - lastWindowHeight);
    }, 100)
  }
  
  window.addEventListener('resize', resizeList)
  
  // 处理内容换行时的高度问题
  watch(message, (newV) => {
    setTimeout(() => {
      botHeight.value = document.querySelector('.bot_bar').offsetHeight - fitUnitPx(24) - botSafeHeight;
      scrollToPos();
    },10)
  })

  const changeEvaluation = async(evaluation, item) => {
    const res = await chatEvaluation({ evaluation, id: item.id })
    if(res.code !== 200) return
    item.evaluation = evaluation;
  }

  let messageId = ''
  let msgIsLoad = false;
  let listHeight = 0;

  defineExpose({
    forbidAutoBot,
  })

  onMounted(async () => {
    setTimeout(() => {
      botSafeHeight = document.querySelector('.bot_bar').offsetHeight - fitUnitPx(60);
      console.log(botSafeHeight);
      aiHeight.value = window.innerHeight - fitUnitPx(116) - botSafeHeight;
      botHeight.value = document.querySelector('.bot_bar').offsetHeight - fitUnitPx(24) - botSafeHeight;
      setTimeout(() => {
        scrollToPos();
      }, 10);
    }, 10)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeList);
  })

</script>

<style lang="scss" scoped>
.ai_chat {
  min-height: inherit;
  background: #fbfbfb;
  width: 375px;
  overflow-x: hidden;
  position: relative;
  .ai_top {
    width: 375px;
    font-size: 15px;
    line-height: 1;
    padding: 10px 20px;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, .1);
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%);
    background: #fff;
    display: flex;
    align-items: center;
    img {
      width: 28px;
      height: 28px;
      margin-right: 10px;
    }
  }
  .chat_msg_list {
    padding: 60px 12px 36px;
    overflow: auto;
  }
  .no_more {
    font-size: 10px;
    color: #bcbcbc;
    text-align: center;
    margin-bottom: 10px;
    line-height: 1;
    @include flex-center;
    span {
      margin-right: 6px
    }
  }
  .user_msg_item {
    @include flex-center;
    justify-content: flex-end;
    .msg_item {
      background: #95EC69;
      color: #333;
    }
  }
  .msg_item {
    padding: 8px 16px;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, .1);
    border-radius: 8px;
    background: #fff;
    max-width: 280px;
    margin-bottom: 12px;
    display: inline-block;
    text-align: justify;
    font-size: 15px;
    line-height: 21px;
    color: #555;
  }
  .bot_bar {
    box-shadow: 0px 1px 4px rgba(0, 0, 0, .1);
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translate(-50%);
    width: 375px;
    @include flex-between;
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom));;
    background: #fff;
  }
  .send_btn {
    padding: 6px 14px 6px 12px;
    border-radius: 8px;
    background: #fff;
    flex-shrink: 0;
    margin-left: 12px;
    box-shadow: 0px 0 4px #efefef;
    border: 1px solid #efefef;
    img {
      @include hor-center(24px);
      height: 24px;
    }
  }
  .van-cell {
    border: 1px solid #efefef;
    border-radius: 6px;
    padding: 7px 16px;
  }
  .tools {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
    img {
      height: 14px;
      margin-left: 12px;
    }
  }
}
</style>

<style lang="scss">
.ai_chat {
  .van-field__control {
    max-height: 30vh;
  }
  ol, ul {
    padding-inline-start: 18px;
    list-style: inherit;
  }
}
</style>