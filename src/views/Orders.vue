<template>
  <div class="orders-page">
    <div class="header">
      <van-icon name="arrow-left" class="back" @click="$router.back()" />
      <span class="title">我的订单</span>
      <van-icon name="search" class="search" @click="showToast('搜索订单')" />
    </div>
    <div class="status-tabs">
      <div v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: currentTab === tab.key }" @click="switchTab(tab.key)">
        <span>{{ tab.name }}</span>
        <span class="badge" v-if="tab.count > 0">{{ tab.count }}</span>
      </div>
    </div>
    <div class="order-list">
      <div class="empty-state" v-if="filteredOrders.length === 0">
        <img src="/images/goods/1586769852044-692d6e3703f0.jpg" />
        <p>暂无{{ currentTabName }}订单</p>
        <van-button round plain type="danger" @click="$router.push('/home')">去逛逛</van-button>
      </div>
      <div class="order-card" v-for="order in filteredOrders" :key="order.id">
        <div class="order-header">
          <div class="shop-info"><van-icon name="shop-o" /><span class="shop-name">向海</span><van-icon name="arrow" size="12" /></div>
          <span class="order-status" :class="order.status">{{ getStatusText(order.status) }}</span>
        </div>
        <div class="order-goods" @click="goOrderDetail(order)">
          <div class="goods-list" :class="{ single: order.items.length === 1 }">
            <img v-for="item in order.items.slice(0,4)" :key="item.id" :src="item.img" />
          </div>
          <div class="goods-count" v-if="order.items.length > 1"><span>共{{ order.items.length }}件</span><van-icon name="arrow" size="12" /></div>
        </div>
        <div class="order-amount"><span>实付款：</span><span class="amount">¥{{ order.totalPrice.toFixed(2) }}</span></div>
        <div class="order-actions">
          <van-button v-for="btn in getOrderButtons(order.status)" :key="btn.text" :type="btn.type" :plain="btn.plain" round size="small" @click="handleAction(order, btn.action)">{{ btn.text }}</van-button>
        </div>
      </div>
    </div>
    
    <!-- 支付弹窗 -->
    <van-popup v-model:show="showPayPopup" position="bottom" round style="height: 60%;">
      <div class="pay-popup">
        <div class="pay-header">
          <span>确认付款</span>
          <van-icon name="cross" @click="showPayPopup = false" />
        </div>
        <div class="pay-amount">¥{{ payAmount }}</div>
        <div class="pay-methods">
          <van-radio-group v-model="payMethod">
            <van-cell-group>
              <van-cell title="微信支付" icon="wechat-pay" :border="false">
                <template #right-icon><van-radio name="wechat" /></template>
              </van-cell>
              <van-cell title="支付宝" icon="alipay" :border="false">
                <template #right-icon><van-radio name="alipay" /></template>
              </van-cell>
              <van-cell title="银行卡支付" icon="card" :border="false">
                <template #right-icon><van-radio name="card" /></template>
              </van-cell>
            </van-cell-group>
          </van-radio-group>
        </div>
        <van-button type="danger" round block class="pay-btn" @click="confirmPay">立即支付</van-button>
      </div>
    </van-popup>
    
    <van-tabbar v-model="activeTab" active-color="#7fd4e8" inactive-color="rgba(234, 246, 251, 0.55)">
      <van-tabbar-item name="home" icon="home-o" @click="$router.push('/home')">首页</van-tabbar-item>
      <van-tabbar-item name="category" icon="apps-o" @click="$router.push('/category')">分类</van-tabbar-item>
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
import { showToast, showConfirmDialog, showSuccessToast } from 'vant'

const route = useRoute()
const router = useRouter()
const activeTab = ref('mine')
const currentTab = ref(route.query.status || 'all')

const tabs = ref([
  { key:'all', name:'全部', count:0 },
  { key:'pending', name:'待付款', count:0 },
  { key:'delivering', name:'待收货', count:0 },
  { key:'review', name:'待评价', count:0 },
  { key:'refund', name:'退款/售后', count:0 }
])
const currentTabName = computed(() => tabs.value.find(t => t.key === currentTab.value)?.name || '')
const allOrders = ref([])
const filteredOrders = computed(() => currentTab.value === 'all' ? allOrders.value : allOrders.value.filter(o => o.status === currentTab.value))

// 支付相关
const showPayPopup = ref(false)
const payAmount = ref('0.00')
const payMethod = ref('wechat')
const currentPayOrder = ref(null)

const loadOrders = () => {
  allOrders.value = JSON.parse(localStorage.getItem('orders') || '[]')
  tabs.value.forEach(tab => {
    tab.count = tab.key === 'all' ? allOrders.value.length : allOrders.value.filter(o => o.status === tab.key).length
  })
}
const switchTab = (key) => { currentTab.value = key }
const getStatusText = (s) => ({ pending:'待付款', delivering:'待收货', review:'待评价', refund:'退款/售后', completed:'已完成', cancelled:'已取消' })[s] || s
const getOrderButtons = (status) => {
  const btns = {
    pending: [{ text:'取消订单', action:'cancel', plain:true }, { text:'去付款', action:'pay', type:'danger' }],
    delivering: [{ text:'查看物流', action:'logistics', plain:true }, { text:'确认收货', action:'receive', type:'danger' }],
    review: [{ text:'申请售后', action:'refund', plain:true }, { text:'去评价', action:'review', type:'danger' }],
    refund: [{ text:'查看详情', action:'detail', plain:true }],
    completed: [{ text:'删除订单', action:'delete', plain:true }, { text:'再次购买', action:'rebuy', type:'danger' }]
  }
  return btns[status] || [{ text:'删除订单', action:'delete', plain:true }]
}
const saveOrders = () => localStorage.setItem('orders', JSON.stringify(allOrders.value))

const handleAction = (order, action) => {
  const maps = {
    pay: () => { 
      currentPayOrder.value = order
      payAmount.value = order.totalPrice.toFixed(2)
      showPayPopup.value = true
    },
    cancel: () => showConfirmDialog({ title:'提示', message:'确定要取消订单吗？' }).then(() => { order.status='cancelled'; saveOrders(); loadOrders(); showToast('订单已取消') }),
    receive: () => showConfirmDialog({ title:'提示', message:'确认已收到商品？' }).then(() => { order.status='review'; saveOrders(); loadOrders(); showToast('确认收货成功') }),
    review: () => showToast('去评价'),
    refund: () => { order.status='refund'; saveOrders(); loadOrders(); showToast('已申请售后') },
    delete: () => showConfirmDialog({ title:'提示', message:'确定要删除订单吗？' }).then(() => { allOrders.value = allOrders.value.filter(o => o.id !== order.id); saveOrders(); loadOrders(); showToast('订单已删除') }),
    rebuy: () => showToast('已加入购物车')
  }
  ;(maps[action] || (() => showToast('功能开发中')))()
}

const confirmPay = () => {
  showPayPopup.value = false
  showSuccessToast('支付成功')
  if (currentPayOrder.value) {
    currentPayOrder.value.status = 'delivering'
    saveOrders()
    loadOrders()
  }
}

const goOrderDetail = (order) => showToast(`订单号：${order.id}`)
const cartBadge = ref(cartBadgeText())
const updateCartBadge = () => { cartBadge.value = cartBadgeText() }
onMounted(() => { loadOrders(); updateCartBadge() })
</script>

<style scoped>
.orders-page { background: #f7f7f7; min-height: 100vh; padding-bottom: 60px; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: #fff; }
.header .back, .header .search { font-size: 20px; color: #333; }
.title { font-size: 17px; font-weight: 500; color: #333; }
.status-tabs { display: flex; background: #fff; padding: 0 10px; border-bottom: 1px solid #f5f5f5; overflow-x: auto; }
.tab-item { position: relative; padding: 15px 12px; font-size: 14px; color: #666; white-space: nowrap; }
.tab-item.active { color: #0b7a9e; font-weight: 500; }
.tab-item.active::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 20px; height: 3px; background: #0b7a9e; border-radius: 2px; }
.badge { position: absolute; top: 8px; right: 2px; background: var(--price); color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 8px; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-state img { width: 120px; height: 120px; border-radius: 60px; object-fit: cover; margin-bottom: 20px; }
.empty-state p { font-size: 14px; color: #999; margin-bottom: 20px; }
.order-list { padding: 10px; }
.order-card { background: #fff; border-radius: 12px; margin-bottom: 10px; padding: 15px; }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.shop-info { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #333; }
.shop-name { font-weight: 500; }
.order-status { font-size: 13px; }
.order-status.pending { color: #0b7a9e; }
.order-status.delivering { color: var(--gold-deep); }
.order-status.review { color: #07c160; }
.order-status.refund { color: #999; }
.order-goods { display: flex; align-items: center; margin-bottom: 12px; }
.goods-list { display: flex; gap: 8px; flex: 1; }
.goods-list.single img { width: 80px; height: 80px; }
.goods-list img { width: 70px; height: 70px; border-radius: 6px; object-fit: cover; }
.goods-count { display: flex; flex-direction: column; align-items: center; color: #999; font-size: 12px; }
.order-amount { text-align: right; margin-bottom: 12px; font-size: 13px; color: #666; }
.order-amount .amount { font-size: 16px; font-weight: 700; color: #333; }
.order-actions { display: flex; justify-content: flex-end; gap: 10px; }
.order-actions .van-button { min-width: 80px; }

/* 支付弹窗 */
.pay-popup { padding: 20px; }
.pay-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.pay-header span { font-size: 16px; font-weight: 500; }
.pay-amount { text-align: center; font-size: 36px; font-weight: 700; color: #333; margin: 30px 0; }
.pay-methods { margin-bottom: 30px; }
.pay-btn { background: #0b7a9e; border-color: #0b7a9e; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.orders-page { background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important; }

/* 卡片类容器统一珍珠化（属性后缀匹配，覆盖各页命名习惯） */
.orders-page [class$="-card"],
.orders-page [class$="-section"],
.orders-page [class$="-box"],
.orders-page [class$="-panel"],
.orders-page [class$="-item"] {
  border-radius: var(--r-md);
}
.orders-page [class$="-card"]:not([class*="__"]),
.orders-page [class$="-panel"] {
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.42);
}
/* 标题与数字 */
.orders-page h1, .orders-page h2, .orders-page h3 { letter-spacing: 0.5px; color: #0f2c3a; }
.orders-page [class$="-price"], .orders-page [class$="-num"], .orders-page [class$="-amount"] {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}
/* 主按钮走金 */
.orders-page .van-button--primary {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  border: 0 !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7);
}
/* 顶部栏 */
.orders-page .header, .orders-page .nav-bar, .orders-page .top-bar {
  background: linear-gradient(180deg, #ffffff, #f8fbfc) !important;
  border-bottom: 1px solid var(--hairline);
}

</style>
