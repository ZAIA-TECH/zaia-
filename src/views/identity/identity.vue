<template>
  <div class="identity">
    <img src="@img/jiantou@2x.png" class="back_icon" alt="" @click="backIndex">
    <img src="@img/wz@2x.png" class="i_top_title" alt="">
    <div class="type_title">小学</div>
    <div class="tyep_list">
      <div :class="{'type_item': 1, 'active': userGrade == item.id}" v-for="item in primarySchool" :key="item.id" @click="selectGrade(item.id)">{{item.grade}}</div>
    </div>
    <div class="type_title">初高中</div>
    <div class="tyep_list">
      <div :class="{'type_item': 1, 'active': userGrade == item.id}" v-for="item in highSchool" :key="item.id" @click="selectGrade(item.id)">{{item.grade}}</div>
    </div>
    <div class="type_title">大学</div>
    <div class="tyep_list">
      <div :class="{'type_item': 1, 'active': userGrade == item.id}" v-for="item in university" :key="item.id" @click="selectGrade(item.id)">{{item.grade}}</div>
    </div>
    <div class="bot_title type_title">您的身份？</div>
    <div class="tyep_list">
      <div :class="{'type_item': 1, 'active': userIdentities == item.id}" v-for="item in identities" :key="item.id" @click="selectIdentity(item.id)">{{item.identity}}</div>
    </div>
    <div :class="{'comfir_btn': 1, 'forbid_btn': !userGrade || !userIdentities}" @click="comfirIdentity">立即使用</div>
  </div>
</template>

<script setup>
import dictionary from '@/utils/dictionary.js'
import { ref } from 'vue';
import { showToast } from 'vant'
import { updateIdentities } from '@/api/index'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '@/stores'

const primarySchool = dictionary.userGrade.filter(val => val.type == 'primary');
const highSchool = dictionary.userGrade.filter(val => val.type == 'high');
const university = dictionary.userGrade.filter(val => val.type == 'university');
const identities = dictionary.userIdentities;

const route = useRoute();
const router = useRouter();
const store = useStore();
const identity = store.identity;

const userGrade = ref(identity ? identity.userGrade : '');
const userIdentities = ref(identity ? identity.userIdentities : '');

const selectGrade = (id) => {
  userGrade.value = id;
}

const selectIdentity = (id) => {
  userIdentities.value = id;
}

const comfirIdentity = async () => {
  if(!userGrade.value) {
    showToast('请选择年级')
    return;
  }
  if(!userIdentities.value) {
    showToast('请选择身份')
    return;
  }
  const res = await updateIdentities({ 
    userGrade: userGrade.value, 
    userIdentities: userIdentities.value 
  })
  store.identity = {
    userGrade: userGrade.value, 
    userIdentities: userIdentities.value 
  }
  localStorage.setItem('identity', JSON.stringify(store.identity))
  store.isSelectIdentity = true;
  if(route.query.backPath) {
    router.replace(decodeURIComponent(route.query.backPath))
  } else {
    router.push('/')
  }
}

const backIndex = () => {
  history.go(-1);
}

</script>

<style lang="scss" scoped>
.identity {
  min-height: inherit;
  background: #fff url('@img/bg@2x.png') no-repeat 0 0 / 375px auto;
  padding: 20px;
  .back_icon {
    width: 19px;
    height: 11px;
    display: block;
  }
  .i_top_title {
    width: 231px;
    height: 68px;
    display: block;
    margin-top: 24px;
    margin-bottom: 16px;
  }
  .type_title {
    font-family: FZB;
    font-size: 15px;
    line-height: 1;
    margin-bottom: 15px;
  }
  .tyep_list {
    @include flex-between;
    flex-flow: row wrap;
    margin-bottom: 12px;
  }
  .type_item {
    width: 104px;
    line-height: 1;
    text-align: center;
    height: 32px;
    border: 1px solid #C1CBC9;
    border-radius: 8px;
    font-size: 12px;
    padding: 10px 0;
    margin-bottom: 15px;
    color: #000000;
    &.active {
      background: #78F9C1;
    }
  } 
  .bot_title {
    text-align: center;
  }
  .comfir_btn {
    @include hor-center(335px);
    height: 48px;
    line-height: 1;
    font-family: FZB;
    background: linear-gradient(90deg, #60F5BA, #60F1F6);
    font-size: 20px;
    text-align: center;
    padding-top: 13px;
    border-radius: 8px;
    margin-top: 15px;
    &.forbid_btn {
      background: #ddd;
      color: #666;
    }
  }
}
</style>