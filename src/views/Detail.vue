<template>
  <div class="detail-page">
    <!-- 顶部导航 -->
    <div class="nav-bar" :class="{ show: showNav }">
      <van-icon name="arrow-left" class="back" @click="$router.back()" />
      <div class="nav-tabs">
        <span :class="{ active: activeTab === 'goods' }" @click="scrollTo('goods')">商品</span>
        <span :class="{ active: activeTab === 'detail' }" @click="scrollTo('detail')">详情</span>
        <span :class="{ active: activeTab === 'recommend' }" @click="scrollTo('recommend')">推荐</span>
      </div>
      <van-icon name="ellipsis" class="more" @click="showShare = true" />
    </div>

    <van-share-sheet v-model:show="showShare" title="立即分享给好友" :options="shareOptions" @select="onShareSelect" />

    <!-- 商品图片轮播 -->
    <div class="goods-swiper" ref="goodsRef">
      <van-swipe @change="onSwipeChange">
        <van-swipe-item v-for="(img, i) in goodsImages" :key="i">
          <img :src="img" class="goods-img" />
        </van-swipe-item>
        <template #indicator>
          <div class="custom-indicator">{{ currentSwipe + 1 }}/{{ goodsImages.length }}</div>
        </template>
      </van-swipe>
    </div>

    <!-- 价格区域 -->
    <div class="price-section">
      <div class="price-row">
<span class="price-symbol">¥</span><span class="price-num">{{ goods.price }}</span>
        <span class="original">¥{{ goods.originalPrice }}</span>
        <span class="discount">{{ discount }}折</span>
      </div>
      <div class="price-tags">
        <span class="tag red">码头直发</span>
        <span class="tag">满99减20</span>
        <span class="tag">包邮</span>
      </div>
    </div>

    <!-- 商品标题 -->
    <div class="title-section">
      <div class="goods-name"><span class="self-tag">码头直发</span>{{ goods.name }}</div>
      <div class="goods-desc">{{ goods.desc }}</div>
    </div>

    <!-- 服务 -->
    <div class="service-bar" @click="showService = true">
      <div class="service-item"><van-icon name="passed" color="#0b7a9e" /><span>码头直发</span></div>
      <div class="service-item"><van-icon name="passed" color="#0b7a9e" /><span>鲜活保障</span></div>
      <div class="service-item"><van-icon name="passed" color="#0b7a9e" /><span>死蟹包赔</span></div>
      <van-icon name="arrow" class="arrow" />
    </div>

    <van-action-sheet v-model:show="showService" title="服务说明">
      <div class="service-list">
        <div class="service-row"><van-icon name="passed" color="#0b7a9e" size="20" /><div class="service-info"><p class="service-title">码头直发</p><p class="service-desc">黄岐半岛码头当日打包，全程冷链直发</p></div></div>
        <div class="service-row"><van-icon name="passed" color="#0b7a9e" size="20" /><div class="service-info"><p class="service-title">鲜活保障</p><p class="service-desc">到货不鲜活，凭开箱视频即赔</p></div></div>
        <div class="service-row"><van-icon name="passed" color="#0b7a9e" size="20" /><div class="service-info"><p class="service-title">不鲜活包赔</p><p class="service-desc">签收 6 小时内举证有效</p></div></div>
      </div>
    </van-action-sheet>

    <!-- 规格 -->
    <div class="sku-bar" @click="showSku = true">
      <span class="label">已选</span><span class="value">{{ selectedSku }}，1件</span><van-icon name="arrow" class="arrow" />
    </div>

    <van-sku v-model:show="showSku" :sku="sku" :goods="skuGoods" :goods-id="goods.id" @buy-clicked="onBuyClicked" @add-cart="onAddCart" />

    <!-- 配送 -->
    <div class="address-bar" @click="showAddress = true">
      <span class="label">送至</span><span class="value">{{ currentAddress }}</span><span class="stock">有货</span><van-icon name="arrow" class="arrow" />
    </div>

    <van-popup v-model:show="showAddress" position="bottom" round>
      <van-address-list v-model="chosenAddressId" :list="addressList" default-tag-text="默认" @add="onAddAddress" @select="onSelectAddress" />
    </van-popup>

    <!-- 评价 -->
    <div class="comment-section">
      <div class="comment-header"><span>商品评价 ({{ commentCount }})</span><span class="good-rate">好评率 {{ goodRate }}% ></span></div>

      <!-- AI 评价总结：把几百条评价读成几句话 -->
      <div class="ai-summary">
        <div class="ai-summary-head">
          <div class="ai-badge-sm">AI</div>
          <div class="ai-summary-title">AI 评价总结</div>
          <van-button
            v-if="!summary && !summaryLoading"
            size="mini" type="primary" round
            @click="loadSummary"
          >一键读完 {{ commentCount }} 条评价</van-button>
          <span v-else-if="summaryLoading" class="ai-loading">正在阅读评价…</span>
          <span v-else class="ai-again" @click="loadSummary">重新总结</span>
        </div>

        <div class="ai-summary-body" v-if="summary">
          <p class="summary-text">{{ summary.summary }}</p>
          <div class="summary-grid">
            <div class="summary-col good" v-if="summary.pros && summary.pros.length">
              <div class="col-title">买家普遍认可</div>
              <div class="col-item" v-for="p in summary.pros" :key="p">{{ p }}</div>
            </div>
            <div class="summary-col bad" v-if="summary.cons && summary.cons.length">
              <div class="col-title">需要留意</div>
              <div class="col-item" v-for="c in summary.cons" :key="c">{{ c }}</div>
            </div>
          </div>
          <p class="summary-suit" v-if="summary.suitable">适合谁买：{{ summary.suitable }}</p>
        </div>

        <div class="ai-error" v-if="summaryError">{{ summaryError }}</div>
      </div>

      <div class="comment-tags"><span v-for="tag in commentTags" :key="tag">{{ tag }}</span></div>
      <div class="comment-item" v-if="comments.length">
        <div class="comment-user">
          <img :src="comments[0].avatar" class="avatar" /><span class="username">{{ comments[0].user }}</span>
          <van-rate v-model="comments[0].star" readonly size="12" />
        </div>
        <p class="comment-content">{{ comments[0].content }}</p>
        <p class="comment-sku">{{ comments[0].sku }}</p>
      </div>
    </div>

    <!-- 店铺 -->
    <div class="shop-section">
      <div class="shop-info">
        <img :src="shop.logo" class="shop-logo" />
        <div class="shop-detail"><p class="shop-name">{{ shop.name }}</p><p class="shop-follow">{{ shop.followers }}万人关注</p></div>
      </div>
      <div class="shop-score">
        <div class="score-item"><span>商品</span><span class="high">{{ shop.goodsScore }}</span></div>
        <div class="score-item"><span>物流</span><span class="high">{{ shop.logisticsScore }}</span></div>
        <div class="score-item"><span>服务</span><span class="high">{{ shop.serviceScore }}</span></div>
      </div>
      <div class="shop-btns">
        <van-button plain round size="small" icon="shop-o">进入店铺</van-button>
        <van-button plain round size="small" icon="plus">关注店铺</van-button>
      </div>
    </div>

    <!-- 商品详情 -->
    <div class="detail-section" ref="detailRef">
      <div class="section-title">商品详情</div>
      <img v-for="i in 3" :key="i" :src="goodsImages[0]" class="detail-img" />
    </div>

    <!-- 推荐 -->
    <div class="recommend-section" ref="recommendRef">
      <div class="section-title">为你推荐</div>
      <div class="recommend-list">
        <div class="rec-item" v-for="item in recommendList" :key="item.id" @click="goDetail(item)">
          <img :src="item.pic" />
          <p class="rec-name">{{ item.name }}</p>
          <p class="rec-price">¥{{ item.price }}</p>
        </div>
      </div>
    </div>

    <!-- 底部栏 -->
    <div class="bottom-bar">
      <div class="bar-icon" @click="$router.push('/home')"><van-icon name="shop-o" /><span>店铺</span></div>
      <div class="bar-icon" @click="$router.push('/message')"><van-icon name="chat-o" /><span>客服</span></div>
      <div class="bar-icon" @click="toggleFavorite"><van-icon :name="isFavorited ? 'star' : 'star-o'" :color="isFavorited ? '#0b7a9e' : ''" /><span>收藏</span></div>
      <div class="bar-icon" @click="$router.push('/cart')"><van-icon name="shopping-cart-o" :badge="cartBadge" /><span>购物车</span></div>
      <div class="bar-btns">
        <van-button class="cart-btn" @click="quickAddCart">加入购物车</van-button>
        <van-button class="buy-btn" @click="showSku = true">立即购买</van-button>
      </div>
    </div>

    <!-- AI 导购悬浮入口：带着当前商品跳到对话页自动提问 -->
    <div class="ai-fab" @click="askAI">
      <div class="ai-fab-badge">AI</div>
      <span class="ai-fab-text">问这件</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getGoodsById, getGoodsByCat } from '../data/goods'
import { aiReviewSummary } from '../api/ai'
import { addToCart, pushFootprint, cartBadgeText } from '../utils/cart'

const route = useRoute()
const router = useRouter()

const goodsId = parseInt(route.query.id) || 1
const goods = ref(getGoodsById(goodsId))
const goodsImages = [goods.value.pic, goods.value.pic, goods.value.pic]
const currentSwipe = ref(0)
const onSwipeChange = (i) => { currentSwipe.value = i }
const discount = computed(() => Math.round(goods.value.price / goods.value.originalPrice * 10))

// 记录足迹
// 记录浏览足迹（首页 AI 推荐会读这份数据）
const saveFootprint = () => pushFootprint(goods.value)

const showNav = ref(false)
const activeTab = ref('goods')
const goodsRef = ref(null)
const detailRef = ref(null)
const recommendRef = ref(null)

const handleScroll = () => {
  const y = window.scrollY
  showNav.value = y > 200
  const dt = detailRef.value?.offsetTop || 9999
  const rt = recommendRef.value?.offsetTop || 9999
  if (y < dt - 100) activeTab.value = 'goods'
  else if (y < rt - 100) activeTab.value = 'detail'
  else activeTab.value = 'recommend'
}
const scrollTo = (s) => {
  activeTab.value = s
  const el = { goods: goodsRef.value, detail: detailRef.value, recommend: recommendRef.value }[s]
  if (el) window.scrollTo({ top: el.offsetTop - 50, behavior: 'smooth' })
}

// 快速加购 - 直接添加到购物车，无需SKU弹窗
const quickAddCart = () => {
  let cart = JSON.parse(localStorage.getItem('cartList') || '[]')
  const exist = cart.find(c => c.id === goods.value.id)
  if (exist) { exist.quantity = (exist.quantity || 1) + 1 }
  else {
    cart.push({
      id: goods.value.id,
      name: goods.value.name,
      price: goods.value.price,
      pic: goods.value.pic,
      quantity: 1,
      selected: true
    })
  }
  localStorage.setItem('cartList', JSON.stringify(cart))
  window.dispatchEvent(new StorageEvent('storage', { key: 'cartList' }))
  updateCartBadge()
  showToast('已加入购物车')
}


onMounted(() => { window.addEventListener('scroll', handleScroll); updateCartBadge(); saveFootprint(); checkFavorite() })
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

const showShare = ref(false)
const shareOptions = [{ name:'微信', icon:'wechat' },{ name:'朋友圈', icon:'wechat-moments' },{ name:'QQ', icon:'qq' },{ name:'复制链接', icon:'link' }]
const onShareSelect = (o) => { showToast(`分享到${o.name}`); showShare.value = false }

const showService = ref(false)

const showSku = ref(false)
const selectedSku = ref('默认规格')
const sku = {
  tree: [{ k:'规格', k_s:'s1', v:[{ id:'1', name:'默认规格' },{ id:'2', name:'礼盒装(+10元)' }] }],
  list: [{ id:1, s1:'1', price: goods.value.price*100, stock_num:999 },{ id:2, s1:'2', price: (goods.value.price+10)*100, stock_num:500 }],
  price: goods.value.price, stock_num: 999
}
const skuGoods = { picture: goods.value.pic }

const onAddCart = (skuData) => {
  addToCart(goods.value, skuData.selectedNum || 1, selectedSku.value)
  updateCartBadge()
  showSku.value = false
  showToast('已加入购物车')
}
const onBuyClicked = () => { showToast('立即购买') }

const showAddress = ref(false)
const currentAddress = ref('福建省 福州市 连江县')
const chosenAddressId = ref('1')
const addressList = [
  { id:'1', name:'张三', tel:'138****8888', address:'福建省福州市连江县黄岐镇海丰街 88 号', isDefault:true },
  { id:'2', name:'李四', tel:'139****9999', address:'上海市浦东新区xxx路xxx号' }
]
const onAddAddress = () => showToast('添加地址')
const onSelectAddress = (item) => { currentAddress.value = item.address.substring(0,6)+'...'; showAddress.value = false }

// 评价条数按销量推算，比写死数字更可信
const commentCount = ref(Math.max(128, Math.round(goods.value.sales * 0.18)))
const goodRate = ref(98)
const commentTags = ['质量好(888)','物流快(666)','性价比高(555)','包装好(444)']
const AVATARS = [
  '/images/goods/1535713875002-d1d0cf377fde.jpg',
  '/images/msg1.jpg',
  '/images/msg2.jpg',
  '/images/msg3.jpg'
]

const comments = ref([
  { user: '用****3182', avatar: AVATARS[0], star: 5, content: '用了两周了，实物和图片基本一致，做工比想象中好，边角处理得很细。', sku: '默认规格' },
  { user: 'y****920', avatar: AVATARS[1], star: 5, content: '发货很快，第二天就到了，外包装很扎实，没有磕碰。', sku: '默认规格' },
  { user: '小****鱼', avatar: AVATARS[2], star: 4, content: '整体满意，就是价格比别家贵一点点，不过质量确实好一些。', sku: '默认规格' },
  { user: 'w****1234', avatar: AVATARS[3], star: 5, content: '性价比挺高，已经推荐给室友了，他也准备下单。', sku: '默认规格' },
  { user: '阿****_', avatar: AVATARS[0], star: 3, content: '东西还行，但客服回复有点慢，问了半天才回。', sku: '默认规格' },
  { user: 'l****5566', avatar: AVATARS[1], star: 5, content: '第二次回购了，一如既往地稳。', sku: '默认规格' },
  { user: '张****同学', avatar: AVATARS[2], star: 4, content: '功能没问题，说明书有点简陋，新手可能要摸索一会儿。', sku: '默认规格' },
  { user: 'm****007', avatar: AVATARS[3], star: 5, content: '学生党表示很值，比线下便宜不少。', sku: '默认规格' },
  { user: 'n****8888', avatar: AVATARS[0], star: 4, content: '外观好看，就是颜色和图片有点色差，实际偏深一点。', sku: '默认规格' },
  { user: 'k****2024', avatar: AVATARS[1], star: 5, content: '物流速度没得说，客服态度也好，有问题秒回。', sku: '默认规格' }
])

/* ── AI 评价总结 ── */
const summary = ref(null)
const summaryLoading = ref(false)
const summaryError = ref('')

const loadSummary = async () => {
  if (summaryLoading.value) return
  summaryLoading.value = true
  summaryError.value = ''
  try {
    summary.value = await aiReviewSummary({
      goodsId: goods.value.id,
      comments: comments.value.map(c => c.content)
    })
  } catch (e) {
    summaryError.value = e.message
  } finally {
    summaryLoading.value = false
  }
}

const shop = ref({ name:'品牌旗舰店', logo:'/images/goods/1560179707-f14e90ef3623.jpg', followers:1250, goodsScore:4.9, logisticsScore:4.8, serviceScore:4.9 })

const recommendList = ref(getGoodsByCat(goods.value.catId).filter(g => g.id !== goodsId).slice(0, 6))

const goDetail = (item) => { router.push({ path:'/detail', query:{ id: item.id } }); window.scrollTo({ top:0 }) }

// 收藏功能
const isFavorited = ref(false)
const checkFavorite = () => {
  const fav = JSON.parse(localStorage.getItem('favorites') || '[]')
  isFavorited.value = fav.some(f => f.id === goods.value.id)
}
const toggleFavorite = () => {
  let fav = JSON.parse(localStorage.getItem('favorites') || '[]')
  if (isFavorited.value) {
    fav = fav.filter(f => f.id !== goods.value.id)
    showToast('已取消收藏')
  } else {
    fav.push({ id: goods.value.id, name: goods.value.name, price: goods.value.price, pic: goods.value.pic })
    showToast('收藏成功')
  }
  localStorage.setItem('favorites', JSON.stringify(fav))
  isFavorited.value = !isFavorited.value
}

const cartBadge = ref(cartBadgeText())
const updateCartBadge = () => { cartBadge.value = cartBadgeText() }

/** 带当前商品跳到 AI 对话页，进入后自动提问 */
const askAI = () => {
  sessionStorage.setItem(
    'ai:autoAsk',
    `我想买「${goods.value.name}」（¥${goods.value.price}，${goods.value.desc}），帮我分析一下值不值得买，也看看有没有更合适的替代品。`
  )
  router.push('/chat')
}
</script>

<style scoped>
.detail-page { background: #f7f7f7; padding-bottom: 60px; }
.nav-bar { position: fixed; top: 0; left: 0; right: 0; height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; background: transparent; z-index: 999; transition: background 0.3s; }
.nav-bar.show { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.nav-bar .back, .nav-bar .more { width: 32px; height: 32px; background: rgba(0,0,0,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; }
.nav-bar.show .back, .nav-bar.show .more { background: transparent; color: #333; }
.nav-tabs { display: flex; gap: 25px; opacity: 0; transition: opacity 0.3s; }
.nav-bar.show .nav-tabs { opacity: 1; }
.nav-tabs span { font-size: 14px; color: #666; position: relative; }
.nav-tabs span.active { color: #333; font-weight: 500; }
.nav-tabs span.active::after { content: ''; position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 20px; height: 3px; background: #0b7a9e; border-radius: 2px; }
.goods-swiper { position: relative; }
.goods-img { width: 100%; max-height: 280px; object-fit: cover; }
.custom-indicator { position: absolute; right: 10px; bottom: 10px; background: rgba(0,0,0,0.4); color: #fff; padding: 4px 10px; border-radius: 10px; font-size: 12px; }
.price-section { background: #fff; padding: 12px 15px; }
.price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.price-symbol { color: var(--price); font-size: 14px; font-weight: 700; }
.price-num { color: var(--price); font-size: 32px; font-weight: 700; }
.price-decimal { color: var(--price); font-size: 18px; }
.original { color: #999; font-size: 14px; text-decoration: line-through; }
.discount { background: var(--price); color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 8px; }
.price-tags { display: flex; gap: 8px; }
.price-tags .tag { background: #eaf4f8; color: var(--price); font-size: 11px; padding: 2px 6px; border-radius: 3px; }
.price-tags .tag.red { background: var(--price); color: #fff; }
.title-section { background: #fff; padding: 0 15px 15px; }
.goods-name { font-size: 16px; color: #333; line-height: 1.5; font-weight: 500; }
.self-tag { background: #0b7a9e; color: #fff; font-size: 11px; padding: 2px 4px; border-radius: 3px; margin-right: 6px; }
.goods-desc { font-size: 13px; color: #999; margin-top: 8px; }
.service-bar { display: flex; align-items: center; padding: 12px 15px; background: #fff; margin-top: 10px; gap: 15px; }
.service-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666; }
.service-bar .arrow { margin-left: auto; color: #999; }
.service-list { padding: 20px; }
.service-row { display: flex; gap: 12px; margin-bottom: 20px; }
.service-info { flex: 1; }
.service-title { font-size: 14px; color: #333; margin: 0 0 4px; }
.service-desc { font-size: 12px; color: #999; margin: 0; }
.sku-bar, .address-bar { display: flex; align-items: center; padding: 15px; background: #fff; margin-top: 10px; }
.sku-bar .label, .address-bar .label { color: #999; font-size: 13px; width: 40px; }
.sku-bar .value, .address-bar .value { flex: 1; color: #333; font-size: 13px; }
.address-bar .stock { color: #0b7a9e; font-size: 12px; margin-right: 10px; }
.sku-bar .arrow, .address-bar .arrow { color: #999; }
.comment-section { background: #fff; margin-top: 10px; padding: 15px; }

/* ── AI 评价总结 ── */
.ai-summary { background: #f2f9fc; border: 1px solid #d9edf5; border-radius: 12px; padding: 12px; margin-bottom: 15px; }
.ai-summary-head { display: flex; align-items: center; gap: 8px; }
.ai-badge-sm {
  width: 26px; height: 26px; border-radius: 9px; flex-shrink: 0;
  background: linear-gradient(135deg, #0b7a9e, #12a0c8); color: #fff;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.ai-summary-title { font-size: 13px; font-weight: 500; color: #333; flex: 1; }
.ai-loading, .ai-again { font-size: 12px; color: #0b7a9e; }
.ai-summary-body { margin-top: 12px; }
.summary-text { font-size: 13px; color: #444; line-height: 1.7; margin: 0 0 12px; }
.summary-grid { display: flex; flex-direction: column; gap: 10px; }
.summary-col { background: #fff; border-radius: 9px; padding: 10px 12px; }
.col-title { font-size: 12px; font-weight: 500; margin-bottom: 6px; }
.summary-col.good .col-title { color: #2e7d32; }
.summary-col.bad .col-title { color: var(--gold-deep); }
.col-item { font-size: 12px; color: #555; line-height: 1.8; padding-left: 12px; position: relative; }
.col-item::before { content: ''; position: absolute; left: 0; top: 9px; width: 4px; height: 4px; border-radius: 50%; background: #c8ccd4; }
.summary-suit { font-size: 12px; color: #0b7a9e; margin: 10px 0 0; line-height: 1.7; }
.ai-error { font-size: 12px; color: var(--brick); margin-top: 10px; }
.comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.comment-header span { font-size: 14px; color: #333; }
.good-rate { color: #0b7a9e; }
.comment-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; }
.comment-tags span { background: #eaf4f8; color: #666; font-size: 12px; padding: 4px 10px; border-radius: 12px; }
.comment-item { border-top: 1px solid #f5f5f5; padding-top: 15px; }
.comment-user { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.comment-user .avatar { width: 24px; height: 24px; border-radius: 50%; }
.comment-user .username { font-size: 13px; color: #666; flex: 1; }
.comment-content { font-size: 13px; color: #333; line-height: 1.6; margin: 0 0 8px; }
.comment-sku { font-size: 12px; color: #999; margin: 0; }
.shop-section { background: #fff; margin-top: 10px; padding: 15px; }
.shop-info { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
.shop-logo { width: 50px; height: 50px; border-radius: 8px; }
.shop-name { font-size: 15px; color: #333; margin: 0 0 4px; font-weight: 500; }
.shop-follow { font-size: 12px; color: #999; margin: 0; }
.shop-score { display: flex; gap: 30px; margin-bottom: 15px; padding: 0 10px; }
.score-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.score-item span:first-child { font-size: 12px; color: #999; }
.score-item .high { color: #0b7a9e; font-size: 14px; font-weight: 700; }
.shop-btns { display: flex; gap: 10px; }
.shop-btns .van-button { flex: 1; }
.detail-section, .recommend-section { background: #fff; margin-top: 10px; padding: 15px; }
.section-title { text-align: center; font-size: 14px; color: #333; margin-bottom: 15px; position: relative; }
.section-title::before, .section-title::after { content: ''; position: absolute; top: 50%; width: 50px; height: 1px; background: #ddd; }
.section-title::before { left: 80px; } .section-title::after { right: 80px; }
.detail-img { width: 100%; max-height: 200px; object-fit: cover; margin-bottom: 10px; }
.recommend-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.rec-item img { width: 100%; height: 80px; object-fit: cover; border-radius: 6px; }
.rec-name { font-size: 12px; color: #333; margin: 6px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rec-price { font-size: 14px; color: var(--price); font-weight: 700; margin: 0; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 50px; background: #fff; display: flex; align-items: center; padding: 0 6px; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 100; }

/* ── AI 导购悬浮入口 ── */
.ai-fab {
  position: fixed; right: 14px; bottom: 68px; z-index: 101;
  width: 52px; padding: 8px 0; border-radius: 14px;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  background: linear-gradient(135deg, #0b7a9e, #12a0c8);
  box-shadow: 0 6px 18px rgba(11, 122, 158, 0.42);
  cursor: pointer;
}
.ai-fab-badge { color: #fff; font-size: 15px; font-weight: 700; line-height: 1; }
.ai-fab-text { color: rgba(255, 255, 255, 0.92); font-size: 10px; line-height: 1; }
.bar-icon { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; flex-shrink: 0; gap: 2px; }
.bar-icon .van-icon { font-size: 19px; color: #666; }
.bar-icon span { font-size: 9px; color: #666; }
.bar-btns { display: flex; flex: 1; gap: 6px; margin-left: 6px; min-width: 0; }
.bar-btns .van-button { flex: 1; min-width: 0; border-radius: 20px; font-size: 12px; padding: 0; }
.cart-btn { background: linear-gradient(90deg, var(--gold), var(--gold-deep)); border: none; color: #fff; }
.buy-btn { background: linear-gradient(90deg, #0b7a9e, var(--gold-deep)); border: none; color: #fff; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层：平铺白块 → 珍珠卡片
   ──────────────────────────────────────────────────────────────────
   原样式是"每个 section 一块白 + margin-top:10px 平铺"，边界全靠白与白的
   微弱差异，看起来就是"默认样式"。改成有圆角、有金发丝、有投影、有呼吸
   间距的珍珠卡片。
   ══════════════════════════════════════════════════════════════════ */

.detail-page {
  background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important;
  padding-bottom: 70px;
  color: #16323f;
}

/* 价格 + 标题本是一张卡的两半：上圆角 / 下圆角，中间用一条极淡的金线分开 */
.detail-page .price-section {
  margin: 12px 12px 0 !important;
  padding: 18px 16px 15px !important;
  border-radius: var(--r-lg) var(--r-lg) 0 0 !important;
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%) !important;
  border: 1px solid var(--hairline-soft);
  border-bottom: 0;
  box-shadow: 0 16px 32px -24px rgba(2, 12, 20, 0.5);
}
.detail-page .title-section {
  margin: 0 12px !important;
  padding: 14px 16px 17px !important;
  border-radius: 0 0 var(--r-lg) var(--r-lg) !important;
  background: linear-gradient(0deg, #ffffff 0%, var(--pearl) 100%) !important;
  border: 1px solid var(--hairline-soft);
  border-top: 1px dashed rgba(201, 169, 97, 0.16);
  box-shadow: 0 20px 36px -26px rgba(2, 12, 20, 0.5);
}

/* 其余区块：各自成为一张珍珠卡 */
.detail-page .service-bar,
.detail-page .sku-bar,
.detail-page .address-bar,
.detail-page .comment-section,
.detail-page .shop-section,
.detail-page .detail-section,
.detail-page .recommend-section {
  margin: 12px 12px 0 !important;
  padding: 16px 15px !important;
  border-radius: var(--r-lg) !important;
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%) !important;
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.45);
}

/* 价格：等宽数字 + 负字距，数字块立刻规整 */
.detail-page .price-num,
.detail-page .price-symbol,
.detail-page .price-decimal {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
}
.detail-page .price-num { font-size: 33px; letter-spacing: -1px; }
.detail-page .price-symbol,
.detail-page .price-decimal { font-weight: 700; }
.detail-page .goods-name {
  font-size: 16.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: #0f2c3a;
  line-height: 1.52;
}
.detail-page .goods-desc { color: #8ba3ad; letter-spacing: 0.2px; }

/* 自营标签走金 */
.detail-page .self-tag {
  background: rgba(201, 169, 97, 0.12) !important;
  color: var(--gold-deep) !important;
  border: 1px solid var(--hairline);
  border-radius: 4px;
  font-weight: 600;
  letter-spacing: 0.4px;
}
.detail-page .discount {
  background: linear-gradient(140deg, var(--gold-soft), var(--coral)) !important;
  border-radius: var(--r-pill);
  letter-spacing: 0.4px;
}

/* 服务承诺条 */
.detail-page .service-item { color: #5b7a8c; letter-spacing: 0.2px; }
.detail-page .service-item .van-icon { color: var(--gold); }

/* 区块标题：大字距 + 深墨 */
.detail-page .section-title {
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 3.5px;
  color: #0f2c3a;
}

/* AI 评价摘要：淡金描边卡 */
.detail-page .ai-summary {
  background: linear-gradient(160deg, rgba(11, 74, 111, 0.045), rgba(201, 169, 97, 0.075)) !important;
  border: 1px solid var(--hairline) !important;
  border-radius: var(--r-md) !important;
  padding: 13px !important;
}
.detail-page .ai-badge-sm {
  background: linear-gradient(140deg, var(--gold-soft), var(--gold)) !important;
  color: #1a1206 !important;
  font-weight: 800;
  border-radius: 8px;
}
.detail-page .ai-summary-title { font-weight: 600; color: #0f2c3a; letter-spacing: 0.3px; }
.detail-page .summary-text { color: #3d5a68; line-height: 1.78; }
.detail-page .summary-col {
  background: rgba(255, 255, 255, 0.75) !important;
  border: 1px solid var(--hairline-soft);
  border-radius: var(--r-sm) !important;
}
.detail-page .col-title { font-weight: 600; letter-spacing: 0.4px; }

/* 商品图：底部圆角，别是生硬的直角切边 */
.detail-page .goods-img { border-radius: 0 0 var(--r-lg) var(--r-lg); }
.detail-page .custom-indicator {
  background: rgba(3, 16, 26, 0.5) !important;
  backdrop-filter: blur(10px);
  border: 1px solid var(--hairline);
  border-radius: var(--r-pill);
  font-family: var(--font-num);
  letter-spacing: 0.5px;
}

/* 店铺卡 */
.detail-page .shop-logo { border-radius: 12px; box-shadow: 0 8px 18px -10px rgba(9, 58, 84, 0.5); }
.detail-page .shop-name { font-weight: 600; letter-spacing: 0.4px; color: #0f2c3a; }

/* 评论 */
.detail-page .comment-item { border-top: 1px solid #f0f6f9; }
.detail-page .comment-content { color: #35515f; line-height: 1.68; }
.detail-page .comment-tags .van-tag { border-radius: var(--r-pill); }

/* 推荐位 */
.detail-page .rec-price {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  letter-spacing: -0.2px;
}
.detail-page .rec-name { color: #35515f; }

/* 底部操作栏：珍珠玻璃 + 金/珊瑚双按钮 */
.detail-page .bottom-bar {
  height: 56px !important;
  background: rgba(247, 249, 250, 0.95) !important;
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  border-top: 1px solid var(--hairline);
  box-shadow: 0 -14px 32px -20px rgba(2, 12, 20, 0.5) !important;
}
.detail-page .bar-icon { color: #6b8794; }
.detail-page .bar-icon .van-icon { font-size: 19px; }
.detail-page .cart-btn {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  border-radius: var(--r-pill) !important;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7);
}
.detail-page .buy-btn {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--coral) 100%) !important;
  color: #fff !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  border-radius: var(--r-pill) !important;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.65);
}
.detail-page .ai-fab {
  background: linear-gradient(145deg, var(--gold-soft) 0%, var(--gold) 55%, var(--gold-deep) 100%) !important;
  box-shadow: 0 16px 32px -12px rgba(201, 169, 97, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
}
.detail-page .ai-fab-badge { color: #1a1206 !important; font-weight: 800; }
.detail-page .ai-fab-text { color: rgba(26, 18, 6, 0.75) !important; }

</style>
