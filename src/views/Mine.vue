<template>
  <div class="mine-page">
    <!-- 用户信息头 -->
    <div class="user-header">
      <div class="header-top">
        <div class="setting-btns">
          <van-icon name="setting-o" @click="showToast('设置')" />
          <van-icon name="chat-o" :badge="unreadCount > 0 ? unreadCount : ''" @click="$router.push('/message')" />
        </div>
      </div>
      <!-- 未登录 -->
      <div class="user-info" v-if="!isLoggedIn" @click="$router.push('/login')">
        <div class="avatar-box"><van-icon name="user-o" size="40" color="#fff" /></div>
        <div class="user-detail"><p class="login-text">登录/注册</p><p class="login-sub">登录后享受更多特权</p></div>
        <van-icon name="arrow" color="#fff" size="18" />
      </div>
      <!-- 已登录 -->
      <div class="user-info" v-else>
        <div class="avatar-box logged"><img :src="currentUser.avatar || '/images/mall.jpg'" /></div>
        <div class="user-detail">
          <p class="username">{{ currentUser.username }}</p>
          <p class="user-level"><span class="level-tag">会员值 {{ userLevel.score }}</span><span class="level-name">{{ userLevel.name }}</span></p>
        </div>
        <van-icon name="qr" color="#fff" size="20" @click.stop="showToast('会员码')" />
      </div>
      <!-- 快捷数据 -->
      <div class="quick-stats">
        <div class="stat-item" v-for="stat in quickStats" :key="stat.name">
          <span class="stat-num">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.name }}</span>
        </div>
      </div>
    </div>

    <!-- 我的订单 -->
    <div class="section-card">
      <div class="section-header">
        <span class="section-title">我的订单</span>
        <span class="view-all" @click="$router.push({ path:'/orders', query:{ status:'all' } })">查看全部 <van-icon name="arrow" /></span>
      </div>
      <div class="order-grid">
        <div class="order-item" v-for="item in orderStatusList" :key="item.key" @click="goOrders(item.key)">
          <van-icon :name="item.icon" size="28" :badge="item.count > 0 ? item.count : ''" />
          <span>{{ item.name }}</span>
        </div>
      </div>
    </div>

    <!-- 工具服务 -->
    <div class="section-card">
      <div class="section-header">
        <span class="section-title">我的服务</span>
      </div>
      <van-cell-group>
        <van-cell title="我的收藏" icon="star-o" is-link @click="$router.push('/favorites')" />
        <van-cell title="我的足迹" icon="clock-o" is-link @click="$router.push('/footprint')" />
        <van-cell title="优惠券" icon="coupon-o" is-link @click="$router.push('/coupons')" />
        <van-cell title="地址管理" icon="location-o" is-link @click="$router.push('/address')" />
        <van-cell title="帮助与客服" icon="service-o" is-link @click="$router.push('/message')" />
        <van-cell title="意见反馈" icon="edit" is-link @click="$router.push('/feedback')" />
        <van-cell title="关于我们" icon="info-o" is-link @click="$router.push('/about')" />
        <van-cell title="退出登录" icon="close" is-link @click="handleLogout" v-if="isLoggedIn" />
      </van-cell-group>
    </div>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" active-color="#7fd4e8" inactive-color="rgba(234, 246, 251, 0.55)">
      <van-tabbar-item name="home" icon="home-o" @click="$router.push('/home')">首页</van-tabbar-item>
      <van-tabbar-item name="category" icon="apps-o" @click="$router.push('/category')">分类</van-tabbar-item>
      <van-tabbar-item name="discover" icon="fire-o" @click="$router.push('/discover')">发现</van-tabbar-item>
      <van-tabbar-item name="cart" icon="shopping-cart-o" :badge="cartBadge" @click="$router.push('/cart')">购物车</van-tabbar-item>
      <van-tabbar-item name="mine" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { cartBadgeText } from '../utils/cart'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const activeTab = ref('mine')
const unreadCount = ref(3)

const isLoggedIn = computed(() => !!currentUser.value)
const currentUser = ref(null)
const userLevel = ref({ name:'高级会员', score: 5680 })

const quickStats = ref([
  { name:'商品收藏', value:12 },
  { name:'店铺关注', value:8 },
  { name:'我的足迹', value:156 },
  { name:'优惠券', value:5 }
])

const orderStatusList = ref([
  { key:'pending', name:'待付款', icon:'balance-pay', count:0 },
  { key:'delivering', name:'待收货', icon:'logistics', count:0 },
  { key:'review', name:'待评价', icon:'comment-circle-o', count:0 },
  { key:'refund', name:'退款/售后', icon:'after-sale', count:0 }
])

const loadUser = () => {
  const user = localStorage.getItem('mall_current_user')
  if (user) currentUser.value = JSON.parse(user)
}
const updateOrderCounts = () => {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  orderStatusList.value.forEach(item => { item.count = orders.filter(o => o.status === item.key).length })
}
const goOrders = (status) => router.push({ path:'/orders', query:{ status } })
const handleLogout = () => {
  showConfirmDialog({ title:'退出登录', message:'确定要退出登录吗？' }).then(() => {
    localStorage.removeItem('mall_current_user'); currentUser.value = null; showToast('已退出登录')
  }).catch(() => {})
}
const cartBadge = ref(cartBadgeText())
const updateCartBadge = () => { cartBadge.value = cartBadgeText() }
onMounted(() => { loadUser(); updateOrderCounts(); updateCartBadge() })
</script>

<style scoped>
.mine-page { background: #f5f5f5; min-height: 100vh; padding-bottom: 60px; }
.user-header { background: linear-gradient(135deg, #0b7a9e 0%, #075a77 100%); padding: 15px; color: #fff; }
.header-top { display: flex; justify-content: flex-end; margin-bottom: 15px; }
.setting-btns { display: flex; gap: 15px; }
.setting-btns .van-icon { font-size: 22px; }
.user-info { display: flex; align-items: center; }
.avatar-box { width: 65px; height: 65px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; margin-right: 15px; }
.avatar-box.logged { background: #fff; overflow: hidden; }
.avatar-box img { width: 100%; height: 100%; object-fit: cover; }
.user-detail { flex: 1; }
.login-text { font-size: 20px; font-weight: 600; margin: 0 0 4px; }
.login-sub { font-size: 13px; opacity: 0.8; margin: 0; }
.username { font-size: 18px; font-weight: 600; margin: 0 0 6px; }
.user-level { display: flex; gap: 8px; margin: 0; }
.level-tag { background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px; font-size: 11px; }
.level-name { font-size: 12px; opacity: 0.9; }
.quick-stats { display: flex; justify-content: space-around; padding: 20px 0 10px; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-num { font-size: 18px; font-weight: 700; }
.stat-label { font-size: 12px; opacity: 0.8; }
.section-card { background: #fff; margin: 10px; border-radius: 12px; overflow: hidden; }
.section-header { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #f5f5f5; }
.section-title { font-size: 15px; font-weight: 500; color: #333; }
.view-all { font-size: 13px; color: #999; display: flex; align-items: center; gap: 4px; }
.order-grid { display: flex; justify-content: space-around; padding: 20px 0; }
.order-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.order-item .van-icon { color: #666; }
.order-item span { font-size: 12px; color: #666; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.mine-page { background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important; }

/* 头部做成"深海会员卡"：径向金光 + 深色渐变 + 金发丝 */
.mine-page .user-header {
  position: relative;
  margin: 12px 12px 0 !important;
  padding: 20px 18px 6px !important;
  border-radius: var(--r-lg) !important;
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(92% 62% at 90% 0%, rgba(201, 169, 97, 0.24) 0%, transparent 62%),
    linear-gradient(150deg, #0b4a6f 0%, #06283a 58%, #03101a 100%) !important;
  border: 1px solid var(--hairline);
  box-shadow: 0 24px 46px -24px rgba(2, 12, 20, 0.72), var(--inner-hi);
}
.mine-page .avatar-box {
  background: rgba(201, 169, 97, 0.16) !important;
  border: 1px solid var(--hairline);
}
.mine-page .login-text { font-size: 19px; font-weight: 700; letter-spacing: 0.6px; }
.mine-page .login-sub { color: rgba(232, 238, 242, 0.6) !important; letter-spacing: 0.3px; }
.mine-page .username { font-weight: 700; letter-spacing: 0.5px; }
.mine-page .level-tag {
  background: linear-gradient(140deg, var(--gold-soft), var(--gold)) !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.6px;
}
.mine-page .level-name { color: rgba(232, 238, 242, 0.72) !important; }
.mine-page .quick-stats { padding: 20px 0 14px !important; }
.mine-page .stat-num {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  font-size: 19px;
  letter-spacing: -0.4px;
}
.mine-page .stat-label { color: rgba(232, 238, 242, 0.5) !important; letter-spacing: 0.8px; }
.mine-page .setting-btns { color: rgba(232, 238, 242, 0.86); }

/* 区块卡：珍珠白 + 金发丝 */
.mine-page .section-card {
  margin: 12px !important;
  border-radius: var(--r-lg) !important;
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%) !important;
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.42);
}
.mine-page .section-header { padding: 15px 16px !important; border-bottom: 1px solid #f2f8fb !important; }
.mine-page .section-title { font-size: 15px !important; font-weight: 700 !important; letter-spacing: 0.6px; color: #0f2c3a !important; }
.mine-page .view-all { color: #9db3bd !important; letter-spacing: 0.3px; }
.mine-page .order-grid { padding: 18px 0 16px !important; }
.mine-page .order-item span { color: #5b7a8c; letter-spacing: 0.3px; }

</style>
