import axios from 'axios';
import { showToast, showLoadingToast, showFailToast } from 'vant';
import Cookies from 'js-cookie'
import { useStore } from '@/stores'
import { removeLoginInfo } from '@/utils/utils'
import { findUserId } from '@/api'
import router from '@/router'

const toast = (message) => {
  return showToast({
    message,
    duration: 2000,
    forbidClick: true
  })
}

const whiteErrorCode = [844, 878, 888]

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASEURL,
  timeout: 300000, // 请求超时时间
  withCredentials: true
});

function closeLoading(config) {
  config && config.toastLoading && config.toastLoading.close();
}
// request拦截器
service.interceptors.request.use(
  (config) => {
    if (config.isloading !== false) {
      config.toastLoading = showLoadingToast({
        duration: 0, // 持续展示 toast
        forbidClick: true, // 禁用背景点击
        type: 'loading',
        message: config.loadingMsg || '',
      });
    } else {
      config.toastLoading = null;
    }
    return config;
  },
  function (error) {
    closeLoading(config);
    // 对请求错误做些什么
    return Promise.reject(error);
  },
  (error) => {
    closeLoading(config);
    Promise.reject(error);
  }
);

// respone拦截器
service.interceptors.response.use(
  (response) => {
    closeLoading(response.config);
    if (response.data.code === 200 || response.config.url.indexOf('/ali/pay/') > -1 || whiteErrorCode.indexOf(response.data.code) > -1) {
      whiteErrorCode.indexOf(response.data.code) > -1 && toast(response.data.message);
      return response.data;
    } else {
      toast(response.data.message);
      // 未登录
      if(response.data.code == 403) {
        setTimeout(() => {
          const store = useStore();
          store.showLogin = true;
          router.push({ path: '/tabs/index' })
          removeLoginInfo();
          findUserId().then(res => {
            Cookies.set('userId', res.data);
          })
        }, 2000)
        return Promise.reject(new Error(response.data.message));
      } else if (whiteErrorCode.indexOf(response.data.code) > -1) {

      } else {
        return Promise.reject(new Error(response.data.message));
      }
    }
  },
  (error) => {
    closeLoading(error.config);
    if (error && error.response) {
      switch (error.response.status) {
        case 400:
          error.desc = '请求错误';
          break;
        case 401:
          error.desc = '未授权，请登录';
          break;
        case 403:
          error.desc = '拒绝访问';
          break;
        case 404:
          error.desc = `请求地址出错: ${error.response.config.url}`;
          break;
        case 408:
          error.desc = '请求超时';
          break;
        case 500:
          error.desc = '服务器内部错误';
          break;
        case 501:
          error.desc = '服务未实现';
          break;
        case 502:
          error.desc = '网关错误';
          break;
        case 503:
          error.desc = '服务不可用';
          break;
        case 504:
          error.desc = '网关超时';
          break;
        case 505:
          error.desc = 'HTTP版本不受支持';
          break;
        default:
          error.desc = '网络不佳，请检查网络后再试';
      }
      showFailToast(error.desc);
    } else if (error && ('err' + error).indexOf('timeout') != -1) {
      error.desc = '请求超时';
      showFailToast(error.desc);
    }
    return Promise.reject(error);
  }
);

async function axiosFetch(url, method, data, Authorization, callBack, config) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization,
      'Content-Type': 'application/json; charset=UTF-8'
    },
    ...config,
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw Error(errorData.message);
  }

  const resData = response.body;
  if (!resData) {
    throw Error('GLM4返回错误');
  }
  
  const reader = resData.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let firstStream = true;

  while (!done) {
    const { value } = await reader.read();
    let str = decoder.decode(value);
    done = !str;
    let message = '';
    const aiInfo = {
      model: '',
      prompt: '',
      request_id: '',
      usage: '',
    }
    if(!done) {
      str = str.replace(/data:/g, '')
      if(str.indexOf('\n') > -1) {
        str = str.split('\n');
      }
      try {
        if(Array.isArray(str)) {
          str.forEach(val => {
            done = val.indexOf('DONE') > -1;
            const msgItem = val && !done ? JSON.parse(val) : '';
            message += (msgItem ? msgItem.choices[0].delta.content : '')
            if(msgItem.usage) {
              aiInfo.model = msgItem.model;
              aiInfo.request_id = msgItem.id;
              aiInfo.usage = msgItem.usage;
            }
          })
        } else {
          const msgItem = str ? JSON.parse(str) : '';
          message = msgItem.choices[0].delta.content;
        }
      } catch(err) {
        console.error(err);
      } 
    }
    typeof callBack == 'function' && callBack({
      aiInfo,
      done,
      message,
      firstStream,
    })
    firstStream = false;
  }
}

service.fetchPost = async (url, data, Authorization, callBack, config={}) => {
  return await axiosFetch(url, 'POST', data, Authorization, callBack, config)
}

export default service;