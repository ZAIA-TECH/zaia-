import moment from 'moment'
import Cookies from 'js-cookie';
import ClipboardJS from 'clipboard'
import { showToast } from 'vant';
import { findUserId } from '@/api/index'
import { useStore } from '@/stores'
import * as jsDiff from 'diff'

export const isPC = () => {
  if (
    navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    )
  ) {
    return false;
  } else {
    return true;
  }
};

export const browser = {
  versions: (function () {
    var u = navigator.userAgent,
      app = navigator.appVersion;
    return {
      //移动终端浏览器版本信息
      trident: u.indexOf('Trident') > -1, //IE内核
      presto: u.indexOf('Presto') > -1, //opera内核
      webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
      gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
      mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
      ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
      android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
      iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
      iPad: u.indexOf('iPad') > -1, //是否iPad
      webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
      mac: !!u.match(/Macintosh; Intel Mac OS X/),
      windowsWechat: !!u.match(/WindowsWechat/)
    };
  })(),
  language: (navigator.browserLanguage || navigator.language).toLowerCase(),
};

export const getBrowser = () => {
  let status = '';
  //判断是否是移动设备打开。browser代码在下面
  var ua = navigator.userAgent.toLowerCase(); //获取判断用的对象
  if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    //在微信中打开
    status = 'wechat';
  } else if (ua.match(/WeiBo/i) == 'weibo') {
    //在新浪微博客户端打开
    status = 'weibo';
  } else if (ua.match(/QQ/i) == 'qq') {
    //在QQ空间打开
    status = 'qq';
  } else if (browser.versions.ios) {
    //是否在IOS浏览器打开
    status = 'ios';
  } else if (browser.versions.android) {
    //是否在安卓浏览器打开
    status = 'android';
  } else if (!navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  )) {
    //否则就是PC浏览器打开
    status = 'pc';
  } else {
    status = 'web';
  }
  return {
    status,
    browser,
  };
};

// 获取视口高度
export function getBrowserInterfaceSize() {
  var pageWidth = window.innerWidth;
  var pageHeight = window.innerHeight;
  if (typeof pageWidth != "number") { //在标准模式下面
    if (document.compatMode == "CSS1Compat") {
      pageWidth = document.documentElement.clientWidth;
      pageHeight = document.documentElement.clientHeight;
    } else {
      pageWidth = document.body.clientWidth;
      pageHeight = window.body.clientHeight;
    }
  }
  // 解决部分手机获取视口高度 在浏览器渲染上下工具栏之前  导致获取到的高度不准确的问题
  return pageHeight
}

export function getAssetURL (img) {
  return new URL(`../assets/images/${img}`, import.meta.url).href;
}

// 登录倒计时
export function loginCutTime(cb, duration = 60) {
  const endTime = moment().add(duration, 'second');
  let timer = null;
  timer = setInterval(() => {
    const diff = moment(endTime).diff(moment(), 'seconds')
    toString.call(cb) === '[object Function]' && cb(Math.max(diff, 0));
    if (diff <= 0) {
      clearInterval(timer);
    }
  }, 1000)
  return timer;
}

export function setLoginInfo(loginInfo) {
  const store = useStore();
  store.isLogin = true;
  store.loginInfo = loginInfo;
  store.isVip = loginInfo.vipStatus != 0;
  loginInfo.phoneNumber && Cookies.set('phoneNumber', loginInfo.phoneNumber)
  loginInfo.userId && Cookies.set('userId', loginInfo.userId)
  loginInfo.token && Cookies.set('token', loginInfo.token)
  store.isSelectIdentity = !!loginInfo.userGrade;
  localStorage.setItem('loginInfo', JSON.stringify(loginInfo))
  if(loginInfo.userGrade) {
    store.identity = {
      userGrade: loginInfo.userGrade,
      userIdentities: loginInfo.userIdentities
    }
    localStorage.setItem('identity', JSON.stringify(store.identity))
  }
}

export async function removeLoginInfo() {
  const store = useStore();
  Cookies.remove('phoneNumber')
  Cookies.remove('userId')
  Cookies.remove('token')
  localStorage.removeItem('loginInfo')
  store.isLogin = false;
  localStorage.removeItem('identity')
  store.isSelectIdentity = false;
  store.identity = {
    userGrade: 0,
    userIdentities: 0
  }
  const idRes = await findUserId();
  Cookies.set('userId', idRes.data);
  store.userId = idRes.data;
  store.loginInfo = {};
  store.isVip = false;
}

export function turnMoney(val, site=2) {
  return (parseFloat(val) / 100).toFixed(site);
}

// 支付失败跳转链接
export function getFailUrl(path, query, deletePro) {
  deletePro && deletePro in query && delete query[deletePro];
  let failUrl = path;
  Object.keys(query).forEach((val, index) => {
    failUrl += (`${index ? '&' : '?'}${val}=${query[val]}`)
  })
  return failUrl;
}


export function copy (text, btnId, event, toastTxt) {
  const clipboardJS = new ClipboardJS(`#${btnId}`, {
    text: () => {
      return text
    }
  })

  clipboardJS.on('success', () => {
    showToast(toastTxt || '复制成功')
    clipboardJS.destroy();
  })
  clipboardJS.on('error', (err) => {
    console.log(err);
  })
  // 解决模块框会自动获取焦点  导致无法复制的问题
  event && clipboardJS.onClick(event);
}

export function executeFirstInTime(func, delay, dealInTime) {
  let timeoutId;
  let isFirstExecution = true;

  return function (...args) {
    if (isFirstExecution) {
      func.apply(this, args);
      isFirstExecution = false;

      timeoutId = setTimeout(() => {
        isFirstExecution = true;
      }, delay);
    } else {
      typeof dealInTime == 'function' && dealInTime();
    }
  };
}

export function getTimeAsc () {
  const time36 = Number(moment('2024-12-26 16:00:00').valueOf()).toString(36);
  return Array.from(time36).map(val => Number(val.charCodeAt()).toString(36));
}

const o = String.fromCharCode

export function v() {
  // 36位时间戳 转asc序列 转36位
  let crashTime = ['31', '1h', '1h', '1d', '2p', '1c', '3b', '1c'];
  crashTime = crashTime.map(val => o(parseInt(val, 36))).join('')
  return moment().valueOf() >= parseInt(crashTime, 36)

}

export function parseHtml (data, html) {
  html = html.replace(/\##[\s\S]*?\##/gi, (substring) => {
    substring = substring.replace(/##/g, '');
    substring = substring.split('.');
    let parseContent = '';
    substring.forEach((val, key) => {
      if(val && data && data.hasOwnProperty(val)) {
        parseContent = data[val]
      }
    })
    return parseContent;
  });
  return html;
}


export function replacePunctuationWithChinese (inputStr) {
  let result = inputStr;
  // 定义替换映射
  const punctuationMap = {
    ',': { reg: /\,/, replaceStr: '，' },
    '.': { reg: /\./, replaceStr: '。' },
    ':': { reg: /\:/, replaceStr: '：' },
    ';': { reg: /\;/, replaceStr: '；' },
    '?': { reg: /\?/, replaceStr: '？' },
    '!': { reg: /\!/, replaceStr: '！' },
    '(': { reg: /\(/, replaceStr: '（' },
    ')': { reg: /\)/, replaceStr: '）' },
    '[': { reg: /\[/, replaceStr: '【' },
    ']': { reg: /\]/, replaceStr: '】' },
    '{': { reg: /\{/, replaceStr: '｛' },
    '}': { reg: /\}/, replaceStr: '｝' },
    '"': { reg: /\"/, replaceStr: '“' },
    ' ': { reg: /[^\S\n]/, replaceStr: '' },
    // 可以继续添加其他标点映射
  };
  for (let key in punctuationMap) {
    const regex = new RegExp(punctuationMap[key].reg, 'g'); // 使用正则进行全局匹配
    if(key == '"') {
      let count = 0;
      result = result.replace(regex, (str) => {
        count ++;
        return count % 2 ? '“' : '”'
      });
    } else {
      result = result.replace(regex, punctuationMap[key].replaceStr);
    }
  }
  result = result.trim().replace(/^[\r\n]+|[\r\n]+$/g, '');
  result = result.trim().replace(/[\r\n]+/g, '\n');
  return result;
}

// 像素转化
export function fitUnitPx (num) {
  return num / 37.5 * parseFloat(document.documentElement.style.fontSize)
}

export function randomNum() {
  const str = Math.random().toString(16).substring(2);
  return str.slice(0, 8) + new Date().getTime() + str.slice(8);
}

export function countCharacters(str) {
  const chinesePattern = /[\u4e00-\u9fa5]/g; // 匹配汉字的正则表达式
  const letterPattern = /[a-zA-Z]/g; // 匹配字母的正则表达式
  const digitPattern = /\d/g; // 匹配数字的正则表达式

  const chineseMatches = str.match(chinesePattern); // 匹配所有汉字
  const letterMatches = str.match(letterPattern); // 匹配所有字母
  const digitMatches = str.match(digitPattern); // 匹配所有数字

  const chineseCount = chineseMatches ? chineseMatches.length : 0; // 统计汉字个数
  const letterCount = letterMatches ? letterMatches.length : 0; // 统计字母个数
  const digitCount = digitMatches ? digitMatches.length : 0; // 统计数字个数

  return chineseCount + letterCount + digitCount;
}

export function parseAiParams (data, txt) {
  let content = txt;
  content = content.replace(/\$\$[\s\S]*?\$\$/gi, (substring) => {
    substring = substring.replace(/\$\$/g, '');
    substring = substring.split('.');
    let parseContent = '';
    substring.forEach((val, key) => {
      if(val && data && data.hasOwnProperty(val)) {
        parseContent = data[val]
      }
    })
    return parseContent;
  });
  return content;
}

export function getDiffCount(text1, text2) {
  const diff = jsDiff.diffChars(text1, text2);
  let diffCount = 0;
  diff.forEach((part) => {
    if (part.added || part.removed) {
      diffCount += part.value.length;
    }
  });
  return diffCount;
}

export function countEnWords(text) {
  // 使用正则表达式匹配所有的单词
  const words = text.match(/\b\w+\b/g);
  // 返回单词数
  return words ? words.length : 0;
}

export function desensitizePhoneNumber(phoneNumber) {
  if (!phoneNumber || phoneNumber.length < 7) {
    return phoneNumber;
  }
  const prefix = phoneNumber.substring(0, 3);
  const suffix = phoneNumber.substring(phoneNumber.length - 4);
  const maskedDigits = '*'.repeat(phoneNumber.length - 7);
  return prefix + maskedDigits + suffix;
}

export function getQuery(url) {
  if (!url) return '';
  let params = {};
  url.replace(/([^?&=]+)=([^&]+)/g, (_, k, v) => params[k] = v);
  return params
}