<<<<<<< HEAD
d<template>
=======
<template>
>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
  <div class="correction_report">
    <div class="top_btns">
      <span></span>
      <div class="right_btns">
        <div class="view_origin" @click="originView"></div>
<<<<<<< HEAD
        <div class = "export_report" id="export_report" @click="exportReport">导出WORD</div> <!--11.17新增-->
=======
>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
        <div class="refresh" id="refresh" @click="copyReport">复制报告</div>
      </div>
    </div>
    <div class="report_content"> 
      <div class="top_nav">
        <span v-for="(item, index) in topNav" :key="index + 's'" :class="{ 'active': activeNav == index }" @click="changeNav(index)">
          {{item}}
        </span>
      </div>
      <div class="error_content" v-if="activeNav == 0">
        <template v-if="!isLoading">
          <div class="edit_title">{{ orderContent.title }} <span class="edit" @click="editTitle"><van-icon name="edit" color="#309E73" /></span></div>
          <div class="title_bot_tip">每个反馈记得评价，下次报告会更加精准</div>
          <div class="comment_module" v-for="(item, index) in answerList" :key="item.agentId">
            <div class="module_title">
              {{item.agentName}}
            </div>
            <div class="module_content" v-html="item.parseAnswer"></div>
            <div class="module_operate">
              <div class="operate_group">
                <span class="operate_item" @click="editFeedBack(index)"><van-icon name="edit" color="#309E73" />编辑</span>
                <span class="operate_item" @click="override(index)"><van-icon name="replay" color="#309E73" />重写</span>
              </div>
              <div class="operate_group">
                <span class="operate_item">
                  <img src="@img/thumb_up_active.png" v-if="item.evaluateAi == 1">
                  <img src="@img/thumb_up.png" @click="evaluatePost(index, 1)" alt="" v-else>
                </span>
                <span class="operate_item">
                  <img src="@img/poor_rating_active.png" v-if="item.evaluateAi == 2">
                  <img src="@img/poor_rating.png" @click="evaluatePost(index, 2)" alt="" v-else>
                </span>
                <span class="operate_item" :id="`copy_${index}`">
                  <img src="@img/copy.svg" @click="copyTxt(item.answer, `copy_${index}`, $event)" alt="">
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div v-show="activeNav == 1" class="touch_msg">
        <div class="touch_title">{{ orderContent.title }}</div>
        <div v-html="touchMessageTxt" class="touch_txt"></div>
        <div class="module_operate">
          <div class="operate_group">
            <span class="operate_item" @click="editFeedBack(-1)"><van-icon name="edit" color="#309E73" />编辑</span>
            <span class="operate_item" @click="override(-1)"><van-icon name="replay" color="#309E73" />重写</span>
          </div>
          <div class="operate_group">
            <span class="operate_item">
              <img src="@img/thumb_up_active.png" v-if="orderDetailInfo.touchMessageEvaluateAi == 1">
              <img src="@img/thumb_up.png" @click="evaluatePost(-1, 1)" alt="" v-else>
            </span>
            <span class="operate_item">
              <img src="@img/poor_rating_active.png" v-if="orderDetailInfo.touchMessageEvaluateAi == 2">
              <img src="@img/poor_rating.png" @click="evaluatePost(-1, 2)" alt="" v-else>
            </span>
            <span class="operate_item" :id="`copy_${-1}`">
              <img src="@img/copy.svg" @click="copyTxt(touchMessageOrigin, `copy_${-1}`, $event)" alt="">
            </span>
          </div>
        </div>
      </div>

      <!-- <zhParagraphEdit ref="zhEdit" v-show="activeNav == 1" v-if="paraEditRender" :detail="detail" :orderContent="orderContent" :refreshNum="refreshNum" :orderDetailInfo="orderDetailInfo"></zhParagraphEdit> -->

      <yaChart ref="yachart" v-show="activeNav == 2" v-if="chartRender" :orderDetailInfo="orderDetailInfo" :dicDetailDesc="dicDetailDesc" :activeNav="activeNav"></yaChart>
    </div>

<<<<<<< HEAD
<!-- 导出word的弹窗 -->
    <van-dialog
        class="success-export"
        v-model:show="showExportDialog"
        :show-confirm-button="false"
        style="max-width: 360px;"
    >
      <template #title>
        <div class="title-left">导出成功</div>
      </template>
      <div class="dialog-content">
        <p class="text-left">点击复制链接，可以发送给其他人，也可以将链接粘贴到微信或浏览器下载。</p>

        <span class="copy-link" @click="copyLink">复制链接</span>

      </div>
    </van-dialog>

=======
>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
    <van-dialog v-model:show="showEditTitle" title="编辑报告标题" show-cancel-button @confirm="confirmTitle" @cancel="cancelTitle">
      <van-field v-model="newTitle" label="" placeholder="请输入报告标题" maxlength="20" />
    </van-dialog>

    <van-popup v-model:show="showEditFeed" position="bottom" round>
      <div class="pop_title">编辑反馈内容</div>
      <div class="edit_feed_b">
        <van-field v-model="newFeedBack" label="" placeholder="请输入反馈内容" type="textarea"/>
      </div>
      <div class="feed_bot_btn">
        <div class="use_btn" @click="cancelFeed">取消</div>
        <div class="comfirm_btn" @click="comfirmFeed">提交</div>
      </div>
    </van-popup>
<<<<<<< HEAD
=======

>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
    <van-dialog v-model:show="isLoading" @confirm="confirmNext" :confirm-button-text="'先改下一篇'">
      <div class="load_txt">
        <van-loading :size="fitUnitPx(50)" color="#1989fa" :vertical="true" text-color="#666">
          <div>分析中...</div>
          <div>
            我们需要大约60S处理您的作文<br />
            您也可以先批改下一篇作文<br />
            然后在【我的报告】中查看报告
          </div>
        </van-loading>
      </div>
    </van-dialog>
<!-- 
    <van-dialog v-model:show="showMenu" title="大纲">
      
    </van-dialog>

    <div class="menu"><img src="@img/menu.svg" alt=""></div> -->
    <backIndex></backIndex>
  </div>
</template>

<script setup>
<<<<<<< HEAD
import {ref, onMounted, computed} from 'vue';
  import { updateTitle, orderDetail, updateReporting, reportingOverride, touchMessage, glmToken ,exportWordReport} from '@/api';
  import { scoreOrderComment } from '@/api/aiApi'
  import { v1Chat } from '@/chatBaseApi'
  import { useRoute, useRouter } from 'vue-router';
  import { copy,  fitUnitPx } from '@/utils/utils'
=======
  import { ref, onMounted } from 'vue';
  import { updateTitle, orderDetail, updateReporting, reportingOverride, touchMessage, glmToken } from '@/api';
  import { scoreOrderComment } from '@/api/aiApi'
  import { v1Chat } from '@/chatBaseApi'
  import { useRoute, useRouter } from 'vue-router';
  import { copy, fitUnitPx } from '@/utils/utils'
>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
  import dictionary from '@/utils/dictionary'
  import { parse } from 'marked'
  import backIndex from '@/components/backIndex.vue';
  import { showToast, showImagePreview, showConfirmDialog } from 'vant';
  import { useStore } from '@/stores'
  import zhParagraphEdit from './zhParagraphEdit.vue'
  import yaChart from './yaChart.vue'

  const store = useStore();
  const route = useRoute();
  const router = useRouter();
  
  const zhEdit = ref(null)
  const orderNo = route.query.orderNo;

  let orderContent = ref({});
  let dicDetailDesc = ''

  const chartRender = ref(false);
  let answerList = ref([]);
  const touchMessageOrigin = ref('');
  const touchMessageTxt = ref('');

  let botTimer = null;

  const yachart = ref(null)

  const topNav = ref(['精批报告', '全文润色', '问小雅']);
  const activeNav = ref(0);
  let pictures = [];

  const originView = () => {
    pictures.length && showImagePreview(pictures)
  }

  const orderDetailInfo = ref({});

  const showEditTitle = ref(false);
  const newTitle = ref('')
  const editTitle = () => {
    showEditTitle.value = true;
  }

  const cancelTitle = () => {
    showEditTitle.value = false;
    newTitle.value = '';
  }

  const confirmTitle = async () => {
    await updateTitle({ orderNo, title: newTitle.value })
    orderContent.value.title = newTitle.value;
    cancelTitle();
  }
  
  const showEditFeed = ref(false);
  const newFeedBack = ref('')
  let currItemFeedIndex = ''; 
  const editFeedBack = (index) => {
    const answer = index > -1 ? answerList.value[index].answer : touchMessageOrigin.value;
    currItemFeedIndex = index;
    showEditFeed.value = true;
    newFeedBack.value = answer;
  }

  const cancelFeed = () => {
    showEditFeed.value = false;
    setTimeout(() => {
      newFeedBack.value = '';
    }, 600)
  }

  const comfirmFeed = async () => {
    const agentId = activeNav.value == 1 ? '-1' : answerList.value[currItemFeedIndex].agentId;
    await updateReporting({ orderNo, agentId, content: newFeedBack.value, evaluateAi: 1 })
    if(activeNav.value == 1) {
      touchMessageOrigin.value = newFeedBack.value;
      touchMessageTxt.value = parse(newFeedBack.value);
<<<<<<< HEAD
      // 在设置 touchMessageTxt 时，处理换行符
=======
>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
    } else {
      answerList.value[currItemFeedIndex].answer = newFeedBack.value;
      answerList.value[currItemFeedIndex].parseAnswer = parse(newFeedBack.value);
      answerList.value[currItemFeedIndex].evaluateAi = 1;
    }
    showToast('提交成功')
    cancelFeed()
  }

  const override = async (index) => {
    if(index > -1) {
      answerList.value[index].isOverride = true;
    }
    const content = index > -1 ? answerList.value[index].answer : touchMessageOrigin.value;
    const agentId = index > -1 ? answerList.value[index].agentId : '-1';
    const res = await reportingOverride({agentId, orderNo, content });
    if(index > -1) {
      answerList.value[index].answer = res.data;
      answerList.value[index].parseAnswer = parse(res.data);
      answerList.value[index].isOverride = false;
    } else {
      touchMessageOrigin.value = res.data;
      touchMessageTxt.value = parse(res.data);
    }
  }

  const evaluatePost = async(index, value) => {
    const agentId = index > -1 ? answerList.value[index].agentId : '-1'; 
    await updateReporting({ orderNo, evaluateAi: value, agentId });
    if(index > -1) {
      answerList.value[index].evaluateAi = value;
    } else {
      orderDetailInfo.value.touchMessageEvaluateAi = value;
    }
  }

  const copyTxt = (txt, id, event) => {
    copy(txt, id, event)
  }

<<<<<<< HEAD

=======
>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
  const confirmNext = () => {
    const { productCode, type } = route.query;
    router.push({path: '/selectFiles', query: { productCode, type, from: 'index' }})
  }


  const polish = async () => {
    if(touchMessageTxt.value) return;
    const res = await touchMessage({ orderNo })
    touchMessageOrigin.value = res.data;
    touchMessageTxt.value = parse(res.data);
<<<<<<< HEAD

=======
>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
  }

  
  const changeNav = (index) => {
    clearTimeout(botTimer);
    unAutoBot();
    activeNav.value = index;
    index == 2 && (chartRender.value = true);
    index == 1 && polish();
    if(yachart.value) {
      yachart.value.forbidAutoBot();
    }
  }

  const unAutoBot = () => {
    // autoBot = false;
    yachart.value && yachart.value.forbidAutoBot();
  }
  
  const refreshNum = ref(0);
  const correctionsNumber = ref(0);
  
  let label = {};

  const isLoading = ref(true);

  const getOrderDetail = async () => {
<<<<<<< HEAD
    const res = await orderDetail({ orderNo, refresh: false, export_report: false})
=======
    const res = await orderDetail({ orderNo, refresh: false })
>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
    isLoading.value = false;
    orderDetailInfo.value = res.data;
    orderContent.value = res.data.orderContentPo;
    label = JSON.parse(orderContent.value.label);
    dicDetailDesc = label.cnLiterary?.dicDetailDesc || label.enGrade?.dicDetailDesc;
    if(res.data.touchMessage) {
      touchMessageOrigin.value = res.data.touchMessage;
      touchMessageTxt.value = parse(res.data.touchMessage);
    }
    answerList.value = res.data.answerList;
    answerList.value.forEach(val => {
      val.parseAnswer = parse(val.answer);
      val.isOverride = false;
    })
    pictures = res.data.pictures;
  }
<<<<<<< HEAD
//复制报告
=======

>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
  const copyReport = (event) => {
    const txt = answerList.value.map(val => `${val.agentName}\n${val.answer}`).join('\n\n')
    copyTxt(`${orderContent.value.title}\n\n${txt}`, 'refresh', event)
  }

<<<<<<< HEAD
  /**
   * 2024.11.18新增:导出报告
   * @author janjiang
   * 1、新增<导出Word>按钮，以链接按钮样式出现，<查看原文>按钮左移
   * 2、点击<导出Word>，弹出弹窗
   * 3、点击弹窗的<复制链接>，复制oss地址，关闭弹窗。toast提示：复制成功
   */
  const showExportDialog = ref(false);
  const ossLink = ref('');

  const exportReport = async() => {
    try{
      //准备数据
      const processedMarkdownContent = answerList.value.map(item => {
        return {
          agentName: item.agentName,
          answer: item.answer,
        };
      });
      const requestData = {
        title:orderContent.value.title,
        markdownContent: processedMarkdownContent,
      };

      //调用/export/word接口生成word文档
      const response = await exportWordReport(requestData);
      console.log("response:",response)
      if (response && response.code == 200) {
        ossLink.value = response.data
        showExportDialog.value = true
      }else{
        showToast("导出失败，请稍后重试！");
      }
    }catch (error){
      showToast("导出失败，请检查网络连接！");
    }
  }

  //点击“复制链接”，复制OSS地址到剪贴板
  const copyLink = () => {
    if (navigator.clipboard){
      navigator.clipboard
          .writeText(`《${orderContent.value.title} - 指导报告》下载地址（word格式）\n${ossLink.value}`)
          .then(() =>{
        showToast("复制成功");
        showExportDialog.value = false;
      }).catch(() =>{
        showToast("复制失败");
      });
    }
  }

=======
>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
  onMounted(async() => {
    if(!store.glmToken) {
      const res = await glmToken();
      store.glmToken = res.data;
    }
    getOrderDetail()
  })
  
</script>

<style lang="scss" scoped>
  .correction_report {
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
<<<<<<< HEAD
    .export_report {
      padding-right:6px;
      font-size: 15px;
      font-weight: normal;
      color: #1989FA;
      line-height: 1;
      &.forbid {
        color: #999;
      }
    }
=======
>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
    .refresh {
      font-size: 15px;
      font-weight: normal;
      color: #B1372F;
      line-height: 1;
      &.forbid {
        color: #999;
      }
    }
    .top_nav {
      width: 375px;
      @include flex-between;
      align-items: flex-end;
      text-align: center;
      background: #DCF6F2;
      height: 40px;
      font-weight: bold;
      span {
        background: #DCF6F2;
        padding: 14px 0;
        font-size: 12px;
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
      color: #309E73;
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        height: 18px;
        width: 6px;
        background: #60DBAB;
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
      color: #309E73;
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
      margin:0 20px 20px;
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
      .comfirm_btn{
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
<<<<<<< HEAD
      .touch_txt{
        margin-bottom: 14px;
        color: #666;
=======
      .touch_txt {
        margin-bottom: 14px;
>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
      }
    }
    .menu {
      position: fixed;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #1989FA;
      right: 15px;
      bottom: 100px;
      @include flex-center;
      img {
        width: 20px;
      }
    }
<<<<<<< HEAD
    .success-export .title-left {
      text-align: left;
      font-weight: bold;
      font-size: 14px;
      padding-left:15px;
      margin-top:-15px;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      font-size:12px;
      padding-top:-10px;
    }

    .text-left {
      text-align: left;
      padding-left:15px;
      padding-right:15px;
      margin: 8px 0;
    }

    .copy-link{
      color: #62c7b4;
      font-size: 12px;
      cursor: pointer;
      text-align: right;
      padding-right:15px;
      margin-bottom: 10px;
    }

=======
>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
  }
</style>

<style lang="scss">
.correction_report {
  .van-tab {
    position: relative;
  }
  .edit_feed_b  .van-field__control {
    height: 50vh;
  }
  .module_content {
<<<<<<< HEAD

    p, li {
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
    ul, ol {
      padding-left: 20px;
    }
  }
  //2024.11.18新增
  //保证润色生成的作文每个段落之间间隔一行，更加清晰
  .touch_txt {

=======
>>>>>>> 2208165747dded217e56bd1408bbaa80b4e7d8e9
    p, li {
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
    ul, ol {
      padding-left: 20px;
    }
  }

}
</style>