<template>
  <div class="feed_back_list">
    <div class="title">选择反馈模块</div>
    <div class="select_label">已经选择：</div>
    <div :class="['selected', !checkedText ? 'un_select' : '' ]">{{checkedText || '暂未选择任何模块'}}</div>
    <div class="tab_bar">
      <div @click="changeBar(index)" v-for="(item, index) in tabBars" :class="['bar_item', activeBar == index ? 'active_bar' : '']">{{ item.name }}</div>
    </div>

    <div class="list" v-if="feedBackList.length">
      <div v-for="item in feedBackList" class="feed_item">
        <div class="feed_item_left" @click="checkedChange($event, item)">
          <div class="item_left">
            <div class="item_name">
              {{ item.agentName }}
              <span class="item_state" v-if="activeBar == 2">({{ item.agentState == 2 ? `使用码：${item.sharingCode}` : authList[item.agentState] }})</span>
              <span class="item_state" v-if="activeBar == 3">(by用户{{ item.agentSource.substr(-6) }})</span>
            </div>
            <div class="item_intro">{{ item.agentIntro }}</div>
          </div>
          <van-checkbox :disabled="checkedAgents.length >= maxLength && !item.checked" v-model="item.checked" shape="square" checked-color="#62c7b4" :icon-size="checkBoxSize"></van-checkbox>
        </div>
        <template v-if="activeBar == 2">
          <div @click="toggleOperate(item)"><van-icon name="edit" :size="editSize" color="#62c7b4" /></div>
        </template>
        <template v-else>
          <div class="feed_item_right" @click="effectView(item)">示例</div>
          <!-- <div v-else class="feed_item_right forbid">示例</div> -->
        </template>
      </div>
    </div>
    <div v-else class="empty">
      暂无可用反馈 <br />
      请联系客服处理
    </div>
    
    <div class="bot_btns">
      <div class="use_btn" @click="toggleUseCode">填写使用码</div>
      <div class="comfirm_btn" @click="comfimAgent" v-if="feedBackList.length">提交</div>
    </div>
    


    <van-dialog v-model:show="showUseCode" title="填写使用码" show-cancel-button @confirm="codeConfirm">
      <div class="use_code">
        <van-field v-model="useCode" label="" placeholder="此处填写您获取的反馈使用码" />
      </div>
    </van-dialog>

    <van-dialog class="operate_dia" v-model:show="showOperate" title="" show-cancel-button :show-confirm-button="false">
      <div class="operate">
        <div class="operate_item operate_edit" @click="toEditAgent"><van-icon name="edit" :size="operateSize" color="#62c7b4" /></div>
        <div class="operate_item" @click="deleteAgent"><van-icon name="delete-o" :size="operateSize" color="#eb546d" /></div>
      </div>
    </van-dialog>

    <div class="add_feed" @click="toCusFeed"><van-icon name="plus" /></div>

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
  import { ref, reactive, computed } from 'vue'
  import { fitUnitPx, replacePunctuationWithChinese } from '@/utils/utils'
  import { useRouter, useRoute } from 'vue-router'
  import { agentGet, agentDelete, agentPreviews, agentUseShardingCode, orderImageParsing } from '@/api/index'
  import { onMounted } from 'vue'
  import { showConfirmDialog, showToast } from 'vant';
  import { useStore } from '@/stores/index'
  import { parse  } from 'marked'

  const store = useStore();

  const checkBoxSize = fitUnitPx(16);
  const crossSize = fitUnitPx(20);
  const editSize = fitUnitPx(22);
  const operateSize = fitUnitPx(26);
  const router = useRouter();
  const route = useRoute();

  const activeBar = ref(1)
  let tabBars = reactive([
    { name: '最近使用' },
    { name: '官方出品' },
    { name: '我创建的' },
    { name: '创作大厅' },
  ])

  const authList = ['公开','私密','分享']

  const feedBackList = ref([])

  
  const checkedAgents = ref(store.checkedAgents || []);
  const checkedAgentIds = computed(() => checkedAgents.value.map(val => val.agentId));
  const checkedText = computed(() => {
    return Array.from(checkedAgents.value).map(val => val.agentName).join('、')
  });

  const changeBar = (index) => {
    activeBar.value = index;
    const item = tabBars[index];
    feedBackList.value = item.agentResponseVos;
    feedBackList.value.forEach(val => {
      val.checked = checkedAgentIds.value.findIndex(v => v == val.agentId) > -1;
    })
  }

  const maxLength = 8;
  const checkedChange = ($event, item) => {
    if(checkedAgents.value.length >= maxLength && !item.checked) {
      showToast(`最多只能选择${maxLength}个`)
      return;
    }
    if($event.target.nodeName != 'I') {
      item.checked = !item.checked
    };
    const checkedIndex = checkedAgents.value.findIndex(val => val.agentId == item.agentId);
    checkedIndex > -1 ? checkedAgents.value.splice(checkedIndex, 1) : checkedAgents.value.push(item);
  }


  const showUseCode = ref(false);
  const useCode = ref('');
  const toggleUseCode = () => {
    showUseCode.value = !showUseCode.value;
  }

  
const codeConfirm = async() => {
  const res = await agentUseShardingCode({ shardingCode: useCode.value });
  if(!res.data) {
    showToast('无效的使用码')
    return;
  }
  showToast('您已成功获取反馈')
  useCode.value = '';
  activeBar.value = 3;
  getList();
}

  const currExample = ref('')
  const showOperate = ref(false);
  const toggleOperate = (item) => {
    showOperate.value = !showOperate.value;
    showOperate.value && (currExample.value = item);
  }

  const getList = async () => {
    const res = await agentGet({ language: route.query.type });
    tabBars = res.data;
    changeBar(activeBar.value);
  }

  const toEditAgent = () => {
    router.push({ path: '/customFeedBack', query: { agentId: currExample.value.agentId, ...route.query } }) 
  }

  const deleteAgent = () => {
    showConfirmDialog({
      message: '确认删除本反馈？',
    }).then(async() => {
      await agentDelete({agentId: currExample.value.agentId})
      showOperate.value = false;
      getList();
    })
  }

  const toCusFeed = () => {
    router.push({ path: '/customFeedBack', query: route.query })
  }

  const comfimAgent = () => {
    store.checkedAgents = checkedAgents.value;
    console.log(store.checkedAgents.length)
    history.go(-1);
  }

  
const showPreView = ref(false)
const preViewContent = ref('')

const getPreViewTxt = async(item) => {
  const res = await agentPreviews({
    ...item,
    language: route.query.type,
    orderContentPo: {
      ...store.viewContent
    }
  })
  preViewContent.value = parse(res.data);
  showPreView.value = true;
}

const effectView = async(item) => {
  const label = JSON.parse(store.viewContent.label) 
  if(!store.fileList?.length || !store.viewContent.title || !label.cnLiterary) {
    showToast('请完善作文信息');
    return
  }
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
      getPreViewTxt(item)
    }
  })
}

onMounted(async() => {
  await getList()
  if(!store.checkedAgents.length) {
    checkedAgents.value = [...tabBars[0].agentResponseVos]
    changeBar(activeBar.value);
  }
})

</script>

<style lang='scss' scoped>
.feed_back_list {
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
  .select_label {
    font-weight: bold;
  }
  .un_select {
    color: #999;
  }
  .tab_bar {
    @include flex-between;
    font-size: 12px;
    color: #333;
    margin-top: 10px;
  }
  .bar_item {
    cursor: pointer;
    line-height: 1;
    padding: 6px 14px;
    background: #eaeaea;
    border-radius: 8px;
    &.active_bar {
      background: #62c7b4;
      color: #fff;
    }
  }
  .list {
    margin-top: 10px;
  }
  .feed_item {
    @include flex-between;
    font-size: 13px;
    line-height: 1;
    margin-bottom: 10px;
  }
  .feed_item_left {
    @include flex-between;
    width: 294px;
    padding: 6px 10px;
    box-shadow: 0 0 6px #e1e1e1;
    border-radius: 6px;
    cursor: pointer;
  }
  .item_name {
    font-size: 14px;
    padding-top: 2px;
    margin-bottom: 6px;
    display: flex;
    align-items: flex-end;
    .item_state {
      font-size: 10px;
      color: #aaa;
      margin-left: 4px;
    }
  }
  .item_intro {
    font-size: 12px;
    width: 230px;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .feed_item_right {
    color: #62c7b4;
    font-size: 13px;
    cursor: pointer;
    &.forbid {
      color: #bbb;
      cursor: not-allowed;
    }
  }
  .add_feed {
    width: 56px;
    height: 56px;
    @include flex-center;
    font-size: 28px;
    font-weight: bold;
    color: #fff;
    background: #62c7b4;
    border-radius: 50%;
    position: fixed;
    left: calc(50% + 114px);
    bottom: 80px;
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
  .pop_title {
    text-align: center;
    font-size: 15px;
    font-weight: bold;
  }
  .agent_demo {
    max-height: 70vh;
    overflow-y: scroll;
    width: 100%;
    border: 1px solid #ccc;
    padding: 10px 12px;
    border-radius: 8px;
    margin-top: 20px;
    text-align: justify;
  }
  .bot_btns {
    @include flex-center;
    margin-top: 40px;
    padding: 0 8px;
    > div {
      width: 240px;
      text-align: center;
      padding: 9px 0;
      font-size: 13px;
      margin: 0 8px;
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
  .use_code_pop {
    width: 280px;
    padding: 20px;
  }
  .use_code {
    margin: 20px;
    border-radius: 20px;
    border: 1px solid #efefef;
    overflow: hidden;
    .van-cell.van-field {
      padding: 4px 12px;
      font-size: 13px;
    }
  }
  .operate {
    @include flex-center;
    padding: 30px 20px;
  }
  .operate_item {
    margin: 0 24px;
    width: 48px;
    height: 48px;
    @include flex-center;
    border-radius: 50%;
    background: #FBF0F0;
  }
  .operate_edit {
    background: #dbf5f0;
  }
  .empty {
    text-align: center;
    margin-top: 20px;
    font-size: 13px;
    color: #999;
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
}
</style>

<style lang="scss">
.feed_back_list {
  .operate_dia {
    width: 280px;
  }
}
</style>