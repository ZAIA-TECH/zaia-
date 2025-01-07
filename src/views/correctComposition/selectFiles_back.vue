<template>
  <div class="select_files">
    <div class="select_top">
      <img src="@img/back@2x.png" class="top_back" alt="" @click="back">
      <img src="@img/zwtp@2x.png" class="top_zwtp" alt="">
      <img src="@img/up@2x.png" class="top_up" alt="" @click="confirmFile">
    </div>
    <div class="top_tip">
      温馨提示：作文内容过多，您可以重复拍照上传，作文内容自动识别，并进行拼接。
    </div>
    <div class="upload_b">
      <div class="upload_in">
        <!-- <img src="@img/tip@2x.png" class="upload_tip" alt=""> -->
        <van-uploader v-model="fileList" reupload :max-size="50 * 1024 * 1024" :max-count="5" :after-read="afterRead" @oversize="onOversize" ref="uploader" @click-reupload="hReupload" />
      </div>
    </div>
    <div class="to_edit" @click="toEditComposition"></div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { orderImageParsing, orderContentEcho } from '@/api/index'
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '@/stores';
import { replacePunctuationWithChinese, fitUnitPx } from '@/utils/utils'
import { showLoadingToast, showToast } from 'vant';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

const fileList = ref([]);
const route = useRoute();
const router = useRouter();
let orderNo = route.query.orderNo;
const uploader = ref(null)

const cropperImg = ref('');
const cropperImgHeight = window.innerHeight;
const showCropper = ref(false);
const store = useStore();
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

const confirmFile = () => {
  const toast = showLoadingToast({
    forbidClick: true,
    duration: 0
  })
  fileList.value.forEach(async (val,index) => {
    const formData = new FormData();
    formData.append('file', val.file)
    formData.append('orderNo ', route.query.orderNo)
    formData.append('productCode ', route.query.productCode)
    const res = await orderImageParsing(formData)
    correctContent[`${index}`] = res.data.map(val => val.text).join("\n");
    if(Object.keys(correctContent).length == fileList.value.length) {
      store.correctContent = Object.values(correctContent).join("\n");
      if(route.query.productCode == 'cn-article-rectify') {
        store.correctContent = replacePunctuationWithChinese(store.correctContent)
        const title = store.correctContent.substring(0, 16);
        const first_n = title.indexOf('\n');
        if(first_n > -1) {
          store.correctTitle = title.split('\n')[0];
          store.correctContent = store.correctContent.substring(first_n + 1)
        }

      }
      toast.close();
      router.replace({ path: '/correctComposition', query: { ...route.query, orderNo } });
    }
  })
}

const toEditComposition = () => {
  router.replace({ path: '/correctComposition', query: { ...route.query, orderNo } });
}

const onOversize = () => {
  showToast('图片大小不能超过50M');
}

onMounted(async () => {
  route.query.from == 'index' && uploader.value.chooseFile();
  const res = await orderContentEcho({ productCode: route.query.productCode, lastOrderNo: orderNo });
  orderNo = res.data.orderNo;
  router.replace({ path: '/selectFiles', query: { ...route.query, from: '', orderNo } });
})

onBeforeUnmount(() => {
  cropper && cropper.destroy();
})

</script>

<style lang="scss" scoped>
  .select_files {
    min-height: inherit;
    padding: 8px 0;
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
    position: relative;
    background: #D2F0EA url('@img/file_bg@2x.png') no-repeat 0 0 / 375px auto;
    .select_top {
      @include flex-center;
      padding: 0 20px 13px;
      color: #000;
      .top_back {
        width: 10px;
        height: 21px;
      }
      .top_zwtp {
        width: 122px;
        height: 20px;
        margin: 0 30px 0 95px;
      }
      .top_up {
        width: 77px;
        height: 40px;
      }
    }
    .bot_tip {
      font-size: 10px;
      color: #aaa;
    }
    .bot_btn {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      border-top: $thinBorder;
      padding: 10px;
      background: #fff;
      padding-bottom: calc(10px + env(safe-area-inset-bottom));
      @include flex-center;
      .confirm {
        @include primaryBtn(275px);
      }
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
      height: calc(100vh - 188px - env(safe-area-inset-bottom));
      position: relative;
      &::before {
        content: '';
        position: absolute;
        width: 339px;
        height: 266px;
        top: 0;
        left: 0;
        background: url('@img/selectFiles_bg2.png') no-repeat 0 0 / 339px 266px;
      }
      &::after {
        content: '';
        position: absolute;
        width: 303px;
        height: 280px;
        bottom: 0;
        left: 20px;
        background: url('@img/selectFiles_bg1.png') no-repeat 0 0 / 303px 280px;
      }
    }
    .upload_in {
      position: absolute;
      width: 308px;
      left: 14px;
      top: 24px;
      bottom: 22px;
      background: #fff;
      padding: 24px 0 20px 20px;
      border-radius: 28px;
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
      @include hor-center(330px);
      margin-top: 8px;
      height: 44px;
      background: url('@img/to_edit.png') no-repeat 0 0 / 330px 44px;
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
  }
</style>