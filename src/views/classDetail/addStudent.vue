<template>
  <Pupop v-bind="attrs" :title="type == 'add' ? '添加学生' : '编辑学生'" @confirm="addConfirm" @cancel="addCancel">
    <div class="add_info" v-if="addType == 'single'">
      <div class="student_info">
        <van-field v-model="student.stuName" :maxlength="30" label="" placeholder="学生姓名" />
      </div>
      <div class="student_info">
        <van-field v-model="student.stuNo" :maxlength="30" label="" placeholder="学生学号[选填]" />
      </div>
      <div class="change_add" @click="changeAdd" v-if="type == 'add'">批量添加</div>
    </div>
    <div v-else class="mutil_add">
      <van-field
        v-model="mutilStudent"
        rows="6"
        autosize
        type="textarea"
        placeholder="每行一个学生，学号选填，可以Excel编辑好黏贴，示例格式：
王浩 20221234
王美美
张晓明 2031424"
      />
    </div>
  </Pupop>
</template>

<script setup>
import { showToast } from 'vant'
import Pupop from '../../components/pupop.vue'
import { ref, useAttrs, watch, watchEffect } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'add'
  },
  info: {
    type: Object,
    default: () => ({})
  }
})

const attrs = useAttrs()

const student = ref({ stuName: '', stuNo: '' })

watchEffect(() => {
  if (props.type == 'edit') {
    student.value = props.info
  } else {
    student.value = { stuName: '', stuNo: '' }
  }
})

const emits = defineEmits(['cancel', 'confirm'])

const addType = ref('single')
const changeAdd = () => {
  addType.value = 'multi'
}

const mutilStudent = ref('')

const addConfirm = () => {
  let list = []
  if (addType.value == 'single') {
    if (!student.value.stuName) {
      showToast('请输入学生姓名')
      return
    }
    list.push(student.value)
  } else {
    if (!mutilStudent.value) {
      showToast('请输入添加内容')
      return
    }
    let students = mutilStudent.value.split('\n')
    students.forEach((val) => {
      if (val) {
        const info = val.split(' ')
        list.push({ stuName: info[0], stuNo: info.length > 1 ? info[info.length - 1] : '' })
      }
    })
  }
  emits('confirm', list)
  addCancel()
}

const addCancel = () => {
  emits('cancel')
  setTimeout(() => {
    student.value = { stuName: '', stuNo: '' }
    addType.value = 'single'
    mutilStudent.value = ''
  }, 200)
}
</script>

<style lang="scss" scoped>
.add_info {
  .student_info {
    border-radius: 25px;
    border: 1px solid #e1e1e1;
    margin-bottom: 12px;
    overflow: hidden;
  }
  .van-field {
    padding: 8px 20px;
  }
  :deep(.van-field__control) {
    text-align: center;
  }
}
.change_add {
  text-align: center;
  color: #1bc0a0;
  text-decoration: underline;
}
.mutil_add {
  border-radius: 8px;
  border: 1px solid #e1e1e1;
  overflow: hidden;
}
</style>
