<template>
  <div class="setting">
    <div class="operate_list">
      <template v-for="(item, index) in operateList" :key="index">
        <div class="operate_item" @click="routeLink(item.route, item.query, item.method, item.outLink)" v-if="!item.hide">
          <div class="item_name">
            <img class="item_icon" :src="item.icon" alt="">
            {{ item.name }}
          </div>
          <img src="@img/arrow.png" alt="" class="right_arrow">
        </div>
      </template>
    </div>
    <div class="logout_btn" @click="logout">退出登录</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useStore } from '../../stores';
import { getAssetURL, removeLoginInfo } from '@/utils/utils'
import { showDialog, showConfirmDialog, showToast } from 'vant';
import { userLoginOut } from '@/api/index'

const router = useRouter();
const store = useStore();

const operateList = [
  { name: '相关协议', route: '/agreementList', icon: getAssetURL('report_icon.png') },
  { name: '举报/投诉', route: '', icon: getAssetURL('email_icon.png'), outLink: 'https://www.wjx.cn/vm/tLbwYDK.aspx# ' },
  { name: '注销账号', route: '/userSignOut', icon: getAssetURL('logout_icon.png') },
]

  
const routeLink = (path, query={}, method, outLink) => {
  if(typeof method == 'function') method();
  if(outLink) window.open(outLink, '_blank')
  if(!path) return;
  if(path.indexOf('http') > -1) {
    window.location.href = path;
  } else {
    router.push({ path, query })
  }
}

const logout = () => {
  showConfirmDialog({
    title: '确认',
    message: '确认退出登录？',
  }).then(async () => {
    await userLoginOut();
    await removeLoginInfo();
    showToast('已退出登录')
    router.push('/')
  }).catch(() => {})
}

</script>

<style lang="scss" scoped>
  .setting {
    min-height: inherit;
    background: #FCFEFE url('@img/ming_bg@2x.png') no-repeat 0 0 / 375px auto;
    padding-top: 57px;
    position: relative;
    .operate_list {
      @include hor-center(352px);
      background: #fff;
      border-radius: 16px;
      padding: 24px;
    }
    .operate_item {
      cursor: pointer;
      @include flex-between;
      font-size: 14px;
      &:not(:last-child) {
        margin-bottom: 22px;
      }
      .right_arrow {
        width: 10px;
        height: 20px;
      }
    }
    .item_name {
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #000000;
    }
    .item_icon {
      width: 38px;
      height: 38px;
      margin-right: 10px;
    }
    .logout_btn {
      width: 335px;
      text-align: center;
      cursor: pointer;
      position: absolute;
      bottom: 60px;
      left: 50%;
      transform: translate(-50%);
      height: 56px;
      background: linear-gradient( 90deg, #61FDB5 0%, #60F1F5 100%);
      border-radius: 15px;
      font-weight: bold;
      font-size: 16px;
      color: #000;
      padding-top: 20px;
      line-height: 1;
    }
  }
</style>