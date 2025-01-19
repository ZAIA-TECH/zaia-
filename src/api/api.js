export default {
  userLogin: '/user/login', // 用户登陆
  sendVerificationCode: '/sms/send/verification/code', // 发送短信验证码
  findUserId: '/user/find/userId', // 获取用户id接口

  orderContentEcho: '/order/content/echo', // 内容回显
  orderImageParsing: '/order/image/parsing', // 图片解析

  orderCreate: '/order/create', // 保存订单
  orderPay: '/order/pay', // 订单支付

  productFindWallet: '/product/find/wallet', // 我的钱包页面

  orderCreateGold: '/order/create/gold', // 创建学币订单

  userDetail: '/user/detail', // 免费得学币页面
  bindInvitationCode: '/user/bind/invitation/code', // 绑定邀请码

  orderDetail: '/order/detail', // 查询订单详情

  orderSubmitAnswer: '/order/submit/answer', // 提交解答

  orderGetToken: '/order/get/token', // 获取token

  userFind: '/user/find', // 查询用户信息

  orderFind: '/order/find', // 我的报告
  orderHomepageFind: '/order/homepage', // 首页

  userSignOut: '/user/sign/out', // 注销帐号
  userLoginOut: '/user/login/out', // 退出登陆

  updateIdentities: '/user/update/identities', // 修改用户身份信息

  saveChatMessage: '/order/save/chat/message', // 保存聊天记录
  requestUrl: '/order/request/url', // 获取用户提问签名路径
  getChatMessage: '/order/get/chat/message', // 获取聊天记录
  chatEvaluation: '/order/change/evaluation', // 评价

  aliPayWebWebsite: '/ali/pay/web/website', // 支付宝pc支付接口
  aliPayAppWebsite: '/ali/pay/app/website', // 支付宝手机支付接口
  nativePay: '/wx/pay/native', // 微信PC支付接口接口
  glmToken: '/order/glmToken', // 生成glmToken
  passagesSave: '/order/passages/save', // 段落上传
  parseGeneration: '/order/passages/parse/generation', // 段落解析生成
  reportKudos: '/order/report/kudos', // 得分报告点赞
  orderRecast: '/order/recast', // 重新批改
  chatMessageSave: '/order/chat/message/save', // 订单问小雅内容保存

  memberCenter: '/user/member/center', // 会员中心页
  createVip: '/order/create/vip', // 创建vip订单
  goldPayVip: '/order/gold/pay/vip', // 金币支付vip订单
  checkCorrection: '/order/check/correction', // 批改前判断

  signature: '/order/get/signature', // 获取JS-SDK 权限验证的签名

  agentAdd: '/agent/add', // 添加agent接口
  agentUpdate: '/agent/update', // 修改agent接口
  agentGet: '/agent/get', // 查询agent接口
  agentDelete: '/agent/delete', // 删除agent接口

  agentGetOne: '/agent/get/one', // 获取agent详情

  updateTitle: 'order/update/title', // 编辑标题
  updateReporting: '/order/update/reporting', // 编辑报告
  reportingOverride: '/order/reporting/override', // 精批报告重写

  touchMessage: '/order/touch/message', // 全文润色

  agentPreviews: '/agent/previews', // 预览接口
  agentUseShardingCode: 'agent/use/sharding/code', // 使用分享吗接口

  exportWordReport: '/order/export/word', //导出报告

  classAdd: '/class/add', // 新增班级
  classDel: '/class/del', // 删除班级
  classFind: '/class/find', // 查询所属用户班级
  classUpdate: '/class/update', // 修改班级信息

  studentAdd: '/class/student/add', // 班级内添加学生
  studentDel: '/class/student/del', // 删除学生
  studentUpdate: '/class/student/update', // 修改学生信息

  classSelect: '/class/select', // 查询班级信息（包含学生）

  taskAdd: '/task/add', // 添加作业
  taskUpdateName: '/task/update/name', // 修改作业名称
  taskDel: '/task/del', // 删除作业
  taskFind: '/task/find', // 查询班级作业信息-班级作业页
  taskDetail: '/task/find/detail', // 查询班级作业信息-具体作业页
  taskUpload: '/task/upload', // 上传作业

  taskDelStu: '/task/del/stu', // 删除学生作业

  taskImageParsing: '/order/image/parsing/v2', // 班级批改图片解析

  taskExportWord: '/task/export/word', // 批量导出

  taskGetAnswer: '/task/getAnswer', // 批改详情

  uploadFile: '/knowledgeBase/upload', // 上传文件

  createKnowledgeBase: '/knowledgeBase/create'


}