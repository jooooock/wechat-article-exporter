<template>
  <div class="flex flex-col items-center relative login__type__container login__type__container__scan">
    <h2 class="text-center text-2xl mb-5">登录微信公众平台</h2>
    <img :src="qrcodeSrc || 'https://res.wx.qq.com/mpres/zh_CN/htmledition/pages/login/loginpage/images/default_qrcode_2x6f3177.png'" alt="" class="block w-2/3 login__type__container__scan__qrcode">

    <div class="login__type__container__scan__info">
      <!-- 等待扫码 -->
      <div class="login__type__container__scan__info__inner" v-if="scanLoginType === 0">
        <p class="login__type__container__scan__info__desc">微信扫一扫，选择该微信下的</p>
        <p class="login__type__container__scan__info__desc">公众平台账号登录</p>
      </div>
      <!-- 扫码成功，可登录账号=1 -->
      <div class="login__type__container__scan__info__inner" v-else-if="scanLoginType === 1">
        <div class="login__type__container__scan_mask">
          <div class="login__type__container__scan_mask__inner">
            <mp-icon size="large" icon="success"></mp-icon>
            <h2 class="login__type__container__scan__info__title">扫码成功</h2>
          </div>
        </div>
        <p class="login__type__container__scan__info__desc">请在微信中确认账号登录</p>
        <a href="javascript:;" @click="refreshQrcode">重新扫码</a>
      </div>
      <!-- 扫码成功，可登录账号>1 -->
      <div class="login__type__container__scan__info__inner" v-else-if="scanLoginType === 2">
        <div class="login__type__container__scan_mask">
          <div class="login__type__container__scan_mask__inner">
            <mp-icon size="large" icon="success"></mp-icon>
            <h2 class="login__type__container__scan__info__title">扫码成功</h2>
          </div>
        </div>
        <p class="login__type__container__scan__info__desc">请在微信中选择账号登录</p>
        <a href="javascript:;" @click="refreshQrcode">重新扫码</a>
      </div>
      <!-- 没有可登录账号 -->
      <div class="login__type__container__scan__info__inner login__type__container__scan__noaccount" v-else-if="scanLoginType === 3">
        <div class="login__type__container__scan_mask">
          <div class="login__type__container__scan_mask__inner">
            <mp-icon size="large" icon="warnning"></mp-icon>
            <h2 class="login__type__container__scan__info__title">没有可登录账号</h2>
          </div>
        </div>
        <p class="login__type__container__scan__info__desc">
          该微信还未注册公众平台账号，<a href="https://mp.weixin.qq.com/cgi-bin/registermidpage?action=index&lang=zh_CN">现在去注册</a>
        </p>
        <a href="javascript:;" @click="refreshQrcode">重新扫码</a>
      </div>
      <!-- 登录失败 -->
      <div class="login__type__container__scan__info__inner" v-else-if="scanLoginType === 4">
        <div class="login__type__container__scan_mask">
          <div class="login__type__container__scan_mask__inner">
            <mp-icon size="large" icon="warnning"></mp-icon>
            <h2 class="login__type__container__scan__info__title">登录失败</h2>
          </div>
        </div>
        <p class="login__type__container__scan__info__desc">
          你可以<a href="javascript:;" @click="refreshQrcode">重新扫码</a>
          登录
        </p>
        <p class="login__type__container__scan__info__desc">或使用账号密码登录</p>
      </div>
      <!-- 二维码已过期 -->
      <div class="login__type__container__scan__info__inner" v-else-if="scanLoginType === 5">
        <div class="login__type__container__scan_mask">
          <div class="login__type__container__scan_mask__inner">
            <p class="login__type__container__scan_mask__info">二维码已过期</p>
            <p class="login__type__container__scan_mask__info">
              <a href="javascript:;" @click="refreshQrcode">点击刷新</a>
            </p>
          </div>
        </div>
        <p class="login__type__container__scan__info__desc">微信扫一扫，选择该微信下的</p>
        <p class="login__type__container__scan__info__desc">公众平台账号登录</p>
      </div>
      <!-- 二维码加载失败 -->
      <div class="login__type__container__scan__info__inner" v-else-if="scanLoginType === 6">
        <div class="login__type__container__scan_mask">
          <div class="login__type__container__scan_mask__inner">
            <p class="login__type__container__scan_mask__info">二维码加载失败</p>
            <p class="login__type__container__scan_mask__info">
              <a href="javascript:;" @click="refreshQrcode">点击刷新</a>
            </p>
          </div>
        </div>
        <p class="login__type__container__scan__info__desc">微信扫一扫，选择该微信下的</p>
        <p class="login__type__container__scan__info__desc">公众平台账号登录</p>
      </div>
      <!-- qq号需要绑定邮箱 -->
      <div class="login__type__container__scan__info__inner" v-else-if="scanLoginType === 7">
        <div class="login__type__container__scan_mask">
          <div class="login__type__container__scan_mask__inner">
            <mp-icon size="large" icon="success"></mp-icon>
            <h2 class="login__type__container__scan__info__title">扫码成功</h2>
          </div>
        </div>
        <p class="login__type__container__scan__info__desc">
          该账号尚未绑定邮箱，<a :href='qqBindMailUrl'>前往绑定邮箱</a>
        </p>
        <a href="javascript:;" @click="refreshQrcode">重新扫码</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {LoginAccount, ScanLoginResult, StartLoginResult} from "~/types/types";


const qrcodeSrc = ref('')
const scanLoginType = ref(0)
const qqBindMailUrl = ref('')


const isStopQrcodeTimer = ref(false)
const qrcodeRefreshTimes = ref(0)
const qrcodeTimer = ref<number | null>(null)
const sessionid = new Date().getTime().toString() + Math.floor(Math.random() * 100);
const hasStartLogin = ref(false)

const loginAccount = useLoginAccount()
const activeAccount = useActiveAccount()


useHead({
  title: '登录 | 微信公众号文章导出'
});

// 创建新的登录会话
async function newLoginSession(sid: string) {
  const {data, status, error} = await useFetch<StartLoginResult>(`/api/login/session/${sid}`, {
    method: 'POST'
  })

  if (status.value === 'success' && data.value?.base_resp.ret === 0) {
    return true
  }
  if (error.value) {
    throw error.value
  } else {
    throw new Error(data.value?.base_resp.err_msg)
  }
}

// 获取登录二维码
async function getQrcode() {
  isStopQrcodeTimer.value = false

  try {
    await newLoginSession(sessionid)
    hasStartLogin.value = true
    if (!isStopQrcodeTimer.value) {
      await refreshQrcode()
    }
  } catch (e) {
    scanLoginType.value = 6
  }
}

// 刷新二维码
async function refreshQrcode(e?: any) {
  if (typeof e === 'object' || !e) {
    qrcodeRefreshTimes.value = 0
  }
  stopCheckQrcode()

  if (qrcodeRefreshTimes.value >= 5) {
    scanLoginType.value = 5
  } else {
    scanLoginType.value = 0

    if (!hasStartLogin.value) {
      await getQrcode()
    } else {
      qrcodeSrc.value = `/api/login/getqrcode?rnd=${Math.random()}`
      qrcodeRefreshTimes.value++;
      startCheckQrcode()
    }
  }
}

// 检测二维码扫码状态
function startCheckQrcode(e?: any) {
  qrcodeTimer.value = window.setTimeout(checkQrcode, 1500)
}

function stopCheckQrcode() {
  isStopQrcodeTimer.value = true
  if (qrcodeTimer.value) {
    clearTimeout(qrcodeTimer.value);
    qrcodeTimer.value = null
  }
}

async function checkQrcode() {
  const result = await $fetch<ScanLoginResult>('/api/login/scan', {
    method: 'GET'
  })

  if (result.base_resp && result.base_resp.ret === 0) {
    switch (result.status) {
      case 1:
        await bizLogin()
        break
      case 2:
        await refreshQrcode()
        break
      case 3:
        await refreshQrcode(true)
        break
      case 4:
      case 6:
        if (result.acct_size === 1) {
          scanLoginType.value = 1
        } else if (result.acct_size > 1) {
          scanLoginType.value = 2
        } else {
          scanLoginType.value = 3
        }
        startCheckQrcode(true)
        break
      case 5:
        if (result.binduin) {
          qqBindMailUrl.value = "/cgi-bin/bizunbindqq?action=page&qq=".concat(result.binduin)
          scanLoginType.value = 7
        } else {
          scanLoginType.value = 4
        }
        break
      default:
        startCheckQrcode(true)
    }
  } else {
    scanLoginType.value = 6
  }
}

async function bizLogin() {
  const result = await $fetch<LoginAccount>('/api/login/bizlogin', {
    method: 'POST'
  })

  if (result.err) {
    alert(result.err)
  } else if (result.token) {
    console.log('登录成功')
    loginAccount.value = result

    if (!activeAccount.value) {
      activeAccount.value = {
        type: 'account',
        fakeid: result.fakeid,
        nickname: result.nickname,
        round_head_img: result.avatar,
        service_type: 1,
        alias: '',
        signature: '',
      }
    }

    navigateTo('/', {replace: true})
  } else {
    console.log('系统繁忙，请稍后再试')
  }
}

onMounted(() => {
  getQrcode()
})

onUnmounted(() => {
  stopCheckQrcode()
})
</script>

<style scoped>
.login__type__container__scan .login__type__container__scan__qrcode {
  display: block;
  margin: 0 auto;
  width: 200px;
  height: 200px
}

.login__type__container__scan .login__type__container__scan__info__desc {
  color: #7E8081;
}

.login__type__container__scan .login__type__container__scan__info {
  text-align: center;
  margin: 10px 0;
}

.login__type__container__scan .login__type__container__scan__info__title {
  font-size: 16px;
  margin-top: 5px;
  font-weight: normal
}

.login__type__container__scan .login__type__container__scan_mask {
  display: table;
  position: absolute;
  left: 0;
  text-align: center;
  width: 200px;
  height: 200px;
  margin-top: -210px;
  background-color: rgba(255,255,255,0.96)
}

.login__type__container__scan .login__type__container__scan_mask .weui-desktop-icon {
  margin-top: 10px
}

.login__type__container__scan .login__type__container__scan_mask .weui-desktop-icon.weui-desktop-icon__large.weui-desktop-icon__normal,.login__type__container__scan .login__type__container__scan_mask .weui-desktop-icon.weui-desktop-icon__large.weui-desktop-icon.weui-desktop-icon__success,.login__type__container__scan .login__type__container__scan_mask .weui-desktop-icon.weui-desktop-icon__large.weui-desktop-icon.weui-desktop-icon__warnning,.login__type__container__scan .login__type__container__scan_mask .weui-desktop-icon.weui-desktop-icon__large.weui-desktop-icon.weui-desktop-icon__info,.login__type__container__scan .login__type__container__scan_mask .weui-desktop-icon.weui-desktop-icon__large.weui-desktop-icon.weui-desktop-icon__waiting {
  width: 40px;
  height: 40px
}

.login__type__container__scan .login__type__container__scan_mask .weui-desktop-icon.weui-desktop-icon__success path {
  fill: #07C160;
}

.login__type__container__scan .login__type__container__scan_mask .weui-desktop-icon.weui-desktop-icon__warnning path {
  fill: #E3E4E5;
}

.login__type__container__scan .login__type__container__scan_mask__inner {
  display: table-cell;
  vertical-align: middle
}
</style>
