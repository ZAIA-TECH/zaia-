
import CryptoJS from 'crypto-js'

export const APPID = '1dea7f1f';

const aiConfigs = {
  primary: {
    API_SECRET: 'ZWQwNzk0NDllOWU4ZDBjM2QyZjcxNWNm',
    API_KEY: '3a341a54b885c96aabc90bcf5fc9319c',
    url: 'wss://spark-openapi.cn-huabei-1.xf-yun.com/v1/assistants/dmjzddenong3_v1'
  },
  juniorHigh: {
    API_SECRET: 'ZWQwNzk0NDllOWU4ZDBjM2QyZjcxNWNm',
    API_KEY: '3a341a54b885c96aabc90bcf5fc9319c',
    url: 'wss://spark-openapi.cn-huabei-1.xf-yun.com/v1/assistants/e1xnxc45q48l_v1'
  },
  seniorHigh: {
    API_SECRET: 'ZWQwNzk0NDllOWU4ZDBjM2QyZjcxNWNm',
    API_KEY: '3a341a54b885c96aabc90bcf5fc9319c',
    url: 'wss://spark-openapi.cn-huabei-1.xf-yun.com/v1/assistants/s8esmrv8lgje_v1'
  },
  university: {
    API_SECRET: 'ZWQwNzk0NDllOWU4ZDBjM2QyZjcxNWNm',
    API_KEY: '3a341a54b885c96aabc90bcf5fc9319c',
    url: 'wss://spark-openapi.cn-huabei-1.xf-yun.com/v1/assistants/f56u3vo7apar_v1'
  }
}

export default {
  aiConfigs,
  getWebsocketUrl: (configName) => {
    const { API_KEY, API_SECRET, url } = aiConfigs[configName];
    const apiKey = API_KEY
    const apiSecret = API_SECRET
    const host = location.host
    // const host = 'zuowenshuo.cn'
    const date = new Date().toGMTString()
    const algorithm = 'hmac-sha256'
    const headers = 'host date request-line'
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
    const signature = CryptoJS.enc.Base64.stringify(signatureSha)
    const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
    const authorization = btoa(authorizationOrigin)
    // return `${url}?authorization=${authorization}&date=${date}&host=${host}`
    return `${url}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`
  }
 }
 