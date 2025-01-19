<template>
  <div class="select_files">
    <div class="medule_title compos_info">作文信息</div>
    <div class="form_item">
      <div class="lable require">作文标题(开放作文可以写题目自拟)</div>
      <van-field
        v-model="taskName"
        maxlength="20"
        label=""
        :placeholder="type == 'en' ? 'Type or paste your title here' : '示例：坚持的力量'"
      />
    </div>
    <div class="form_item" v-if="type !== 'en'">
      <div class="lable require">作文文体</div>
      <div class="cn_literary">
        <span
          @click="selectLiterary(item)"
          :class="[
            'literary_item',
            item.type == 'compensation' ? 'compensation' : '',
            currLiterary && currLiterary.id == item.id ? 'select' : ''
          ]"
          v-for="item in cnLiterary"
          :key="item.id"
          >{{ item.dicDetailValue }}</span
        >
        <span class="literary_item compensation"></span>
      </div>
    </div>
    <div class="form_item">
      <div class="lable">写作要求</div>
      <van-field
        class="composition_require"
        v-if="type == 'en'"
        v-model="taskRequirements"
        :autosize="{ maxHeight: 400, minHeight: 220 }"
        label=""
        type="textarea"
        placeholder="示例：
斗转星移，四季更替。你最喜欢哪个季节?在你十多年的成长历程中，一走有许多体会与感悟值得分享。请你以“My favourite season”为题写一篇英语短文。
内容必须包括以下几方面:
要求:
1.词数不少于 40词:
2 文中不得出现真实的人名、校名"
      />
      <van-field
        class="composition_require"
        v-else
        v-model="taskRequirements"
        :autosize="{ maxHeight: 200, minHeight: 120 }"
        label=""
        type="textarea"
        placeholder="示例：
请结合你的生活体验与思考，以“恒心”或“锲而不舍”为关键词!自选角度，自拟题目，写一篇文章"
      />
    </div>
    <div class="form_item">
      <div class="lable report">报告内容</div>
      <div class="report_content">
        <template v-if="agentNames"> {{ agentNames }} </template>
        <span class="no_agent" v-else>无</span>
      </div>
    </div>
    <div class="bot_btn">
      <div class="set_btn" @click="toFeedBack">批改报告设置</div>
      <div class="get_btn" @click="createWork">添加作业</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineOptions, computed } from 'vue'
import { orderContentEcho, taskAdd, taskDetail } from '@/api/index'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/stores'
import { showToast } from 'vant'
import dictionary from '@/utils/dictionary'

defineOptions({ name: 'classCorrect' })

const route = useRoute()
const router = useRouter()
const type = ref(route.query.type)

const store = useStore()

const taskName = ref('')
const currLiterary = ref('')
const taskRequirements = ref('')

const agentNames = computed(() => store.checkedAgents.map((val) => val.agentName).join('、') || '')

const toFeedBack = () => {
  store.viewContent = { title: taskName.value, label: JSON.stringify({ cnLiterary: currLiterary.value }) }
  const gradeInfo = dictionary.getClassGrade(route.query.grade)
  const documentTitle = `${gradeInfo.grade.text}${type.value == 'zh' ? '语文' : '英语'}-反馈列表`
  router.push({
    path: '/feedBackList',
    query: { ...route.query, rFrom: 'classCorrect', documentTitle }
  })
}

const cnLiterary = ref([])

const selectLiterary = (item) => {
  currLiterary.value = item
}

const createWork = async () => {
  if (!taskName.value) {
    showToast('请输入标题')
    return
  }
  if (!currLiterary.value && type.value == 'zh') {
    showToast('请选择作文文体')
    return
  }
  if (!agentNames.value) {
    showToast({
      message: '请根据教学需要选择报告包含的反馈',
      forbidClick: true,
      duration: 2500,
      onClose() {
        const gradeInfo = dictionary.getClassGrade(route.query.grade)
        router.push({
          path: '/feedBackList',
          query: { ...route.query, rFrom: 'classCorrect', fTitle: gradeInfo.grade.text }
        })
      }
    })
    return
  }
  const data = {
    classId: route.query.classId,
    taskName: taskName.value,
    taskRequirements: taskRequirements.value,
    taskDemand: store.checkedAgents.map((val) => val.agentId).join(',')
  }
  route.query.taskId && (data.taskId = route.query.taskId)
  await taskAdd(data)
  showToast({
    message: '添加成功！',
    onClose: () => {
      store.checkedAgents = []
      window.history.go(-1)
    }
  })
}

onMounted(async () => {
  type.value = route.query.type
  route.query.from == 'index' && uploader.value.chooseFile()
  const res = await orderContentEcho({ productCode: route.query.productCode, language: route.query.type })
  cnLiterary.value = res.data.cnLiterary
  if (res.data?.orderContentPo?.label && type.value !== 'en') {
    const orderLabel = JSON.parse(res.data.orderContentPo.label)
    currLiterary.value = orderLabel.cnLiterary || orderLabel
    const compensationLen = 4 - (cnLiterary.value.length % 4)
    for (let i = 0; i < compensationLen; i++) {
      cnLiterary.value.push({ id: 'compensation' + i, type: 'compensation' })
    }
  }
  if (res.data.userLastData && !store.checkedAgents.length) {
    store.checkedAgents = [...res.data.userLastData]
  }
  if (route.query.taskId) {
    const res = await taskDetail({ taskId: route.query.taskId })
    taskName.value = res.data.taskName
    taskRequirements.value = res.data.taskRequirements
    store.checkedAgents = res.data.responseVoList || []
  }
})
</script>

<style lang="scss" scoped>
.select_files {
  min-height: inherit;
  padding: 16px 18px 58px;
  padding-bottom: calc(58px + env(safe-area-inset-bottom));
  position: relative;
  background: #d2f0ea url('@img/file_bg@2x.png') no-repeat 0 0 / 375px auto;
  .select_top {
    @include flex-between;
    padding-bottom: 13px;
    color: #000;
    .top_up {
      width: 77px;
      height: 40px;
    }
  }
  .bot_tip {
    font-size: 10px;
    color: #aaa;
  }
  .top_tip {
    color: #868484;
    @include hor-center(292px);
    text-align: justify;
    font-size: 10px;
    margin-bottom: 10px;
  }
  .upload_b {
    @include hor-center(339px);
    position: relative;
  }
  .upload_in {
    background: #fff;
    padding: 20px 0 0 22px;
    border-radius: 8px;
    z-index: 3;
  }
  .upload_tip {
    width: 167px;
    height: 28px;
    position: absolute;
    top: 25px;
    left: 36px;
  }
  .to_edit {
    cursor: pointer;
    padding: 6px 12px;
    font-size: 13px;
    line-height: 1;
    background: #62c7b4;
    color: #fff;
    border-radius: 8px;
  }
}
.medule_title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.example_tip {
  font-size: 12px;
  text-align: right;
  margin-top: 10px;
  margin-bottom: 12px;
  color: #999;
  span {
    color: #62c7b4;
  }
}

.example_pop {
  padding: 20px;
  position: relative;
}
.pop_close {
  position: absolute;
  right: 20px;
  top: 20px;
}
.pop_tips {
  font-size: 12px;
  color: #999;
}
.example_title {
  font-size: 14px;
  margin: 14px 0 8px;
}
.example_list {
  @include flex-between;
}
.example_item {
  width: 100%;
  margin: 0 10px;
  position: relative;
  &.right::after {
    content: '';
    width: 38px;
    height: 30px;
    position: absolute;
    bottom: 20px;
    right: 10px;
    background: url('@img/v@2x.png') no-repeat 0 0 / 38px 30px;
  }
  &.wrong::after {
    content: '';
    width: 38px;
    height: 38px;
    position: absolute;
    bottom: 20px;
    right: 10px;
    background: url('@img/x@2x.png') no-repeat 0 0 / 38px 38px;
  }
  img {
    width: inherit;
  }
}
.compos_info {
  margin-bottom: 4px;
}
.form_item {
  margin-bottom: 16px;
}
.lable {
  font-size: 14px;
  line-height: 1;
  display: flex;
  margin-bottom: 10px;
  color: #444;
  align-items: flex-end;
  &::after {
    content: '(选填)';
    color: #aaa;
    font-size: 10px;
    margin-left: 2px;
  }
  &.require::after {
    content: '*';
    color: #e95954;
    margin-left: 2px;
  }
  &.report::after {
    content: "(可在底部'批改报告设置'处选择、查看与定制)";
  }
}
.report_content {
  font-size: 13px;
  line-height: 1;
}
.no_agent {
  color: #aaa;
}
.cn_literary {
  @include flex-between;
  flex-flow: row wrap;
  margin-bottom: -10px;
}
.literary_item {
  cursor: pointer;
  font-size: 12px;
  line-height: 12px;
  color: #666;
  padding: 6px 0;
  margin-bottom: 10px;
  width: 77px;
  text-align: center;
  border-radius: 20px;
  background: #fff;
  &.select {
    background: #84bd93;
    color: #fff;
  }
  &.compensation {
    padding: 0;
    height: 0;
  }
}
.bot_btn {
  position: fixed;
  height: calc(58px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  @include flex-center;
  background: #fff;
  width: 375px;
  left: calc(50% - 187.5px);
  right: 0;
  bottom: 0;
  border-top: 1px solid transparent;
  box-shadow: 0 0 10px #eee;
  > div {
    width: 140px;
    text-align: center;
    padding: 9px 0;
    font-size: 13px;
    line-height: 1;
    margin: 0 16px;
    border-radius: 25px;
    cursor: pointer;
  }
  .set_btn {
    border: 1px solid #62c7b4;
    color: #62c7b4;
  }
  .get_btn {
    background: #62c7b4;
    color: #fff;
  }
}
.cropper_cover {
  padding: 20px 20px 50px;
  background: #d2f0ea url('@img/file_bg@2x.png') no-repeat 0 0 / 375px auto;
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .cro_title {
    font-family: FZB;
    @include flex-between;
    font-size: 17px;
    margin-bottom: 19px;
    img {
      height: 23px;
    }
  }
  .cro_b {
    @include hor-center(335px);
    border-radius: 12px;
    background: #000;
    overflow: hidden;
  }
  #cropper_img {
    position: absolute;
    z-index: -10;
    display: block;
    width: 375px;
    object-fit: contain;
  }
}
</style>

<style lang="scss">
.select_files {
  .van-uploader__input-wrapper,
  .van-uploader__upload,
  .van-uploader__preview {
    width: 82px;
    height: 82px;
    border: $thinBorder;
    border-radius: 4px;
    overflow: hidden;
    margin-right: 22px;
    margin-bottom: 20px;
  }
  .cropper-point:not(.point-se) {
    &::after {
      content: '';
      position: absolute;
      width: 25px;
      height: 25px;
      background: transparent;
      left: -10px;
      top: -10px;
    }
  }
  .pop_close .van-icon {
    font-weight: bold;
    font-size: 22px;
  }
  .form_item .van-field {
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 14px;
  }
  .composition_require .van-field__control {
    font-size: 13px;
    line-height: 1.5;
  }
  .pay_pop {
    padding: 20px;
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
    .pay_title,
    .pay_tip {
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
      color: #e2433e;
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
          color: #e2433e;
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
