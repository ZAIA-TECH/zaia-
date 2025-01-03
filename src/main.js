import './assets/css/main.css'
import './utils/lib-flexible'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'vant/lib/index.css'
import Vant from 'vant'

import { turnMoney, getBrowser } from '@/utils/utils'

import { signature } from '@/api/index'

import App from './App.vue'
import router from './router'

// 日志插件
import eruda from 'eruda'
console.log(import.meta.env)
import.meta.env.VITE_APP_ENV != 'prod' && eruda.init()

const app = createApp(App)

const isWeChat = getBrowser().status == 'wechat'

app.config.globalProperties.turnMoney = turnMoney
app.config.globalProperties.payDomin = 'https://www.zuowenshuo.cn' + import.meta.env.VITE_APP_API_BASEURL
app.config.globalProperties.isWechat = isWeChat

isWeChat &&
  signature({ url: encodeURIComponent(location.href.split('#')[0]) }).then((res) => {
    wx.config({
      // debug: import.meta.env.VITE_APP_ENV != 'prod' ? true : false, // 开启调试模式,调用的所有 api 的返回值会在客户端 alert 出来，若要查看传入的参数，可以在 pc 端打开，参数信息会通过 log 打出，仅在 pc 端时才会打印。
      debug: false,
      timestamp: res.data.timestamp, // 必填，生成签名的时间戳
      nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
      signature: res.data.signature, // 必填，签名
      appId: res.data.appId, // 必填，公众号的唯一标识
      openTagList: ['wx-open-launch-weapp'],
      jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'] // 必填，需要使用的 JS 接口列表
    })
  })

app.use(createPinia())
app.use(router)
app.use(Vant)

app.mount('#app')
