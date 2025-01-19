import { createRouter, createWebHistory } from 'vue-router'
import { setLoginInfo } from '@/utils/utils'
import { useStore } from '../stores'
import Cookies from 'js-cookie'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_ROUTER_BASE),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/tabs/index',
      component: () => import('@/views/home.vue'),
      children: [
        {
          path: '/tabs',
          name: 'tabs',
          redirect: '/tabs/index',
          component: () => import('@/views/tabs/tabs.vue'),
          children: [
            {
              path: 'index',
              name: 'Index',
              meta: {
                title: '首页'
              },
              component: () => import('@/views/tabs/index.vue')
            },
            {
              path: 'mine',
              name: 'Mine',
              meta: {
                title: '我的'
              },
              component: () => import('@/views/tabs/mine.vue')
            }
          ]
        },
        {
          path: '/correctComposition',
          name: 'CorrectComposition',
          component: () => import('@/views/correctComposition/correctComposition.vue')
        },
        {
          path: '/selectFiles',
          name: 'SelectFiles',
          meta: {
            title: '上传图片'
          },
          component: () => import('@/views/correctComposition/selectFiles.vue')
        },
        {
          path: '/myWallet',
          name: 'MyWallet',
          meta: {
            title: '我的钱包'
          },
          component: () => import('@/views/myWallet/myWallet.vue')
        },
        {
          path: '/correctionReport',
          name: 'CorrectionReport',
          meta: {
            title: '批改报告'
          },
          component: () => import('@/views/correctionReport/correctionReport.vue')
        },
        {
          path: '/freeAccessCoin',
          name: 'FreeAccessCoin',
          meta: {
            title: '免费得学币'
          },
          component: () => import('@/views/freeAccessCoin/freeAccessCoin.vue')
        },
        {
          path: '/report',
          name: 'Report',
          meta: {
            title: '我的报告'
          },
          component: () => import('@/views/report/report.vue')
        },
        {
          path: '/userSignOut',
          name: 'UserSignOut',
          meta: {
            title: '账号注销'
          },
          component: () => import('@/views/userSignOut/userSignOut.vue')
        },
        {
          path: '/agreementList',
          name: 'AgreementList',
          meta: {
            title: '相关协议'
          },
          component: () => import('@/views/agreementList/agreementList.vue')
        },
        {
          path: '/login',
          name: 'Login',
          meta: {
            title: '登录',
            keepAlive: true
          },
          component: () => import('@/views/login/login.vue')
        },
        {
          path: '/identity',
          name: 'Identity',
          meta: {
            title: '信息选择'
          },
          component: () => import('@/views/identity/identity.vue')
        },
        {
          path: '/aiChat',
          name: 'AiChat',
          meta: {
            title: '全科家教-小雅老师'
          },
          component: () => import('@/views/aiChat/aiChat.vue')
        },
        {
          path: '/vip',
          name: 'Vip',
          meta: {
            title: '会员中心'
          },
          component: () => import('@/views/vip/vip.vue')
        },
        {
          path: '/vipAgreement',
          name: 'VipAgreement',
          meta: {
            title: '会员协议'
          },
          component: () => import('@/views/vip/vipAgreement.vue')
        },
        {
          path: '/setting',
          name: 'Setting',
          meta: {
            title: '设置'
          },
          component: () => import('@/views/setting/setting.vue')
        },
        {
          path: '/feedBackList',
          name: 'FeedBackList',
          meta: {
            title: '反馈列表'
          },
          component: () => import('@/views/feedBackList/feedBackList.vue')
        },
        {
          path: '/customFeedBack',
          name: 'CustomFeedBack',
          meta: {
            title: '定制反馈'
          },
          component: () => import('@/views/customFeedBack/customFeedBack.vue')
        },
        {
          path: '/classList',
          name: 'ClassList',
          meta: {
            title: '班级列表'
          },
          component: () => import('@/views/classList/classList.vue')
        },
        {
          path: '/classDetail',
          name: 'classDetail',
          meta: {
            title: '班级设置'
          },
          component: () => import('@/views/classDetail/classDetail.vue')
        },
        {
          path: '/classAssignment',
          name: 'classAssignment',
          meta: {
            title: '班级作业'
          },
          component: () => import('@/views/classAssignment/classAssignment.vue')
        },
        {
          path: '/classCorrect',
          name: 'classCorrect',
          meta: {
            title: '批改要求'
          },
          component: () => import('@/views/classAssignment/classCorrect.vue')
        },
        {
          path: '/assignmentDetail',
          name: 'assignmentDetail',
          meta: {
            title: '作业详情'
          },
          component: () => import('@/views/classAssignment/assignmentDetail.vue')
        },
        {
          path: '/taskDetail',
          name: 'taskDetail',
          meta: {
            title: '作业批改详情'
          },
          component: () => import('@/views/taskDetail/taskDetail.vue')
        },
        {
          path: '/test',
          name: 'Test',
          meta: {
            keepAlive: true
          },
          component: () => import('@/views/correctionReport/enParagraphEdit.vue')
        }
      ]
    }
  ],
  scrollBehavior() {
    return {
      top: 0
    }
  }
})

const whitePageName = ['Index', 'Login', 'Identity', 'Mine']

router.beforeEach((to, from, next) => {
  const store = useStore()
  if (to.query.userId && to.query.token) {
    const loginInfo = {
      userId: to.query.userId,
      token: to.query.token,
      userGrade: to.query.userGrade,
      userIdentities: to.query.userIdentities,
      vipStatus: to.query.vipStatus
    }
    setLoginInfo(loginInfo)
    store.userId = to.query.userId
    store.isLogin = true
  }
  document.title = to.query.documentTitle || to.meta?.title || '作文说'
  if (to.name == 'CorrectComposition') {
    document.title = to.query.type == 'zh' ? '中文作文批改' : '英文作文批改'
  }
  if (whitePageName.indexOf(to.name) == -1 && !Cookies.get('token')) {
    // store.showLogin = true;
    next({ path: '/login', query: { backPath: encodeURIComponent(to.fullPath) } })
    if (from.name !== 'Index' && from.name !== 'Mine') {
      return { name: 'Index' }
    }
    return false
  }
  if (whitePageName.indexOf(to.name) == -1 && !store.isSelectIdentity) {
    next({ path: '/identity', query: { backPath: encodeURIComponent(to.fullPath) } })
    if (from.name !== 'Index' && from.name !== 'Mine') {
      return { name: 'Index' }
    }
    return false
  }
  if (store.source && !to.query.source) {
    to.query.source = store.source
    next(to)
  } else {
    next()
  }
})

export default router
