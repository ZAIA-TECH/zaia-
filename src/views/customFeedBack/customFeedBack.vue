<template>
  <div class="custom_feed_back">
    <div class="title">定制您专属的输出反馈</div>

    <!-- Feedback Name -->
    <div class="form_item">
      <div class="lable require">反馈名称</div>
      <van-field class="filed_entry" v-model="agentName" label="" placeholder="示例：词句升格" />
    </div>

    <!-- Introduction -->
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

    <!-- Knowledge Base Section -->
    <div class="form_item">
      <div class="lable require">知识库</div>
      <div class="knowledge-upload-section">
        <div class="upload-container">
          <van-icon name="folder" class="upload-icon" />
          <span class="upload-text">支持 word, pdf, txt 格式，单个文件最大 100MB，最多上传 20 个文件</span>
        </div>
        <van-uploader
            v-model="knowledgeBaseFiles"
            :after-read="handleFileUpload"
            :max-count="20"
            :max-size="102400"
            upload-icon="plus"
            accept="application/pdf, .docx, .txt"
            label="点击上传文件"
        />
      </div>

      <!-- Display uploaded files -->
      <div class="file-list">
        <div v-for="file in uploadedFiles" :key="file.id" class="file-item">
          <span>{{ file.name }}</span>
          <van-icon name="cross" @click="deleteFile(file.id)" class="delete-icon" />
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="bot_btns">
      <div class="use_btn" @click="effectView">效果预览</div>
      <div class="comfirm_btn" @click="publishFeed">发布您的反馈</div>
    </div>

    <!-- Permission Settings Popup -->
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

    <!-- Preview Popup -->
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
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';
import { uploadFile, createKnowledgeBase } from '@/api';  // Import API functions

const crossSize = 20;  // 控制关闭图标的大小

// Form data
const agentName = ref('');
const agentIntro = ref('');
const agentDemand = ref('');
const agentExampleList = ref('');
const agentState = ref(0);

// File upload
const knowledgeBaseFiles = ref([]);
const uploadedFiles = ref([]);

// Validating the form fields
const fieldsValid = () => {
  if (!agentName.value) {
    showToast('请填写反馈名称');
    return false;
  }
  if (!agentIntro.value) {
    showToast('请填写简介');
    return false;
  }
  if (!agentDemand.value) {
    showToast('请填写输出要求');
    return false;
  }
  if (knowledgeBaseFiles.value.length === 0) {
    showToast('请上传文件');
    return false;
  }
  return true;
};

// Handle file upload after the file is selected
const handleFileUpload = async (file) => {
  console.log('文件选择:', file);  // 打印文件信息
  try {
    const formData = new FormData();
    console.log(file);  // 打印完整的 file 结构，检查是否有正确的 `file.file`
    formData.append('file', file.file);  // 确保上传的是 file.file 而不是整个 file 对象

    const res = await uploadFile(formData);

    if (res.data.success) {
      uploadedFiles.value.push({
        id: res.data.data.id,
        name: res.data.data.name,
        size: (file.size / 1024).toFixed(2),  // 转换为 KB
      });
      showToast('文件上传成功');
    } else {
      showToast('文件上传失败');
    }
  } catch (error) {
    console.error('上传出错:', error);  // 打印上传错误
    showToast('文件上传出错');
  }
};



// Delete file
const deleteFile = async (fileId) => {
  try {
    const res = await deleteFile({data: {id: fileId}});
    if (res.data.success) {
      uploadedFiles.value = uploadedFiles.value.filter(file => file.id !== fileId);
      showToast('文件删除成功');
    } else {
      showToast('删除文件失败');
    }
  } catch (error) {
    console.error(error);
    showToast('删除文件出错');
  }
};

// Preview of the feedback content
const showPreView = ref(false);
const preViewContent = ref('');

const effectView = async () => {
  if (!fieldsValid()) return;

  // Call createKnowledgeBase API after uploading files
  const res = await createKnowledgeBase({
    name: agentName.value,
    description: agentIntro.value,
  });

  if (res.data.success) {
    preViewContent.value = res.data.content; // Set the preview content after creating the knowledge base
    showPreView.value = true;
  } else {
    showToast('生成反馈预览失败');
  }
};

// Publish the feedback
const showAuthSet = ref(false);
const publishFeed = () => {
  if (!fieldsValid()) return;
  showAuthSet.value = true;
};

// Handle permission settings and publish
const surePush = async () => {
  // Implement publish logic here
  showToast('发布成功');
};

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

  /* 知识库上传部分样式 */
  .knowledge-upload-section {
    border: 1px dashed #62c7b4;
    padding: 16px;
    margin-top: 10px;
    border-radius: 8px;
    background-color: #f9f9f9;
    text-align: center; /* 确保内容居中对齐 */
  }

  .upload-container {
    display: flex;
    flex-direction: column; /* 使图标和文字排列在垂直方向 */
    justify-content: center;
    align-items: center; /* 水平居中对齐 */
    margin-bottom: 16px; /* 图标和上传文件框之间的间距 */
  }

  .upload-icon {
    font-size: 40px; /* 设置图标的大小 */
    color: #62c7b4; /* 图标颜色 */
  }

  .upload-text {
    display: block;
    margin-top: 10px;
    font-size: 14px;
    color: #777; /* 文字颜色 */
  }

  /* 文件列表显示样式 */
  .file-list {
    margin-top: 10px;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    padding: 5px;
    border-bottom: 1px solid #eaeaea;
  }

}
</style>
