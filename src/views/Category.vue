<template>
  <div class="category-page">
    <div class="search-header">
      <div class="search-box" @click="showSearch = true">
        <van-icon name="search" />
        <span :class="{ keyword }">{{ keyword || '搜索商品、品牌' }}</span>
        <van-icon v-if="keyword" name="clear" class="clear-kw" @click.stop="clearKeyword" />
      </div>
      <van-icon name="chat-o" class="msg-icon" @click="$router.push('/message')" />
    </div>

    <van-popup v-model:show="showSearch" position="top">
      <van-search v-model="searchInput" placeholder="搜连江海产 · 吃法 · 产地" shape="round" autofocus show-action @search="doSearch">
        <template #action><span @click="showSearch = false">取消</span></template>
      </van-search>
    </van-popup>
    <div class="category-body">
      <div class="left-nav">
        <div v-for="cat in categoryList" :key="cat.id" class="nav-item" :class="{ active: currentCat === cat.id }" @click="switchCategory(cat)">
          <span>{{ cat.name }}</span>
        </div>
      </div>
      <div class="right-content">
        <!-- 搜索结果态 -->
        <template v-if="keyword">
          <div class="search-head">
            <span>「{{ keyword }}」共 {{ categoryGoods.length }} 件</span>
            <span class="clear-btn" @click="clearKeyword">清除</span>
          </div>
          <div class="hot-list">
            <div class="hot-item" v-for="item in categoryGoods" :key="item.id" @click="goDetail(item)">
              <img :src="item.pic" />
              <p class="hot-name">{{ item.name }}</p>
              <p class="hot-price">¥{{ item.price }}</p>
            </div>
          </div>
          <van-empty v-if="categoryGoods.length === 0" description="没有找到相关商品，换个词试试" />
        </template>

        <!-- 分类浏览态 -->
        <template v-else>
          <div class="cat-banner"><img :src="currentCategory.banner" /></div>
          <div class="sub-cats">
            <div class="sub-title">{{ currentCategory.name }}</div>
            <div class="sub-grid">
              <div class="sub-item" v-for="sub in currentCategory.children" :key="sub.id" @click="showToast(sub.name)">
                <div class="sub-icon" :style="{ background: sub.bg }"><svg viewBox="0 0 24 24" v-html="sub.icon"></svg></div>
                <span>{{ sub.name }}</span>
              </div>
            </div>
          </div>
          <div class="hot-goods">
            <div class="hot-title">热门推荐</div>
            <div class="hot-list">
              <div class="hot-item" v-for="item in categoryGoods" :key="item.id" @click="goDetail(item)">
                <img :src="item.pic" />
                <p class="hot-name">{{ item.name }}</p>
                <p class="hot-price">¥{{ item.price }}</p>
              </div>
            </div>
            <van-empty v-if="categoryGoods.length === 0" description="该分类暂无商品" />
          </div>
        </template>
      </div>
    </div>
    <van-tabbar v-model="activeTab" active-color="#7fd4e8" inactive-color="rgba(234, 246, 251, 0.55)">
      <van-tabbar-item name="home" icon="home-o" @click="$router.push('/home')">首页</van-tabbar-item>
      <van-tabbar-item name="category" icon="apps-o">分类</van-tabbar-item>
      <van-tabbar-item name="discover" icon="fire-o" @click="$router.push('/discover')">发现</van-tabbar-item>
      <van-tabbar-item name="cart" icon="shopping-cart-o" :badge="cartBadge" @click="$router.push('/cart')">购物车</van-tabbar-item>
      <van-tabbar-item name="mine" icon="user-o" @click="$router.push('/mine')">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { cartBadgeText } from '../utils/cart'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { GOODS, searchGoods } from '../data/goods'

const route = useRoute()
const router = useRouter()
const activeTab = ref('category')
const currentCat = ref(1)

// 商品数据统一维护在 src/data/goods.js
const allGoods = ref(GOODS)

// ── 搜索 ──
const keyword = ref(String(route.query.kw || '').trim())
const showSearch = ref(false)
const searchInput = ref('')
const doSearch = () => {
  keyword.value = searchInput.value.trim()
  showSearch.value = false
}
const clearKeyword = () => {
  keyword.value = ''
  searchInput.value = ''
}

// 分类映射 catId -> categoryList.id
const catIdMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10 }

const categoryList = ref([
  {
    id:1, name:'热门推荐', catId: 1,
    banner:'/images/seafood/croaker.webp',
    children:[
      { id: 11, name: '码头直发', icon: '<path d="M20 12c-2.6 3.6-5.7 5.6-9.2 5.6-3.1 0-5.7-2-7.3-5.6 1.6-3.6 4.2-5.6 7.3-5.6 3.5 0 6.6 2 9.2 5.6z"/><path d="M20 12l3.2-3.2v6.4L20 12z"/><circle cx="10.4" cy="11" r=".9"/>', bg: 'linear-gradient(135deg, #d9eef7, #a8dbec)' },
      { id: 12, name: '官坞海带', icon: '<path d="M8 3.6c-1.6 3 1.6 4.4 0 7.4s1.6 4.4 0 7.4"/><path d="M12.4 3.6c-1.6 3 1.6 4.4 0 7.4s1.6 4.4 0 7.4"/><path d="M16.8 3.6c-1.6 3 1.6 4.4 0 7.4s1.6 4.4 0 7.4"/>', bg: 'linear-gradient(135deg, #dcf1e9, #b0ddca)' },
      { id: 13, name: '头水紫菜', icon: '<rect x="4.6" y="5.2" width="14.8" height="13.6" rx="2"/><path d="M4.6 9.8h14.8M4.6 14.2h14.8"/>', bg: 'linear-gradient(135deg, #bfe6f3, #7fd4e8)' },
      { id: 14, name: '连江鲍鱼', icon: '<path d="M12 6.2c4 0 7 2.6 7 6 0 3.4-3.1 5.8-7 5.8s-7-2.4-7-5.8c0-3.4 3-6 7-6z"/><path d="M12 6.2v11.8M8.8 7.4l1.5 10.4M15.2 7.4l-1.5 10.4"/>', bg: 'linear-gradient(135deg, #fdeade, #f6d0b3)' },
      { id: 15, name: '福州鱼丸', icon: '<circle cx="12" cy="12" r="6.6"/><path d="M9.4 10.2c.7-1.1 2.4-1.5 3.6-.6"/>', bg: 'linear-gradient(135deg, #fbe2ea, #f2c6d6)' },
      { id: 16, name: '9.9 尝鲜', icon: '<path d="M4 7.2h16v3.4a2.2 2.2 0 0 0 0 4.4v3.4H4v-3.4a2.2 2.2 0 0 0 0-4.4V7.2z"/><path d="M10.6 9.8v1.6M10.6 14.4v1.6"/>', bg: 'linear-gradient(135deg, #e4ecf1, #c7d8e1)' }
    ]
  },
  {
    id:2, name:'鲜活海产', catId: 2,
    banner:'/images/seafood/oyster.webp',
    children:[
      { id: 21, name: '鲍鱼', icon: '<path d="M12 6.2c4 0 7 2.6 7 6 0 3.4-3.1 5.8-7 5.8s-7-2.4-7-5.8c0-3.4 3-6 7-6z"/><path d="M12 6.2v11.8M8.8 7.4l1.5 10.4M15.2 7.4l-1.5 10.4"/>', bg: 'linear-gradient(135deg, #d9eef7, #a8dbec)' },
      { id: 22, name: '生蚝', icon: '<path d="M12 7c3.6 0 6.4 2.2 6.4 5s-2.9 5-6.4 5-6.4-2.2-6.4-5S8.4 7 12 7z"/><path d="M12 7v10M9.4 7.6l-1 9M14.6 7.6l1 9"/>', bg: 'linear-gradient(135deg, #bfe6f3, #7fd4e8)' },
      { id: 23, name: '虾蟹', icon: '<ellipse cx="12" cy="13.4" rx="6.4" ry="4.6"/><path d="M5.6 10.8L3.2 8.4M18.4 10.8l2.4-2.4M7.2 17.6l-2 2.2M16.8 17.6l2 2.2"/><circle cx="10.6" cy="12.2" r=".85"/><circle cx="13.4" cy="12.2" r=".85"/>', bg: 'linear-gradient(135deg, #fdeade, #f6d0b3)' },
      { id: 24, name: '贝类', icon: '<path d="M12 7c3.6 0 6.4 2.2 6.4 5s-2.9 5-6.4 5-6.4-2.2-6.4-5S8.4 7 12 7z"/><path d="M12 7v10M9.4 7.6l-1 9M14.6 7.6l1 9"/>', bg: 'linear-gradient(135deg, #dcf1e9, #b0ddca)' },
      { id: 25, name: '海鱼', icon: '<path d="M20 12c-2.6 3.6-5.7 5.6-9.2 5.6-3.1 0-5.7-2-7.3-5.6 1.6-3.6 4.2-5.6 7.3-5.6 3.5 0 6.6 2 9.2 5.6z"/><path d="M20 12l3.2-3.2v6.4L20 12z"/><circle cx="10.4" cy="11" r=".9"/>', bg: 'linear-gradient(135deg, #d9eef7, #a8dbec)' },
      { id: 26, name: '时令鲜货', icon: '<path d="M2.6 9c2.8-3 5.6-3 8.4 0s5.6 3 8.4 0"/><path d="M2.6 15.4c2.8-3 5.6-3 8.4 0s5.6 3 8.4 0"/>', bg: 'linear-gradient(135deg, #bfe6f3, #7fd4e8)' }
    ]
  },
  {
    id:3, name:'干货海味', catId: 3,
    banner:'/images/seafood/kelp.webp',
    children:[
      { id: 31, name: '官坞海带', icon: '<path d="M8 3.6c-1.6 3 1.6 4.4 0 7.4s1.6 4.4 0 7.4"/><path d="M12.4 3.6c-1.6 3 1.6 4.4 0 7.4s1.6 4.4 0 7.4"/><path d="M16.8 3.6c-1.6 3 1.6 4.4 0 7.4s1.6 4.4 0 7.4"/>', bg: 'linear-gradient(135deg, #dcf1e9, #b0ddca)' },
      { id: 32, name: '头水紫菜', icon: '<rect x="4.6" y="5.2" width="14.8" height="13.6" rx="2"/><path d="M4.6 9.8h14.8M4.6 14.2h14.8"/>', bg: 'linear-gradient(135deg, #bfe6f3, #7fd4e8)' },
      { id: 33, name: '干贝瑶柱', icon: '<path d="M12 6.2c4 0 7 2.6 7 6 0 3.4-3.1 5.8-7 5.8s-7-2.4-7-5.8c0-3.4 3-6 7-6z"/><path d="M12 6.2v11.8M8.8 7.4l1.5 10.4M15.2 7.4l-1.5 10.4"/>', bg: 'linear-gradient(135deg, #fdeade, #f6d0b3)' },
      { id: 34, name: '淡干虾皮', icon: '<path d="M8.4 5.6c4.6.6 7.8 3.4 7.8 7.4 0 3.2-2.4 5.4-5.6 5.4"/><path d="M10.6 18.4c-3 0-5.2-2.2-5.2-5.2"/><path d="M4.6 9.4h2M4.8 13h2M6.2 16.4l1.8-1.4"/><circle cx="14.6" cy="9.2" r=".9"/>', bg: 'linear-gradient(135deg, #fbe2ea, #f2c6d6)' },
      { id: 35, name: '各式鱼干', icon: '<path d="M19 11c-2.3 3.3-5.1 5-8.3 5-2.8 0-5.1-1.8-6.6-5 1.5-3.2 3.8-5 6.6-5 3.2 0 6 1.7 8.3 5z"/><path d="M19 11l3-3v6l-3-3z"/><path d="M8.5 8.2v5.6M11.5 7.6v6.8"/>', bg: 'linear-gradient(135deg, #d9eef7, #a8dbec)' },
      { id: 36, name: '鱿鱼墨鱼', icon: '<circle cx="12" cy="12" r="3.8"/><path d="M12 3.2v2.2M12 18.6v2.2M3.2 12h2.2M18.6 12h2.2M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6"/>', bg: 'linear-gradient(135deg, #e4ecf1, #c7d8e1)' }
    ]
  },
  {
    id:4, name:'预制即食', catId: 4,
    banner:'/images/seafood/fishball.webp',
    children:[
      { id: 41, name: '福州鱼丸', icon: '<circle cx="12" cy="12" r="6.6"/><path d="M9.4 10.2c.7-1.1 2.4-1.5 3.6-.6"/>', bg: 'linear-gradient(135deg, #d9eef7, #a8dbec)' },
      { id: 42, name: '连江鱼面', icon: '<path d="M3.4 11h17.2a8.6 8.6 0 0 1-17.2 0z"/><path d="M9 7.6c0-2.2 6-2.2 6 0"/><path d="M2.6 19.4h18.8"/>', bg: 'linear-gradient(135deg, #bfe6f3, #7fd4e8)' },
      { id: 43, name: '即食海苔', icon: '<rect x="4.6" y="5.2" width="14.8" height="13.6" rx="2"/><path d="M4.6 9.8h14.8M4.6 14.2h14.8"/>', bg: 'linear-gradient(135deg, #dcf1e9, #b0ddca)' },
      { id: 44, name: '香酥小黄鱼', icon: '<path d="M19 11c-2.3 3.3-5.1 5-8.3 5-2.8 0-5.1-1.8-6.6-5 1.5-3.2 3.8-5 6.6-5 3.2 0 6 1.7 8.3 5z"/><path d="M19 11l3-3v6l-3-3z"/><path d="M8.5 8.2v5.6M11.5 7.6v6.8"/>', bg: 'linear-gradient(135deg, #fdeade, #f6d0b3)' },
      { id: 45, name: '醉泥螺', icon: '<path d="M12 3.8s5.4 5.8 5.4 9.4a5.4 5.4 0 0 1-10.8 0C6.6 9.6 12 3.8 12 3.8z"/>', bg: 'linear-gradient(135deg, #fbe2ea, #f2c6d6)' },
      { id: 46, name: '虾油鱼露', icon: '<path d="M10 3.6h4v2.2c0 .8.4 1.3 1 1.8.8.8 1.4 1.8 1.4 3v9.6c0 1.2-.8 2-2 2h-4.8c-1.2 0-2-.8-2-2v-9.6c0-1.2.6-2.2 1.4-3 .6-.5 1-1 1-1.8V3.6z"/><path d="M7.6 13.4h8.8"/>', bg: 'linear-gradient(135deg, #e4ecf1, #c7d8e1)' }
    ]
  },
  {
    id:5, name:'海味礼盒', catId: 5,
    banner:'/images/seafood/giftbox.webp',
    children:[
      { id: 51, name: '连江伴手礼', icon: '<rect x="3" y="8.4" width="18" height="11.6" rx="2.2"/><path d="M3 12.4h18M12 8.4v11.6"/><path d="M12 8.4c-1.8-3.4-6-3-6 0M12 8.4c1.8-3.4 6-3 6 0"/>', bg: 'linear-gradient(135deg, #d9eef7, #a8dbec)' },
      { id: 52, name: '商务馈赠', icon: '<rect x="3" y="8.4" width="18" height="11.6" rx="2.2"/><path d="M3 12.4h18M12 8.4v11.6"/><path d="M12 8.4c-1.8-3.4-6-3-6 0M12 8.4c1.8-3.4 6-3 6 0"/>', bg: 'linear-gradient(135deg, #bfe6f3, #7fd4e8)' },
      { id: 53, name: '年货大礼包', icon: '<rect x="3" y="8.4" width="18" height="11.6" rx="2.2"/><path d="M3 12.4h18M12 8.4v11.6"/><path d="M12 8.4c-1.8-3.4-6-3-6 0M12 8.4c1.8-3.4 6-3 6 0"/>', bg: 'linear-gradient(135deg, #fdeade, #f6d0b3)' },
      { id: 54, name: '送长辈', icon: '<rect x="3" y="8.4" width="18" height="11.6" rx="2.2"/><path d="M3 12.4h18M12 8.4v11.6"/><path d="M12 8.4c-1.8-3.4-6-3-6 0M12 8.4c1.8-3.4 6-3 6 0"/>', bg: 'linear-gradient(135deg, #dcf1e9, #b0ddca)' },
      { id: 55, name: '干货四宝', icon: '<rect x="3" y="8.4" width="18" height="11.6" rx="2.2"/><path d="M3 12.4h18M12 8.4v11.6"/><path d="M12 8.4c-1.8-3.4-6-3-6 0M12 8.4c1.8-3.4 6-3 6 0"/>', bg: 'linear-gradient(135deg, #fbe2ea, #f2c6d6)' },
      { id: 56, name: '尊享礼盒', icon: '<path d="M12 3.8l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>', bg: 'linear-gradient(135deg, #e4ecf1, #c7d8e1)' }
    ]
  }
])

const currentCategory = computed(() => categoryList.value.find(c => c.id === currentCat.value) || categoryList.value[0])

// 当前分类的商品（搜索态下改为关键词检索结果）
const categoryGoods = computed(() => {
  if (keyword.value) return searchGoods(keyword.value, 30)
  const catId = currentCategory.value.catId
  // 「热门推荐」不是一个真实品类，商品表里没有 catId=1 的条目，
  // 直接按 catId 过滤会得到空列表（页面上就是「该分类无商品」），所以走销量榜
  if (catId === 1) return [...allGoods.value].sort((a, b) => b.sales - a.sales).slice(0, 8)
  return allGoods.value.filter(g => g.catId === catId).slice(0, 8)
})

const switchCategory = (cat) => { currentCat.value = cat.id }
const goDetail = (item) => router.push({ path:'/detail', query:{ id: item.id } })

// 接收首页传过来的catId
onMounted(() => {
  const queryCatId = parseInt(route.query.catId)
  if (queryCatId) {
    const targetCat = categoryList.value.find(c => c.catId === queryCatId)
    if (targetCat) currentCat.value = targetCat.id
  }
})

const cartBadge = ref(cartBadgeText())
const updateCartBadge = () => { cartBadge.value = cartBadgeText() }
onMounted(() => { 
  const queryCatId = parseInt(route.query.catId)
  if (queryCatId) {
    const targetCat = categoryList.value.find(c => c.catId === queryCatId)
    if (targetCat) currentCat.value = targetCat.id
  }
  updateCartBadge() 
})
</script>

<style scoped>
.category-page { background: #f7f7f7; min-height: 100vh; padding-bottom: 60px; }
.search-header { display: flex; align-items: center; padding: 8px 15px; background: #fff; gap: 12px; }
.search-box { flex: 1; display: flex; align-items: center; background: #f5f5f5; border-radius: 20px; padding: 8px 15px; gap: 8px; }
.search-box span { color: #999; font-size: 13px; }
.msg-icon { font-size: 22px; color: #333; }
.category-body { display: flex; height: calc(100vh - 100px); }
.left-nav { width: 85px; background: #f7f7f7; overflow-y: auto; }
.nav-item { padding: 18px 10px; text-align: center; font-size: 13px; color: #666; position: relative; }
.nav-item.active { background: #fff; color: #0b7a9e; font-weight: 500; }
.nav-item.active::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 20px; background: #0b7a9e; }
.right-content { flex: 1; background: #fff; overflow-y: auto; padding: 10px; }
.cat-banner { border-radius: 10px; overflow: hidden; margin-bottom: 15px; }
.cat-banner img { width: 100%; height: 110px; object-fit: cover; object-position: center 38%; }
.sub-title { font-size: 14px; color: #333; font-weight: 500; margin-bottom: 12px; }
.sub-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
.sub-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.sub-icon svg { width: 22px; height: 22px; fill: none; stroke: #0b4666; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.sub-icon { width: 55px; height: 55px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.sub-item span { font-size: 12px; color: #666; }
.hot-title { font-size: 14px; color: #333; font-weight: 500; margin-bottom: 12px; }
.hot-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.hot-item { background: #f7f7f7; border-radius: 8px; overflow: hidden; }
.hot-item img { width: 100%; height: 100px; object-fit: cover; }
.hot-name { font-size: 12px; color: #333; margin: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hot-price { font-size: 14px; color: var(--price); font-weight: 700; margin: 0 8px 8px; }

/* ── 搜索 ── */
.search-box .keyword { color: #333; font-weight: 500; }
.clear-kw { color: #bbb; font-size: 15px; }
.search-head { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #666; margin-bottom: 12px; }
.clear-btn { font-size: 12px; color: #0b7a9e; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.category-page .cat-banner {
  border-radius: var(--r-lg) !important;
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 16px 32px -22px rgba(2, 12, 20, 0.5);
}
.category-page .sub-title {
  font-weight: 700 !important;
  letter-spacing: 0.6px;
  color: #0f2c3a !important;
}
.category-page .sub-icon {
  box-shadow: 0 8px 18px -10px rgba(9, 58, 84, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
}
.category-page .sub-item span { color: #35515f; letter-spacing: 0.3px; }
.category-page .cart-item,
.category-page .goods-item,
.category-page .hot-goods [class*="item"] {
  border-radius: var(--r-md);
}
.category-page .price,
.category-page .goods-price {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  color: var(--coral);
  font-weight: 700;
  letter-spacing: -0.3px;
}

</style>
