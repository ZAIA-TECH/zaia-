import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { getQuery, getBrowser } from '@/utils/utils'

export const useStore = defineStore('index', {
  state: () => {
    const showLogin = ref(false);
    const userId = Cookies.get('userId')
    const isLogin = !!Cookies.get('token')
    // 用户身份
    let identity = localStorage.getItem('identity');
    identity = identity ? JSON.parse(identity) : '';
    const isSelectIdentity = identity && !!identity.userGrade;
    let loginInfo = localStorage.getItem('loginInfo')
    loginInfo = loginInfo ? JSON.parse(loginInfo) : {};
    const query = getQuery(window.location.href);

    return {
      showLogin,
      userId,
      isLogin,
      correctContent: '',
      correctTitle: '',
      innerHeight: 0,
      pickerParams: '',
      isApp: false,
      isSelectIdentity,
      identity,
      glmToken: '',
      phoneNumber: loginInfo.phoneNumber,
      isVip: loginInfo.vipStatus != 0,
      loginInfo,
      source: query.source || 'default',
      hideDot: !!window.localStorage.getItem('hideDot'),
      isWechat: getBrowser().status == 'wechat',
      hideImagesExample: !!window.localStorage.getItem('hideImagesExample'),
      checkedAgents: reactive([]),
      fileList: [],
      viewContent: {content: '', title: ''}
    }
  }
})
