<template>
  <div class="class_list">
    <div class="title">
      <span>班级列表</span>
      <span @click="playVideo" class="tutor"><img class="camera" src="@img/camera.svg" alt="" /> 快速上手教程</span>
    </div>
    <div class="class_item" @click="toAssignment(item)" v-for="(item, index) in classList" :key="index">
      <div :class="['class_type', `${item.classType}_type`]">
        <span>{{ item.classType == 'zh' ? '语' : '英' }}</span>
      </div>
      <div class="class_right">
        <div class="name_invt">
          <div class="c_name">{{ item.className }}</div>
          <div class="c_menb"><img src="@img/degree.svg" alt="" />{{ item.stuCount || 0 }}人</div>
        </div>
        <img @click.stop="operate(item)" class="class_edit" src="@img/class_edit.svg" alt="" />
      </div>
    </div>

    <div class="bot_btn" v-if="classList.length < 3">
      <van-button round type="comfirm" icon="plus" @click="addClass">创建班级</van-button>
    </div>

    <van-dialog v-model:show="showCreate" title="创建班级" show-cancel-button @confirm="createClass">
      <div class="create_class">
        <div class="info_item" @click="showGrade = true">
          {{ formParams.classGrade.text }} {{ formParams.banGrade.text }}
        </div>
        <div class="info_item">
          <van-field v-model="formParams.className" :maxlength="30" label="" placeholder="[选填]班级名称" />
        </div>
        <div class="info_item">
          <van-radio-group direction="horizontal" v-model="formParams.classType" :icon-size="fitUnitPx(16)">
            <van-radio name="zh">语文</van-radio>
            <van-radio name="en">英语</van-radio>
          </van-radio-group>
        </div>
      </div>
    </van-dialog>

    <van-popup v-model:show="showGrade" position="bottom" round safe-area-inset-bottom>
      <van-picker title="" :columns="gradeColumns" @confirm="pickConfirm" @cancel="pickCancel" v-model="gradeClass" />
    </van-popup>

    <van-dialog v-model:show="showEdit" title="" show-cancel-button :showConfirmButton="false">
      <div class="class_operate">
        <div class="operate_item" @click="toSet">
          <img src="@img/class_manage.svg" alt="" />
          <div>班级管理</div>
        </div>
        <div class="operate_item" @click="addMenb">
          <img src="@img/add_student.svg" alt="" />
          <div>添加成员</div>
        </div>
        <div class="operate_item" @click="deleteClass">
          <img src="@img/delete.svg" alt="" />
          <div>删除班级</div>
        </div>
      </div>
    </van-dialog>

    <AddStudent v-model:show="showAdd" @cancel="addCancel" @confirm="addConfirm"></AddStudent>

    <van-dialog v-model:show="showDelete" title="警告" show-cancel-button :beforeClose="deleteConfirm">
      <div class="delete_dia_body">
        <div class="d_tips">解散班级后，您将失去所有数据。确认解散请输入班级名称</div>
        <div class="del_name">
          <van-field v-model="deleteName" label="" placeholder="请输入班级名称" />
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import LazyLoad from '../../components/lazyLoad.vue'
import { ref } from 'vue'
import { fitUnitPx } from '@/utils/utils'
import dictionary from '@/utils/dictionary'
import { useRouter } from 'vue-router'
import AddStudent from '../classDetail/addStudent.vue'
import { showToast } from 'vant'
import { classAdd, classDel, classFind, studentAdd } from '@/api/index'

const showCreate = ref(false)

const addClass = () => {
  showCreate.value = true
}

const total = ref(0)

const showGrade = ref(false)
const classList = ref([])

let videoUrl = ''
const getList = async () => {
  const res = await classFind()
  classList.value = res.data.classResponseVos
  total.value = classList.value.length
  videoUrl = res.data.videoUrl
}

getList()

const loadList = () => {}

const playVideo = () => {
  videoUrl && window.open(videoUrl, '_blank')
}

const gradeColumns = [dictionary.classGrade.gradeArr, dictionary.classGrade.classArr]

const gradeClass = ref([gradeColumns[0][0].value, gradeColumns[1][0].value])

const formParams = ref({
  classGrade: gradeColumns[0][0],
  banGrade: gradeColumns[1][0],
  className: '',
  classType: 'zh'
})

const pickConfirm = ({ selectedOptions }) => {
  formParams.value.classGrade = selectedOptions[0]
  formParams.value.banGrade = selectedOptions[1]
  showGrade.value = false
}

const pickCancel = () => {
  gradeClass.value = [formParams.value.classGrade.value, formParams.value.banGrade.value]
  showGrade.value = false
}

const router = useRouter()
const createClass = async () => {
  const cName = `${formParams.value.classGrade.text}${formParams.value.banGrade.text}`
  const res = await classAdd({
    classGrade: formParams.value.classGrade.value,
    banGrade: formParams.value.banGrade.value,
    className: formParams.value.className || cName,
    classType: formParams.value.classType
  })
  classList.value.unshift({ ...formParams.value })
  router.push({ path: '/classDetail', query: { id: res.data } })
}

const showEdit = ref(false)
let editItem = null

const operate = (item) => {
  showEdit.value = true
  editItem = { ...item }
}

const toSet = () => {
  router.push({ path: '/classDetail', query: { id: editItem.id } })
}

const showAdd = ref(false)
const addMenb = () => {
  showAdd.value = true
}

const addCancel = () => {
  showAdd.value = false
}

const addConfirm = async (list) => {
  if (!list || !list.length) return
  await studentAdd({ stuDetails: list, classId: editItem.id  })
  showEdit.value = false
  showToast('添加成功')
  getList()
}

const showDelete = ref(false)
const deleteClass = () => {
  showDelete.value = true
}

const deleteName = ref('')
const deleteConfirm = async (action) => {
  if (action == 'confirm') {
    if (editItem.className !== deleteName.value) {
      showToast('名称输入错误')
      return false
    }
    const index = classList.value.findIndex(val => val.id == editItem.id)
    await classDel({ id: editItem.id })
    classList.value.splice(index, 1)
    showToast({
      message: '解散成功！',
      onClose: () => {
        getList()
      }
    })
  }

  deleteName.value = ''
  showDelete.value = false
  showEdit.value = false
}

const toAssignment = (item) => {
  router.push({
    path: '/classAssignment',
    query: { id: item.id }
  })
}
</script>

<style lang="scss" scoped>
.class_list {
  min-height: inherit;
  // background: #fff url('@img/bg@2x.png') no-repeat 0 0 / 375px auto;
  background: #f5f8fc;
  padding: 14px 16px 78px;
  padding-bottom: calc(78px + constant(safe-area-inset-bottom));
  padding-bottom: calc(78px + env(safe-area-inset-bottom));
  .title {
    @include flex-between;
    margin-bottom: 20px;
    span:first-child {
      font-weight: bold;
      color: #454545;
      font-size: 20px;
    }
    span:last-child {
      color: #f66f6f;
      @include flex-center;
    }
    .tutor {
      padding: 4px 14px;
      border: 1px solid #ffc4c4;
      background: #fff6f6;
      border-radius: 8px;
    }
    .camera {
      width: 22px;
      margin-right: 6px;
    }
  }
  .van-button--comfirm {
    border: none;
    background: linear-gradient(to bottom, #72e7d2 0%, #4cb19e 100%);
    color: #fff;
    height: 36px;
    width: 100%;
    &:before {
      display: none;
    }
  }
  .bot_btn {
    // position: fixed;
    // bottom: 0;
    // width: 375px;
    // left: calc(50% - 187.5px);
    @include flex-center;
    padding: 14px 20px 0;
    // box-shadow: 0 0 6px #e5e5e5;
    padding-bottom: calc(14px + constant(safe-area-inset-bottom));
    padding-bottom: calc(14px + env(safe-area-inset-bottom));
  }
  .create_class {
    padding: 20px;
  }
  .info_item {
    padding-top: 2px;
    height: 50px;
    width: 100%;
    border-radius: 12px;
    border: 1px solid #eee;
    box-shadow: 0 0 4px #eee;
    margin-bottom: 14px;
    @include flex-center;
    overflow: hidden;
    font-size: 14px;
    :deep(.van-field__control) {
      text-align: center;
    }
    :deep(.van-radio-group) {
      .van-radio {
        margin-right: 20px;
      }
      .van-radio:last-child {
        margin-right: 0;
      }
    }
  }
  .class_item {
    padding: 12px 20px 12px 12px;
    border: 1px solid #ffc4c4;
    box-shadow: 0 0 6px #dfdfdf;
    background-color: #fff;
    border-radius: 10px;
    margin-bottom: 10px;
    @include flex-between;
  }
  .class_type {
    position: relative;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    margin-right: 26px;
    border-radius: 50%;
    background: #fff3e0;
    @include flex-center;
    span {
      background: #f38f24;
      font-size: 14px;
      color: #fff;
      width: 22px;
      height: 22px;
      line-height: 22px;
      text-align: center;
      border-radius: 2px;
      position: relative;
      z-index: 2;
    }
    &::before {
      content: '';
      background: #ffc88d;
      position: absolute;
      z-index: 1;
      border-radius: 2px;
      bottom: 6px;
      left: 50%;
      transform: translate(-50%);
      width: 22px;
      height: 10px;
    }
  }
  .zh_type {
    background: #dee7ff;
    span {
      background: #7495f0;
    }
    &::before {
      background: #b2c8ff;
    }
  }
  .class_right {
    width: 100%;
    @include flex-between;
  }
  .name_invt {
    .c_name {
      font-weight: bold;
      color: #333;
      font-size: 22px;
      margin-bottom: 8px;
      max-width: 180px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .c_menb {
      padding-left: 2px;
      @include flex-center;
      justify-content: flex-start;
      font-size: 14px;
    }
    img {
      width: 15px;
      margin-right: 8px;
    }
  }
  .class_edit {
    width: 30px;
  }
  .class_operate {
    padding: 30px 32px 20px;
    @include flex-between;
  }
  .operate_item {
    text-align: center;
    font-size: 14px;
    img {
      width: 36px;
    }
  }
  .delete_dia_body {
    padding: 20px;
    text-align: center;
    color: #ec280e;
  }
  .del_name {
    border: 1px solid #ccc;
    margin-top: 12px;
    border-radius: 24px;
    overflow: hidden;
    :deep(.van-cell) {
      padding: 6px 16px;
    }
  }
}
</style>
