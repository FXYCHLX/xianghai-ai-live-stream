<template>
  <div class="pay-success-page">
    <div class="success-animation">
      <div class="circle">
        <van-icon name="success" size="60" color="#fff" />
      </div>
    </div>
    
    <h2 class="title">支付成功！</h2>
    <p class="amount">¥{{ order.totalPrice }}</p>
    <p class="order-no">订单号：{{ order.id }}</p>
    
    <div class="info-card">
      <div class="info-row"><span>收货人</span><span>{{ order.address?.name || '未设置' }}</span></div>
      <div class="info-row"><span>联系电话</span><span>{{ order.address?.phone || '' }}</span></div>
      <div class="info-row"><span>收货地址</span><span>{{ order.address?.address || '未设置' }}</span></div>
      <div class="info-row"><span>下单时间</span><span>{{ order.createTime }}</span></div>
      <div class="info-row"><span>商品数量</span><span>{{ order.items?.length || 0 }}件</span></div>
    </div>

    <div class="btn-group">
      <van-button round block type="primary" @click="$router.push('/orders')">查看订单</van-button>
      <van-button round block plain type="primary" @click="$router.push('/home')">继续购物</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const order = ref({
  id: '',
  totalPrice: '0.00',
  address: { name: '', phone: '', address: '' },
  createTime: '',
  items: []
})

onMounted(() => {
  const lastOrder = localStorage.getItem('lastOrder')
  if (lastOrder) {
    order.value = JSON.parse(lastOrder)
  } else {
    // fallback
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    if (orders.length > 0) order.value = orders[0]
  }
})
</script>

<style scoped>
.pay-success-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #07c160 0%, #f7f7f7 40%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px 30px;
}
.success-animation { margin-bottom: 20px; }
.circle {
  width: 90px; height: 90px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pop 0.5s ease;
  box-shadow: 0 4px 20px rgba(7,193,96,0.3);
}
@keyframes pop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
.title { font-size: 22px; color: #fff; margin: 0 0 8px; }
.amount { font-size: 36px; color: #fff; font-weight: 700; margin: 0 0 4px; }
.order-no { font-size: 13px; color: rgba(255,255,255,0.8); margin: 0 0 30px; }
.info-card {
  width: 100%; background: #fff; border-radius: 12px; padding: 16px;
  margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.info-row {
  display: flex; justify-content: space-between; padding: 10px 0;
  border-bottom: 1px solid #f5f5f5; font-size: 14px;
}
.info-row:last-child { border-bottom: none; }
.info-row span:first-child { color: #999; }
.info-row span:last-child { color: #333; text-align: right; max-width: 60%; }
.btn-group { width: 100%; display: flex; flex-direction: column; gap: 12px; }
.btn-group .van-button--primary { background: #07c160; border-color: #07c160; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.pay-success-page { background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important; }

/* 卡片类容器统一珍珠化（属性后缀匹配，覆盖各页命名习惯） */
.pay-success-page [class$="-card"],
.pay-success-page [class$="-section"],
.pay-success-page [class$="-box"],
.pay-success-page [class$="-panel"],
.pay-success-page [class$="-item"] {
  border-radius: var(--r-md);
}
.pay-success-page [class$="-card"]:not([class*="__"]),
.pay-success-page [class$="-panel"] {
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.42);
}
/* 标题与数字 */
.pay-success-page h1, .pay-success-page h2, .pay-success-page h3 { letter-spacing: 0.5px; color: #0f2c3a; }
.pay-success-page [class$="-price"], .pay-success-page [class$="-num"], .pay-success-page [class$="-amount"] {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}
/* 主按钮走金 */
.pay-success-page .van-button--primary {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  border: 0 !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7);
}
/* 顶部栏 */
.pay-success-page .header, .pay-success-page .nav-bar, .pay-success-page .top-bar {
  background: linear-gradient(180deg, #ffffff, #f8fbfc) !important;
  border-bottom: 1px solid var(--hairline);
}

</style>
