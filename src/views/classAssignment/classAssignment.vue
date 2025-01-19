<template>
  <div class="class_assignment">
    <div class="class_name">
      {{ classType == 'zh' ? '语文' : '英语' }} · {{ className }}
      <span class="setting" @click="toSet"><img src="@img/setting.svg" alt="" /> 班级管理</span>
    </div>
    <lazyLoad @loadList="loadList" :total="total" :pageSize="10000" :emptyText="'还没有发布作业哦~'">
      <template v-for="item in taskList" :key="item.id">
        <div class="work_item" @click="toWorkDetail(item)">
          <div class="item_title">
            {{ item.taskName }}
            <div @click.stop="() => {}">
              <van-popover
                v-model:show="item.showPopover"
                :actions="opeates"
                placement="bottom-end"
                @click.stop="() => {}"
                @select="(action) => opeateSelect(action, item)"
              >
                <template #reference>
                  <span class="item_operate"><van-icon name="ellipsis" /></span>
                </template>
              </van-popover>
            </div>
          </div>
          <div class="item_date">
            {{ item.sysCreateTime }} <span class="item_num">{{ item.reviewCount }}</span>
          </div>
        </div>
      </template>
    </lazyLoad>
    <div class="bot_btn">
      <van-button round type="comfirm" icon="plus" @click="toCorrect">创建作业</van-button>
    </div>

    <Pupop
      v-model:show="showOpeate"
      :title="currOperate == 'delete' ? '删除记录' : '修改标题'"
      @confirm="opeateConfirm"
      @cancel="showOpeate = false"
    >
      <div class="delete_tip" v-if="currOperate == 'delete'">确定删除作业“{{ operateItem.taskName }}”吗？</div>
      <div class="edit_title" v-else>
        <van-field v-model="operateItem.taskName" label="" :maxlength="20" placeholder="请输入标题" />
      </div>
    </Pupop>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import lazyLoad from '../../components/lazyLoad.vue'
import Pupop from '../../components/pupop.vue'
import { showToast } from 'vant'
import { taskFind, classSelect, taskUpdateName, taskDel } from '@/api/index'

const route = useRoute()
const router = useRouter()

const id = route.query.id
const classType = ref('')
const className = ref('')
let classGrade = 0
classSelect({ classId: id }).then((res) => {
  classType.value = res.data.classType
  className.value = res.data.className
  classGrade = res.data.classGrade
})

const toSet = () => {
  router.push({ path: '/classDetail', query: { id } })
}

const toCorrect = async () => {
  const productCode = classType.value == 'zh' ? 'cn-article-rectify' : 'en-article-rectify'
  router.push({ path: '/classCorrect', query: { productCode, type: classType.value, grade: classGrade, classId: id } })
  // router.push({
  //   path: '/classCorrect',
  //   query: { productCode: 'cn-article-rectify', type: 'zh', grade: classGrade, classId: id }
  // })
}

const opeates = [
  { text: '编辑', operate: 'edit' },
  { text: '重命名', operate: 'rename' },
  { text: '删除', operate: 'delete' }
]

const taskList = ref([])
const total = ref(0)

const getList = async () => {
  const res = await taskFind({ classId: id })
  taskList.value = res.data
  total.value = res.data.length
}

getList()

const loadList = () => {}

const toWorkDetail = (item) => {
  router.push({ path: '/assignmentDetail', query: { taskId: item.id, classId: id, classType: classType.value } })
}

const showOpeate = ref(false)
const operateItem = ref({})
const currOperate = ref('')
const opeateSelect = (action, item) => {
  currOperate.value = action.operate
  if (action.operate == 'edit') {
    router.push({
      path: '/classCorrect',
      query: { productCode: 'cn-article-rectify', type: classType.value, taskId: item.id, classId: id }
    })
  } else {
    operateItem.value = { ...item }
    showOpeate.value = true
  }
}

const opeateConfirm = async () => {
  const index = taskList.value.findIndex((val) => val.id == operateItem.value.id)
  if (currOperate.value == 'rename') {
    if (!operateItem.value.taskName) {
      showToast('请输入标题')
      return
    }
    await taskUpdateName({
      id: operateItem.value.id,
      taskName: operateItem.value.taskName
    })
    index > -1 && (taskList.value[index].taskName = operateItem.value.taskName)
    showToast({
      message: '修改成功',
      forbidClick: true,
      onClose: () => {
        getList()
      }
    })
  } else {
    await taskDel({
      id: operateItem.value.id,
      taskName: operateItem.value.taskName
    })
    index > -1 && taskList.value.splice(index, 1)
    showToast({
      message: '删除成功',
      forbidClick: true,
      onClose: () => {
        getList()
      }
    })
  }
  showOpeate.value = false
}
</script>

<style lang="scss" scoped>
.class_assignment {
  min-height: inherit;
  background: #f7f8fc;
  padding: 14px 16px;
  padding-bottom: calc(14px + constant(safe-area-inset-bottom));
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
  .bot_btn {
    position: fixed;
    bottom: 0;
    width: 375px;
    left: calc(50% - 187.5px);
    @include flex-center;
    padding: 14px 20px 0;
    box-shadow: 0 0 6px #e5e5e5;
    padding-bottom: calc(14px + constant(safe-area-inset-bottom));
    padding-bottom: calc(14px + env(safe-area-inset-bottom));
  }
  .class_name {
    font-size: 16px;
    @include flex-between;
    margin-bottom: 20px;
  }
  .setting {
    font-size: 14px;
    line-height: 16px;
    @include flex-center;
    padding: 6px 14px;
    border-radius: 20px;
    background-color: #aee9dd;
    color: #316d63;
    img {
      width: 18px;
      margin-right: 4px;
    }
  }
  .work_item {
    padding: 8px 16px;
    border-radius: 12px;
    border: 1px solid #8fdbcc;
    margin-bottom: 12px;
    box-shadow: 0 0 6px #e5e5e5;
  }
  .item_operate {
    padding: 0 12px;
    font-size: 16px;
  }
  .item_title {
    @include flex-between;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  .item_date {
    font-size: 12px;
    color: #999;
    @include flex-between;
  }
  .item_num {
    font-size: 14px;
    color: #fd971f;
    @include flex-center;
    &::after {
      content: '人提交';
      font-size: 12px;
      color: #666;
    }
  }
  .delete_tip {
    text-align: center;
  }
  .edit_title {
    border: 1px solid #e5e5e5;
    border-radius: 26px;
    overflow: hidden;
    .van-field {
      padding: 7px 14px;
    }
  }
}
</style>
