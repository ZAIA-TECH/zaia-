import axios from 'axios';
import { showToast, showLoadingToast } from 'vant';

// 创建axios实例
const service = axios.create({
  baseURL: '/chatBase',
  timeout: 300000, // 请求超时时间
  // withCredentials: true,
});

function closeLoading(config) {
  config && config.toastLoading && config.toastLoading.close();
}
// request拦截器
service.interceptors.request.use(
  (config) => {
    console.log(config);
    if (config.isloading !== false) {
      config.toastLoading = showLoadingToast({
        duration: 0, // 持续展示 toast
        forbidClick: true, // 禁用背景点击
        type: 'loading',
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
    console.log('----------------RES', response.body)
    closeLoading(response.config);
    if (response.data.code === 200) {
      return response.data;
    } else {
      // mySessage.fail(response.data.message);
      mySessage(response.data.message);
      // 未登录
      if(response.data.code == 403) {
       
      } else if(response.data.code == 853 || response.data.code == 855) {
        return response.data;
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
      showToast(error.desc);
    } else if (error && ('err' + error).indexOf('timeout') != -1) {
      error.desc = '请求超时';
      showToast(error.desc);
    }
    return Promise.reject(error);
  }
);


async function axiosFetch(url, method, data, config) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: 'Bearer ef234572-3246-404d-9b07-68fe20477758'
    },
    ...config,
    body: JSON.stringify(data)
  })

  config.repeatCount && config.repeatCount--;

  if (!response.ok || !response.body) {
    console.log('---------------重新请求', config.repeatCount)
    // config.repeatCount && axiosFetch(url, method, data, config)
    // if(config.repeatCount == 0) {
    //   smsChatbaseError();
    //   store.commit('stateUpdate', {
    //     showAiErrorComfirm: true
    //   })
    // }
    config.repeatCount === 0 && showToast('AI故障\n请联系网络管理员');
    return;
  }

  // response.controller = controller
  return response;
}

service.fetchPost = async (url, data, config={}) => {
  return await axiosFetch(url, 'POST', data, config)
}

export default service;