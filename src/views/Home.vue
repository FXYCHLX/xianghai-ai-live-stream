<template>
  <div class="home-page">
    <!-- 顶部状态栏 -->
    <div class="header" :class="{ scrolled: isScrolled }">
      <div class="header-top">
        <div class="location" @click="showCity = true">
          <van-icon name="location-o" />
          <span>{{ currentCity }}</span>
          <van-icon name="arrow-down" size="10" />
        </div>
        <div class="header-right">
          <van-icon name="scan" @click="$router.push('/scan')" />
          <van-icon name="chat-o" :badge="unreadCount > 0 ? unreadCount : ''" @click="$router.push('/message')" />
        </div>
      </div>
      <div class="search-box" @click="showSearch = true">
        <van-icon name="search" />
        <span>搜连江海产 · 吃法 · 产地</span>
        <van-icon name="camera-o" class="camera" @click.stop="$router.push('/scan')" />
      </div>
    </div>

    <!-- 城市选择 -->
    <van-popup v-model:show="showCity" position="bottom" round>
      <van-picker title="选择收货地址" :columns="cityColumns" @confirm="onCityConfirm" @cancel="showCity = false" />
    </van-popup>

    <!-- 搜索弹窗 -->
    <van-popup v-model:show="showSearch" position="top" :style="{ height: '100%' }">
      <van-search v-model="searchVal" placeholder="搜连江海产 · 吃法 · 产地" shape="round" autofocus show-action @cancel="showSearch = false" @search="onSearch">
        <template #action><span @click="showSearch = false">取消</span></template>
      </van-search>
      <div class="search-history">
        <div class="history-title"><span>历史搜索</span><van-icon name="delete-o" @click="clearHistory" /></div>
        <div class="history-tags">
          <span v-for="tag in searchHistory" :key="tag" @click="searchVal = tag; onSearch()">{{ tag }}</span>
        </div>
      </div>
    </van-popup>

    <!-- 轮播Banner -->
    <div class="banner-section">
      <van-swipe :autoplay="3000" indicator-color="#7fd4e8">
        <van-swipe-item v-for="(banner, i) in banners" :key="i">
          <img :src="banner" class="banner-img" />
        </van-swipe-item>
      </van-swipe>
      <div class="banner-copy">
        <h1>{{ bannerCopy[0].title }}</h1>
        <p>{{ bannerCopy[0].sub }}</p>
      </div>
    </div>

    <!-- 数字人直播间入口 -->
    <div class="live-card" @click="$router.push('/live')">
      <div class="live-card-glow"></div>
      <div class="live-card-body">
        <div class="live-card-avatar">
          <span>海</span>
          <i class="live-card-ring"></i>
        </div>
        <div class="live-card-info">
          <div class="live-card-title">
            <span class="live-card-live"><i></i>LIVE</span>
            <b>向海 · 数字人直播间</b>
          </div>
          <p>AI 主播阿海，正在讲解今天的码头鲜货</p>
        </div>
        <div class="live-card-enter">进入</div>
      </div>
    </div>

    <!-- 10宫格分类 - 点击跳转对应分类 -->
    <div class="category-grid">
      <div class="cat-item" v-for="cat in categoryList" :key="cat.id" @click="goCategory(cat)">
        <div class="cat-icon" :style="{ background: cat.bg }"><svg viewBox="0 0 24 24" v-html="cat.icon"></svg></div>
        <span>{{ cat.name }}</span>
      </div>
    </div>

    <!-- 今日鲜货 -->
    <div class="seckill-section">
      <div class="seckill-header">
        <div class="seckill-title">
          <span class="seckill-text">今日码头鲜货</span>
          <div class="countdown">
            <span class="time-box">{{ hours }}</span><span class="sep">:</span>
            <span class="time-box">{{ minutes }}</span><span class="sep">:</span>
            <span class="time-box">{{ seconds }}</span>
          </div>
        </div>
        <span class="more" @click="$router.push('/category')">更多鲜货 ></span>
      </div>
      <div class="seckill-list">
        <div class="seckill-item" v-for="item in seckillGoods" :key="item.id" @click="goDetail(item)">
          <img :src="item.pic" />
          <div class="seckill-price">
            <span class="now">¥{{ item.seckillPrice }}</span>
            <span class="old">¥{{ item.price }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 精选推荐（根据浏览 / 加购 / 搜索行为生成，非固定位） -->
    <div class="ai-section">
      <div class="ai-head">
        <div class="ai-badge">AI</div>
        <div class="ai-head-text">
          <div class="ai-title">{{ aiTitle }}</div>
          <div class="ai-reason">{{ aiReason || '正在分析你的偏好…' }}</div>
        </div>
      </div>
      <div class="ai-list" v-if="aiGoods.length">
        <div class="ai-item" v-for="g in aiGoods" :key="g.id" @click="goDetail(g)">
          <img :src="g.pic" />
          <div class="ai-item-name">{{ g.name }}</div>
          <div class="ai-item-price">¥{{ g.price }}</div>
        </div>
      </div>
      <div class="ai-list" v-else>
        <div class="ai-skeleton" v-for="i in 3" :key="i"></div>
      </div>
    </div>

    <!-- 推荐商品瀑布流 -->
    <div class="recommend-section">
      <div class="section-header">
        <div class="header-line"></div>
        <span class="header-text">为你推荐</span>
        <div class="header-line"></div>
      </div>
      <div class="goods-waterfall">
        <div class="goods-list left">
          <div class="goods-card" v-for="item in leftGoods" :key="item.id" @click="goDetail(item)">
            <img :src="item.pic" class="goods-img" />
            <div class="goods-info">
              <div class="goods-tags" v-if="item.tags && item.tags.length">
                <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
              <p class="goods-name">{{ item.name }}</p>
              <div class="goods-price-row">
                <span class="price"><small>¥</small>{{ item.price }}</span>
                <span class="similar">看相似</span>
              </div>
              <div class="goods-shop">
                <span class="shop-tag">码头直发</span>
                <span class="shop-name">向海</span>
              </div>
            </div>
          </div>
        </div>
        <div class="goods-list right">
          <div class="goods-card" v-for="item in rightGoods" :key="item.id" @click="goDetail(item)">
            <img :src="item.pic" class="goods-img" />
            <div class="goods-info">
              <div class="goods-tags" v-if="item.tags && item.tags.length">
                <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
              <p class="goods-name">{{ item.name }}</p>
              <div class="goods-price-row">
                <span class="price"><small>¥</small>{{ item.price }}</span>
                <span class="similar">看相似</span>
              </div>
              <div class="goods-shop">
                <span class="shop-tag">码头直发</span>
                <span class="shop-name">向海</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 导购悬浮入口（首页主入口，直进 AI 对话） -->
    <div class="ai-fab" @click="$router.push('/chat')">
      <span class="ai-fab-badge">AI</span>
      <span class="ai-fab-text">导购</span>
    </div>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" active-color="#7fd4e8" inactive-color="rgba(234, 246, 251, 0.55)">
      <van-tabbar-item name="home" icon="home-o" @click="$router.push('/home')">首页</van-tabbar-item>
      <van-tabbar-item name="category" icon="apps-o" @click="$router.push('/category')">分类</van-tabbar-item>
      <van-tabbar-item name="discover" icon="fire-o" @click="$router.push('/discover')">发现</van-tabbar-item>
      <van-tabbar-item name="cart" icon="shopping-cart-o" :badge="cartBadge" @click="$router.push('/cart')">购物车</van-tabbar-item>
      <van-tabbar-item name="mine" icon="user-o" @click="$router.push('/mine')">我的</van-tabbar-item>
    </van-tabbar>

    <van-back-top visibility-height="200" />
  </div>
</template>

<script setup>
import { cartBadgeText } from '../utils/cart'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { GOODS, BANNERS, SECKILL_GOODS } from '../data/goods'
import { aiRecommend, checkHealth } from '../api/ai'

const router = useRouter()
const activeTab = ref('home')
const searchVal = ref('')
const showSearch = ref(false)
const showCity = ref(false)
const currentCity = ref('连江')
const cityList = ['连江', '福州', '宁德', '厦门', '泉州', '上海', '北京', '广州', '深圳', '杭州']
const cityColumns = cityList.map(city => ({ text: city, value: city }))
const unreadCount = ref(2)
const isScrolled = ref(false)
const loadSearchHistory = () => {
  try {
    const v = JSON.parse(localStorage.getItem('searchHistory') || '[]')
    return Array.isArray(v) && v.length ? v : ['大黄鱼', '海带', '紫菜']
  } catch {
    return ['大黄鱼', '海带', '紫菜']
  }
}
const searchHistory = ref(loadSearchHistory())
const saveSearchHistory = () => localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))

// 倒计时
const hours = ref('02')
const minutes = ref('15')
const seconds = ref('36')
let countdownTimer = null

// 轮播图（统一来自 src/data/goods.js）
const banners = BANNERS

// 10宫格分类 - 点击跳转到分类页对应分类
const bannerCopy = [
  { title: '向海', sub: '海上福州 · 世界渔都 · 码头直发' },
  { title: '24 小时数字人直播', sub: '一个人 + 一套 AI 工具链，不下播' },
  { title: '产地直供', sub: '黄岐半岛 · 官坞 · 晓澳 · 定海湾' }
]

const categoryList = [
  { id: 1, name: '鲜活海产', bg: 'linear-gradient(135deg, #d9eef7, #a8dbec)', catId: 2, icon: '<path d="M20 12c-2.6 3.6-5.7 5.6-9.2 5.6-3.1 0-5.7-2-7.3-5.6 1.6-3.6 4.2-5.6 7.3-5.6 3.5 0 6.6 2 9.2 5.6z"/><path d="M20 12l3.2-3.2v6.4L20 12z"/>' },
  { id: 2, name: '数字人直播', bg: 'linear-gradient(135deg, #bfe6f3, #7fd4e8)', path: '/live', icon: '<rect x="2.8" y="6.8" width="12" height="10.4" rx="2.4"/><path d="M14.8 11l5.4-3.2v8.4l-5.4-3.2z"/><circle cx="8.8" cy="12" r="2.2"/>' },
  { id: 3, name: '干货海味', bg: 'linear-gradient(135deg, #dcf1e9, #b0ddca)', catId: 3, icon: '<path d="M19 11c-2.3 3.3-5.1 5-8.3 5-2.8 0-5.1-1.8-6.6-5 1.5-3.2 3.8-5 6.6-5 3.2 0 6 1.7 8.3 5z"/><path d="M19 11l3-3v6l-3-3z"/><path d="M8.5 8.2v5.6M11.5 7.6v6.8"/>' },
  { id: 4, name: '预制即食', bg: 'linear-gradient(135deg, #fdeade, #f6d0b3)', catId: 4, icon: '<path d="M3.4 11h17.2a8.6 8.6 0 0 1-17.2 0z"/><path d="M9 7.6c0-2.2 6-2.2 6 0"/><path d="M2.6 19.4h18.8"/>' },
  { id: 5, name: '海味礼盒', bg: 'linear-gradient(135deg, #fbe2ea, #f2c6d6)', catId: 5, icon: '<rect x="3" y="8.4" width="18" height="11.6" rx="2.2"/><path d="M3 12.4h18M12 8.4v11.6"/><path d="M12 8.4c-1.8-3.4-6-3-6 0M12 8.4c1.8-3.4 6-3 6 0"/>' },
  { id: 6, name: '热门推荐', bg: 'linear-gradient(135deg, #f6eddc, #e6d3ae)', catId: 1, icon: '<path d="M2.4 9c2.8-3 5.6-3 8.4 0s5.6 3 8.4 0"/><path d="M2.4 15.4c2.8-3 5.6-3 8.4 0s5.6 3 8.4 0"/>' },
  { id: 7, name: '领券中心', bg: 'linear-gradient(135deg, #e7e3f6, #cfc8eb)', path: '/coupons', icon: '<path d="M4 7h16v3.6a2.2 2.2 0 0 0 0 4.4V19H4v-4a2.2 2.2 0 0 0 0-4.4V7z"/><path d="M11 9.6v1.6M11 14.4v1.6"/>' },
  { id: 8, name: '全部分类', bg: 'linear-gradient(135deg, #e4ecf1, #c7d8e1)', catId: 0, icon: '<rect x="3.2" y="3.2" width="7" height="7" rx="1.8"/><rect x="13.8" y="3.2" width="7" height="7" rx="1.8"/><rect x="3.2" y="13.8" width="7" height="7" rx="1.8"/><rect x="13.8" y="13.8" width="7" height="7" rx="1.8"/>' }
]

// 鲜货推荐（统一来自 src/data/goods.js）
const seckillGoods = ref(SECKILL_GOODS)

// 推荐商品：全站商品统一维护在 src/data/goods.js
const goodsList = ref(GOODS)

const leftGoods = computed(() => goodsList.value.filter((_, i) => i % 2 === 0))
const rightGoods = computed(() => goodsList.value.filter((_, i) => i % 2 === 1))

// 购物车角标
const cartBadge = ref(cartBadgeText())
const updateCartBadge = () => { cartBadge.value = cartBadgeText() }

const startCountdown = () => {
  let totalSeconds = 2 * 3600 + 15 * 60 + 36
  countdownTimer = setInterval(() => {
    totalSeconds--
    if (totalSeconds <= 0) totalSeconds = 2 * 3600 + 15 * 60 + 36
    hours.value = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    minutes.value = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    seconds.value = String(totalSeconds % 60).padStart(2, '0')
  }, 1000)
}

const handleScroll = () => { isScrolled.value = window.scrollY > 50 }

onMounted(() => {
  updateCartBadge()
  startCountdown()
  loadAiRecommend()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('storage', updateCartBadge)
})
onUnmounted(() => {
  clearInterval(countdownTimer)
  window.removeEventListener('scroll', handleScroll)
})

const onCityConfirm = ({ selectedOptions }) => {
  currentCity.value = selectedOptions[0].text
  showCity.value = false
  showToast(`已切换到：${currentCity.value}`)
}
const onSearch = () => {
  const kw = searchVal.value.trim()
  if (!kw) return
  if (!searchHistory.value.includes(kw)) {
    searchHistory.value.unshift(kw)
    if (searchHistory.value.length > 10) searchHistory.value.pop()
  }
  saveSearchHistory()
  showSearch.value = false
  router.push({ path: '/category', query: { kw } })
}
const clearHistory = () => {
  searchHistory.value = []
  saveSearchHistory()
}

// 首页分类点击跳转到分类页
const goCategory = (cat) => {
  if (cat.path) {
    router.push(cat.path)
  } else if (cat.catId === 0) {
    router.push('/category')
  } else {
    router.push({ path: '/category', query: { catId: cat.catId } })
  }
}
const goDetail = (item) => router.push({ path: '/detail', query: { id: item.id } })

/* ── AI 精选推荐 ── */
const aiGoods = ref([])
const aiTitle = ref('AI 精选')
const aiReason = ref('')

const readNames = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]').map(i => i.name || i).filter(Boolean)
  } catch {
    return []
  }
}

const loadAiRecommend = async () => {
  const payload = {
    viewed: readNames('footprint').slice(0, 8),
    cart: readNames('cartList').slice(0, 8),
    favorites: readNames('favorites').slice(0, 8),
    keywords: searchHistory.value.slice(0, 5)
  }
  // 先探一次服务状态，避免必然失败的请求
  const h = await checkHealth()
  if (!h.ok || !h.aiReady) {
    aiTitle.value = '大家都在买'
    aiReason.value = 'AI 服务未连接，先看看全站热销'
    aiGoods.value = [...GOODS].sort((a, b) => b.sales - a.sales).slice(0, 6)
    return
  }
  try {
    const res = await aiRecommend(payload)
    aiTitle.value = res.title || '猜你喜欢'
    aiReason.value = res.reason || ''
    aiGoods.value = res.products || []
  } catch {
    aiTitle.value = '大家都在买'
    aiReason.value = '推荐服务暂时不可用，先看看全站热销'
    aiGoods.value = [...GOODS].sort((a, b) => b.sales - a.sales).slice(0, 6)
  }
}
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════════════
   首页 · 深海墨蓝 × 珍珠白 × 香槟金
   ──────────────────────────────────────────────────────────────────
   旧版是分好几轮追加出来的（同一个选择器定义 3～4 次），视觉不统一。
   这里整段重写，只保留一套规则。
   高端的做法是"克制"：深色打底、金色只做点缀（描边/徽章/副标题/图标），
   大面积留给珍珠白卡片和大留白。
   ══════════════════════════════════════════════════════════════════ */

.home-page {
  position: relative;
  min-height: 100vh;
  padding-bottom: 70px;
  color: #e8eef2;
  background:
    radial-gradient(115% 52% at 50% -8%, rgba(26, 127, 168, 0.34) 0%, transparent 62%),
    radial-gradient(70% 38% at 104% 6%, rgba(201, 169, 97, 0.12) 0%, transparent 58%),
    linear-gradient(180deg, #04141f 0%, #03101a 46%, #020c14 100%);
}

/* 水下光斑：极慢、极淡，只是让深色底"活"一点，不能抢戏 */
.home-page::before {
  content: '';
  position: fixed;
  inset: -20% -20% auto;
  height: 90vh;
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;
  background:
    radial-gradient(ellipse 46% 30% at 24% 18%, rgba(127, 212, 232, 0.16), transparent 62%),
    radial-gradient(ellipse 38% 26% at 78% 30%, rgba(127, 212, 232, 0.10), transparent 62%);
  animation: caustics 26s ease-in-out infinite alternate;
}
@keyframes caustics {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  100% { transform: translate3d(-3%, 3%, 0) scale(1.08); }
}

/* 上升气泡：数量减半，透明度调低 —— 高级感靠克制，不靠热闹 */
.home-page::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.34;
  background-image:
    radial-gradient(circle 2.5px at 14% 82%, rgba(201, 169, 97, 0.45), transparent 62%),
    radial-gradient(circle 2px at 30% 94%, rgba(127, 212, 232, 0.4), transparent 62%),
    radial-gradient(circle 3px at 72% 88%, rgba(127, 212, 232, 0.32), transparent 62%),
    radial-gradient(circle 2px at 86% 97%, rgba(201, 169, 97, 0.38), transparent 62%);
  animation: bubbleRise 20s linear infinite;
}
@keyframes bubbleRise {
  0%   { transform: translateY(8vh); opacity: 0; }
  16%  { opacity: 0.5; }
  84%  { opacity: 0.3; }
  100% { transform: translateY(-94vh); opacity: 0; }
}

/* 内容层压在光效之上 */
.home-page > * { position: relative; z-index: 1; }

/* 横向溢出治理 */
.home-page { width: 100vw; max-width: 100vw; overflow-x: hidden; }

/* ────────── 顶部 ────────── */
.header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 999;
  padding: 10px 16px 12px;
  background: transparent;
  transition: background 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.header.scrolled {
  background: rgba(3, 16, 26, 0.84);
  backdrop-filter: saturate(180%) blur(22px);
  -webkit-backdrop-filter: saturate(180%) blur(22px);
  box-shadow: 0 1px 0 var(--hairline), 0 16px 34px -20px rgba(0, 0, 0, 0.8);
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 9px;
}
.location {
  display: flex; align-items: center; gap: 4px;
  font-size: 13px; font-weight: 500; letter-spacing: 0.4px;
  color: var(--pearl);
}
.header-right {
  display: flex; gap: 17px;
  font-size: 19px;
  color: rgba(247, 249, 250, 0.9);
}

/* 搜索框：珍珠白胶囊 + 金发丝描边 —— 深底上最跳的一块，是"贵"的第一眼 */
.search-box {
  display: flex; align-items: center; gap: 8px;
  height: 38px; padding: 0 14px;
  border-radius: var(--r-pill);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(247, 249, 250, 0.9));
  border: 1px solid rgba(201, 169, 97, 0.24);
  box-shadow: 0 12px 26px -14px rgba(0, 0, 0, 0.6), inset 0 1px 0 #fff;
}
.search-box span { flex: 1; font-size: 12.5px; color: #7c94a2; letter-spacing: 0.2px; }
.search-box .van-icon { font-size: 17px; color: #93a9b5; }

/* 搜索历史（弹窗） */
.search-history { padding: 18px; }
.history-title {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px;
  font-size: 14px; font-weight: 600; color: #16323f;
}
.history-tags { display: flex; flex-wrap: wrap; gap: 10px; }
.history-tags span {
  padding: 7px 14px;
  font-size: 12.5px; color: #43606e;
  background: #f2f7fa;
  border: 1px solid #e3edf2;
  border-radius: var(--r-pill);
}

/* ────────── Banner ────────── */
.banner-section { position: relative; }
.banner-img { width: 100%; height: 190px; object-fit: cover; display: block; }
/* 底部一道波浪，把海面"化"进深海，避免生硬的直线切边 */
.banner-section::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: -1px;
  height: 28px;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 28' preserveAspectRatio='none'%3E%3Cpath d='M0 14 Q15 1 30 14 T60 14 T90 14 T120 14 V28 H0 Z' fill='%2304141f'/%3E%3C/svg%3E");
  background-size: 120px 28px;
  background-repeat: repeat-x;
}
.banner-copy {
  position: absolute;
  left: 22px;
  bottom: 38px;
  z-index: 6;
  pointer-events: none;
}
.banner-copy h1 {
  margin: 0 0 7px;
  font-size: 27px;
  font-weight: 800;
  letter-spacing: 2.5px;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.55);
}
/* 副标题走金色 + 大字距，这是最省力的"高级"信号 */
.banner-copy p {
  margin: 0;
  font-size: 10.5px;
  letter-spacing: 3.2px;
  color: var(--gold-soft);
}

/* ────────── 数字人直播入口 ────────── */
.live-card {
  position: relative;
  margin: 16px;
  border-radius: var(--r-lg);
  overflow: hidden;
  background: linear-gradient(150deg, rgba(11, 74, 111, 0.55) 0%, rgba(3, 16, 26, 0.78) 100%);
  border: 1px solid var(--hairline);
  box-shadow: var(--sh-card), var(--inner-hi);
  transition: transform 0.3s var(--ease);
}
.live-card:active { transform: scale(0.986); }
.live-card-glow {
  position: absolute;
  top: -46px; right: -30px;
  width: 150px; height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 66%);
  pointer-events: none;
}
.live-card-body {
  position: relative;
  display: flex; align-items: center; gap: 12px;
  padding: 15px 16px;
}
.live-card-avatar {
  position: relative;
  width: 46px; height: 46px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 15px;
  font-size: 18px; font-weight: 700; color: #0a1a24;
  background: linear-gradient(140deg, var(--gold-soft), var(--gold));
  box-shadow: 0 8px 20px -8px rgba(201, 169, 97, 0.65);
}
.live-card-ring {
  position: absolute;
  inset: -5px;
  border-radius: 19px;
  border: 1px solid rgba(201, 169, 97, 0.4);
  animation: ringPulse 2.6s ease-in-out infinite;
}
@keyframes ringPulse {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50%      { opacity: 0.9;  transform: scale(1.06); }
}
.live-card-info { flex: 1; min-width: 0; }
.live-card-title { display: flex; align-items: center; gap: 7px; margin-bottom: 5px; }
.live-card-title b {
  font-size: 13.5px; font-weight: 600; letter-spacing: 0.3px;
  color: #eaf2f6;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.live-card-live {
  display: inline-flex; align-items: center; gap: 4px;
  flex-shrink: 0;
  padding: 2px 7px;
  font-size: 9px; font-weight: 800; letter-spacing: 1.3px;
  color: #1a1206;
  border-radius: var(--r-pill);
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
}
.live-card-live i {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: #7a1f1f;
  animation: liveDot 1.3s ease-in-out infinite;
}
@keyframes liveDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
.live-card-info p {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.3px;
  color: rgba(232, 238, 242, 0.52);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.live-card-enter {
  flex-shrink: 0;
  padding: 7px 15px;
  font-size: 12px; font-weight: 600; letter-spacing: 1.2px;
  color: #0a1a24;
  border-radius: var(--r-pill);
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
  box-shadow: 0 8px 18px -8px rgba(201, 169, 97, 0.7);
}

/* ────────── 分类宫格 ────────── */
.category-grid {
  display: flex; flex-wrap: wrap;
  margin: 16px;
  padding: 18px 6px 14px;
  border-radius: var(--r-lg);
  background: linear-gradient(172deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline);
  box-shadow: var(--sh-card);
}
.cat-item {
  width: 25%;
  box-sizing: border-box;
  padding: 10px 0;
  display: flex; flex-direction: column; align-items: center; gap: 9px;
  cursor: pointer;
}
.cat-icon {
  width: 46px; height: 46px;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 18px -10px rgba(9, 58, 84, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
/* 图标描边用深金 —— 整套视觉里最提气的一笔 */
.cat-icon svg {
  width: 23px; height: 23px;
  fill: none;
  stroke: var(--gold-deep);
  stroke-width: 1.45;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.cat-item span {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: #35515f;
}

/* ────────── 今日码头鲜货 ────────── */
.seckill-section {
  margin: 16px;
  padding: 16px 14px 14px;
  border-radius: var(--r-lg);
  background: linear-gradient(172deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline);
  box-shadow: var(--sh-card);
}
.seckill-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px;
}
.seckill-title { display: flex; align-items: center; gap: 11px; }
.seckill-text {
  position: relative;
  padding-left: 11px;
  font-size: 16.5px; font-weight: 700; letter-spacing: 0.5px;
  color: #0f2c3a;
}
.seckill-text::before {
  content: '';
  position: absolute; left: 0; top: 50%;
  transform: translateY(-50%);
  width: 3px; height: 15px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--gold-soft), var(--gold-deep));
}
.countdown { display: flex; align-items: center; gap: 3px; }
.time-box {
  min-width: 22px;
  padding: 3px 5px;
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  font-size: 12px; font-weight: 700;
  color: var(--gold-soft);
  text-align: center;
  border-radius: 6px;
  background: linear-gradient(160deg, #0b3c56, #06283a);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.sep { font-weight: 700; color: #9db3bd; }
.more {
  font-size: 11.5px;
  letter-spacing: 0.3px;
  color: #8ba3ad;
}
.seckill-list { display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; }
.seckill-list::-webkit-scrollbar { display: none; }
.seckill-item { min-width: 74px; text-align: center; }
.seckill-item img {
  width: 74px; height: 74px;
  border-radius: 14px;
  object-fit: cover;
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 8px 18px -10px rgba(9, 58, 84, 0.45);
}
.seckill-price { margin-top: 8px; }
.seckill-price .now {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  font-size: 14px; font-weight: 700;
  color: var(--coral);
}
.seckill-price .old {
  display: block;
  margin-top: 1px;
  font-size: 10.5px;
  color: #a8bac2;
  text-decoration: line-through;
}

/* ────────── AI 精选 ────────── */
.ai-section {
  margin: 16px;
  padding: 15px 14px;
  border-radius: var(--r-lg);
  background: linear-gradient(172deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline);
  box-shadow: var(--sh-card);
}
.ai-head { display: flex; align-items: center; gap: 11px; margin-bottom: 13px; }
.ai-badge {
  width: 32px; height: 32px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 11px;
  font-family: var(--font-num);
  font-size: 12.5px; font-weight: 800; letter-spacing: 0.5px;
  color: #0a1a24;
  background: linear-gradient(140deg, var(--gold-soft), var(--gold));
  box-shadow: 0 7px 16px -7px rgba(201, 169, 97, 0.7);
}
.ai-head-text { flex: 1; min-width: 0; }
.ai-title {
  font-size: 14.5px; font-weight: 700; letter-spacing: 0.4px;
  color: #0f2c3a;
}
.ai-reason {
  margin-top: 3px;
  font-size: 11px;
  color: #8ba3ad;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ai-list { display: flex; gap: 11px; overflow-x: auto; scrollbar-width: none; }
.ai-list::-webkit-scrollbar { display: none; }
.ai-item { min-width: 98px; width: 98px; cursor: pointer; }
.ai-item img {
  width: 98px; height: 98px;
  border-radius: 14px;
  object-fit: cover;
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 8px 20px -11px rgba(9, 58, 84, 0.5);
}
.ai-item-name {
  margin-top: 7px;
  font-size: 11.5px;
  line-height: 1.45;
  color: #35515f;
  overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.ai-item-price {
  margin-top: 4px;
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  font-size: 13px; font-weight: 700;
  color: var(--coral);
}
.ai-skeleton {
  min-width: 98px; height: 98px;
  border-radius: 14px;
  background: linear-gradient(100deg, #eef4f7 30%, #f7fbfd 50%, #eef4f7 70%);
  background-size: 220% 100%;
  animation: shimmer 1.5s linear infinite;
}
@keyframes shimmer { 0% { background-position: 120% 0; } 100% { background-position: -20% 0; } }

/* ────────── 为你推荐 ────────── */
.recommend-section { padding: 0 16px; }
.section-header {
  display: flex; align-items: center; justify-content: center; gap: 14px;
  padding: 26px 0 18px;
}
.header-line {
  width: 42px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--hairline));
}
.header-line:last-child {
  background: linear-gradient(90deg, var(--hairline), transparent);
}
.header-text {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 4px;
  color: var(--gold-soft);
}
.goods-waterfall { display: flex; gap: 11px; }
.goods-list { flex: 1; display: flex; flex-direction: column; gap: 11px; min-width: 0; }
.goods-card {
  border-radius: var(--r-md);
  overflow: hidden;
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 16px 32px -18px rgba(2, 12, 20, 0.55);
  transition: transform 0.3s var(--ease);
}
.goods-card:active { transform: scale(0.978); }
.goods-img { width: 100%; display: block; aspect-ratio: 1; object-fit: cover; }
.goods-info { padding: 11px 11px 12px; }
.goods-tags { display: flex; gap: 5px; margin-bottom: 7px; flex-wrap: wrap; }
/* 标签改"浅底 + 细描边"，比实心色块安静得多 */
.goods-tags .tag {
  padding: 1.5px 6px;
  font-size: 9.5px;
  letter-spacing: 0.3px;
  color: #0b6a86;
  background: rgba(11, 122, 158, 0.08);
  border: 1px solid rgba(11, 122, 158, 0.2);
  border-radius: 5px;
}
.goods-name {
  margin: 0 0 9px;
  font-size: 12.5px;
  line-height: 1.55;
  color: #16323f;
  letter-spacing: 0.1px;
  overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.goods-price-row {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 8px;
}
.price {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  font-size: 19px; font-weight: 700;
  letter-spacing: -0.3px;
  color: var(--coral);
}
.price small { font-size: 11px; font-weight: 600; color: var(--coral); margin-right: 1px; }
.similar {
  padding: 2.5px 9px;
  font-size: 10.5px;
  color: #8ba3ad;
  border: 1px solid #e2ebf0;
  border-radius: var(--r-pill);
}
.goods-shop {
  display: flex; align-items: center; gap: 5px;
  font-size: 10.5px;
  color: #a0b4bd;
}
.shop-tag {
  padding: 1px 5px;
  font-size: 9.5px;
  letter-spacing: 0.3px;
  color: var(--gold-deep);
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid var(--hairline);
  border-radius: 4px;
}
.shop-name { letter-spacing: 0.3px; }

/* ────────── AI 导购悬浮球 ────────── */
.ai-fab {
  position: fixed;
  right: 16px;
  bottom: 74px;
  z-index: 900;
  width: 50px; height: 50px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1px;
  border-radius: 17px;
  background: linear-gradient(145deg, var(--gold-soft) 0%, var(--gold) 55%, var(--gold-deep) 100%);
  box-shadow: 0 16px 32px -12px rgba(201, 169, 97, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transition: transform 0.26s var(--ease);
}
.ai-fab:active { transform: scale(0.93); }
.ai-fab-badge { font-size: 15px; font-weight: 800; line-height: 1; color: #1a1206; }
.ai-fab-text { font-size: 9.5px; line-height: 1; letter-spacing: 0.5px; color: rgba(26, 18, 6, 0.75); }
</style>
