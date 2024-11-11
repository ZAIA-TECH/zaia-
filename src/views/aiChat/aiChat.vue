<template>
  <div class="ai_chat">
    <div class="ai_top"><img src="@img/chat_avater.png" alt=""> 全科家教-小雅老师</div>
    <div class="chat_msg_list" :style="{ height: `${innerHiehgt}px`, paddingBottom: botHeight + 'px' }">
      <div class="msg_list">
        <template v-if="isComplete">
          <div class="no_more">—— 没有更多记录了 ——</div>
          <div class="msg_item">
            你好，我是小雅。你的专属全科AI家教老师，你有任何关于学业上的问题都可以直接告诉我（知识解析、题目解答、素材推荐、出题练习、心理指导.....）
          </div>
        </template>
        <div class="no_more" v-else><span>加载中</span><van-loading size="12" /></div>
        <div v-for="(item, index) in messageList" :key="index" :class="item.role == 'user' ? 'user_msg_item' : ''">
          <template v-if="item.role == 'user' && item.payload">
            <div class="msg_item" v-for="(val, key) in item.payload.message.text" :key="item.header.sid + key">{{val.content}}</div>
          </template>
          <template  v-if="item.role == 'assistant' && item.payload">
            <div class="msg_item" v-for="(val, key) in item.payload.choices.text" :key="item.header.sid + key">
              <div v-html="val.contentParse"></div>
              <div class="tools" v-if="evaluatList[index]">
                <img src="@img/copy.png" alt="" :id="`copy_${item.header.sid}`" @click="copyTxt(val.content, `copy_${item.header.sid}`, $event)">
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
      <van-field v-model="message" rows="1" :maxlength="msgMaxLength" autosize type="textarea" placeholder="请输入..." />
      <div class="send_btn" @click="sendMsg">
        <img src="@img/send.png" alt="">
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, withScopeId, watch, onBeforeUnmount } from 'vue'
  import signature from '@/utils/signature'
  import WSocket from '@/utils/webSocket'
  import { saveChatMessage, requestUrl, getChatMessage, chatEvaluation, orderHomepageFind } from '@/api/index'
  import { fitUnitPx, copy } from '@/utils/utils'
  import { showToast } from 'vant'
  import { parse } from 'marked'
  import { useStore } from '@/stores'
  import { useRouter } from 'vue-router'

  const innerHiehgt = ref(window.innerHeight)

  const messageList = ref([{}]);
  const evaluatList = ref([])
  const message = ref('')
  
  const router = useRouter();
  const store = useStore();
  let wSocket = '';

  let replyList = [];
  let replyState = 'end'
  
  let isReceive = false;
  
  const msgMaxLength = 2000;

  const sendMsg = async () => {
    if(isReceive) {
      showToast('正在接收回答中，请稍后再试')
      return;
    } 
    if(!message.value) return;
    await wSocket.connect();
  }

  const scrollToPos = (pos) => {
    setTimeout(() => {
      document.querySelector('.chat_msg_list').scrollTo({
        behavior: 'smooth',
        top: pos || 10000000,
      });
    }, 50)
  } 

  const copyTxt = (text, id, event) => {
    copy(text, id, event)
  }

  const botHeight = ref(fitUnitPx(60))

  // 处理键盘弹出时的高度问题
  const resizeList = () => {
    innerHiehgt.value = window.innerHeight;
    scrollToPos();
  }
  
  window.addEventListener('resize', resizeList)
  
  // 处理内容换行时的高度问题
  watch(message, (newV) => {
    setTimeout(() => {
      botHeight.value = document.querySelector('.bot_bar').offsetHeight;
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
  const isComplete = ref(false);

  const getMessageList = async (cb) => {
    if(msgIsLoad || isComplete.value) return;
    msgIsLoad = true;
    const msgRes = await getChatMessage({
      id: messageId,
      requestVo: {
        pointer: {
          pageNum: 0,
          pageSize: 20
        }
      }
    })
    const msgList = [];
    const evaluats = [];
    isComplete.value = !(msgRes.data.list.length)
    msgRes.data.list.forEach((val, index) => {
      msgList.push(JSON.parse(val.answer));
      evaluats.push({ evaluation: val.evaluation, id: val.id });
      !isComplete.value && (isComplete.value = val.flag);
    })
    messageList.value = msgList.concat(messageList.value);
    evaluatList.value = evaluats.concat(evaluatList.value);
    // 已加载完聊天记录
    isComplete.value && document.querySelector('.chat_msg_list').removeEventListener('scroll', handleScroll)
    typeof cb == 'function' && cb()
    setTimeout(() => {
      !messageId && (listHeight = document.querySelector('.msg_list').scrollHeight);
      msgRes.data.list.length && (messageId = msgRes.data.list[0].id);
      msgIsLoad = false;
    }, 1000)
  }

  const handleScroll = () => {
    if(!messageId || isComplete.value) return;
    const scrollTop = document.querySelector('.chat_msg_list').scrollTop;
    if(scrollTop < 50) {
      getMessageList(() => {
        // 滚动到上一次的位置
        setTimeout(() => {
          const currHeight = document.querySelector('.msg_list').scrollHeight; 
          document.querySelector('.chat_msg_list').scrollTop = currHeight - listHeight;
          listHeight = currHeight;
        }, 10)
      });
    }
  }

  onMounted(async () => {
    const findRes = await orderHomepageFind()
    if(!store.isVip && !findRes.data.aiTutor) {
      showToast({
        message: '该功能为VIP专享，请开通后使用哦',
        forbidClick: true,
        onClose: () => {
          router.replace('/tabs/index')
        }
      })
      return
    }
    // 监听加载聊天记录
    document.querySelector('.chat_msg_list').addEventListener('scroll', handleScroll)
    getMessageList(scrollToPos);
    const res = await requestUrl()
    // socket相关
    wSocket = new WSocket({url: res.data, msgMaxLength});
    wSocket.receiveMessage(async(data) => {
      const { header, payload } = data;
      const text = payload.choices.text;

      if(header.status == 0) {
        replyState = 'reply'
        isReceive = true;
        messageList.value[messageList.value.length -1 ].role = text[0].role;
        messageList.value[messageList.value.length -1 ].contents = [];
      }
      if(replyState == 'end') return;

      replyList.push({ 
        seq: payload.choices.seq, 
        role: text.role,
        text
      });

      replyList = replyList.sort((a, b) => a.seq - b.seq);
      const contents = [];
      replyList.forEach(val => {
        val.text.forEach(item => {
          // item.content = item.content.replace(/\n/g, '<br />');
          contents[item.index] = contents[item.index] || {};
          contents[item.index].role = item.role;
          contents[item.index].content = contents[item.index].content ? contents[item.index].content + item.content : '' + item.content;
        });
      });
      contents.forEach(val => {
        // val.copyContent = val.content;
        val.contentParse = parse(val.content);
      })
      payload.choices.text = contents;
      data.role = payload.choices.text[0].role;
      messageList.value[messageList.value.length - 1] = { ...data, commentary: {} };

      if(header.status == 2) {
        const saveRes = await saveChatMessage({ content: JSON.stringify(messageList.value[messageList.value.length - 1]) })
        evaluatList.value.push({ id: saveRes.data, evaluation: 0 })
        replyList = [];
        messageList.value.push({})
        replyState = 'end';
        isReceive = false;
      };
      scrollToPos();
    })

    wSocket.ready(async () => {
      if(!message.value) return;
      wSocket.send('user', message.value, messageList.value);
      const saveMessage = wSocket.getFormatParam('user', message.value, [], true);
      messageList.value[messageList.value.length - 1] = {
        role: 'user',
        commentary: {},
        ...saveMessage
      };
      scrollToPos();
      messageList.value.push({});
      const saveRes = await saveChatMessage({ content: JSON.stringify(messageList.value[messageList.value.length - 2]) })
      evaluatList.value.push({ id: saveRes.data, evaluation: 0 })
      message.value = '';
    })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeList);
    document.querySelector('.chat_msg_list').removeEventListener('scroll', handleScroll);
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
    position: fixed;
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
    padding: 60px 12px;
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
    padding: 10px 12px;
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