<template>
  <div class="class_detail">
    <div class="info_item" id="g_id" @click="($event) => copy(formParams.id, 'g_id', $event)">
      <span>班级ID：</span> <span>{{ formParams.id }}</span>
    </div>
    <div class="info_item" @click="showGrade = true">
      <span>年级班级：</span><span>{{ classGradeText }}</span>
    </div>
    <div class="info_item">
      <span>班级名称：</span>
      <van-field
        v-model="formParams.className"
        :maxlength="30"
        label=""
        @blur="updateInfo"
        placeholder="请输入班级名称"
      />
    </div>
    <div class="info_item class_menb">
      <div class="menb_len">
        <span>{{ menbList.length }}</span
        ><span class="tip">注：输入学生名字即可，打印时候会显示学生名字</span>
      </div>
      <div class="menb_list">
        <div class="add_menb" @click="addMenb"><van-icon name="plus" /></div>
        <div
          class="menb_item"
          v-for="(item, index) in menbList"
          :key="item.stuName + index"
          @click="editStudent(item, index)"
        >
          {{ item.stuName }}
          <span class="menb_delete" @click.stop="menbDelete(index)"><van-icon name="minus" /></span>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showGrade" position="bottom" round safe-area-inset-bottom>
      <van-picker title="" :columns="gradeColumns" @confirm="pickConfirm" @cancel="pickCancel" v-model="gradeClass" />
    </van-popup>

    <AddStudent
      v-model:show="showAdd"
      :info="editInfo"
      :type="addType"
      @cancel="addCancel"
      @confirm="addConfirm"
    ></AddStudent>

    <Pupop v-model:show="showDelet" title="移除学生" @confirm="deleteConfirm" @cancel="showDelet = false">
      <div class="delete_tip">移除后，该学生的作业将全部删除，确定删除学生“{{ deleteInfo.stuName }}”吗？</div>
    </Pupop>
  </div>
</template>

<script setup>
import { copy } from '@/utils/utils'
import { ref, computed } from 'vue'
import AddStudent from './addStudent.vue'
import Pupop from '../../components/pupop.vue'
import { showToast } from 'vant'
import { useRoute } from 'vue-router'
import { studentDel, classUpdate, classSelect, studentAdd, studentUpdate } from '@/api/index'
import dictionary from '@/utils/dictionary'

const route = useRoute()

const formParams = ref({
  classGrade: 0,
  banGrade: 0,
  id: route.query.id,
  className: '',
  classType: ''
})

const gradeColumns = [dictionary.classGrade.gradeArr, dictionary.classGrade.classArr]

const gradeClass = ref([])

const showGrade = ref(false)

const updateInfo = async () => {
  await classUpdate({ ...formParams.value })
  showToast('修改成功')
}

const pickConfirm = ({ selectedOptions }) => {
  formParams.value.classGrade = selectedOptions[0].value
  formParams.value.banGrade = selectedOptions[1].value
  showGrade.value = false
  updateInfo()
}

const classGradeText = computed(() => {
  const cgInfo = dictionary.getClassGrade(formParams.value.classGrade, formParams.value.banGrade)
  return `${cgInfo.grade.text || ''} ${cgInfo.class.text || ''}`
})

const pickCancel = () => {
  gradeClass.value = [formParams.value.classGrade, formParams.value.banGrade]
  showGrade.value = false
}

const menbList = ref([])

const getClassInfo = () => {
  classSelect({ classId: formParams.value.id }).then((res) => {
    formParams.value.className = res.data.className
    formParams.value.classGrade = res.data.classGrade
    formParams.value.banGrade = res.data.banGrade
    formParams.value.classType = res.data.classType
    gradeClass.value = [res.data.classGrade, res.data.banGrade]
    menbList.value = res.data.studentResponseVos
  })
}

getClassInfo()

const showAdd = ref(false)
const addType = ref('add')

const addMenb = () => {
  showAdd.value = true
  addType.value = 'add'
}

const addCancel = () => {
  showAdd.value = false
}

let eIndex = -1

const addConfirm = async (list) => {
  const editItem = menbList.value[eIndex]
  if (addType.value == 'add') {
    await studentAdd({ stuDetails: list, classId: formParams.value.id })
    menbList.value = menbList.value.concat(list)
    showToast('添加成功')
  } else {
    await studentUpdate({
      id: editItem.id,
      stuName: list[0].stuName,
      stuNo: list[0].stuNo
    })
    menbList.value[eIndex] = list[0]
    showToast('修改成功')
  }
}

const showDelet = ref(false)
let dIndex = -1

const deleteInfo = ref({})
const menbDelete = (index) => {
  deleteInfo.value = { ...menbList.value[index] }
  dIndex = index
  showDelet.value = true
}

const deleteConfirm = async () => {
  await studentDel({ id: deleteInfo.value.id })
  menbList.value.splice(dIndex, 1)
  showDelet.value = false
  showToast('移除成功')
}

const editInfo = ref({})
const editStudent = (item, index) => {
  eIndex = index
  editInfo.value = { ...item }
  showAdd.value = true
  addType.value = 'edit'
}
</script>

<style lang="scss" scoped>
.class_detail {
  background-color: #f9f9f9;
  min-height: inherit;
  padding: 16px 14px;
  padding-bottom: calc(16px + constant(safe-area-inset-bottom));
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  .info_item {
    background: #fff;
    line-height: 30px;
    padding: 14px 16px 12px;
    width: 100%;
    border-radius: 12px;
    border: 1px solid #eee;
    box-shadow: 0 0 4px #eee;
    margin-bottom: 12px;
    @include flex-between;
    overflow: hidden;
    font-size: 14px;
    :deep(.van-field) {
      padding: 0;
      width: 180px;
    }
    :deep(.van-field__control) {
      text-align: right;
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

  .class_menb {
    display: block;
  }
  .menb_len {
    width: 100%;
    @include flex-between;
    align-items: flex-end;
    padding: 8px 0;
    border-bottom: 1px solid #ccc;
    margin-bottom: 12px;
    span:first-child {
      font-size: 20px;
      color: #1bc0a0;
      &::before {
        content: '共';
        font-size: 13px;
        color: #444;
        vertical-align: middle;
        margin-right: 2px;
      }
      &::after {
        content: '人';
        font-size: 13px;
        vertical-align: middle;
        color: #444;
        margin-left: 2px;
      }
    }
    .tip {
      color: #999;
      font-size: 11px;
      white-space: nowrap;
    }
  }
  .menb_list {
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    flex-flow: row wrap;
    color: #999;
  }
  .add_menb {
    border-radius: 50%;
    text-align: center;
    line-height: 36px;
    width: 36px;
    font-size: 20px;
    border: 1px dashed #aaa;
    margin-right: 12px;
    margin-bottom: 16px;
  }
  .menb_item {
    line-height: 32px;
    padding: 0 10px;
    border: 1px solid #aaa;
    margin-right: 12px;
    border-radius: 6px;
    font-size: 15px;
    position: relative;
    margin-bottom: 16px;
  }
  .menb_delete {
    position: absolute;
    right: -8px;
    top: -8px;
    font-size: 10px;
    width: 16px;
    text-align: center;
    line-height: 16px;
    border-radius: 50%;
    color: #fff;
    background: #fe6b6b;
    font-weight: bold;
  }
  .delete_tip {
    color: #fe6b6b;
    text-align: center;
  }
}
</style>
