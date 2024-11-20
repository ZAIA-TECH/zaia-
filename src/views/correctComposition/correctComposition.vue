<template>
  <div class="correct_composition">
    <div class="top_picker">
      <div @click="picker(item)" class="picker_item" v-for="(item, index) in pickers" :key="index">
        {{pickerParams[item.type].dicDetailValue}} 
        <img :src="getAssetURL('arrow-right.svg')" alt="" class="right_arrow" v-if="!pickerForbid">
      </div>
    </div>

    <div class="correct" :style="{ height: correctHeight }">
      <van-field class="correct_title" v-model="title" v-if="isZH" placeholder="请输入作文题目，20字以内" maxlength="20" @blur="saveTitle" />
      <van-field class="correct_title en_title" v-model="title" v-else placeholder="Type or paste your text here（可空）" @blur="saveTitle" @input="countWords"/>
      <compositionEntry :textareaHeight="textareaHeight" @updateWordLength="updateWordLength" :wordMaxLength="wordMaxLength" v-model="content" :isZH="isZH" :placeholder="isZH ? '请输入文章内容' : 'Please enter your essay'"></compositionEntry>
      <!-- <van-field
        :style="{height: correctContentHeight}"
        v-model="content"
        class="correct_content"
        :autosize="{minHeight: 400}"
        @input="countChar"
        type="textarea"
        :placeholder="isZH ? '请输入文章内容' : 'Please enter your essay'"
      /> -->
      <div :class="{'word_limit': 1, 'word_full': wordLength == wordMaxLength}">
        <template v-if="isZH">{{wordLength}}/{{wordMaxLength}}</template>
        <template v-else>{{wordLength}} Words</template>
      </div>
    </div>

    <div class="bot_bar">
      <div class="photo_entry" @click="toUpload"><img :src="getAssetURL('photo.svg')" alt="">拍照输入</div>
      <div class="confirm_btn" @click="confirmCorrect"><img :src="getAssetURL('confirm.svg')" alt="">提交批改</div>
    </div>

    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker :title="pickerTitle" :columns="pickerColumns" :columns-field-names="columnsFieldNames" @confirm="pickerConfirm" @cancel="showPicker = false" v-model="pickerValues" :swipe-duration="300"></van-picker>
    </van-popup>

    <van-popup v-model:show="showPayPop" round position="bottom">
      <div class="pay_pop">
        <div class="pay_title">作文深度批改报告</div>
        <div class="pay_tip">精准点评+分析指正+优化润色</div>
        <div class="pay_info">
          <div class="pay_cost">
            <img :src="getAssetURL('taojinbi.svg')" alt="">{{ turnMoney(payInfo.currentPrice) }}
          </div>
          <div class="num_bot">支付学币</div>
          <div class="my_coin">
            <div class="my_coin_right">我的学币：<span>{{turnMoney(payInfo.balance)}}</span> 个</div>
            <div class="coin_tip">tips:邀请可获高额学币</div>
          </div>
          <div class="product_name" v-if="isZH">服务内容：中文作文批改({{ grade }})</div>
          <div class="product_name" v-else>服务内容：英文作文批改({{ grade }})</div>
        </div>
        <div class="pay_btn" @click="confirmPay">
          确认支付
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
  import { useRoute, useRouter } from 'vue-router';
  import { getAssetURL, replacePunctuationWithChinese, fitUnitPx, countCharacters, countEnWords } from '@/utils/utils'
  import { orderContentEcho, orderCreate, orderPay } from '@/api/index'
  import { ref, computed, onMounted, watch } from 'vue';
  import { useStore } from '@/stores';
  import { showToast } from 'vant';
  import compositionEntry from '@/components/compositionEntry.vue'
  import dictionary from '@/utils/dictionary'

  const store = useStore();
  const query = useRoute().query;
  const router = useRouter();
  let orderNo = query.orderNo;
  const isZH = query.type == 'zh';
  const wordLength = ref(countCharacters(store.correctContent))
  const wordMaxLength = isZH ? 1200 : 400;
  const content = ref(store.correctContent)
  const { grades } = dictionary.getUserIdentityObj();
  const grade = grades[store.identity.userGrade].grade;
  console.log(grade)
  let isFull = false;

  const updateWordLength = (val) => {
    wordLength.value = val;
  }

  const pickers = computed(() => {
    const zhPickers = [
      // { defaultValue: 2, type: 'cnGrade', title: '年级' },
      { defaultValue: 0, type: 'cnLiterary', title: '选择文体' },
    ]
    const enPickers = [
      { defaultValue: 2, type: 'enGrade' },
    ]
    return isZH ? zhPickers : enPickers;
  })

  const pickerParams = ref(store.pickerParams || {
          cnGrade: {},
          cnLiterary: {},
          enGrade: {},
        })


  const showPicker = ref(false)
  const pickerValues = ref([])

  const pickerType = ref('')
  const pickerTitle = ref('')

  const allColumns = ref({})

  const pickerColumns = computed(() => {
    return allColumns.value[pickerType.value]
  })

  const pickerForbid = ref(false);

  const picker = (item) => {
    if(pickerForbid.value) return;
    showPicker.value = true;
    pickerType.value = item.type;
    pickerTitle.value = item.title;
    const parentId = pickerParams.value[item.type].parentId
    pickerValues.value = parentId && parentId != '0' ? [parentId, pickerParams.value[item.type].id] : [pickerParams.value[item.type].id]
  }


  const title = ref(store.correctTitle)

  const saveTitle = () => {
    store.correctTitle = title.value;
  }

  const columnsFieldNames = ref({
    text: 'dicDetailValue',
    value: 'id',
  })

  const toUpload = () => {
    store.pickerParams = pickerParams.value;
    router.push({ path: '/selectFiles', query: { ...query, orderNo } })
  }

  const pickerConfirm = (val) => {
    console.log(val);
    showPicker.value = false;
    const selectedValues = val.selectedValues.filter( item => !!item)
    pickerParams.value[pickerType.value] = val.selectedOptions[selectedValues.length - 1];
    pickerValues.value = val.selectedValues;
  }

  let lastEnTitle = '';
  const countWords = (event) => {
    if(countEnWords(title.value) > 10) {
      title.value = lastEnTitle;
    } else {
      lastEnTitle = title.value;
    }
  }

  const showPayPop = ref(!!query.showPayPop)

  const payInfo = ref({})

  const confirmCorrect = async () => {
    if(!title.value && isZH) {
      showToast('请输入作文标题')
      return
    }
    if(!content.value) {
      showToast(isZH ? '请输入文章内容' : 'Please enter your essay')
      return
    }
    const res = await orderCreate({
      orderContentPo: {
        content: query.productCode == 'cn-article-rectify' ? replacePunctuationWithChinese(content.value) : content.value,
        title: title.value,
        label: JSON.stringify(pickerParams.value),
        // label: JSON.stringify({cnLiterary: isZH ? pickerParams.value.cnLiterary : pickerParams.value.enGrade })
      },
      orderNo,
      productCode: query.productCode,
      source: query.source,
      agentId: query.agentId,
    });
    store.correctTitle = '';
    store.correctContent = '';
    payInfo.value = res.data;
    // showPayPop.value = true;
    confirmPay();
  }

  const confirmPay = async () => {
    const res = await orderPay({ orderNo })
    if(res.code == 844) {
      setTimeout(() => {
        router.push({ path: '/myWallet', query: { orderNo, ...query, showPayPop: 1 } })
      }, 2000)
    } else {
      router.replace({ path: '/correctionReport', query: { orderNo, ...query } })
    }
  }

  const correctHeight = ref('auto')
  const correctContentHeight = ref('auto')
  const textareaHeight = ref('')
  const setDomHeight = () => {
    const pickerHeight = document.querySelector('.top_picker').offsetHeight;
    const botHeight = document.querySelector('.bot_bar').offsetHeight;
    const titleHeight = document.querySelector('.correct_title').offsetHeight;
    correctHeight.value = window.innerHeight - pickerHeight - botHeight + 'px';
    correctContentHeight.value = parseInt(correctHeight.value) - titleHeight - fitUnitPx(10) + 'px';
    textareaHeight.value = parseInt(correctContentHeight.value) - fitUnitPx(40);
    // document.querySelector('.correct_content .van-field__body').style.height = textareaHeight.value + 'px';
  }

  const resiezePage = () => {
    setTimeout(() => {
      setDomHeight();
    }, 10)
  }
  window.addEventListener('resize', resiezePage)


  onMounted(async () => {

    const echoRes = await orderContentEcho({ productCode: query.productCode, lastOrderNo: orderNo, language: query.type })
    echoRes.data.enGrade && echoRes.data.enGrade.forEach((val, index) => {
      val.children && val.children.forEach(v => {
        delete v.children;
      })
    })
    allColumns.value = {
      // cnGrade: echoRes.data.cnGrade,
      cnLiterary: echoRes.data.cnLiterary,
      enGrade: echoRes.data.enGrade,
    }
    console.log(allColumns.value)
    orderNo = echoRes.data.orderNo;
    if(echoRes.data.orderContentPo) {
      title.value = title.value || echoRes.data.orderContentPo.title;
      content.value = content.value || echoRes.data.orderContentPo.content;
      // pickerParams.value = JSON.parse(echoRes.data.orderContentPo.label);
    // } else {
    //   if(store.pickerParams) return;
    //   pickerParams.value = {
    //     cnGrade: echoRes.data.cnGrade ? echoRes.data.cnGrade[2] : {},
    //     cnLiterary: echoRes.data.cnLiterary ? echoRes.data.cnLiterary[0] : {},
    //     enGrade: echoRes.data.enGrade ? echoRes.data.enGrade[2] : {},
    //   }
    }

    if(!isZH) {
      pickerForbid.value = !allColumns.value.enGrade || !allColumns.value.enGrade[0].children.length;
      if(!pickerForbid.value) {
        pickerParams.value = {
          enGrade: echoRes.data.enGrade[0].children[0],
        }
      } else {
        pickerParams.value.enGrade.dicDetailValue = grade;
      }
    } else{
      pickerParams.value = {
        cnLiterary: echoRes.data.cnLiterary ? echoRes.data.cnLiterary[1] : {},
      }
    }

    if(query.showPayPop) {
      router.replace({ path: '/correctComposition', query: { ...query, showPayPop: '' } })
      confirmCorrect();
    }
    setTimeout(() => {
      setDomHeight();
      isZH && picker(pickers.value[0])
    }, 100)
  })

</script>

<style lang="scss" scoped>
  .correct_composition {
    min-height: inherit;
    position: relative;
    padding: 41px 0 50px;
    padding-bottom: calc(50px + env(safe-area-inset-bottom));
    .top_picker {
      position: absolute;
      top: 0;
      left: 50%;
      width: 375px;
      transform: translate(-50%);
      @include flex-between;
      border-bottom: $thinBorder;
      .picker_item {
        width: 100%;
        padding: 8px 0;
        @include flex-center;
      }
    }
    .right_arrow {
      width: 12px;
      height: 12px;
      transform: rotate(90deg);
      margin-left: 4px;
    } 
    .correct {
      padding: 10px 12px 0;
    }
    .correct_title, .correct_content {
      font-size: 14px;
      line-height: 14px;
      padding: 10px 0;
      border-bottom: $thinBorder;
      &::after {
        display: none;
      }
      &.en_title {
        font-weight: bold;
      }
    }
    .word_limit {
      position: fixed;
      font-size: 12px;
      color: #999;
      bottom: 64px;
      right: 16px;
      &.word_full {
        color: #E03A2E;
      }
    }
    .correct_content {
      border-bottom: 0;
      overflow: auto;
      padding: 10px 0 30px;
    }
    .bot_bar {
      position: fixed;
      left: 50%;
      transform: translate(-50%);
      width: 375px;
      bottom: 0;
      height: calc(60px + env(safe-area-inset-bottom));
      border-top: $thinBorder;
      // background: #fff;
      @include flex-around;
      padding: 0 20px calc(env(safe-area-inset-bottom));
      img {
        width: 20px;
        margin-right: 6px;
      }
    }
    .confirm_btn {
      @include primaryBtn(140px);
    }
    .photo_entry {
      @include primaryThinBtn(140px);
      color: $primaryColor;
    }

    .pay_pop {
      padding: 20px;
      padding-bottom: calc(20px + env(safe-area-inset-bottom));
      .pay_title, .pay_tip {
        text-align: center;
        font-size: 20px;
        font-weight: bold;
      }
      .pay_tip {
        font-size: 14px;
        font-weight: normal;
        color: #666;
        margin: 4px 0 12px;
      }
      .pay_info {
        border: $thinBorder;
        padding: 12px;
        border-radius: $primaryRadius;
        background: #f1f1f1;
      }
      .pay_cost {
        @include flex-center;
        color: #E2433E;
        font-size: 24px;
        line-height: 1;
        font-weight: bold;
        img {
          width: 20px;
          height: 20px;
          margin-right: 4px;
        }
      }
      .num_bot {
        font-size: 12px;
        color: #666;
        text-align: center;
        margin: 4px 0 16px;
      }
      .my_coin {
        @include flex-between;
        font-size: 14px;
        .my_coin_right {
          @include flex-center;
          align-items: flex-end;
          line-height: 1;
          span {
            color: #E2433E;
            line-height: 17px;
            font-size: 22px;
            font-weight: bold;
          }
        }
        .coin_tip {
          color: #eb8784;
          font-size: 10px;
        }
      }
      .product_name {
        font-size: 14px;
        margin-top: 10px;
      }
    }
    .pay_btn {
      @include primaryBtn(335px);
      font-size: 16px;
      font-weight: bold;
      padding: 10px 0;
      margin-top: 20px;
    }
  }
  
</style>

<style lang="scss">
.correct_composition {
  .correct_content {
    position: relative;
    .van-field__control {
      line-height: 1.6;
    } 
  }
  .van-field__control {
    color: #747474;
    font-size: 16px;
  }
  .van-field__body {
    overflow: auto;
    align-items: flex-start;
  }
  .van-field__word-limit {
    margin: 0;
    position: absolute;
    bottom: -22px;
    right: 4px;
  }
}

</style>