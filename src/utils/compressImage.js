// compressImage.js

/**
 * 将 base64 转换为 File 对象
 * @param {string} base64Data - base64 编码的图片数据
 * @param {File} originalFile - 原始的 File 对象（用于复制原始文件的名字、类型等信息）
 * @returns {File} - 转换后的 File 对象
 */
export function dataToFile(base64Data, originalFile) {
    // 从 base64 数据中提取出 mime 类型
    const arr = base64Data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];

    // 通过 base64 解码为二进制数据
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    // 创建一个新的 File 对象
    const file = new File([u8arr], originalFile.name, { type: mime });
    return file;
}

/**
 * 压缩图片
 * @param {File} file - 原始图片文件
 * @param {number} width - 压缩后的宽度
 * @param {number} height - 压缩后的高度
 * @param {number} quality - 压缩质量，0 - 1 之间
 * @param {function} callback - 压缩完成后的回调函数，传入压缩后的 Blob 对象
 */
export function compressImage(file, width, height, quality, callback) {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function (e) {
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);

    img.onload = function () {
        const w = img.width;
        const h = img.height;
        const scale = w / h;

        // 计算新的宽高，确保比例不变
        const newWidth = width || height * scale;
        const newHeight = height || width / scale;

        // 创建 canvas 对象用于生成压缩后的图片
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置 canvas 宽高
        canvas.width = newWidth;
        canvas.height = newHeight;

        // 在 canvas 上绘制图片
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // 将 canvas 转换为 base64 数据
        const base64 = canvas.toDataURL('image/jpeg', quality);

        // 调用回调函数，传入转换后的 blob
        callback(convertBase64UrlToBlob(base64));
    };
}

/**
 * 将 base64 转换为 Blob 对象
 * @param {string} urlData - base64 数据
 * @returns {Blob} - 转换后的 Blob 对象
 */
function convertBase64UrlToBlob(urlData) {
    const arr = urlData.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
}
