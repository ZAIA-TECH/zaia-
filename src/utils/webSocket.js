
import { showToast } from "vant";
import { APPID } from '@/utils/signature'
import Cookies from "js-cookie";
import { randomNum } from '@/utils/utils'
import { useStore } from "../stores";
import dictionary from '@/utils/dictionary'

const store = useStore();
const identityObj = dictionary.getUserIdentityObj();
export default class WSocket {
  constructor({ url, msgMaxLength }) {
    this.wsUrl = url;
    this.status = 'unConnect';
    this.ws = '';
    this.sliceIndex = 0;
    this.contextList = [];
    this.msgData = '';
    this.onReceive = '';
    this.onReady = '';
    this.maxTokens = 6000;
    this.msgMaxLength = msgMaxLength;
    this.userGrade = identityObj.grades[store.identity.userGrade].grade
    console.log(this.userGrade);
    this.handleReceive = (event) => {
      this.msgData = event.data ? JSON.parse(event.data) : '';
      if(!this.msgData) return;
      if(this.msgData.header.code != 0) {
        showToast(this.msgData.header.message + '，请联系客服处理');
        return;
      }
      this.onReceive(this.msgData);
    }
    
    this.handleOpen = (event) => {
      this.onReady();
      console.log('websocket连接成功')
    }

    this.handleClose = () => {
      this.ws.removeEventListener('open', this.handleOpen, false)
      this.ws.removeEventListener('message', this.handleReceive, false)
      this.ws.removeEventListener('close', this.handleClose, false)
      this.ws.removeEventListener('error', this.handleError, false)
      console.log('websocket已关闭')
    }

    this.handleError = (event) => {
      console.error('error:', event)
    }
  }
  
  computeCtx (role, content, historyText) {
    console.log('--------------historyText',historyText)
    console.log('--------------this.sliceIndex',this.sliceIndex)
    const list = historyText.slice(this.sliceIndex, historyText.length)
    console.log('--------------list',list)
    const text = [ ...list, { role, content } ]
    const textStr = text.map(val => val.content).join('');
    console.log(textStr.length);
    if(textStr.length > this.maxTokens) {
      const diffCount = Math.floor((textStr.length - this.maxTokens) / this.msgMaxLength)
      this.sliceIndex += (diffCount || 1);
      this.computeCtx(role, content, historyText)
    } else {
      list.unshift({
        role: 'system',
        content: `你是温柔亲和的专业${this.userGrade}全科家庭教师小雅`
      })
      this.contextList = list;
    }
  }

  getFormatParam (role, content, historyText=[], isSave) {
    const text = [ ...historyText, { role, content } ]
    const header = { app_id: APPID, uid: Cookies.get('userId') };
    isSave && (header.sid = randomNum()); 
    return {
      header,
      parameter: {
        chat: { domain: "generalv3", temperature: 0.5, top_k: 4, max_tokens: 4096 }
      },
      payload: {
        message: { text }
      },
    }
  }

  async connect() {
    if ('WebSocket' in window) {
      this.ws = await new WebSocket(this.wsUrl)
    } else if ('MozWebSocket' in window) {
      this.ws = await new MozWebSocket(this.wsUrl)
    } else {
      showToast('浏览器不支持WebSocket')
    }
    
    this.ws.addEventListener('open', this.handleOpen, false)
    this.ws.addEventListener('message', this.handleReceive, false)
    this.ws.addEventListener('close', this.handleClose, false)
    this.ws.addEventListener('error', this.handleError, false)
  }

  send(role, content, historyText=[]) {
    const historyTextList = [];
    historyText.forEach(val => {
      if(val.payload) {
        const text = val.payload.message? val.payload.message.text : val.payload.choices.text;
        historyTextList.push(...text);
      }
    })
    this.computeCtx(role, content, historyTextList)
    const params = this.getFormatParam(role, content, this.contextList);
    console.log('-----------------发送params', params);
    this.ws.send(JSON.stringify(params))
  }
  
  receiveMessage (cb) {
    this.onReceive = (data) => {
      typeof cb == 'function' && cb(data);
    } 
  }

  ready(cb) {
    this.onReady = (data) => {
      typeof cb == 'function' && cb(data);
    } 
  }
}