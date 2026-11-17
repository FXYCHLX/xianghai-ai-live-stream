<template>
  <div class="discover-page">
    <!-- 顶部搜索 -->
    <div class="header">
      <div class="search-box" @click="$router.push('/home')">
        <van-icon name="search" />
        <span>搜连江海产、吃法、产地</span>
      </div>
      <van-icon name="chat-o" class="msg-icon" @click="$router.push('/message')" />
    </div>

    <!-- 瀑布流内容 -->
    <div class="waterfall-content">
      <div class="waterfall-column" v-for="(col, idx) in [leftGoods, rightGoods]" :key="idx">
        <div class="discover-card" v-for="item in col" :key="item.id" @click="goDetail(item)">
          <img :src="item.pic" class="card-img" />
          <div class="card-info">
            <p class="card-title">{{ item.name }}</p>
            <div class="card-user">
              <span class="user-avatar" :style="{ background: avatarColor(item.userName) }">{{ item.userName.slice(0, 1) }}</span>
              <span class="user-name">{{ item.userName }}</span>
            </div>
            <div class="card-stats">
              <span class="likes">❤️ {{ item.likes }}</span>
              <span class="price">¥{{ item.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布按钮 -->
    <div class="publish-btn" @click="showToast('发布种草')">
      <van-icon name="plus" />
      <span>发布</span>
    </div>

    <van-tabbar v-model="activeTab" active-color="#7fd4e8" inactive-color="rgba(234, 246, 251, 0.55)">
      <van-tabbar-item name="home" icon="home-o" @click="$router.push('/home')">首页</van-tabbar-item>
      <van-tabbar-item name="category" icon="apps-o" @click="$router.push('/category')">分类</van-tabbar-item>
      <van-tabbar-item name="discover" icon="fire-o">发现</van-tabbar-item>
      <van-tabbar-item name="cart" icon="shopping-cart-o" :badge="cartBadge" @click="$router.push('/cart')">购物车</van-tabbar-item>
      <van-tabbar-item name="mine" icon="user-o" @click="$router.push('/mine')">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { cartBadgeText } from '../utils/cart'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const activeTab = ref('discover')

// 发现页种草内容（使用商品ID映射到真实商品）
const discoverList = ref([
  { id: 1, name: '黄岐半岛现捞鲍鱼，9 头的这个价真的少见', price: '88.00', pic: '/images/seafood/abalone.webp', userName: '产地直发老林', likes: 8642, goodsId: 1 },
  { id: 2, name: '晓澳缢蛏挖回来了，吐沙超干净，直接下锅', price: '49.90', pic: '/images/seafood/razorclam.webp', userName: '连江渔家妹', likes: 5210, goodsId: 2 },
  { id: 3, name: '花蛤这样炒，一锅比大排档还香', price: '29.90', pic: '/images/seafood/clam.webp', userName: '福州吃货阿May', likes: 12400, goodsId: 3 },
  { id: 4, name: '定海湾生蚝现开现发，敢生吃的那种新鲜', price: '58.00', pic: '/images/seafood/oyster.webp', userName: '海边老张', likes: 3410, goodsId: 4 },
  { id: 5, name: '带膏皮皮虾，只只活跳，剥壳那一刻值了', price: '68.00', pic: '/images/seafood/mantis.webp', userName: '海鲜猎人', likes: 2980, goodsId: 5 },
  { id: 6, name: '梭子蟹母蟹带膏，清蒸蘸醋，鲜到跺脚', price: '118.00', pic: '/images/seafood/crab.webp', userName: '连江本地人', likes: 1860, goodsId: 6 },
  { id: 7, name: '坑园大黄鱼，蒜瓣肉，清蒸一筷子不散', price: '45.00', pic: '/images/seafood/croaker.webp', userName: '渔港日记', likes: 7200, goodsId: 7 },
  { id: 8, name: '官坞头水海带，出胶厚实，煲汤一流', price: '19.90', pic: '/images/seafood/grouper.webp', userName: '阿婆的海味铺', likes: 11200, goodsId: 11 },
  { id: 9, name: '头水紫菜免洗，蛋花汤 30 秒就搞定', price: '42.00', pic: '/images/seafood/clam.webp', userName: '早餐研究所', likes: 9640, goodsId: 12 },
  { id: 10, name: '福州鱼丸手打的，一口爆汁，别买速冻的', price: '38.00', pic: '/images/seafood/shrimp.webp', userName: '深夜食堂', likes: 18600, goodsId: 19 }
])

const AVATAR_COLORS = ['#0b7a9e', '#12a594', 'var(--gold-deep)', '#7a6bc4', '#c98a2b', '#3f8a52']
const avatarColor = (n) => AVATAR_COLORS[[...String(n || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

const leftGoods = computed(() => discoverList.value.filter((_, i) => i % 2 === 0))
const rightGoods = computed(() => discoverList.value.filter((_, i) => i % 2 === 1))

// 点击种草跳转到对应商品详情
const goDetail = (item) => {
  router.push({ path: '/detail', query: { id: item.goodsId } })
}

const cartBadge = ref(cartBadgeText())
const updateCartBadge = () => { cartBadge.value = cartBadgeText() }
onMounted(updateCartBadge)
</script>

<style scoped>
.discover-page { background: #f2f6f8; min-height: 100vh; padding-bottom: 60px; }
.header { display: flex; align-items: center; padding: 10px 15px; background: #fff; gap: 12px; }
.search-box { flex: 1; display: flex; align-items: center; background: #f5f5f5; border-radius: 20px; padding: 8px 15px; gap: 8px; }
.search-box span { color: #999; font-size: 13px; }
.msg-icon { font-size: 22px; color: #333; }
.waterfall-content { display: flex; gap: 8px; padding: 8px; }
.waterfall-column { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.discover-card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 12px rgba(9, 58, 84, 0.07); }
.card-img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; background: #eef6f9; }
.card-info { padding: 10px; }
.card-title { font-size: 13px; color: #333; line-height: 1.5; margin: 0 0 8px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.card-user { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.user-avatar { width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; color: #fff; flex-shrink: 0; }
.user-name { font-size: 11px; color: #999; }
.card-stats { display: flex; justify-content: space-between; align-items: center; }
.likes { font-size: 12px; color: #999; }
.price { background: linear-gradient(135deg, var(--gold-soft), var(--gold-deep)); -webkit-background-clip: text; background-clip: text; color: transparent; font-size: 14px; font-weight: 700; }
.publish-btn { position: fixed; right: 20px; bottom: 80px; width: 56px; height: 56px; background: linear-gradient(135deg, #0b7a9e, var(--gold-deep)); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 12px rgba(11,122,158,0.4); }
.publish-btn .van-icon { font-size: 20px; }
.publish-btn span { font-size: 10px; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.discover-page .discover-card {
  border: 1px solid var(--hairline-soft) !important;
  box-shadow: 0 18px 36px -22px rgba(2, 12, 20, 0.65) !important;
}
.discover-page .price {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  letter-spacing: -0.3px;
}
.discover-page .search-bar,
.discover-page .discover-header {
  border-bottom: 1px solid var(--hairline);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
}

</style>
