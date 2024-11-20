<template>
  <div class="custom_feed_back">
    <div class="title">定制您专属的输出反馈</div>
    <div class="form_item">
      <div class="lable require">反馈名称</div>
      <van-field class="filed_entry" v-model="agentName" label="" placeholder="示例：词句升格" />
    </div>
    <div class="form_item">
      <div class="lable require">简介</div>
      <van-field class="filed_entry" v-model="agentIntro" label="" placeholder="示例：适用于初中二年级的词句升格" />
    </div>
    <div class="form_item">
      <div class="lable require">输出要求</div>
      <van-field class="filed_entry" maxlength="1500" show-word-limit :autosize="{ maxHeight: 400, minHeight: 150 }" label="" type="textarea" v-model="agentDemand" placeholder="示例：
首先学习和理解下述材料【具体词句升格的逻辑或资料】，然后根据这个理解针对作文原文给出词句升格建议。要求：
1、必须符合原文语境
2、严格遵守参考示例
#仅供参考，可搜索学习：怎么写好prompt提示词。自由探索和尝试写法" />
    </div>
    <div class="form_item">
      <div class="lable">输出示例</div>
      <van-field class="filed_entry" maxlength="1000" show-word-limit :autosize="{ maxHeight: 400, minHeight: 130 }" label="" type="textarea" v-model="agentExampleList" placeholder="示例（仅供参考，自由发挥）：
-“每个清晨的第一缕阳光”升格为：“每个清晨，第一缕阳光如同母亲的微笑，轻轻拂过窗帘，洒满我的小屋。”
-“妈妈总是含笑倾听”丰富为：“妈妈那双温润的眼睛里，总是满含笑意，她倾听我的故事，仿佛在品尝世间最美的旋律。”" />
    </div>
    <div class="bot_btns">
      <div class="use_btn" @click="effectView">效果预览</div>
      <div class="comfirm_btn" @click="publishFeed">发布您的反馈</div>
    </div>

    <van-popup v-model:show="showAuthSet" round position="bottom">
      <div class="example_pop">
        <div class="pop_title">设置权限</div>
        <div class="pop_close" @click="showAuthSet = false"><van-icon name="cross" :size="crossSize" /></div>
        <div class="auth_list">
          <div v-for="item in authList" class="auth_item" @click="toggleAuth(item)">
            <div class="icon_name"><van-icon :name="item.icon" :size="crossSize" /><div class="auth_name">{{ item.name }}</div></div>
            <div :class="['auth_radio', item.auth == agentState ? 'auth_checked' : '']"></div>
          </div>
        </div>
        <div class="publish_btn" @click="surePush">确认发布</div>
      </div>
    </van-popup>

    <van-popup v-model:show="showPreView" round position="bottom" >
      <div class="example_pop">
        <div class="pop_title">预览 <span class="cross" @click="showPreView=false"><van-icon name="cross" :size="crossSize" /></span></div>
        <div class="pre_view_tip">您的本次提交作文将作为输入示例</div>
        <div class="pre_view_content" v-html="preViewContent"></div>
      </div>
    </van-popup>
  </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue'
import { fitUnitPx, replacePunctuationWithChinese } from '@/utils/utils'
import { showToast } from 'vant'
import { agentGetOne, agentAdd, agentUpdate, agentPreviews, orderImageParsing } from '@/api/index'
import { useRoute } from 'vue-router'
import { useStore } from '../../stores'
import { parse } from 'marked'

const route = useRoute();
const store = useStore();

const crossSize = fitUnitPx(20)

const agentName = ref('');
const agentIntro = ref('');
const agentDemand = ref('');
const agentExampleList = ref('');
const agentState = ref(0);

const filedsValid = () => {
  if(!agentName.value) {
    showToast('请填写反馈名称')
    return false
  }
  if(!agentIntro.value) {
    showToast('请填写简介')
    return false
  }
  if(!agentDemand.value) {
    showToast('请填写输出要求')
    return false
  }
  return true
}

const showPreView = ref(false)
const preViewContent = ref('')

const effectView = async() => {
  const label = JSON.parse(store.viewContent.label) 
  if(!store.fileList?.length || !store.viewContent.title || !label.cnLiterary) {
    showToast('请完善作文信息');
    return
  }
  preViewContent.value = '';
  const contentList = [];
  preViewContent.value = '';
  store.fileList.forEach(async (val,index) => {
    const formData = new FormData();
    formData.append('file', val.file)
    formData.append('orderNo ', route.query.orderNo)
    formData.append('productCode ', route.query.productCode)
    const res = await orderImageParsing(formData, { isloading: true })
    let content = '';
    contentList[`${index}`] = res.data.map(val => val.text).join("\n");
    if(Object.keys(contentList).length == store.fileList.length) {
      content = Object.values(contentList).join("\n");
      if(route.query.productCode == 'cn-article-rectify') {
        content = replacePunctuationWithChinese(content)
      }
      store.viewContent.content = content;
      const res = await agentPreviews({
        agentName: agentName.value, 
        agentIntro: agentIntro.value,
        agentDemand: agentDemand.value,
        agentExampleList: agentExampleList.value,
        agentInput: '##作文背景信息##：{\n1、作文标题：【$$title$$】2、作文文体：【$$作文文体$$】\n3、写作要求：【$$写作要求$$】\n4、适用年级：【$$适用年级$$】\n5、需要输出的反馈及介绍：【$$反馈名称$$：$$简介$$】\n}\n##格式参考示例##：{\n$$输出示例$$\n}\n##任务##：{\n}\n##输出要求{\n$$输出要求$$\n注意：输出格式必须严格遵守‘格式参考示例’\n}',
        agentState: agentState.value,
        agentId,
        language: route.query.type,
        orderContentPo: {
          ...store.viewContent
        }
      })
      preViewContent.value = parse(res.data);
      showPreView.value = true;
    }
  })
}

const showAuthSet = ref(false)
const publishFeed = () => {
  if(!filedsValid()) return;
  showAuthSet.value = true;
}

const authList = ref([
  { icon: 'lock', name: '私密 · 仅自己可用', auth: '1' },
  { icon: 'contact', name: '分享 · 通过使用码的用户可共享', auth: '2' },
  { icon: 'eye', name: '公开 · 发表在反馈大厅', auth: '0' },
])


const toggleAuth = (item) => {
  if(item.auth == agentState.value) return;
  agentState.value = item.auth;
}

const preview = '##作文背景信息##：{\n1、作文标题：【$$title$$】\n2、作文文体：【$$dicDetailValue$$】\n3、写作要求：【$$写作要求$$】\n4、适用年级：【$$userGrade$$】\n5、需要输出的反馈及介绍：【$$agentName$$：$$agentIntro$$】\n}\n##格式参考示例##：{\n$$agentExampleList$$\n}\n##任务##：{\n}\n##输出要求{\n$$agentDemand$$\n注意：输出格式必须严格遵守‘格式参考示例’\n}'

const agentId = route.query.agentId;

const surePush = async () => {
  await (!agentId ? agentAdd : agentUpdate)({
    agentName: agentName.value, 
    agentIntro: agentIntro.value,
    agentDemand: agentDemand.value,
    agentExampleList: agentExampleList.value,
    agentInput: '##作文背景信息##：{\n1、作文标题：【$$title$$】2、作文文体：【$$作文文体$$】\n3、写作要求：【$$写作要求$$】\n4、适用年级：【$$适用年级$$】\n5、需要输出的反馈及介绍：【$$反馈名称$$：$$简介$$】\n}\n##格式参考示例##：{\n$$输出示例$$\n}\n##任务##：{\n}\n##输出要求{\n$$输出要求$$\n注意：输出格式必须严格遵守‘格式参考示例’\n}',
    agentState: agentState.value,
    agentId,
    language: route.query.type
  })
  showToast({
    message: agentId ? '修改成功' : '添加成功',
    forbidClick: true,
    onClose: () => {
      history.go(-1);
    },
    duration: 1500
  })
}

onMounted(async() => {
  if(agentId !== undefined) {
    const res = await agentGetOne({ agentId: route.query.agentId });
    agentName.value = res.data.agentName;
    agentIntro.value = res.data.agentIntro;
    agentDemand.value = res.data.agentDemand;
    agentExampleList.value  = res.data.agentExampleList;
    agentState.value = res.data.agentState;
  }
})

</script>
  
<style lang='scss' scoped>
.custom_feed_back {
  min-height: inherit;
  padding: 20px;
  font-size: 14px;
  color: #333;

  .title {
    text-align: center;
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .form_item {
    margin-bottom: 16px;
  }

  .lable {
    font-size: 14px;
    line-height: 1;
    display: flex;
    margin-bottom: 10px;
    color: #222;
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
  }
  .filed_entry {
    border: 1px solid #eaeaea;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.4;
  }
  .bot_btns {
    @include flex-between;
    margin-top: 24px;
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
  .example_pop {
    padding: 20px;
    position: relative;
  }
  .pop_close {
    position: absolute;
    right: 18px;
    top: 20px;
  }
  .pop_title {
    text-align: center;
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 10px;
    position: relative;
    .cross {
      position: absolute;
      top: 0;
      right: 0px;
    }
  }
  .pre_view_tip {
    font-size: 12px;
    color: #aaa;
  }

  .pre_view_content {
    border: 1px solid #f1f1f1;
    padding: 10px;
    margin-top: 4px;
    border-radius: 6px;
    max-height: 60vh;
    overflow: auto;
    text-align: justify;
    text-indent: 2em;
    font-size: 14px;
    color: #333;
  }
  .auth_item {
    @include flex-between;
    line-height: 1;
    padding: 10px 0;
  }
  .icon_name {
    display: flex;
    align-items: center;
  }
  .auth_name {
    margin-left: 6px;
  }
  .auth_radio {
    width: 18px;
    height: 18px;
    border: 1px solid #62c7b4;
    border-radius: 50%;
    @include flex-center;
    &.auth_checked::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #62c7b4;
    }
  }
  .publish_btn {
    @include hor-center(240px);
    text-align: center;
    padding: 9px 0;
    font-size: 13px;
    line-height: 1;
    margin-top: 16px;
    border-radius: 25px;
    cursor: pointer;
    background: #62c7b4;
    color: #fff;
  }
}
</style>