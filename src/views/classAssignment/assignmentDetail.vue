<template>
  <div class="assignment_detail">
    <div class="assign_explain">
      <h4>说明</h4>
      1.点击下面的学生名字，可以上传作文图片。<br />
      2.批改失败会变成红色，可以重新上传。 <br />
      3.<span style="color: #f66f6f">长按</span>可以删除作业，重新上传。<br />
      4.批改完成后，点击<span style="color: #f66f6f">全选</span>，然后导出。
    </div>
    <div class="upload_container">
      <div class="work_export">
        <div class="export_left">
          <van-checkbox v-model="checkAll" @click="handleChange">全选</van-checkbox>
          <div class="export_num">
            {{ exportList.length }}<span>/{{ students.length }}人</span>
          </div>
        </div>
        <van-button type="primary" class="export_btn" round @click="exportSet"
          ><van-icon name="link-o" /> 导出</van-button
        >
      </div>
      <div class="stu_list">
        <template v-if="isPc">
          <div
            v-for="item in students"
            :key="`${item.stuId}_${item.taskStatus}`"
            :class="['stu_item', `task_status_${item.taskStatus}`]"
            @click="stuUploadTask(item)"
            @mousedown="stuTouchStart($event, item)"
            @mouseup="stuTouchEnd"
          >
            <div class="item_stu_name">{{ item.stuName }}</div>
            <div class="item_status">{{ taskStatus[item.taskStatus] }}</div>
            <div
              :class="['item_dot', exportList.includes(item.stuId) ? 'item_checked' : '']"
              @mousedown.stop="exportSelect(item)"
            ></div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="item in students"
            :key="`${item.stuId}_${item.taskStatus}`"
            :class="['stu_item', `task_status_${item.taskStatus}`]"
            @click="stuUploadTask(item)"
            @touchstart="stuTouchStart($event, item)"
            @touchend="stuTouchEnd"
          >
            <div class="item_stu_name">{{ item.stuName }}</div>
            <div class="item_status">{{ taskStatus[item.taskStatus] }}</div>
            <div
              :class="['item_dot', exportList.includes(item.stuId) ? 'item_checked' : '']"
              @touchstart.stop="exportSelect(item)"
            ></div>
          </div>
        </template>
      </div>
    </div>
    <div class="ex_tips">拍照方式严重影响报告质量，点此 <span @click="toggleExample">查看示例</span></div>

    <Pupop v-model:show="showUpload" title="上传作文">
      <div class="pop_container">
        <div class="upload_b" v-if="isFile">
          <div class="upload_in">
            <!-- <img src="@img/tip@2x.png" class="upload_tip" alt=""> -->
            <van-uploader
              v-model="fileList"
              reupload
              :max-size="50 * 1024 * 1024"
              :max-count="5"
              :after-read="afterRead"
              @oversize="onOversize"
              ref="uploader"
              @click-reupload="hReupload"
            />
          </div>
        </div>
        <div v-else class="input_entry">
          <van-field
            class="comp_title"
            maxlength="20"
            v-model="orderContentPo.title"
            label=""
            placeholder="请输入作文标题"
          />
          <van-field
            class="comp_content"
            v-model="orderContentPo.content"
            show-word-limit
            maxlength="800"
            :autosize="{
              maxHeight: fitUnitPx(300),
              minHeight: fitUnitPx(100)
            }"
            type="textarea"
            label=""
            placeholder="请输入作文正文"
          />
        </div>
      </div>

      <template #footer>
        <div class="fot_btn">
          <van-button round @click="changeEntry">{{ isFile ? '文字输入' : '返回拍照' }}</van-button>
          <van-button round type="comfirm" @click="confirm">提交批改</van-button>
        </div>
      </template>
    </Pupop>

    <div class="cropper_cover" v-show="showCropper">
      <div class="cro_title">
        <img src="@img/x@2x.png" alt="" @click="closeCropper" />
        裁剪
        <img src="@img/v@2x.png" alt="" @click="commitCropper" />
      </div>
      <div class="cro_b" :style="{ height: crobHeight + 'px' }">
        <img
          :src="cropperImg"
          id="cropper_img"
          alt=""
          :style="{ height: `${cropperImgHeight}px` }"
          @load="cropperLoad"
        />
      </div>
    </div>

    <Pupop v-model:show="showDelete" title="提示">
      <div>确定要删除{{ deleteItem.stuName }}的作业吗？删除后可以重新提交</div>
      <template #footer>
        <div class="fot_btn">
          <van-button round @click="showDelete = false">取消</van-button>
          <van-button round type="comfirm" @click="deleteConfirm">确定</van-button>
        </div>
      </template>
    </Pupop>

    <van-popup v-model:show="showExample" round position="bottom">
      <div class="example_pop">
        <div class="medule_title">作文拍照提示</div>
        <div class="pop_close" @click="toggleExample"><van-icon name="cross" /></div>
        <div class="pop_tips">拍照质量将影响最终批改报告的准确度</div>
        <div class="example_title medule_title">1、选好角度，排除干扰、字迹清晰</div>
        <div class="example_list">
          <div class="example_item right">
            <img src="@img/example/u346.png" alt="" />
          </div>
          <div class="example_item wrong">
            <img src="@img/example/u345.png" alt="" />
          </div>
        </div>
        <div class="example_title medule_title">2、一次只能选一页，可多次拍摄</div>
        <div class="example_list">
          <div class="example_item right">
            <img src="@img/example/u343.png" alt="" />
          </div>
          <div class="example_item wrong">
            <img src="@img/example/u340.png" alt="" />
          </div>
        </div>
      </div>
    </van-popup>

    <Pupop v-model:show="showExport" title="导出设置" @confirm="exportConfirm">
      <div class="agent_list">
        <van-checkbox-group v-model="checkedAgents">
          <van-checkbox name="origin">原文</van-checkbox>
          <van-checkbox v-for="item in agentList" :name="item.agentId" :key="item.agentId">{{
            item.agentName
          }}</van-checkbox>
        </van-checkbox-group>
      </div>
    </Pupop>

    <Pupop v-model:show="showExportUrl" title="导出成功">
      <div class="export_tip">点击复制链接，可以发送给其他人，也可以粘贴到浏览器下载，此链接有效期1天</div>
      <template #footer>
        <van-button round type="comfirm" id="copy_url" @click="copyUrl">复制链接</van-button>
      </template>
    </Pupop>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { taskDetail, taskUpload, taskDelStu, taskImageParsing, taskExportWord } from '@/api/index'
import { useRoute, useRouter } from 'vue-router'
import Pupop from '../../components/pupop.vue'
import { showToast, showLoadingToast } from 'vant'
import { dataToFile, compressImage } from '@/utils/compressImage'
import { replacePunctuationWithChinese, fitUnitPx, copy, isPC } from '@/utils/utils'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

const route = useRoute()
const router = useRouter()

const isPc = isPC()

const taskStatus = {
  0: '待上传',
  1: '批改中',
  2: '批改完成',
  3: '批改失败'
}

const checkAll = ref(false)
const taskId = route.query.taskId
const classType = route.query.classType
const agentList = ref([])

const exportList = ref([])
const students = ref([])

const completeList = ref([])
const getList = async () => {
  const res = await taskDetail({ taskId })
  students.value = res.data.taskFindDetail || []
  completeList.value = students.value.filter((val) => val.taskStatus == 2).map((val) => val.stuId)
  agentList.value = res.data.responseVoList
}
getList()

const handleChange = () => {
  if (checkAll.value) {
    exportList.value = [...completeList.value]
  } else {
    exportList.value = []
  }
}

const showUpload = ref(false)
let currStu = ''
const stuUploadTask = (item) => {
  if ([0, 3].includes(item.taskStatus)) {
    currStu = item
    showUpload.value = true
  }
}

const exportSelect = (item) => {
  console.log(item)
  if (item.taskStatus != 2) return
  const index = exportList.value.indexOf(item.stuId)
  index == -1 && exportList.value.push(item.stuId)
  index > -1 && exportList.value.splice(index, 1)
  checkAll.value = exportList.value.length === completeList.value.length
}

let reuploadIndex = -1
let currFile = ''
let currIndex = -1
const hReupload = (file, detail) => {
  reuploadIndex = detail.index
}

const cropperImgHeight = window.innerHeight
const crobHeight = cropperImgHeight - fitUnitPx(116)

const showCropper = ref(false)
const cropperImg = ref('')
const fileList = ref([])
const afterRead = async (file, props) => {
  currIndex = reuploadIndex == -1 ? props.index : reuploadIndex
  reuploadIndex = -1
  if (fileList.value[currIndex].file.size > 3 * 1024 * 1024) {
    const toast = showLoadingToast({
      message: '图片压缩中...',
      forbidClick: true,
      duration: 0
    })
    await compressImage(fileList.value[currIndex].file, 1000, 1000, 1)
    toast.close()
  }
  currFile = fileList.value[currIndex].file
  console.log('图片压缩后尺寸：', fileList.value[currIndex].file.size)
  setTimeout(() => {
    showCropper.value = true
    cropperImg.value = document
      .querySelectorAll('.van-uploader__preview-image')
      [currIndex].querySelector('.van-image__img').src
  }, 10)
  return true
}

const onOversize = () => {
  showToast('图片大小不能超过50M')
}

let cropper = ''

const cropperLoad = () => {
  const cropperImgDom = document.querySelector('#cropper_img')
  cropper = new Cropper(cropperImgDom, {
    viewMode: 1, // 设置裁剪框在画布中可见，并限制在画布内
    guides: true, // 显示裁剪框的虚线辅助线
    movable: false, // 禁止拖动图片
    zoomable: false, // 禁止缩放图片
    background: false
  })
}

const closeCropper = () => {
  showCropper.value = false
  cropper.destroy()
  Array.from(document.querySelectorAll('.van-uploader__wrapper .van-uploader__preview')).forEach((val) => {
    console.dir(val.draggable)
  })
}

const commitCropper = () => {
  const croppedImageData = cropper.getCroppedCanvas().toDataURL('image/jpeg')
  fileList.value[currIndex] = dataToFile(croppedImageData, currFile)
  closeCropper()
}

const correctContent = {}

const orderContentPo = ref({
  title: '',
  content: ''
})

const isFile = ref(true)
const changeEntry = () => {
  isFile.value = !isFile.value
}

const comfirmTast = async () => {
  if (!orderContentPo.value.title) {
    showToast('请输入标题')
    return
  }
  if (!orderContentPo.value.content) {
    showToast('请输入内容')
    return
  }
  await taskUpload({
    taskId,
    stuId: currStu.stuId,
    orderContentPo: { ...orderContentPo.value }
  })
  orderContentPo.value = { title: '', content: '' }
  showUpload.value = false
  fileList.value = []
  getList()
}

const confirm = async () => {
  if (isFile.value) {
    if (!fileList.value.length) {
      showToast('请上传图片')
      return
    }
    const toast = showLoadingToast({
      forbidClick: true,
      duration: 0
    })
    fileList.value.forEach(async (val, index) => {
      const formData = new FormData()
      formData.append('file', val.file)
      formData.append('language ', classType)
      const res = await taskImageParsing(formData)
      let content = ''
      correctContent[`${index}`] = res.data.map((val) => val.text).join('\n')
      if (Object.keys(correctContent).length == fileList.value.length) {
        content = Object.values(correctContent).join('\n')
        if (classType == 'zh') {
          content = replacePunctuationWithChinese(content)
          let title = content.substring(0, 16)
          const first_n = title.indexOf('\n')
          if (first_n > -1) {
            title = title.split('\n')[0]
            content = content.substring(first_n + 1)
          }
          orderContentPo.value = { title, content }
        }
        toast.close()
        comfirmTast()
      }
    })
  } else {
    comfirmTast()
  }
}

let deleteItem = ''
let timer = null
const showDelete = ref(false)
const stuTouchStart = (event, item) => {
  if (!item.id) return
  clearTimeout(timer)
  deleteItem = { ...item }
  timer = setTimeout(() => {
    showDelete.value = true
    timer = null
    deleteItem = ''
  }, 500)
  event.preventDefault()
}
const stuTouchEnd = () => {
  if (timer && deleteItem) {
    router.push({ path: '/taskDetail', query: { id: deleteItem.id } })
  }
  clearTimeout(timer)
}

const deleteConfirm = async () => {
  const res = await taskDelStu({ id: deleteItem.id })
  showToast('删除成功')
  showDelete.value = false
  getList()
}

const showExample = ref(false)
const toggleExample = () => {
  showExample.value = !showExample.value
}

const showExport = ref(false)
const exportSet = () => {
  if (!exportList.value.length) {
    showToast('请选择需要导出的学生')
    return
  }
  showExport.value = true
}

const showExportUrl = ref(false)
const checkedAgents = ref([])
let exportUrl = ''
const exportConfirm = async () => {
  const selectedAgentNames = []
  agentList.value.forEach((val) => {
    checkedAgents.value.includes(val.agentId) && selectedAgentNames.push(val.agentName)
  })
  const data = {
    taskId,
    studentIds: exportList.value,
    content: checkedAgents.value.includes('origin'),
    selectedAgentNames: selectedAgentNames
  }
  const res = await taskExportWord(data)
  showExport.value = false
  showExportUrl.value = true
  exportUrl = res.data
}

const copyUrl = (event) => {
  if (!exportUrl) return
  copy(exportUrl, 'copy_url', event)
  showExportUrl.value = false
}
</script>

<style lang="scss" scoped>
.assignment_detail {
  user-select: none;
  min-height: inherit;
  background: #f7f8fc;
  padding: 14px 16px;
  padding-bottom: calc(14px + constant(safe-area-inset-bottom));
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
  .assign_explain {
    padding: 12px 14px;
    border: 1px solid #8fdbcc;
    border-radius: 8px;
    font-size: 14px;
    line-height: 26px;
    margin-bottom: 12px;
    h4 {
      font-size: 16px;
    }
  }
  .upload_container {
    padding: 12px 14px;
    border: 1px solid #8fdbcc;
    border-radius: 8px;
    font-size: 14px;
  }
  .work_export {
    font-size: 16px;
    padding: 8px 0 10px;
    border-bottom: 1px solid #ccc;
    line-height: 1;
    @include flex-between;
  }
  .export_left {
    @include flex-center;
    justify-content: flex-start;
  }
  .export_num {
    font-size: 18px;
    color: #1bc09d;
    @include flex-center;
    font-weight: bold;
    margin: 0 24px;
    span {
      font-weight: normal;
      color: #666;
      font-size: 14px;
    }
  }
  .export_btn {
    height: 32px;
    width: 90px;
  }
  .ex_tips {
    font-size: 12px;
    margin-top: 2px;
    color: #666;
    @include flex-between;
    justify-content: flex-end;
    span {
      color: #1989fa;
      padding: 8px 2px;
    }
  }
  .stu_list {
    margin-top: 12px;
    @include flex-between;
    flex-flow: row wrap;
  }
  .stu_item {
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin: 0 8px 20px 8px;
    margin-bottom: 20px;
    min-width: 60px;
    position: relative;
    .item_dot {
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 1px solid #ccc;
      left: -7px;
      top: -7px;
      background: #fff;
      padding: 2px;
      &::before {
        content: '';
        position: absolute;
        width: 22px;
        height: 22px;
        top: -5px;
        left: -5px;
      }
    }
    .item_checked::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: block;
      background: #1dc09d;
    }
  }
  .item_stu_name {
    padding: 4px 6px;
    font-size: 14px;
    line-height: 1;
  }
  .item_status {
    padding: 4px 6px;
    border-top: 1px solid #999;
    font-size: 10px;
    line-height: 1;
    background: #999;
    color: #fff;
  }
  .task_status_1 {
    border: 1px solid #1591f3;
    .item_status {
      background: #1591f3;
      border-top: 1px solid #1591f3;
    }
  }
  .task_status_2 {
    border: 1px solid #1dc09d;
    .item_status {
      background: #1dc09d;
      border-top: 1px solid #1dc09d;
    }
  }
  .task_status_3 {
    border: 1px solid #e95954;
    .item_status {
      background: #e95954;
      border-top: 1px solid #e95954;
    }
  }
  .upload_b {
    position: relative;
    border-radius: 8px;
    background: #fff;
    border: 1px solid #e2e2e2;
    padding: 12px 6px 4px;
  }
  .upload_in {
    z-index: 3;
    max-height: 56vh;
  }
  :deep(.van-uploader__input-wrapper, .van-uploader__upload, .van-uploader__preview) {
    width: 82px;
    height: 82px;
    border: $thinBorder;
    border-radius: 4px;
    overflow: hidden;
    margin-right: 22px;
    margin-bottom: 20px;
  }

  .cropper_cover {
    padding: 20px 20px 50px;
    background: #d2f0ea url('@img/file_bg@2x.png') no-repeat 0 0 / 375px auto;
    position: absolute;
    z-index: 99999;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    // right: 0;
    // bottom: 0;
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
  .fot_btn {
    @include flex-between;
    .van-button {
      height: 40px;
      width: 130px;
    }
    .van-button--comfirm {
      border: none;
      background: linear-gradient(to bottom, #77eed8 0%, #4cb19e 100%);
      color: #fff;
      font-size: 15px;
      &:before {
        display: none;
      }
    }
  }
  .input_entry {
    .van-cell {
      border: 1px solid #e2e2e2;
      padding: 4px 10px;
      border-radius: 8px;
    }
    .comp_title {
      margin-bottom: 12px;
    }
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
.agent_list {
  max-height: 50vh;
  overflow: auto;
  .van-checkbox {
    margin-bottom: 12px;
  }
}
.export_tip {
  padding: 0 4px;
  text-align: center;
}
</style>
