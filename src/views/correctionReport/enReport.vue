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
          <div class="score_detail">
            <div class="score_item" v-for="item in enScoreDetails" :key="item.value">
              {{ item.name }}: {{ majorScore[item.value] || 0 }}
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
      </div>
    </div>
    
    <backIndex></backIndex>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { orderDetail, orderSubmitAnswer } from '@/api';
  import { v1Chat } from '@/chatBaseApi'
  import { useRoute } from 'vue-router';
  import { parseHtml, fitUnitPx } from '@/utils/utils'
  import dictionary from '@/utils/dictionary'
  import { parse } from 'marked'
  import backIndex from '@/components/backIndex.vue';
  import { showToast } from 'vant';
  import { useStore } from '@/stores'
  import enParagraphEdit from './enParagraphEdit.vue'
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
  let orderContent = {};
  let label = {};

  const startRate = ref(0);
  const endRate = ref(0);
  const score = ref(0)
  const fullScore = ref(100);
  const gradientColor = {
    '0%': '#a0cfff',
    '100%': '#5387F4',
  };

  const _polishContent = ref('')
  const chatDone = ref(false)
  const submitAnswerNumber = ref(false)

  const scoreCollection = ref({})
  const commentCollection = ref('')
  const correctedContent = ref([])
  const sentenceEvaluation = ref([])
  const phraseEvaluation = ref([])
  
  const scoreDetails = [
    { name: '主题明确', value: 'themeExplicit' },
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
  const productCode = route.query.productCode

  const errorType = {
    spell: '拼写错误',
    space: '空格错误',
    punct: '标点错误',
    grammar: '语法错误',
  }

  const topNav = ref(['得分报告', '逐段精批', '问小雅'])
  const activeNav = ref(0)

  onMounted(async() => {
    const res = await orderDetail({ orderNo: route.query.orderNo })
    detail.value = JSON.parse(res.data.answer)
    if(detail.value.errorCode !== '0') {
      showToast('当前批改人数太多，请稍后再试或联系管理员')
      return
    }
    orderContent = res.data.orderContentPo;
    label = JSON.parse(orderContent.label);
    console.log(detail.value);
    console.log(label);
    if(productCode == 'en-article-rectify') {
      majorScore.value = detail.value.Result.majorScore;
      score.value = detail.value.Result.totalScore;
      fullScore.value = detail.value.Result.fullScore;
      essayAdvice.value = detail.value.Result.essayAdvice;
      detail.value.Result.essayFeedback.sentsFeedback.forEach(val => {
        val.errorPosInfos.length && errorPosInfos.value.push(val)
      })
    } else {
      scoreCollection.value = detail.value.Result.scoreCollection;
      commentCollection.value = detail.value.Result.commentCollection.comment;
      correctedContent.value = detail.value.Result.correctedContent;
      score.value = scoreCollection.value.score;

      const orgContent = detail.value.Result.orgContent;

      detail.value.Result.correctedContent.forEach(val => {
        if(!val.errorInfos.length) {
          val.errorInfosStr = '';
        } else {
          const errStr = val.errorInfos.map(v => {
            return `${errorType[v.errorType]}，建议将〖${v.orgChunk}〗修改为【${v.corChunk}】`
          })
          val.errorInfosStr = errStr.join('；') + '。';
        }
      })

      detail.value.Result.detailedEvaluation.sentenceEvaluation.forEach(val => {
        val.type == 'goodsent' && sentenceEvaluation.value.push(orgContent.substring(val.start, val.end))
      });

      detail.value.Result.detailedEvaluation.phraseEvaluation.forEach(val => {
        phraseEvaluation.value.push(orgContent.substring(val.start, val.end))
      });
    }
    topNav.value[0] = `得分报告(${score.value}/${fullScore.value})`
    endRate.value = (score.value / fullScore.value) * 100;
    _polishContent.value = detail.value._polishContent || '';
    chatDone.value = !!detail.value._polishContent;
    submitAnswerNumber.value = res.data.submitAnswerNumber;

    
  })
  
</script>

<style lang="scss" scoped>
  .correction_report {
    min-height: inherit;
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
    background: #fff url('@img/report_bg@2x.png') no-repeat 0 0 / 375px auto;
    position: relative;
    font-size: 14px;
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
          font-size: 16px;
          line-height: 1;
        }
      }
      .full_score {
        font-size: 12px;
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