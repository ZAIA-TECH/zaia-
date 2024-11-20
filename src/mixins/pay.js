import { isPC, getBrowser, getFailUrl } from '@/utils/utils.js';
import { aliPayWebWebsite, aliPayAppWebsite, nativePay } from '@/api/index.js'
import { showLoadingToast } from 'vant';
import { useStore } from '../stores';

export default (orderNo, engineeringUrl, route) => {
  const store = useStore();
  let returnUrlModelAliPay = '';
  let returnUrlPcAliPay = '';
  const payType = {
    modelAlipay: 'modelAlipay',
    pcAlipay: 'pcAlipay',
  };
  const payBackBaseUrl = import.meta.env.VITE_APP_OUTPUTDIR;


  const getSuccessUrl = (successUrl) => {
    return payBackBaseUrl + successUrl;
  }
  // 微信支付
  const handleWechatPay = (successUrl, failUrl) => {
    showLoadingToast({ type: 'loading', forbidClick: true, duration: 3000 })
    const { path, query } = route;

    successUrl = getSuccessUrl(successUrl);      
    
    failUrl = payBackBaseUrl + (failUrl || getFailUrl(path, query))
    if (isPC()) {
      handlePcWechatPay(successUrl);
    } else if (getBrowser().status === 'wechat') {
      window.location.href = engineeringUrl + '/wx/pay/obtain/code?orderNo=' + orderNo + '&failUrl=' + encodeURIComponent(failUrl) + '&successUrl=' + encodeURIComponent(successUrl);
    } else {
      window.location.href = engineeringUrl + '/wx/pay/h5/view?orderNo=' + orderNo + '&failUrl=' + encodeURIComponent(failUrl) + '&successUrl=' + encodeURIComponent(successUrl);
    }
  }
  
  // 微信PC端支付
  const handlePcWechatPay = async (successUrl) => {
    const data = {
      orderNo: orderNo,
    }
    const result = await nativePay(data);
    if (result.code == 200) {
      if (!result.data.payStatus) {
        $router.push({
          path: '/pcPay',
          query: {
            successUrl,
            orderNo: orderNo,
            qr_url: result.data.codeUrl,
            source: store.source || 'defaultCode'
          },
        });
      } else if (result.data.payStatus == 1) {
        $router.push({
          path: '/orderDetail',
          query: {
            orderNo: orderNo,
          },
        });
      }
    }
  }

  // 支付宝支付
  const handleAliPay = (successUrl) => {
    showLoadingToast({ type: 'loading', forbidClick: true, duration: 3000 })
    if (isPC()) {
      handlePcAliPay(successUrl);
    } else {
      handleModelAlipy(successUrl);
    }
  }
  // 支付宝PC端支付
  const handlePcAliPay = async (successUrl) => {

    successUrl = getSuccessUrl(successUrl);

    returnUrlPcAliPay = successUrl + '&brower_pay_type=' + payType.pcAlipay;
    const data = {
      orderNo: orderNo,
      channelPaypointId: '',
      successUrl: returnUrlPcAliPay,
    }
    const result = await aliPayWebWebsite(data)
    if (result.code == 200) {
      const payFormDom = document.querySelector('#payForm');
      payFormDom.innerHTML = result.data;
      document.forms[0].submit();
    }
  }
  // 支付宝手机支付
  const handleModelAlipy = async (successUrl) => {
    successUrl = getSuccessUrl(successUrl);
    returnUrlModelAliPay = successUrl + '&brower_pay_type=' + payType.modelAlipay;
    const data = {
      orderNo: orderNo,
      channelPaypointId: '',
      successUrl: returnUrlModelAliPay,
    }
    const result = await aliPayAppWebsite(data)
    if (result.code == 200) {
      const payFormDom = document.querySelector('#payForm');
      payFormDom.innerHTML = result.data;
      document.forms[0].submit();
    }
  }

  return {
    getSuccessUrl,
    handleWechatPay,
    handlePcWechatPay,
    handleAliPay,
    handlePcAliPay,
    handleModelAlipy
  }
};