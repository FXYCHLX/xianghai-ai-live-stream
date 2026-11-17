<template>
  <div class="coupons-page">
    <div class="header">
      <van-icon name="arrow-left" class="back" @click="$router.back()" />
      <span class="title">我的优惠券</span>
    </div>
    
    <van-tabs v-model="activeTab" sticky>
      <van-tab title="未使用">
        <div class="coupon-list">
          <div class="coupon-item unused" v-for="item in unusedCoupons" :key="item.id">
            <div class="coupon-left">
              <span class="amount">¥{{ item.amount }}</span>
              <span class="condition">满{{ item.minSpend }}可用</span>
            </div>
            <div class="coupon-right">
              <p class="coupon-name">{{ item.name }}</p>
              <p class="coupon-time">有效期至 {{ item.expireTime }}</p>
              <van-button size="small" round type="danger" @click="useCoupon(item)">立即使用</van-button>
            </div>
          </div>
        </div>
      </van-tab>
      <van-tab title="已使用">
        <div class="coupon-list">
          <div class="coupon-item used" v-for="item in usedCoupons" :key="item.id">
            <div class="coupon-left">
              <span class="amount">¥{{ item.amount }}</span>
              <span class="condition">满{{ item.minSpend }}可用</span>
            </div>
            <div class="coupon-right">
              <p class="coupon-name">{{ item.name }}</p>
              <p class="coupon-time">使用时间 {{ item.useTime }}</p>
              <span class="status">已使用</span>
            </div>
          </div>
        </div>
      </van-tab>
      <van-tab title="已过期">
        <div class="coupon-list">
          <div class="coupon-item expired" v-for="item in expiredCoupons" :key="item.id">
            <div class="coupon-left">
              <span class="amount">¥{{ item.amount }}</span>
              <span class="condition">满{{ item.minSpend }}可用</span>
            </div>
            <div class="coupon-right">
              <p class="coupon-name">{{ item.name }}</p>
              <p class="coupon-time">有效期至 {{ item.expireTime }}</p>
              <span class="status">已过期</span>
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const activeTab = ref(0)

const unusedCoupons = ref([
  { id: 1, name: '新人专享券', amount: 20, minSpend: 100, expireTime: '2026-07-31' },
  { id: 2, name: '满减优惠券', amount: 50, minSpend: 299, expireTime: '2026-07-15' },
  { id: 3, name: '生鲜专享券', amount: 15, minSpend: 99, expireTime: '2026-06-30' }
])

const usedCoupons = ref([
  { id: 4, name: '618大促券', amount: 100, minSpend: 500, useTime: '2026-06-18' }
])

const expiredCoupons = ref([
  { id: 5, name: '五一特惠券', amount: 30, minSpend: 199, expireTime: '2026-05-05' }
])

const useCoupon = (item) => {
  showToast(`使用${item.name}`)
  router.push('/home')
}
</script>

<style scoped>
.coupons-page { background: #f5f5f5; min-height: 100vh; }
.header { display: flex; align-items: center; padding: 12px 15px; background: #fff; }
.back { font-size: 20px; color: #333; margin-right: 15px; }
.title { font-size: 17px; font-weight: 500; color: #333; }
.coupon-list { padding: 15px; }
.coupon-item { display: flex; background: #fff; border-radius: 10px; margin-bottom: 15px; overflow: hidden; }
.coupon-left { width: 100px; background: linear-gradient(135deg, var(--price), var(--gold-deep)); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; padding: 15px; }
.coupon-item.used .coupon-left, .coupon-item.expired .coupon-left { background: #ccc; }
.amount { font-size: 28px; font-weight: 700; }
.condition { font-size: 12px; margin-top: 4px; }
.coupon-right { flex: 1; padding: 15px; position: relative; }
.coupon-name { font-size: 15px; color: #333; margin: 0 0 8px; font-weight: 500; }
.coupon-time { font-size: 12px; color: #999; margin: 0 0 12px; }
.status { position: absolute; right: 15px; bottom: 15px; font-size: 12px; color: #999; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.coupons-page { background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important; }

/* 卡片类容器统一珍珠化（属性后缀匹配，覆盖各页命名习惯） */
.coupons-page [class$="-card"],
.coupons-page [class$="-section"],
.coupons-page [class$="-box"],
.coupons-page [class$="-panel"],
.coupons-page [class$="-item"] {
  border-radius: var(--r-md);
}
.coupons-page [class$="-card"]:not([class*="__"]),
.coupons-page [class$="-panel"] {
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.42);
}
/* 标题与数字 */
.coupons-page h1, .coupons-page h2, .coupons-page h3 { letter-spacing: 0.5px; color: #0f2c3a; }
.coupons-page [class$="-price"], .coupons-page [class$="-num"], .coupons-page [class$="-amount"] {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}
/* 主按钮走金 */
.coupons-page .van-button--primary {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  border: 0 !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7);
}
/* 顶部栏 */
.coupons-page .header, .coupons-page .nav-bar, .coupons-page .top-bar {
  background: linear-gradient(180deg, #ffffff, #f8fbfc) !important;
  border-bottom: 1px solid var(--hairline);
}


/* 券面：橙红 → 香槟金（券=优惠，用金色既合语义又统一调性） */
.coupons-page .coupon-item {
  border-radius: var(--r-lg) !important;
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 16px 32px -22px rgba(2, 12, 20, 0.45);
}
.coupons-page .coupon-left {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 56%, var(--gold-deep) 100%) !important;
  color: #1a1206 !important;
}
.coupons-page .amount {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -1.2px;
}
.coupons-page .condition { letter-spacing: 0.4px; opacity: 0.85; }
.coupons-page .coupon-name { font-weight: 600; letter-spacing: 0.3px; color: #0f2c3a; }
.coupons-page .title { font-weight: 700; letter-spacing: 0.8px; color: #0f2c3a; }

</style>
