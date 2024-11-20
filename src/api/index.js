import service from "./http";
import api from './api'

export async function userLogin (data) {
  const url = api.userLogin;
  return await service.post(url, data)
}

export async function sendVerificationCode (params) {
  const url = api.sendVerificationCode;
  return await service.get(url, { params })
}

export async function findUserId (params) {
  const url = api.findUserId;
  return await service.get(url, { params })
}

export async function orderContentEcho (params) {
  const url = api.orderContentEcho;
  return await service.get(url, { params })
}

export async function orderImageParsing (data, config={}) {
  let url = api.orderImageParsing;
  return await service.post(url, data, { 
    isloading: false,
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data'
    } 
  })
}

export async function orderCreate (data) {
  const url = api.orderCreate;
  return await service.post(url, data)
}

export async function orderPay (params) {
  const url = api.orderPay;
  return await service.get(url, { params })
}

export async function productFindWallet (params) {
  const url = api.productFindWallet;
  return await service.get(url, { params })
}

export async function orderCreateGold (params) {
  const url = api.orderCreateGold;
  return await service.get(url, { params })
}

export async function userDetail (data) {
  const url = api.userDetail;
  return await service.post(url, data)
}

export async function orderDetail (params) {
  const url = api.orderDetail;
  return await service.get(url, { params, isloading: false })
}

export async function bindInvitationCode (params) {
  const url = api.bindInvitationCode;
  return await service.get(url, { params })
}

export async function orderSubmitAnswer (data) {
  const url = api.orderSubmitAnswer;
  return await service.post(url, data)
}

export async function orderGetToken (params) {
  const url = api.orderGetToken;
  return await service.get(url, { params })
}

export async function userFind (params) {
  const url = api.userFind;
  return await service.get(url, { params })
}

export async function orderFind (data) {
  const url = api.orderFind;
  return await service.post(url, data)
}

export async function userSignOut (params) {
  const url = api.userSignOut;
  return await service.get(url, { params })
}

export async function userLoginOut (params) {
  const url = api.userLoginOut;
  return await service.get(url, { params })
}

export async function updateIdentities (data) {
  const url = api.updateIdentities;
  return await service.post(url, data)
}

export async function orderHomepageFind () {
  const url = api.orderHomepageFind;
  return await service.post(url)
}

export async function saveChatMessage (data) {
  const url = api.saveChatMessage;
  return await service.post(url, data, { isloading: false })
}

export async function requestUrl () {
  const url = api.requestUrl;
  return await service.get(url)
}

export async function getChatMessage (data) {
  const url = api.getChatMessage;
  return await service.post(url, data)
}

export async function chatEvaluation (data) {
  const url = api.chatEvaluation;
  return await service.post(url, data)
}

export async function glmToken () {
  const url = api.glmToken;
  return await service.get(url)
}

export async function passagesSave (data) {
  const url = api.passagesSave;
  return await service.post(url, data, { isloading: false })
}

export async function parseGeneration (data) {
  const url = api.parseGeneration;
  return await service.post(url, data)
}

export async function reportKudos (data) {
  const url = api.reportKudos;
  return await service.post(url, data)
}

export async function orderRecast (params) {
  const url = api.orderRecast;
  return await service.get(url, { params })
}

export async function chatMessageSave (data) {
  const url = api.chatMessageSave;
  return await service.post(url, data)
}

export async function memberCenter () {
  const url = api.memberCenter;
  return await service.get(url)
}

export async function createVip (params) {
  const url = api.createVip;
  return await service.get(url, { params })
}

export async function goldPayVip (params) {
  const url = api.goldPayVip;
  return await service.get(url, { params })
}

export async function checkCorrection () {
  const url = api.checkCorrection;
  return await service.get(url)
}

export async function signature(params) {
  const url = api.signature;
  return await service.get(url, { params })
}

export async function agentAdd (data) {
  const url = api.agentAdd;
  return await service.post(url, data)
}

export async function agentUpdate (data) {
  const url = api.agentUpdate;
  return await service.post(url, data)
}

export async function agentGet (params) {
  const url = api.agentGet;
  return await service.get(url, { params })
}

export async function agentDelete(params) {
  const url = api.agentDelete;
  return await service.get(url, { params })
}

export async function updateTitle (params) {
  const url = api.updateTitle;
  return await service.get(url, { params })
}

export async function updateReporting (data) {
  const url = api.updateReporting;
  return await service.post(url, data)
}

export async function reportingOverride (data) {
  const url = api.reportingOverride;
  return await service.post(url, data, { loadingMsg: '重写中...' })
}

export async function exportWordReport (data){
  const url = api.exportWordReport;
  return await service.post(url,data) //应该不要“导出中”吧...
}

export async function touchMessage (params) {
  const url = api.touchMessage;
  return await service.get(url, { params, loadingMsg: '润色中...' })
}

export async function agentPreviews (data) {
  const url = api.agentPreviews;
  return await service.post(url, data, { loadingMsg: '生成中...' })
}

export async function agentUseShardingCode (params) {
  const url = api.agentUseShardingCode;
  return await service.get(url, { params })
}

export async function agentGetOne (params) {
  const url = api.agentGetOne;
  return await service.get(url, { params })
}



// 微信PC支付
export async function nativePay(data) {
  const url = api.nativePay;
  return await service.get(url, { params: data })
}

// 支付宝PC支付
export async function aliPayWebWebsite(data) {
  const url = api.aliPayWebWebsite;
  return await service.get(url, { params: data });
}

// 支付宝web支付
export async function aliPayAppWebsite(data) {
  const url = api.aliPayAppWebsite;
  return await service.get(url, { params: data });
}


