// 辅助函数：将数据 URL 转换为 Blob 对象
export const dataURLtoBlob = (dataURL) => {
  const parts = dataURL.split(',')
  const mimeString = parts[0].split(':')[1].split(';')[0]
  const byteString = atob(parts[1])
  let arrayBuffer = new ArrayBuffer(byteString.length)
  let intArray = new Uint8Array(arrayBuffer)
  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i)
  }
  return new Blob([arrayBuffer], { type: mimeString })
}

export const dataToFile = (compressedDataURL, file) => {
  // 将数据 URL 转换为 Blob 对象
  const compressedFile = dataURLtoBlob(compressedDataURL)
  const filename = file.name

  // 将数据 Blob 转换为 File 对象
  const newFile = new File([compressedFile], filename, { type: file.type })
  // 替换原来的文件
  return { file: newFile, content: compressedDataURL, objectUrl: URL.createObjectURL(newFile) }
}

// 创建一个函数来压缩图像
export const compressImage = (file, maxWidth, maxHeight, quality) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function (event) {
      const img = new Image()
      img.src = event.target.result
      img.onload = function () {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // 根据最大宽度和最大高度计算新的尺寸
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }

        // 设置 canvas 尺寸
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')

        // 在 canvas 上绘制压缩后的图像
        ctx.drawImage(img, 0, 0, width, height)

        // 将 canvas 转换为压缩后的图像数据 URL
        const compressedDataURL = canvas.toDataURL('image/jpeg', quality)

        dataToFile(compressedDataURL, file)

        resolve()
      }
    }
    reader.onerror = function (error) {
      reject(error)
    }
  })
}
