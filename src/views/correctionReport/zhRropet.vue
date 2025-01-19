<template>
  <div class="correction_report">
    <div class="top_btns">
      <span></span>
      <div class="right_btns">
        <div class="view_origin" @click="originView"></div>
        <div class="refresh forbid" v-if="correctionsNumber == refreshNum">重新批改</div>
        <div class="refresh" v-else @click="reCorrectionReport">重新批改</div>
      </div>
    </div>
    <div class="report_content"> 
      <div class="top_nav">
        <span v-for="(item, index) in topNav" :key="index + 's'" :class="{ 'active': activeNav == index }" @click="changeNav(index)">
          {{item}}
        </span>
      </div>
      <div class="error_content" v-if="activeNav == 0">
        <div class="module_title">参考评分</div>
        <div class="score_module">
          <van-circle
            :stroke-width="60"
            layer-color="transparent"
            :speed="100"
            :size="rateSize"
            v-model:current-rate="startRate"
            :rate="endRate"
            color="#60DBAB"
            class="score_circle"
          >
            <div class="all_score en_all_score">
              <div class="user_score">{{ score }}<span>分</span></div>
              <div class="full_score">满分{{ fullScore }}分</div>
            </div>
          </van-circle>
          <div class="score_detail" v-if="scoreNums">
            <div class="score_item" v-for="item in scoreDetailNames" :key="item.value">
              {{ item.name }}: {{ scoreNums[item.value] || 0 }} 
              <span v-if="scoreDiff[item.value] && scoreDiff[item.value].num" :class="scoreDiff[item.value].symbol">
                <img src="@img/above.png" class="symbol" v-if="scoreDiff[item.value].symbol == 'add'" alt="">
                <img src="@img/below.png" class="symbol" v-if="scoreDiff[item.value].symbol == 'reduce'" alt="">
                {{scoreDiff[item.value].num}}
              </span>
            </div>
          </div>
        </div>
        <div class="comment_module">
          <div class="module_title">老师评语</div>
          <div class="module_content" v-html="aiCommentCollection"></div>
        </div>
        <div class="comment_bot">
          <img src="@img/thumb_up_active.png" v-if="evaluateAi == 1">
          <img src="@img/thumb_up.png" @click="evaluatePost(1)" alt="" v-else>
          <img src="@img/poor_rating_active.png" v-if="evaluateAi == -1">
          <img src="@img/poor_rating.png" @click="evaluatePost(-1)" alt="" v-else>
        </div>
      </div>
      <zhParagraphEdit ref="zhEdit" v-show="activeNav == 1" v-if="paraEditRender" :detail="detail" :orderContent="orderContent" :refreshNum="refreshNum" :orderDetailInfo="orderDetailInfo"></zhParagraphEdit>

      <yaChart v-show="activeNav == 2" v-if="chartRender" :orderDetailInfo="orderDetailInfo" :dicDetailDesc="label.cnLiterary.dicDetailDesc"></yaChart>
    </div>
    
    <backIndex></backIndex>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { glmToken, orderDetail, orderSubmitAnswer, orderRecast, parseGeneration, reportKudos } from '@/api';
  import { scoreOrderComment } from '@/api/aiApi'
  import { v1Chat } from '@/chatBaseApi'
  import { useRoute } from 'vue-router';
  import { parseHtml, fitUnitPx, countCharacters } from '@/utils/utils'
  import dictionary from '@/utils/dictionary'
  import { parse } from 'marked'
  import backIndex from '@/components/backIndex.vue';
  import { showToast, showImagePreview, showConfirmDialog } from 'vant';
  import { useStore } from '@/stores'
  import zhParagraphEdit from './zhParagraphEdit.vue'
  import yaChart from './yaChart.vue'

  const route = useRoute()
  const active = ref('error')
  const store = useStore();
  const rateSize = fitUnitPx(90);
  const zhEdit = ref(null)
  const orderNo = route.query.orderNo;

  const aiCommentCollection = ref('')
  let genId = '';
  const evaluateAi = ref(0)

  const detail = ref({});
  let orderContent = ref({});
  let label = {};

  const startRate = ref(0);
  const endRate = ref(0);
  const score = ref(0)
  const fullScore = ref(100);

  const paraEditRender = ref(false)
  const chartRender = ref(false);
  const changeNav = (index) => {
    activeNav.value = index;
    index == 2 && (chartRender.value = true);
  }

  const scoreCollection = ref({})
  const phraseEvaluation = ref([])
  const scoreNums = ref(null);

  const scoreDetails = [
    // { name: '主题明确', value: 'themeExplicit' },
    // { name: '符合题意', value: 'satisfyRequirement' },
    { name: '结构严谨', value: 'structureStrict' },
    { name: '感情真挚', value: 'sentimentSincerity' },
    { name: '语言流畅', value: 'essayFluence' },
    { name: '好词好句', value: 'goodSent' },
  ]

  const majorScore = ref({})
  const enScoreDetails = [
    { name: '词汇得分', value: 'wordScore' },
    { name: '语法得分', value: 'grammarScore' },
    { name: '逻辑得分', value: 'structureScore' },
    { name: '内容得分', value: 'topicScore' },
  ]
  const essayAdvice = ref('')
  const errorPosInfos = ref([]);
  const productCode = route.query.productCode;

  const scoreDetailNames = ref(scoreDetails)

  const errorType = {
    spell: '拼写错误',
    space: '空格错误',
    punct: '标点错误',
    grammar: '语法错误',
  };

  const topNav = ref(['得分报告', '逐段精批', '问小雅']);
  const activeNav = ref(0);
  const lastScoreCollection = ref('');
  const scoreDiff = ref({});
  let pictures = [];

  const originView = () => {
    pictures.length && showImagePreview(pictures)
  }

  const refreshNum = ref(0);
  const correctionsNumber = ref(0);
  
  const orderDetailInfo = ref({});

  const getOrderDetail = async () => {
    const res = await orderDetail({ orderNo: route.query.orderNo, refresh: false })
    paraEditRender.value = true;
    setDetailData(res);
  }

  const setScore = () => {
    if(productCode == 'en-article-rectify') {
      majorScore.value = detail.value.Result.majorScore;
      score.value = detail.value.Result.totalScore;
      fullScore.value = detail.value.Result.fullScore;
      scoreNums.value = detail.value.Result.majorScore;
      scoreDetailNames.value = enScoreDetails;
    } else {
      scoreCollection.value = detail.value.Result.scoreCollection;
      score.value = scoreCollection.value.score;
      scoreNums.value = scoreCollection.value.perspectiveScore;
    }
    console.log(scoreNums.value)

    if(isRecor) {
      const lastAnswer = JSON.parse(res.data.answer[res.data.answer.length - 2])
      lastScoreCollection.value = lastAnswer.Result.scoreCollection || lastAnswer.Result.majorScore;
      for(let key in scoreNums.value) {
        scoreDiff.value[key] = {};
        scoreDiff.value[key].num = scoreNums.value[key] - lastScoreCollection.value.perspectiveScore[key];
        scoreDiff.value[key].symbol = scoreDiff.value[key].num > 0 ? 'add' : 'reduce';
        scoreDiff.value[key].num = Math.abs(scoreDiff.value[key].num)
      }
      console.log(scoreDiff);
    }
  }

  const handleEnData = () => {
    if(productCode !== 'en-article-rectify') return;
    detail.value.Result.correctedContent = detail.value.Result.essayFeedback.sentsFeedback.filter(val => val.errorPosInfos.length > 0).map(val => {
      val.orgSent = val.rawSent;
      val.corSent = val.correctedSent;
      val.orgSentStart = val.sentStartPos;
      val.errorInfos = val.errorPosInfos.length ? [{
        errorType: 'grammar',
        errorTypeTxt: val.errorPosInfos[0].errorTypeTitle
      }] : '';
      return val
    })
  }

  let isRecor = false;

  const setDetailData = (res) => {
    orderDetailInfo.value = res.data;
    isRecor = Array.isArray(res.data.answer) && res.data.answer.length > 1;
    const answer = Array.isArray(res.data.answer) ? res.data.answer[res.data.answer.length - 1] : res.data.answer;
    const answerData = JSON.parse(answer)
    console.log(answerData)
    if(answerData.errorCode !== '0') {
      showToast('当前批改人数太多，请稍后再试或联系管理员')
      return
    }
    pictures = res.data.pictures;
    
    detail.value = answerData;
    res.data.orderContentPo.txtLength = countCharacters(res.data.orderContentPo.content)
    refreshNum.value = res.data.refreshNum;
    correctionsNumber.value = res.data.correctionsNumber;
    orderContent.value = res.data.orderContentPo;
    label = JSON.parse(orderContent.value.label);

    handleEnData();

    setScore();

    // const orgContent = detail.value.Result.orgContent;

    // detail.value.Result.detailedEvaluation.phraseEvaluation.forEach(val => {
    //   phraseEvaluation.value.push(orgContent.substring(val.start, val.end))
    // });

    topNav.value[0] = `得分报告(${score.value}/${fullScore.value})`
    endRate.value = (score.value / fullScore.value) * 100;
    aiCommentCollection.value = orderDetailInfo.value.parseGenerationRequestVo ? orderDetailInfo.value.parseGenerationRequestVo.outPut : '';
    genId = orderDetailInfo.value.parseGenerationRequestVo?.id;
    evaluateAi.value = orderDetailInfo.value.parseGenerationRequestVo?.evaluateAi;
    !aiCommentCollection.value && comment();
  }

  const reCorrectionReport = async () => {
    const saveRes = await zhEdit.value.saveAllEdit();
    if(saveRes == 'noNeed') return;
    await orderRecast({orderNo: route.query.orderNo});
    window.location.reload();
  }

  const commentType = {
    scoreOrder: { scene: '得分报告-首次' },
    reScoreOrder: { scene: '得分报告-非首次' },
  }

  const evaluatePost = async (commentAi) => {
    await reportKudos({
      evaluateAi: commentAi,
      orderNo,
      requestResultId: genId
    })
    evaluateAi.value = commentAi;
    if(commentAi == 1) {
      showToast({
        message: '评价成功',
      })
    } else if (commentAi == -1) {
      showConfirmDialog({
        message: '评价成功，是否重新生成',
      }).then(() => {
        comment(commentAi)
      }).catch(() => {})
    }
  }

  const comment = async(commentAi) => {
    const lastSores = isRecor ? {
      lastScore: lastScoreCollection.value.score,
      lastThemeExplicit: lastScoreCollection.value.perspectiveScore.themeExplicit,
      lastStructureStrict: lastScoreCollection.value.perspectiveScore.structureStrict,
      lastSentimentSincerity: lastScoreCollection.value.perspectiveScore.sentimentSincerity,
      lastEssayFluence: lastScoreCollection.value.perspectiveScore.essayFluence,
      lastGoodSent: lastScoreCollection.value.perspectiveScore.goodSent,
    } : {}
    const res = await scoreOrderComment({
      isRecor,
      dicDetailDesc: label.cnLiterary.dicDetailDesc,
      title: orderContent.value.title,
      content: orderContent.value.content,
      fullScore: fullScore.value,
      score: score.value,
      poorComment: commentAi == -1,
      itemFullScore: 5,
      ...scoreNums.value,
      ...lastSores
    })
    aiCommentCollection.value =  parse(res.choices[0].message.content);
    generation(res, isRecor ? 'reScoreOrder' : 'scoreOrder', aiCommentCollection.value)
  }

  const generation = async (res, sceneType, outPut) => {
    const data = {
      evaluateAi: 0,
      model: res.model,
      orderNo,
      outPut,
      paraId: 0,
      prompt: res.prompt,
      requestId: res.request_id,
      sceneType,
      source: orderContent.value.content,
      sourceId: 0,
      tokensCost: res.usage.total_tokens,
      scene: commentType[sceneType].scene,
      type: 0,
    }
    const genRes = await parseGeneration(data);
    genId = genRes.data;
  }

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
    .refresh {
      font-size: 15px;
      font-weight: normal;
      color: #B1372F;
      line-height: 1;
      &.forbid {
        color: #999;
      }
    }
    .back {
      width: 20px;
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
    .test_tip {
      background: #FF6085;
      line-height: 1;
      padding: 4px 10px 2px;
      border-radius: 20px;
      font-size: 10px;
      color: #fff;
      text-align: center;
      position: absolute;
      right: 26px;
      top: 6px;
      z-index: 100;
      font-weight: bold;
    }
    .top_bars {
      border-bottom: $thinBorder;
      position: fixed;
      top: -1px;
      left: calc(50% - 187.5px);
      right: 0;
      width: 375px;
      background: #fff;
      z-index: 10;
    }
    .error_content {
      padding: 16px 16px 0;
      min-height: 400px;
      background: #fff;
    }
    .score_module {
      @include flex-between;
    }
    .all_score {
      font-size: 26px;
      line-height: 1;
      @include hor-center(70px);
      height: 70px;
      @include flex-both-center;
      flex-flow: row wrap;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #60DBAB;
      border-radius: 50%;
      .user_score {
        font-size: 20px;
        font-weight: bold;
        @include flex-center;
        line-height: 20px;
        span {
          font-weight: bold;
          font-size: 18px;
          line-height: 1;
        }
      }
      .full_score {
        font-size: 11px;
        margin-top: 6px;
        width: inherit;
        color: #5E7870;
      }
    }
    .score_circle {
      flex-shrink: 0;
      position: relative;
    }
    .score_detail {
      @include flex-between;
      flex-flow: row wrap;
      flex-shrink: 2;
      margin-top: 12px;
      margin-left: 12px;
      font-size: 13px;
      .score_item {
        width: 110px;
        white-space: nowrap;
        text-align: left;
        display: flex;
        margin-bottom: 14px;
        span {
          display: flex;
          align-items: center;
        }
        .reduce {
          color: #4D79A3;
        }
        .add {
          color: #F05252;
        }
      }
      .symbol {
        width: 5px;
        margin: 0 4px;
      }
    }
    .comment_module {
      margin-top: 24px;
    }
    .en_error {
      .module_content {
        line-height: 1.6;
        border-bottom: $thinBorder;
      }
    }
    .corrected_content:not(:last-child) {
      margin-bottom: 12px;
    }
    .err_content {
      position: relative;
      display: flex;
      line-height: 1.6;
      // text-align: justify;
      &:not(last-child) {
        margin-bottom: 4px;
      }
      span {
        flex-shrink: 0;
        font-weight: bold;
      }
      .error_pos{
        width: 70px;
        white-space: nowrap;
        text-align: right;
      }
    }
    .module_content {
      padding-left: 8px;
      color: #666;
    }
    .module_title {
      padding-left: 14px;
      font-size: 15px;
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
    .comment_bot {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
      img {
        width: 17px;
        height: 15px;
        margin-left: 16px;
      }
    }
  }
</style>

<style lang="scss">
.correction_report {
  .van-tab {
    position: relative;
  }
  .back_index {
    bottom: 80px;
  }
  .polish_content {
    p, li {
      margin-bottom: 12px;
      line-height: 1.6;
      // text-align: justify;
    }
  }
  .module_content {
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