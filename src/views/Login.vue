<template>
  <div class="login-page">
    <div class="header">
      <van-icon name="cross" class="close" @click="$router.push('/home')" />
      <span class="title">{{ isLogin ? '登录' : '注册' }}</span>
      <span class="help" @click="showToast('帮助')">帮助</span>
    </div>
    <div class="logo-section">
      <div class="logo-seal">鲜</div>
      <p class="logo-sub">向海</p>
    </div>
    <div class="form-section">
      <template v-if="loginType === 'password'">
        <van-field v-model="form.username" placeholder="用户名/手机号" clearable class="custom-field" />
        <van-field v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" clearable class="custom-field">
          <template #right-icon><van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" @click="showPassword = !showPassword" /></template>
        </van-field>
      </template>
      <template v-else>
        <van-field v-model="form.phone" type="tel" placeholder="请输入手机号" clearable maxlength="11" class="custom-field" />
        <van-field v-model="form.code" placeholder="请输入验证码" clearable maxlength="6" class="custom-field">
          <template #button>
            <van-button size="small" type="primary" :disabled="countdown>0" @click="sendCode" class="code-btn">{{ countdown>0 ? `${countdown}s` : '获取验证码' }}</van-button>
          </template>
        </van-field>
      </template>
      <van-button type="danger" round block size="large" class="submit-btn" :loading="loading" @click="handleSubmit">{{ isLogin ? '登 录' : '注 册' }}</van-button>
      <div class="switch-type"><span @click="loginType = loginType==='password' ? 'sms' : 'password'">{{ loginType==='password' ? '短信验证码登录' : '账号密码登录' }}</span></div>
      <div class="switch-mode">
        <span v-if="isLogin">还没有账号？<a @click="isLogin = false">立即注册</a></span>
        <span v-else>已有账号？<a @click="isLogin = true">立即登录</a></span>
      </div>
      <div class="other-login">
        <div class="divider"><span>其他登录方式</span></div>
        <div class="login-icons">
          <div class="icon-item" @click="showToast('QQ登录')"><van-icon name="qq" color="#12b7f5" /><span>QQ</span></div>
          <div class="icon-item" @click="showToast('微信登录')"><van-icon name="wechat" color="#07c160" /><span>微信</span></div>
          <div class="icon-item" @click="showToast('Apple登录')"><van-icon name="apple" color="#000" /><span>Apple</span></div>
        </div>
      </div>
    </div>
    <div class="agreement">
      <van-checkbox v-model="agreed" icon-size="14px" />
      <span>我已阅读并同意<a>《用户注册协议》</a>和<a>《隐私政策》</a></span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()
const isLogin = ref(true)
const loginType = ref('password')
const showPassword = ref(false)
const loading = ref(false)
const agreed = ref(true)
const countdown = ref(0)
const form = reactive({ username:'', password:'', phone:'', code:'' })
let timer = null

const sendCode = () => {
  if (!form.phone || form.phone.length !== 11) { showToast('请输入正确的手机号'); return }
  countdown.value = 60
  showToast('验证码已发送')
  timer = setInterval(() => { countdown.value--; if (countdown.value <= 0) clearInterval(timer) }, 1000)
}
const handleSubmit = () => {
  if (!agreed.value) { showToast('请同意用户协议'); return }
  if (loginType.value === 'password') { if (!form.username || !form.password) { showToast('请输入用户名和密码'); return } }
  else { if (!form.phone || !form.code) { showToast('请输入手机号和验证码'); return } }
  loading.value = true
  setTimeout(() => {
    if (isLogin.value) {
      const users = JSON.parse(localStorage.getItem('mall_users') || '[]')
      const user = users.find(u => u.username === form.username && u.password === form.password)
      if (user || (form.username === 'admin' && form.password === '123456')) {
        localStorage.setItem('mall_current_user', JSON.stringify(user || { username:form.username, avatar:'' }))
        showSuccessToast('登录成功'); router.push('/home')
      } else showToast('用户名或密码错误')
    } else {
      if (form.password.length < 6) { showToast('密码长度不能少于6位'); loading.value = false; return }
      const users = JSON.parse(localStorage.getItem('mall_users') || '[]')
      if (users.find(u => u.username === form.username)) { showToast('用户名已存在'); loading.value = false; return }
      users.push({ username:form.username, password:form.password, avatar:'' })
      localStorage.setItem('mall_users', JSON.stringify(users))
      showSuccessToast('注册成功'); isLogin.value = true
    }
    loading.value = false
  }, 1000)
}
</script>

<style scoped>
.login-page { min-height: 100vh; background: #fff; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; }
.header .close { font-size: 20px; color: #999; }
.header .title { font-size: 17px; font-weight: 500; color: #333; }
.header .help { font-size: 14px; color: #666; }
.logo-section { display: flex; flex-direction: column; align-items: center; padding: 30px 0; }
/* 品牌印章：金色圆形 + 单字（emoji 在不同系统上渲染不一致，故用纯 CSS 绘制） */
.logo-seal {
  display: flex; align-items: center; justify-content: center;
  width: 88px; height: 88px; border-radius: 50%;
  font-size: 40px; font-weight: 800; color: #fdf9ee; user-select: none;
  background: linear-gradient(145deg, var(--gold-soft, #e5d4a1) 0%, #c9a961 55%, #8b7444 100%);
  box-shadow: 0 18px 36px -14px rgba(139, 116, 68, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.45);
  letter-spacing: 0;
}
.logo-sub { font-size: 16px; color: #16323f; font-weight: 600; margin-top: 14px; letter-spacing: 4px; }
.form-section { padding: 0 30px; }
.custom-field { margin-bottom: 15px; background: #f5f5f5; border-radius: 25px; padding: 10px 20px; }
.code-btn { background: #0b7a9e; border-color: #0b7a9e; border-radius: 15px; }
.submit-btn { margin-top: 20px; background: #0b7a9e; border-color: #0b7a9e; font-size: 16px; }
.switch-type { text-align: center; margin-top: 20px; }
.switch-type span { font-size: 14px; color: #666; }
.switch-mode { text-align: center; margin-top: 15px; font-size: 14px; color: #666; }
.switch-mode a { color: #0b7a9e; }
.other-login { margin-top: 40px; }
.divider { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #eee; }
.divider span { font-size: 12px; color: #999; }
.login-icons { display: flex; justify-content: center; gap: 40px; }
.icon-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.icon-item .van-icon { font-size: 32px; }
.icon-item span { font-size: 12px; color: #666; }
.agreement { position: fixed; bottom: 20px; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 6px; padding: 0 30px; }
.agreement span { font-size: 12px; color: #999; }
.agreement a { color: #4a90e2; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.login-page { background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important; }

/* 卡片类容器统一珍珠化（属性后缀匹配，覆盖各页命名习惯） */
.login-page [class$="-card"],
.login-page [class$="-section"],
.login-page [class$="-box"],
.login-page [class$="-panel"],
.login-page [class$="-item"] {
  border-radius: var(--r-md);
}
.login-page [class$="-card"]:not([class*="__"]),
.login-page [class$="-panel"] {
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.42);
}
/* 标题与数字 */
.login-page h1, .login-page h2, .login-page h3 { letter-spacing: 0.5px; color: #0f2c3a; }
.login-page [class$="-price"], .login-page [class$="-num"], .login-page [class$="-amount"] {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}
/* 主按钮走金 */
.login-page .van-button--primary {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  border: 0 !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7);
}
/* 顶部栏 */
.login-page .header, .login-page .nav-bar, .login-page .top-bar {
  background: linear-gradient(180deg, #ffffff, #f8fbfc) !important;
  border-bottom: 1px solid var(--hairline);
}

</style>
