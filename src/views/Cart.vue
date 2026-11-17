<template>
  <div class="cart-page">
    <div class="header">
      <van-icon name="arrow-left" class="back" @click="$router.back()" />
      <span class="title">购物车({{ cartList.length }})</span>
      <span class="edit-btn" @click="isEdit = !isEdit">{{ isEdit ? '完成' : '编辑' }}</span>
    </div>

    <div class="cart-content" v-if="cartList.length > 0">
      <div class="cart-item" v-for="item in cartList" :key="item.id">
        <van-checkbox v-model="item.selected" class="item-checkbox" />
        <img :src="item.pic || item.img" class="item-img" @click="goDetail(item)" />
        <div class="item-info">
          <p class="item-name" @click="goDetail(item)">{{ item.name }}</p>
          <p class="item-spec" v-if="item.spec">{{ item.spec }}</p>
          <div class="item-bottom">
            <span class="item-price">¥{{ item.price }}</span>
            <van-stepper v-model="item.quantity" :min="1" :max="99" @change="saveCart" />
          </div>
        </div>
      </div>
    </div>

    <div class="empty-cart" v-else>
      <img src="/images/goods/1586769852044-692d6e3703f0.jpg" />
      <p>购物车空空如也</p>
      <van-button round plain type="danger" @click="$router.push('/home')">去逛逛</van-button>
    </div>

    <div class="cart-footer" v-if="cartList.length > 0">
      <van-checkbox v-model="isAllSelected" class="select-all">全选</van-checkbox>
      <div class="total-section" v-if="!isEdit">
        <span class="total-label">合计：</span>
        <span class="total-price">¥{{ totalPrice }}</span>
      </div>
      <van-button :type="isEdit ? 'danger' : 'primary'" round class="action-btn" @click="handleAction">
        {{ isEdit ? '删除' : '去结算' }}
      </van-button>
    </div>

    <!-- 结算确认弹窗 -->
    <van-popup v-model:show="showCheckout" position="bottom" round style="height: 70%;">
      <div class="checkout-popup">
        <div class="checkout-header">
          <span>确认订单</span>
          <van-icon name="cross" @click="showCheckout = false" />
        </div>
        
        <!-- 地址选择 -->
        <div class="address-section" @click="showAddressPicker = true">
          <div class="address-info" v-if="selectedAddress">
            <div class="address-top">
              <span class="name">{{ selectedAddress.name }}</span>
              <span class="phone">{{ selectedAddress.phone }}</span>
            </div>
            <p class="address-detail">{{ selectedAddress.address }}</p>
          </div>
          <div class="no-address" v-else>
            <van-icon name="location-o" />
            <span>请选择收货地址</span>
          </div>
          <van-icon name="arrow" class="address-arrow" />
        </div>

        <!-- 商品列表 -->
        <div class="checkout-goods">
          <div class="checkout-item" v-for="item in selectedItems" :key="item.id">
            <img :src="item.pic || item.img" />
            <div class="checkout-info">
              <p class="name">{{ item.name }}</p>
              <p class="spec" v-if="item.spec">{{ item.spec }}</p>
              <div class="price-row">
                <span class="price">¥{{ item.price }}</span>
                <span class="num">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 金额明细 -->
        <div class="amount-detail">
          <div class="amount-row">
            <span>商品总额</span>
            <span>¥{{ totalPrice }}</span>
          </div>
          <div class="amount-row">
            <span>运费</span>
            <span>¥0.00</span>
          </div>
          <div class="amount-row total">
            <span>实付款</span>
            <span class="final-price">¥{{ totalPrice }}</span>
          </div>
        </div>

        <van-button type="danger" round block class="submit-btn" @click="submitOrder">提交订单</van-button>
      </div>
    </van-popup>

    <!-- 地址选择 -->
    <van-popup v-model:show="showAddressPicker" position="bottom" round>
      <van-picker title="选择地址" :columns="addressList.map(a => a.name + ' ' + a.phone)" @confirm="onAddressConfirm" @cancel="showAddressPicker = false" />
    </van-popup>

    <van-tabbar v-model="activeTab" active-color="#7fd4e8" inactive-color="rgba(234, 246, 251, 0.55)">
      <van-tabbar-item name="home" icon="home-o" @click="$router.push('/home')">首页</van-tabbar-item>
      <van-tabbar-item name="category" icon="apps-o" @click="$router.push('/category')">分类</van-tabbar-item>
      <van-tabbar-item name="discover" icon="fire-o" @click="$router.push('/discover')">发现</van-tabbar-item>
      <van-tabbar-item name="cart" icon="shopping-cart-o">购物车</van-tabbar-item>
      <van-tabbar-item name="mine" icon="user-o" @click="$router.push('/mine')">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()
const activeTab = ref('cart')
const isEdit = ref(false)
const cartList = ref([])
const showCheckout = ref(false)
const showAddressPicker = ref(false)

// 地址数据
const addressList = ref([
  { id: 1, name: '张三', phone: '138****8888', address: '广东省深圳市南山区科技园南区123号' },
  { id: 2, name: '李四', phone: '139****9999', address: '广东省深圳市福田区华强北路456号' }
])
const selectedAddress = ref(addressList.value[0])

const loadCart = () => {
  cartList.value = JSON.parse(localStorage.getItem('cartList') || '[]')
  cartList.value.forEach(item => { if (item.selected === undefined) item.selected = true })
}
const saveCart = () => {
  localStorage.setItem('cartList', JSON.stringify(cartList.value))
  window.dispatchEvent(new Event('storage'))
}

const isAllSelected = computed({
  get: () => cartList.value.length > 0 && cartList.value.every(item => item.selected),
  set: (val) => { cartList.value.forEach(item => item.selected = val); saveCart() }
})

const selectedItems = computed(() => cartList.value.filter(item => item.selected))
const totalPrice = computed(() => selectedItems.value.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2))

const handleAction = () => {
  if (isEdit.value) {
    const toDelete = cartList.value.filter(item => item.selected)
    if (toDelete.length === 0) { showToast('请选择要删除的商品'); return }
    cartList.value = cartList.value.filter(item => !item.selected)
    saveCart()
    showToast('已删除')
    if (cartList.value.length === 0) isEdit.value = false
  } else {
    if (selectedItems.value.length === 0) { showToast('请选择商品'); return }
    showCheckout.value = true
  }
}

const submitOrder = () => {
  if (!selectedAddress.value) { showToast('请选择收货地址'); return }
  
  const order = {
    id: 'DD' + Date.now(),
    status: 'pending',
    totalPrice: parseFloat(totalPrice.value),
    items: selectedItems.value.map(item => ({ id: item.id, name: item.name, img: item.pic, price: item.price, quantity: item.quantity })),
    address: selectedAddress.value,
    createTime: new Date().toLocaleString()
  }
  
  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  orders.unshift(order)
  localStorage.setItem('orders', JSON.stringify(orders))
  
  // 从购物车移除已结算商品
  cartList.value = cartList.value.filter(item => !item.selected)
  saveCart()
  
  localStorage.setItem('lastOrder', JSON.stringify(order))
  showCheckout.value = false
  showSuccessToast('支付成功！')
  router.push('/payment-success')
}

const onAddressConfirm = ({ selectedOptions }) => {
  selectedAddress.value = addressList.value.find(a => (a.name + ' ' + a.phone) === selectedOptions[0].text)
  showAddressPicker.value = false
}

const goDetail = (item) => router.push({ path: '/detail', query: { id: item.id } })

watch(cartList, saveCart, { deep: true })
onMounted(loadCart)
</script>

<style scoped>
.cart-page { background: #f5f5f5; min-height: 100vh; padding-bottom: 110px; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: #fff; }
.back { font-size: 20px; color: #333; }
.title { font-size: 17px; font-weight: 500; color: #333; }
.edit-btn { font-size: 14px; color: #666; }
.cart-content { padding: 10px; }
.cart-item { display: flex; align-items: center; background: #fff; border-radius: 10px; padding: 12px; margin-bottom: 10px; }
.item-checkbox { margin-right: 10px; }
.item-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; margin-right: 12px; }
.item-info { flex: 1; }
.item-name { font-size: 14px; color: #333; line-height: 1.4; margin: 0 0 6px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.item-spec { font-size: 12px; color: #999; margin: 0 0 8px; }
.item-bottom { display: flex; justify-content: space-between; align-items: center; }
.item-price { color: var(--price); font-size: 16px; font-weight: 700; }
.empty-cart { display: flex; flex-direction: column; align-items: center; padding: 80px 0; }
.empty-cart img { width: 120px; height: 120px; border-radius: 60px; object-fit: cover; margin-bottom: 20px; }
.empty-cart p { font-size: 14px; color: #999; margin-bottom: 20px; }
.cart-footer { position: fixed; bottom: 50px; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; background: #fff; border-top: 1px solid #eee; }
.select-all { font-size: 14px; color: #666; }
.total-section { display: flex; align-items: center; gap: 4px; }
.total-label { font-size: 14px; color: #666; }
.total-price { color: var(--price); font-size: 18px; font-weight: 700; }
.action-btn { min-width: 100px; background: #0b7a9e; border-color: #0b7a9e; }

/* 结算弹窗 */
.checkout-popup { padding: 20px; height: 100%; overflow-y: auto; }
.checkout-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.checkout-header span { font-size: 16px; font-weight: 500; }
.address-section { display: flex; align-items: center; background: #f8f8f8; padding: 15px; border-radius: 10px; margin-bottom: 20px; }
.address-info { flex: 1; }
.address-top { display: flex; gap: 10px; margin-bottom: 6px; }
.name { font-weight: 500; }
.phone { color: #999; }
.address-detail { font-size: 13px; color: #666; margin: 0; }
.no-address { flex: 1; display: flex; align-items: center; gap: 8px; color: #999; }
.address-arrow { color: #999; }
.checkout-goods { margin-bottom: 20px; }
.checkout-item { display: flex; gap: 12px; margin-bottom: 15px; }
.checkout-item img { width: 70px; height: 70px; border-radius: 6px; object-fit: cover; }
.checkout-info { flex: 1; }
.checkout-info .name { font-size: 14px; margin: 0 0 4px; }
.checkout-info .spec { font-size: 12px; color: #999; margin: 0 0 8px; }
.price-row { display: flex; justify-content: space-between; }
.price { color: var(--price); font-weight: 500; }
.num { color: #999; font-size: 12px; }
.amount-detail { background: #f8f8f8; padding: 15px; border-radius: 10px; margin-bottom: 20px; }
.amount-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
.amount-row.total { margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; font-weight: 500; }
.final-price { color: var(--price); font-size: 18px; font-weight: 700; }
.submit-btn { background: #0b7a9e; border-color: #0b7a9e; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.cart-page { background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important; }

.cart-page .header {
  padding: 14px 16px !important;
  background: linear-gradient(180deg, #ffffff, #f8fbfc) !important;
  box-shadow: 0 1px 0 var(--hairline);
}
.cart-page .title { font-weight: 700 !important; letter-spacing: 0.8px; color: #0f2c3a !important; }
.cart-page .back { color: #35515f !important; }
.cart-page .edit-btn { color: #0b7a9e !important; letter-spacing: 0.3px; }

.cart-page .cart-content { padding: 12px !important; }
.cart-page .cart-item {
  padding: 14px !important;
  margin-bottom: 12px !important;
  border-radius: var(--r-lg) !important;
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%) !important;
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.42);
}
.cart-page .item-img {
  width: 86px !important; height: 86px !important;
  border-radius: var(--r-sm) !important;
  border: 1px solid var(--hairline-soft);
}
.cart-page .item-name { font-size: 13.5px !important; color: #16323f !important; line-height: 1.52 !important; }
.cart-page .item-spec { color: #9db3bd !important; }
.cart-page .item-price,
.cart-page .total-price,
.cart-page .final-price,
.cart-page .price {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  color: var(--coral) !important;
  font-weight: 700 !important;
  letter-spacing: -0.3px;
}
.cart-page .cart-footer {
  background: rgba(247, 249, 250, 0.95) !important;
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  border-top: 1px solid var(--hairline) !important;
  box-shadow: 0 -14px 32px -20px rgba(2, 12, 20, 0.45);
  padding: 12px 16px !important;
}
.cart-page .action-btn,
.cart-page .submit-btn {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  border: 0 !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  border-radius: var(--r-pill) !important;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7);
}
.cart-page .address-section,
.cart-page .amount-detail {
  background: #f5fafc !important;
  border: 1px solid var(--hairline-soft);
  border-radius: var(--r-md) !important;
}
.cart-page .checkout-header { letter-spacing: 0.5px; }

</style>
