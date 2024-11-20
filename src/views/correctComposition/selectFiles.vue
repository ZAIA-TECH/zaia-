<template>
  <div class="select_files">
    <div class="select_top">
      <div class="medule_title">拍照上传作文</div>
      <div class="to_edit" @click="toEditComposition">手动输入</div>
    </div>
    <div class="upload_b">
      <div class="upload_in">
        <!-- <img src="@img/tip@2x.png" class="upload_tip" alt=""> -->
        <van-uploader v-model="fileList" reupload :max-size="50 * 1024 * 1024" :max-count="5" :after-read="afterRead" @oversize="onOversize" ref="uploader" @click-reupload="hReupload" />
      </div>
    </div>
    <div class="example_tip" @click="toggleExample">拍照方式严重影响报告质量，点此<span>查看示例</span></div>

    <div class="medule_title compos_info">作文信息</div>
    <div class="form_item">
      <div :class="['lable', type !== 'en' ? 'require' : '']">作文标题</div>
      <van-field v-model="title" maxlength="20" label="" :placeholder="type == 'en' ? 'Type or paste your title here' : '示例：坚持的力量'" />
    </div>
    <div class="form_item" v-if="type !== 'en'">
      <div class="lable require">作文文体</div>
      <div class="cn_literary">
        <span @click="selectLiterary(item)" :class="['literary_item', item.type == 'compensation' ? 'compensation' : '', currLiterary && currLiterary.id == item.id ? 'select' : '']" v-for="item in cnLiterary" :key="item.id">{{ item.dicDetailValue }}</span>
        <span class="literary_item compensation"></span>
      </div>
    </div>
    <div class="form_item">
      <div class="lable">写作要求</div>
      <van-field class="composition_require" v-if="type == 'en'" v-model="requirement" :autosize="{ maxHeight: 400, minHeight: 220 }" label="" type="textarea" placeholder="示例：
斗转星移，四季更替。你最喜欢哪个季节?在你十多年的成长历程中，一走有许多体会与感悟值得分享。请你以“My favourite season”为题写一篇英语短文。
内容必须包括以下几方面:
要求:
1.词数不少于 40词:
2 文中不得出现真实的人名、校名" />
      <van-field class="composition_require" v-else v-model="requirement" :autosize="{ maxHeight: 200, minHeight: 120 }" label="" type="textarea" placeholder="示例：
请结合你的生活体验与思考，以“恒心”或“锲而不舍”为关键词!自选角度，自拟题目，写一篇文章" />
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
      <div class="get_btn" @click="getReport">获取报告</div>
    </div>
    <van-popup v-model:show="showExample" round position="bottom">
      <div class="example_pop">
        <div class="medule_title">作文拍照提示</div>
        <div class="pop_close" @click="toggleExample"><van-icon name="cross" /></div>
        <div class="pop_tips">拍照质量将影响最终批改报告的准确度</div>
        <div class="example_title medule_title">1、选好角度，排除干扰、字迹清晰</div>
        <div class="example_list">
          <div class="example_item right">
            <img src="@img/example/u346.png" alt="">
          </div>
          <div class="example_item wrong">
            <img src="@img/example/u345.png" alt="">
          </div>
        </div>
        <div class="example_title medule_title">2、一次只能选一页，可多次拍摄</div>
        <div class="example_list">
          <div class="example_item right">
            <img src="@img/example/u343.png" alt="">
          </div>
          <div class="example_item wrong">
            <img src="@img/example/u340.png" alt="">
          </div>
        </div>
      </div>
    </van-popup>

    <div class="cropper_cover" v-show="showCropper">
      <div class="cro_title">
        <img src="@img/x@2x.png" alt="" @click="closeCropper">
        裁剪
        <img src="@img/v@2x.png" alt="" @click="commitCropper">
      </div>
      <div class="cro_b" :style="{ height: crobHeight + 'px' }">
        <img :src="cropperImg" id="cropper_img" alt="" :style="{ height: `${cropperImgHeight}px` }" @load="cropperLoad">
      </div>
    </div>
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
import { ref, onMounted, onBeforeUnmount, defineOptions, computed, onActivated } from 'vue';
import { orderImageParsing, orderContentEcho, orderCreate, orderPay } from '@/api/index'
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '@/stores';
import { replacePunctuationWithChinese, fitUnitPx } from '@/utils/utils'
import { showLoadingToast, showToast } from 'vant';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

defineOptions({ name: 'SelectFiles' })

const fileList = ref([]);
const route = useRoute();
const router = useRouter();
let orderNo = '';
const type = ref(route.query.type);
const uploader = ref(null)

const cropperImg = ref('');
const cropperImgHeight = window.innerHeight;
const showCropper = ref(false);
const store = useStore();

const agentNames = computed(() => store.checkedAgents.map(val => val.agentName).join('、') || '');

const correctContent = {};

const crobHeight = cropperImgHeight - fitUnitPx(116);

let reuploadIndex = -1;
let currFile = ''
let currIndex = -1;

// 辅助函数：将数据 URL 转换为 Blob 对象
const dataURLtoBlob = (dataURL) => {
  const parts = dataURL.split(",");
  const mimeString = parts[0].split(":")[1].split(";")[0];
  const byteString = atob(parts[1]);
  let arrayBuffer = new ArrayBuffer(byteString.length);
  let intArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  return new Blob([arrayBuffer], { type: mimeString });
}

const dataToFile = (compressedDataURL, file) => {
  // 将数据 URL 转换为 Blob 对象
  const compressedFile = dataURLtoBlob(compressedDataURL);
  const filename = file.name;

  // 将数据 Blob 转换为 File 对象
  const newFile = new File([compressedFile], filename, { type: file.type });
  // 替换原来的文件
  fileList.value[currIndex].file = newFile;
  fileList.value[currIndex].content = compressedDataURL;
  fileList.value[currIndex].objectUrl = URL.createObjectURL(newFile);
}

// 创建一个函数来压缩图像
const compressImage = (file, maxWidth, maxHeight, quality) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
      const img = new Image();
      img.src = event.target.result;
      img.onload = function () {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // 根据最大宽度和最大高度计算新的尺寸
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }

        // 设置 canvas 尺寸
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        // 在 canvas 上绘制压缩后的图像
        ctx.drawImage(img, 0, 0, width, height);

        // 将 canvas 转换为压缩后的图像数据 URL
				const compressedDataURL = canvas.toDataURL("image/jpeg", quality);

        dataToFile(compressedDataURL, file)

        resolve();

      };
    };
    reader.onerror = function (error) {
      reject(error);
    };
  });
}

const hReupload = (file, detail) => {
  reuploadIndex = detail.index;
}

const afterRead = async (file, props) => {
  currIndex = reuploadIndex == -1 ? props.index : reuploadIndex;
  reuploadIndex = -1;
  console.log('图片压缩前尺寸：', fileList.value[currIndex].file.size)
  if(fileList.value[currIndex].file.size > 3 * 1024 * 1024) {
    const toast = showLoadingToast({
      message: '图片压缩中...',
      forbidClick: true,
      duration: 0
    });
    await compressImage(fileList.value[currIndex].file, 1000, 1000, 1);
    toast.close();
  }
  currFile = fileList.value[currIndex].file;
  console.log('图片压缩后尺寸：', fileList.value[currIndex].file.size)
  setTimeout(() => {
    showCropper.value = true;
    cropperImg.value = document.querySelectorAll('.van-uploader__preview-image')[currIndex].querySelector('.van-image__img').src;
  }, 10)
  return true
}

let cropper = '';
 
const cropperLoad = () => {
  const cropperImgDom = document.querySelector('#cropper_img')
  cropper = new Cropper(cropperImgDom, {
    viewMode: 1, // 设置裁剪框在画布中可见，并限制在画布内
    guides: true, // 显示裁剪框的虚线辅助线
    movable: false, // 禁止拖动图片
    zoomable: false, // 禁止缩放图片  
    background: false,
    // ready: () => {
    //   cropper.setCropBoxData({ left: 0, top: 0 })
    //   console.log(cropper.getCropBoxData());
    // }
  })
}

const closeCropper = () => {
  showCropper.value = false;
  cropper.destroy();
  Array.from(document.querySelectorAll('.van-uploader__wrapper .van-uploader__preview')).forEach(val => {
    // val.draggable = 'true'
    console.dir(val.draggable);
  })
}

const commitCropper = () => {
  const croppedImageData = cropper.getCroppedCanvas().toDataURL('image/jpeg');
  dataToFile(croppedImageData, currFile)
  closeCropper();
}

const back = () => {
  window.history.back();
}

const showPayPop = ref(!!route.query.showPayPop)
const payInfo = ref({})

const confirmPay = async () => {
  const res = await orderPay({ orderNo })
  if(res.code == 844) {
    setTimeout(() => {
      router.push({ path: '/myWallet', query: { ...route.query, orderNo, showPayPop: 1 } })
    }, 2000)
  } else {
    router.replace({ path: '/correctionReport', query: { ...route.query, orderNo } })
  }
}

const confirmFile = () => {
  const toast = showLoadingToast({
    forbidClick: true,
    duration: 0
  })
  fileList.value.forEach(async (val,index) => {
    const formData = new FormData();
    formData.append('file', val.file)
    formData.append('orderNo ', orderNo)
    formData.append('productCode ', route.query.productCode)
    const res = await orderImageParsing(formData)
    let content = '';
    correctContent[`${index}`] = res.data.map(val => val.text).join("\n");
    if(Object.keys(correctContent).length == fileList.value.length) {
      content = Object.values(correctContent).join("\n");
      if(route.query.productCode == 'cn-article-rectify') {
        content = replacePunctuationWithChinese(content)
        const title = content.substring(0, 16);
        const first_n = title.indexOf('\n');
        if(first_n > -1) {
          store.correctTitle = title.split('\n')[0];
          content = content.substring(first_n + 1)
        }
      }
      const orderRes = await orderCreate({
        orderContentPo: {
          content,
          title: title.value,
          originalText: content,
          label: JSON.stringify({cnLiterary: currLiterary.value}),
        },
        requirement: requirement.value,
        agentId: store.checkedAgents.map(val => val.agentId).join(','),
        orderNo,
        productCode: route.query.productCode,
        source: route.query.source,
      });
      orderNo = orderRes.data.orderNo
      toast.close();
      payInfo.value = res.data;
      confirmPay();
    }
  })
}

const toEditComposition = () => {
  if(!store.checkedAgents?.length) {
    showToast('请先选择报告内容')
    return
  }
  router.replace({ path: '/correctComposition', query: { ...route.query, orderNo, agentId: store.checkedAgents.map(val => val.agentId).join(',') } });
}

const onOversize = () => {
  showToast('图片大小不能超过50M');
}

const showExample = ref(false)
const toggleExample = () => {
  showExample.value = !showExample.value;
}

const toFeedBack = () => {
  store.viewContent = {title: title.value, label: JSON.stringify({cnLiterary: currLiterary.value})}
  store.fileList = fileList.value;
  router.push({ path: './feedBackList', query: route.query })
}


const title = ref('');
const requirement = ref('');

const currLiterary = ref('')
const selectLiterary = (item) => {
  currLiterary.value = item;
}

const cnLiterary = ref([])

const getReport = () => {
  if(!fileList.value.length) {
    showToast('请上传作文图片')
    return
  }
  if(!title.value && type.value == 'zh') {
    showToast('请输入标题')
    return
  }
  if(!currLiterary.value && type.value == 'zh') {
    showToast('请选择作文文体')
    return
  }
  if(!agentNames.value) {
    showToast('请先点击下方【批改报告设置】选择反馈')
    return
  }
  confirmFile();
}


onMounted(async () => {
  type.value = route.query.type;
  route.query.from == 'index' && uploader.value.chooseFile();
  const res = await orderContentEcho({ productCode: route.query.productCode, language: route.query.type });
  orderNo = res.data.orderNo;
  cnLiterary.value = res.data.cnLiterary;
  if(res.data?.orderContentPo?.label && type.value !== 'en') {
    const orderLabel = JSON.parse(res.data.orderContentPo.label);
    currLiterary.value = orderLabel.cnLiterary || orderLabel;
    const compensationLen = 4 - cnLiterary.value.length % 4;
    for(let i = 0;i < compensationLen;i++) {
      cnLiterary.value.push({id: 'compensation' + i, type: 'compensation'})
    }
  }
  console.log(store.checkedAgents.length)
  if(res.data.userLastData && !store.checkedAgents.length) {
    store.checkedAgents = [...res.data.userLastData]
  }
  router.replace({ path: '/selectFiles', query: { ...route.query, from: '', orderNo } });
})

onBeforeUnmount(() => {
  cropper && cropper.destroy();
})

</script>

<style lang="scss" scoped>
  .select_files {
    min-height: inherit;
    padding: 20px 18px 58px;
    padding-bottom: calc(58px + env(safe-area-inset-bottom));
    position: relative;
    background: #D2F0EA url('@img/file_bg@2x.png') no-repeat 0 0 / 375px auto;
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
      background: #62C7B4;
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
      color: #62C7B4;
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
      background: #84BD93;
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
    box-shadow: 0 0 10px #ccc;
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
    .get_btn{
      background: #62c7b4;
      color: #fff;
    }
  }
  .cropper_cover {
    padding: 20px 20px 50px;
    background: #D2F0EA url('@img/file_bg@2x.png') no-repeat 0 0 / 375px auto;
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
        height: 23px
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
    .van-uploader__input-wrapper, .van-uploader__upload, .van-uploader__preview {
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