<template>
  <div class="paragraph_edit">
    <div class="top_note">Notes：点击<span style="color: #BA7000">第一段</span>可拉起对应段落精批修改，双击按钮<span style="color:#228200">变绿</span></div>
    <div class="title">{{orderContent.title}}</div>
    <div class="paragraph_list">
      <div class="paragraph_item" v-for="(item, index) in paragraphList" :key="index">
        <div :class="`paragraph_index paragraph_${item.status}`" @click="indexClick(item, index)">第{{index + 1}}段</div>
        <div class="paragraph_content">
          <template v-for="(val, key) in item.contentList" :key="key + 'ge'">
            <span v-if="val.errorType == 'grammar'" :class="val.errorType" v-html="val.sent" @click="togglePop(item, index, val)"></span>
            <span v-else :class="val.errorType" v-html="val.sent"></span>
          </template>
        </div>
      </div>
    </div>
    <div class="bot_tips">
      <span class="c_num" v-if="corType == 'zh'">{{orderContent.txtLength}}字</span>
      <span class="c_num" v-else>{{orderContent.wordLength}} words</span>
      <span class="edit_num">({{props.refreshNum}}次批改)</span>
      <span class="ledge">
        <span>已完成</span>
        <span>可润色</span>
        <span>有错误</span>
      </span>
      <img src="@img/copy.png" id="copy" @click="copyArticle" alt="">
    </div>
    <van-popup v-model:show="showPop" position="bottom" round :style="{ maxHeight: '80vh' }">
      <div class="pop_in">
        <div class="top_splid" @touchstart="touchBegin" @touchend="touchEnd">
          <div class="top_line"></div>
          <div class="pop_title" v-if="currGradParagraph.status == 'grammar'">请修改第{{currParagraphIndex + 1}}段的病句</div>
          <div class="pop_title" v-else>润色第{{currParagraphIndex + 1}}段</div>
          <div class="origin_parag" v-if="currGradParagraph.status == 'grammar'">
            <div class="pop_label">原句</div>
            <div class="label_right">
              <span>同学们可以在原句实时编辑修改哦！</span>
              <img src="@img/edit_avater.png" class="edit_avater" alt="">
            </div>
          </div>
        </div>
        <van-field v-model="currGradParagraph.passagesContent" type="textarea" :autosize="autoSize" label="" placeholder="请输入" />
        <template v-if="currGradParagraph.status == 'grammar'">
          <div class="pop_label">纠错</div>
          <div class="error_sent_index">
            <span :class="['sent_index_item', `${item.errorType}_item`, currSentIndex == index ? 'curr_sent' : '']" v-for="(item, index) in currCorList" :key="index + 'he'" @click="changeSent(index)">{{index + 1}}</span>
          </div>
          <div class="err_type">
            <template v-if="currErrSent">错误类型：{{currErrSent.errorTypeTxt}}</template>
            <div v-show="false">错误类型：{{errTypeVo[currErrorType]}}</div>
            <span>老师也可能误判，请保持自己的思考哦</span>
          </div>
          <div class="err_sent">{{currErrSent.sent}}</div>
          <div class="tips_b" v-if="currErrSent.output">
            <img src="@img/paragraph_edit_avater.png" class="paragraph_edit_avater" alt="">
            <div class="tips_content" v-html="currErrSent.output"></div>
            <div class="comment_bot">
              <img src="@img/thumb_up_active.png" v-if="currErrSent.tipsEvaluate == 1">
              <img src="@img/thumb_up.png" @click="comment(1, 'tips')" alt="" v-else>
              <img src="@img/poor_rating_active.png" v-if="currErrSent.tipsEvaluate == -1">
              <img src="@img/poor_rating.png" @click="comment(-1, 'tips')" alt="" v-else>
            </div>
          </div>
          <div class="tips_b" v-if="currErrSent.answerOutput">
            <img src="@img/paragraph_edit_avater.png" class="paragraph_edit_avater" alt="">
            <div class="tips_content" v-html="currErrSent.answerOutput"></div>
            <div class="comment_bot">
              <img src="@img/thumb_up_active.png" v-if="currErrSent.answerEvaluate == 1">
              <img src="@img/thumb_up.png" @click="comment(1, 'answer')" alt="" v-else>
              <img src="@img/poor_rating_active.png" v-if="currErrSent.answerEvaluate == -1">
              <img src="@img/poor_rating.png" @click="comment(-1, 'answer')" alt="" v-else>
            </div>
          </div>

          <div class="bot_btns">
            <template v-if="!currErrSent.output || !currErrSent.answerOutput">
              <div :class="`tips_btn ${currErrSent.errTipLimt > 0 ? 'forbid' : ''}`" @click="getTips(0)"  v-if="!currErrSent.output">
                <img src="@img/tips_img.png" class="tips_img" alt="" v-if="!currErrSent.errTipLimt">
                提示{{currErrSent.errTipLimt ? `(${currErrSent.errTipLimt}s)` : ''}}
              </div>
              <div :class="`tips_btn ${currErrSent.errAnswerLimt > 0 ? 'forbid' : ''}`" @click="getAnswer(0)" v-else>
                <img src="@img/tips_img.png" class="tips_img" alt="" v-if="!currErrSent.errAnswerLimt">
                参考答案{{currErrSent.errAnswerLimt ? `(${currErrSent.errAnswerLimt}s)` : ''}}
              </div>
            </template>
            <div class="tips_btn comfir_btn" @click="checkSentError">
              <template v-if="paragFixed">完成学习</template>
              <template v-else>
                <img src="@img/pen.png" alt="">
                提交检测
              </template>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="tips_b" v-if="currErrSent.output">
            <img src="@img/paragraph_edit_avater.png" class="paragraph_edit_avater" alt="">
            <div class="tips_content" v-html="currErrSent.output"></div>
            <div class="comment_bot">
              <img src="@img/thumb_up_active.png" v-if="currErrSent.tipsEvaluate == 1">
              <img src="@img/thumb_up.png" @click="comment(1, 'paraComment')" alt="" v-else>
              <img src="@img/poor_rating_active.png" v-if="currErrSent.tipsEvaluate == -1">
              <img src="@img/poor_rating.png" @click="comment(-1, 'paraComment')" alt="" v-else>
            </div>
          </div>
          <div class="tips_b" v-if="currErrSent.answerOutput">
            <img src="@img/paragraph_edit_avater.png" class="paragraph_edit_avater" alt="">
            <div class="tips_content" v-html="currErrSent.answerOutput"></div>
            <div class="comment_bot">
              <img src="@img/thumb_up_active.png" v-if="currErrSent.answerEvaluate == 1">
              <img src="@img/thumb_up.png" @click="comment(1, 'gradAnswer')" alt="" v-else>
              <img src="@img/poor_rating_active.png" v-if="currErrSent.answerEvaluate == -1">
              <img src="@img/poor_rating.png" @click="comment(-1, 'gradAnswer')" alt="" v-else>
            </div>
          </div>
          <div class="bot_btns">
            <div class="tips_btn" @click="aiComment(0)" v-if="!currErrSent.output">点评</div>
            <!-- <div class="tips_btn" @click="aiRefine(0)" v-else-if="!currErrSent.answerOutput">参考结果</div> -->
            <div :class="`tips_btn ${currErrSent.errAnswerLimt > 0 ? 'forbid' : ''}`" @click="aiRefine(0)"  v-else-if="!currErrSent.answerOutput">
              <img src="@img/tips_img.png" class="tips_img" alt="" v-if="!currErrSent.errAnswerLimt">
              参考答案{{currErrSent.errAnswerLimt ? `(${currErrSent.errAnswerLimt}s)` : ''}}
            </div>

            <div class="tips_btn comfir_btn" @click="editSave">保存并进入下一段</div>
          </div>
        </template>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, defineProps, computed, onMounted, defineExpose, watch } from 'vue'
import { useStore } from '@/stores'
import { fitUnitPx, copy, getDiffCount } from '@/utils/utils'
import { errTips, errAnswer, paraComment, paraRefine } from '@/api/aiApi'
import { passagesSave, parseGeneration, reportKudos } from '@/api/index'
import { showConfirmDialog, showToast } from 'vant'
import { useRoute } from 'vue-router';

const store = useStore();
const route = useRoute();
const orderNo = route.query.orderNo;
const corType = route.query.type;
const errTypeVo = {
  spell: '拼写错误',
  space:	'空格错误',	
  punct:	'标点错误',	
  grammar:	'语法错误',	
};

const props = defineProps(['detail', 'orderContent', 'refreshNum', 'orderDetailInfo']);

const errTipLimt = 0 || props.orderDetailInfo.countDown;
const errAnswerLimt = 0 || props.orderDetailInfo.referenceResultsTime;
const isInit = !props.orderDetailInfo.saveDetailRequestVos;

const detail = ref(props.detail);
const orderContent = ref(props.orderContent);

const content = orderContent.value.content;
const originalText = orderContent.value.originalText || content;
const paragraphList = ref([]);
const paragraphs = content.split('\n');

let timer = null;

let saveDetailRequestVos = []
if(props.orderDetailInfo.saveDetailRequestVos) {
  saveDetailRequestVos = props.orderDetailInfo.saveDetailRequestVos.sort((a, b) => a.passagesSerial - b.passagesSerial);
}

const generaParagraphs = () => {
  const list = []
  paragraphs.forEach((val, index) => {
    if(!val) return
    // const starIndex = index ? list[list.length -1].lastIndex : 0;
    const orgSent = val + (paragraphs.length - 1 == index ? '' : '\n');
    const starIndex = index ? list[index -1].lastIndex : 0;
    list.push({
      orgSent,
      passagesContent: val,
      starIndex,
      passagesSerial: index + 1,
      lastIndex: index ? starIndex + orgSent.length : orgSent.length,
      contentList: [],
    })
  })
  return list;
}

const getAiOutput = (val, sentId) => {
  const aiOutput = {};
  if(!isInit && !!val.passagesParseGenerationRequestVos) {
    val.passagesParseGenerationRequestVos.forEach(v => {
      if(v.sourceId == sentId) {
        if([1, 3].indexOf(v.type) > -1) {
          aiOutput.output = v.outPut;
          aiOutput.tipsEvaluate = v.evaluateAi || 0;
          aiOutput.tipId = v.id;
        } else if ( [2, 4].indexOf(v.type) > -1) {
          aiOutput.answerOutput = v.outPut;
          aiOutput.answerEvaluate = v.evaluateAi || 0;
          aiOutput.answerId = v.id;
        }
      }
    })
  }
  return aiOutput;
}

const dealParagraContentList = () => {
    
  detail.value.Result.correctedContent.map((val, key) => {

    val.orgSentEnd = val.orgSentStart + val.orgSent.length;
    let belongParIndex = -1;

    paragraphList.value.forEach((item, index) => {
      item.lastIndex >= val.orgSentEnd && belongParIndex == -1 && (belongParIndex = index)
    })

    val.belongParIndex = belongParIndex;
    return val
  })
  
  let corIndex = -1;
  paragraphList.value.forEach((val, key) => {
    const correctedContentList = detail.value.Result.correctedContent.filter(item => item.belongParIndex == key);
    correctedContentList.forEach((item, index) => {
      corIndex ++;  
      const paragraphContent = val.orgSent;

      if(index == 0 && val.starIndex != item.orgSentStart) {
        const sent = paragraphContent.substring(0, item.orgSentStart - val.starIndex);
        val.contentList.push({
          sent,
          starIndex: 0,
          endIndex: item.orgSentStart, // 不含最后一个字符
        })
      }
      if(index != 0 && val.contentList[val.contentList.length - 1].endIndex != item.orgSentStart) {
        const endIndex = val.contentList[val.contentList.length - 1].endIndex;
        const sent = paragraphContent.substring(endIndex - val.starIndex, item.orgSentStart - val.starIndex);
        val.contentList.push({
          sent,
          starIndex: endIndex - val.starIndex,
          endIndex: item.orgSentStart, // 不含最后一个字符
        })
      }

      const aiOutput = getAiOutput(val, item.sentId);

      val.contentList.push({
        sent: item.orgSent,
        correctedContent: item,
        errorInfos: item.errorInfos,
        sentId: val.contentList.length,
        ...item,
        corIndex,
        errorType: item.errorInfos.some(v => v.errorType != 'space') ? 'grammar' : 'pendView',
        errorTypeTxt: item.errorInfos[0].errorTypeTxt || errTypeVo[item.errorInfos[0].errorType],
        starIndex: item.orgSentStart,
        errTipLimt,
        errAnswerLimt,
        ...aiOutput,
        endIndex: item.orgSentStart + item.orgSent.length
      })
    })

    if(!val.contentList.length) {
      const aiOutput = getAiOutput(val, 0);
      val.contentList.push({
        sent: val.passagesContent,
        starIndex: val.starIndex,
        errAnswerLimt,
        endIndex: val.lastIndex,
        ...aiOutput
      })
    } else if(val.contentList[val.contentList.length - 1].endIndex != val.lastIndex) {
      const endIndex = val.contentList[val.contentList.length - 1].endIndex;
      const sent = val.orgSent.substring(endIndex - val.starIndex, val.orgSent.length);
      val.contentList.push({
        sent,
        starIndex: endIndex,
        endIndex: val.lastIndex
      })
    }
    val.status = val.contentList.some(v => v.errorType == 'grammar') ? 'grammar' : 'pendView';
    val.copyContentList = JSON.parse(JSON.stringify(val.contentList))
  })
}



const showPop = ref(false);

watch(showPop, (newV) => {
  !newV && clearInterval(timer);
})

const currParagraphIndex = ref(0);
const currSentIndex = ref(0);
const currErrSent = ref('');
const errorTypeTxt = ref('');
const currCorList = ref([]);

const currGradParagraph = computed(() => {
  const item = paragraphList.value[currParagraphIndex.value];
  currSentIndex.value = 0;
  if(item.status == 'grammar') {
    currCorList.value = item.contentList.filter(val => val.errorType == 'grammar');
  } else {
    currCorList.value = item.contentList;
    currErrSent.value = currCorList.value[currSentIndex.value];
  }
  return item;
});

const currErrorType = computed(() => {
  currErrSent.value = currCorList.value[currSentIndex.value];
  console.log('------------------------22')
  timeCutDown(currErrSent.value.output ? 'errAnswerLimt' : 'errTipLimt')
  return currCorList.value[currSentIndex.value].errorInfos[0].errorType
})

const autoSize = {
  maxHeight: fitUnitPx(window.innerHeight / 3),
  minHeight: fitUnitPx(50) 
}

const timeCutDown = (type = 'errTipLimt') => {
  const outputName = type == 'errTipLimt' ? 'output' : 'answerOutput';
  console.log(currErrSent.value[type])
  setTimeout(() => {
    if(!currErrSent.value[type] || !!currErrSent.value[outputName]) return;
    clearInterval(timer);
    timer = setInterval(() => {
      currErrSent.value[type]--;
      console.log(currErrSent.value[type])
      if(currErrSent.value[type] <= 0) {
        currErrSent.value[type] = Math.max(currErrSent.value[type], 0)
        clearInterval(timer);
      }
    }, 1000)
  }, 10)
}

const changeSent = (index) => {
  currSentIndex.value = index;
}

const togglePop = (item, index, val) => {
  // if(item.status != 'grammar') return
  showPop.value = true;
  currParagraphIndex.value = index;
  currCorList.value = item.contentList.filter(val => val.errorType == 'grammar');
  console.log(currCorList);
  if(val) {
    setTimeout(() => {
      const key = currCorList.value.findIndex(v => v.sentId == val.sentId)
      changeSent(key);
    }, 10)
  } else {
    const type = item.status != 'grammar' && item.contentList[0].output ? 'errAnswerLimt' : 'errTipLimt';
    timeCutDown(type)
  }
}

const paragFixed = ref(false)

const setCache = () => {
  savePassages();
  localStorage.setItem('paragraphList', JSON.stringify({
    orderNo,
    refreshNum: props.refreshNum,
    paragraphList: paragraphList.value
  }))
}

let hasCache = false;

const getCache = () => {
  const cacheStr = localStorage.getItem('paragraphList')
  const cacheObj = cacheStr ? JSON.parse(cacheStr) : ''
  if(cacheStr && cacheObj && cacheObj.orderNo == orderNo && cacheObj.refreshNum == props.refreshNum) {
    paragraphList.value = cacheObj.paragraphList;
    hasCache = true
  }
}

const editSave = (type) => {
  currGradParagraph.value.status = 'repaird';
  if(type != 'isCheck') {
    const currEdited = !currGradParagraph.value.passagesContent.match(currErrSent.value.sent)
    currGradParagraph.value.orgSent = currGradParagraph.value.passagesContent + '\n';
    currGradParagraph.value.contentList = [{
      starIndex: currGradParagraph.value.starIndex,
      sent: currGradParagraph.value.passagesContent,
      endIndex: (currGradParagraph.value.starIndex || -1) + currGradParagraph.value.passagesContent.length,
      output: currEdited ? '' : currGradParagraph.value.contentList[0].output,
      answerOutput: currEdited ? '' : currGradParagraph.value.contentList[0].answerOutput,
      // errTipLimt: currEdited ? errTipLimt : (currGradParagraph.value.contentList[0].errTipLimt || errTipLimt),
      errAnswerLimt: currEdited ? errAnswerLimt : (currGradParagraph.value.contentList[0].errAnswerLimt || errAnswerLimt),
    }]
    setCache();
    if(!hasOtherGrammar('你还有病句没修改，现在让我们解决它吧!')) return;
    if(hasOtherPendView('现在让我们尝试优化下一个段落')) return;
    showToast({
      message: '太棒啦，你可以继续批改或者结束学习',
      onClose() {
        showPop.value = false;
      }
    })
  } else {
    currGradParagraph.value.orgSent = currGradParagraph.value.passagesContent + '\n';
    currGradParagraph.value.contentList = [{
      starIndex: currGradParagraph.value.starIndex,
      sent: currGradParagraph.value.passagesContent,
      endIndex: (currGradParagraph.value.starIndex || -1) + currGradParagraph.value.passagesContent.length,
      errTipLimt,
      errAnswerLimt,
    }]
    setCache();
  }
}

const checkSentError = () => {
  if(!currGradParagraph.value.passagesContent) return;
  // 当前病句还在
  const currFixed = !currGradParagraph.value.passagesContent.match(currErrSent.value.sent);
  if(!currFixed) {
    showToast({
      message: '您必须纠正所有病句才能进入到下一步',
    })
    return
  }
  currCorList.value.forEach(val => {
    val.errorType = !!currGradParagraph.value.passagesContent.match(val.orgSent) ?  'grammar' : 'repaird';
  })

  // 当前段落存在其他错误句
  const isParaRepaird = !currCorList.value.some(val => val.errorType == 'grammar');
  if(!isParaRepaird) {
    showToast({
      message: '干得不错，但还有错误需要继续修改哦',
    })
    changeSent(currCorList.value.findIndex(val => val.errorType == 'grammar'))
    return
  } else if(currGradParagraph.value.status !== 'repaird') {
    editSave('isCheck');
  }

  if(!hasOtherGrammar()) return;

  if(hasOtherPendView()) return;

  paragFixed.value = true;
  showToast({
    message: '太棒啦，你可以继续批改或者结束学习',
    onClose() {
      showPop.value = false;
    }
  })
}

const hasOtherGrammar = (message) => {
  // 是否存在其他病段
  const isFixAll = !paragraphList.value.some(val => val.status == 'grammar');
  if(!isFixAll) {
    showToast({
      message: message || '真棒，继续纠正下一个病段吧',
    })
    currParagraphIndex.value = paragraphList.value.findIndex(val => val.status == 'grammar');
  }
  return isFixAll
}

const hasOtherPendView = (message) => {
  // 是否存在黄色段落
  const isPendView = paragraphList.value.some(val => val.status == 'pendView');
  if(isPendView) {
    showToast({
      message: message || 'Cool!你已完成全部改错，试试润色一下其他段落吧',
    })
    currParagraphIndex.value = paragraphList.value.findIndex(val => val.status == 'pendView');
  }
  return isPendView;
}

const getTips = async (poorComment) => {
  if(currErrSent.value.errTipLimt && !currErrSent.value.output) return;
  const res = await errTips({
    corType,
    rawSent: currErrSent.value.rawSent,
    sentFeedback: currErrSent.value.sentFeedback,
    correctedSent: currErrSent.value.correctedSent,
    orgSent: currErrSent.value.orgSent,
    corSent: currErrSent.value.corSent,
    errorTypeTxt: currErrSent.value.errorInfos[0].errorTypeTxt || errTypeVo[currErrorType.value],
    poorComment: poorComment == -1
  })
  currErrSent.value.output = res.choices[0].message.content;
  timeCutDown('errAnswerLimt')
  generation(res, poorComment, 'errTips', currErrSent.value.output);
}

const getAnswer = async (poorComment) => {
  if(currErrSent.value.errAnswerLimt && !currErrSent.value.answerOutput) return;
  const res = await errAnswer({
    corType,
    rawSent: currErrSent.value.rawSent,
    sentFeedback: currErrSent.value.sentFeedback,
    correctedSent: currErrSent.value.correctedSent,
    orgSent: currErrSent.value.orgSent,
    corSent: currErrSent.value.corSent,
    errorTypeTxt: currErrSent.value.errorInfos[0].errorTypeTxt || errTypeVo[currErrorType.value],
    poorComment: poorComment == -1
  })
  currErrSent.value.answerOutput = res.choices[0].message.content;
  generation(res, poorComment, 'errAnswer', currErrSent.value.answerOutput);
}

const aiComment = async (poorComment) => {
  const res = await paraComment({
    corType,
    content,
    orgSent: currErrSent.value.sent,
    poorComment: poorComment == -1
  })
  currErrSent.value.output = res.choices[0].message.content;
  timeCutDown('errAnswerLimt');
  generation(res, poorComment, 'paraComment', currErrSent.value.output);
}

const aiRefine = async (poorComment) => {
  const res = await paraRefine({
    corType,
    content,
    orgSent: currErrSent.value.sent,
    poorComment: poorComment == -1
  })
  currErrSent.value.answerOutput = res.choices[0].message.content;
  generation(res, poorComment, 'gradAnswer', currErrSent.value.answerOutput);
}

const sceneTypes = {
  errTips: { scene: '红色错句-提示', type: 1, id: 'tipId', evaluate: 'tipsEvaluate' },
  errAnswer: { scene: '红色错句-参考结果', type: 2, id: 'answerId', evaluate: 'answerEvaluate' },
  paraComment: { scene: '黄绿色段落-点评', type: 3, id: 'tipId', evaluate: 'tipsEvaluate' },
  gradAnswer: { scene: '黄绿色句子-参考结果', type: 4, id: 'answerId', evaluate: 'answerEvaluate' },
}

const generation = async (res, poorComment, sceneType, outPut) => {
  const data = {
    evaluateAi: 0,
    model: res.model,
    orderNo,
    outPut,
    paraId: currGradParagraph.value.passagesSerial,
    prompt: res.prompt,
    requestId: res.request_id,
    sceneType,
    source: currErrSent.value.orgSent || currErrSent.value.sent,
    sourceId: currErrSent.value.sentId || 0,
    tokensCost: res.usage.total_tokens,
    scene: sceneTypes[sceneType].scene,
    type: sceneTypes[sceneType].type,
  }
  const genRes = await parseGeneration(data);
  currErrSent.value[sceneTypes[sceneType].id] = genRes.data;
  currErrSent.value[sceneTypes[sceneType].evaluate] = 0;
  localStorage.setItem('paragraphList', JSON.stringify(paragraphList.value));
}

const commentFn = {
  tips: {fn: getTips, genId: 'tipId', evaluate: 'tipsEvaluate'},
  paraComment: {fn: aiComment, genId: 'tipId', evaluate: 'tipsEvaluate'},
  answer: {fn: getAnswer, genId: 'answerId', evaluate: 'answerEvaluate'},
  gradAnswer: {fn: aiRefine, genId: 'answerId', evaluate: 'answerEvaluate'},
}

const comment = async (value, type) => {
  await reportKudos({
    evaluateAi: value,
    orderNo,
    requestResultId: currErrSent.value[commentFn[type].genId]
  })
  currErrSent.value[commentFn[type].evaluate] = value;
  localStorage.setItem('paragraphList', JSON.stringify(paragraphList.value));
  if(value == 1) {
    showToast({
      message: '评价成功',
    })
  } else if (value == -1) {
    showConfirmDialog({
      message: '评价成功，是否重新生成',
    }).then(() => {
      commentFn[type] && typeof commentFn[type].fn == 'function' && commentFn[type].fn(value)
    }).catch(() => {})
  }
}

let indexClickCount = 0;
let indexTimer = null; 
const indexClick = (item, index) => {
  indexClickCount ++
  if(indexClickCount == 2) {
    clearTimeout(indexTimer);
    paragraphList.value[index].orgSent = paragraphList.value[index].passagesContent + '\n';
    paragraphList.value[index].contentList = [{
      starIndex: paragraphList.value[index].starIndex,
      sent: paragraphList.value[index].passagesContent,
      endIndex: (paragraphList.value[index].starIndex || -1) + paragraphList.value[index].passagesContent.length,
      output: '',
      answerOutput: '',
    }]
    paragraphList.value[index].status = 'repaird';
    indexClickCount = 0;
    setCache();
    return;
  }
  indexTimer = setTimeout(() => {
    indexClickCount = 0;
    togglePop(item, index)
  }, 300)
}

let touchStartPos = 0;
const touchBegin = (event) => {
  console.log(event);
  touchStartPos = event.changedTouches[0].clientY;
}

const touchEnd = (event) => {
  console.log(event);
  const diffPos = event.changedTouches[0].clientY - touchStartPos;
  if(diffPos > 30) {
    showPop.value = false;
  }
}

const copyArticle = () => {
  const txt = (orderContent.value.title ? orderContent.value.title + '\n' : '') + orderContent.value.content;
  copy(txt, 'copy');
}

const colors = {
  grammar: 1,
  pendView: 2,
  repaird: 3,
}

const saveAllEdit = async () => {
  const passageContent = paragraphList.value.map(val => val.orgSent).join('');
  const diffCount = getDiffCount(originalText, passageContent)
  console.log(diffCount)
  if(diffCount < 20) {
    showToast('作文似乎未作大的改动，无需再次批改')
    return 'noNeed'
  }
  localStorage.removeItem('paragraphList');
  await savePassages()
}

const savePassages = async () => {
  const content = paragraphList.value.map(val => val.orgSent).join('');
  const passagesSaveDetailRequestVos = paragraphList.value.map((val, index) => {
    return {
      passagesSerial: val.passagesSerial,
      passagesColor: colors[val.status],
      passagesContent: val.passagesContent,
    }
  })
  await passagesSave({
    content,
    orderNo: route.query.orderNo,
    passagesSaveDetailRequestVos,
  })
}

onMounted(async () => {
  if(isInit) {
    paragraphList.value = generaParagraphs();
  } else {
    getCache()
    if(!hasCache) {
      props.orderDetailInfo.saveDetailRequestVos.forEach((val, index) => {
        const orgSent = val.passagesContent + (props.orderDetailInfo.saveDetailRequestVos.length - 1 == index ? '' : '\n');
        const starIndex = index ? paragraphList.value[index -1].lastIndex : 0;
        paragraphList.value.push({
          orgSent,
          contentList: [],
          lastIndex: index ? starIndex + orgSent.length : orgSent.length,
          starIndex,
          ...val,
        }) 
      })
      paragraphList.value.sort((a, b) => a.passagesSerial - b.passagesSerial)
    }
  }
  !hasCache && dealParagraContentList();
  if(isInit) savePassages();
  console.log(detail.value.Result.correctedContent);
  console.log(paragraphList.value);
})


defineExpose({
  saveAllEdit,
  clearTimer: () => {
    clearInterval(timer)
  }
})

</script>

<style lang="scss" scoped>
.paragraph_edit {
  padding: 16px 16px 0;
  background: #fff;
  min-height: 400px;
  .top_note {
    font-size: 10px;
    text-align: right;
    margin-top: -10px;
  }
  .title {
    font-size: 15px;
    margin-bottom: 12px;
    font-weight: bold;
  }
  .paragraph_index {
    width: 68px;
    height: 28px;
    border-radius: 20px;
    line-height: 1;
    text-align: center;
    font-size: 14px;
    color: #000;
    padding-top: 7px;
    margin-bottom: 12px;
  }
  .paragraph_grammar {
    background: #F97D7D;
  }
  .paragraph_pendView {
    background: #F1E084;
  }
  .paragraph_repaird {
    background: #60DBAB;
    padding-top: 6px;
  }
  .paragraph_content {
    padding-left: 16px;
    margin-bottom: 12px;
    text-align: justify;
    .grammar {
      border-bottom: 1px solid #F97D7D;
      // margin-right: 4px;
    }
  }
  .pop_in {
    padding: 8px 20px 36px;
  }
  .top_line {
    @include hor-center(180px);
    height: 6px;
    background: #D9D9D9;
    border-radius: 10px;
  }
  .pop_title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin-top: 4px;
  }
  .origin_parag {
    @include flex-between;
    align-items: flex-end;
  }
  .pop_label {
    padding-left: 14px;
    font-size: 16px;
    line-height: 20px;
    height: 20px;
    position: relative;
    &::before {
      content: '';
      width: 6px;
      height: 20px;
      background: #60DBAB;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
  .label_right {
    display: flex;
    align-items: flex-end;
    font-size: 10px;
    font-weight: 400;
    color: #B5B2B2;
    line-height: 12px;
  }
  .edit_avater {
    width: 42px;
    height: 42px;
    margin-left: 3px;
  }
  .error_sent_index {
    padding: 14px 0 12px;
    display: flex;
    flex-flow: row wrap;
  }
  .sent_index_item {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    text-align: center;
    padding-top: 5px;
    font-size: 10px;
    line-height: 1;
    border: 1px solid #60DBAB;
    margin-right: 20px;
  }
  .curr_sent {
    background: #60DBAB;
  }
  .grammar_item {
    border: 1px solid #F97D7D;
    &.curr_sent {
      background: #F97D7D;
    }
  }
  .err_type {
    font-size: 15px;
    color: #D77731;
    line-height: 18px;
    @include flex-between;
    span {
      font-size: 10px;
      color: #B5B2B2;
    }
  }
  .err_sent {
    font-size: 15px;
    text-align: justify;
    color: #000000;
    line-height: 20px;
    padding-top: 10px;
  }
  .bot_btns {
    margin-top: 26px;
    @include flex-between;
  }
  .tips_btn {
    width: 100%;
    height: 52px;
    font-size: 16px;
    font-weight: bold;
    color: #000;
    padding-top: 18px;
    line-height: 1;
    background: #C0F993;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    &.forbid {
      cursor: not-allowed;
      background: #CBCBCB;
      color: #fff;
    }
    .tips_img {
      width: 16px;
      height: 25px;
      margin-right: 6px;
      transform: translateY(-6px);
    }
    &+.comfir_btn {
      margin-left: 20px;
    }
  }
  .comfir_btn {
    display: flex;
    justify-content: center;
    background: linear-gradient(90deg, #CEF4EF, #80E2BC);
    img {
      width: 22px;
      height: 36px;
      transform: rotate(10deg) translateY(-4px);
    }
  }
  .tips_b {
    margin-top: 16px;
  }
  .paragraph_edit_avater {
    width: 39px;
    height: 39px;
    display: block;
    margin-bottom: 3px;
  }
  .tips_content {
    border-radius: 23px;
    border: 1px solid #80E2BC;
    padding: 10px;
    text-align: justify;
    margin-top: 14px;
    position: relative;
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
  .grammar +.grammar {
    margin-left: 6px;
  }
  .bot_tips {
    margin-top: 6px;
    font-size: 12px;
    color: #B8B0B0;
    line-height: 14px;
    padding-left: 16px;
    display: flex;
    justify-content: space-between;
  }
  .c_num {
  }
  .edit_num {
    color: #000;
  }
  .ledge {
    display: flex;
    span {
      display: flex;
      align-items: center;
      margin-right: 8px;
      &::before {
        content: '';
        width: 10px;
        height: 6px;
        background: #60DBAB;
        margin-right: 3px;
      }
      &:nth-child(2)::before {
        background: #F1E084;
      }
      &:nth-child(3) {
        margin-right: 0;
        &::before {
          background: #F97D7D;
        }
      }
    }
  }
  #copy {
    width: 19px;
    height: 19px;
  }
}
</style>

<style lang="scss">
  .paragraph_edit {
    .van-cell {
      padding: 8px 12px;
      border: 1px solid #efefef;
      border-radius: 8px;
      margin: 12px 0;
    }
    .van-field__control {
      text-align: justify;
      font-size: 15px;
    }
  }
</style>