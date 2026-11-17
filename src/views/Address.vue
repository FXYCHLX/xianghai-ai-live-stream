<template>
  <div class="address-page">
    <div class="header">
      <van-icon name="arrow-left" class="back" @click="$router.back()" />
      <span class="title">地址管理</span>
    </div>
    
    <div class="address-list" v-if="addressList.length > 0">
      <div class="address-item" v-for="item in addressList" :key="item.id">
        <div class="address-info" @click="selectAddress(item)">
          <div class="user-info">
            <span class="name">{{ item.name }}</span>
            <span class="phone">{{ item.tel }}</span>
            <van-tag v-if="item.isDefault" type="danger" size="small">默认</van-tag>
          </div>
          <p class="address-detail">{{ item.address }}</p>
        </div>
        <div class="address-actions">
          <van-icon name="edit" @click="editAddress(item)" />
          <van-icon name="delete-o" @click="deleteAddress(item)" />
        </div>
      </div>
    </div>
    
    <div class="empty" v-else>
      <van-icon name="location-o" size="60" color="#ddd" />
      <p>暂无收货地址</p>
    </div>
    
    <div class="footer">
      <van-button type="danger" round block @click="addAddress">新增地址</van-button>
    </div>
    
    <!-- 添加/编辑地址弹窗 -->
    <van-popup v-model:show="showEdit" position="bottom" round style="height: 80%;">
      <van-address-edit
        :area-list="areaList"
        :address-info="editInfo"
        show-set-default
        show-search-result
        :search-result="searchResult"
        :area-columns-placeholder="['请选择', '请选择', '请选择']"
        @save="onSave"
        @delete="onDelete"
        @change-detail="onChangeDetail"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { areaList } from '@vant/area-data'

const router = useRouter()
const route = useRoute()

const addressList = ref([])
const showEdit = ref(false)
const editInfo = ref({})
const searchResult = ref([])
const isSelectMode = ref(false)

const loadAddress = () => {
  addressList.value = JSON.parse(localStorage.getItem('addressList') || '[]')
  if (addressList.value.length === 0) {
    // 默认地址
    addressList.value = [
      { id: '1', name: '张三', tel: '138****8888', address: '广东省深圳市南山区科技园南区123号', isDefault: true }
    ]
    saveAddress()
  }
}

const saveAddress = () => {
  localStorage.setItem('addressList', JSON.stringify(addressList.value))
}

const addAddress = () => {
  editInfo.value = {}
  showEdit.value = true
}

const editAddress = (item) => {
  editInfo.value = { ...item }
  showEdit.value = true
}

const deleteAddress = (item) => {
  showConfirmDialog({ title: '提示', message: '确定删除该地址？' }).then(() => {
    addressList.value = addressList.value.filter(a => a.id !== item.id)
    saveAddress()
    showToast('删除成功')
  })
}

const onSave = (content) => {
  const newAddress = {
    id: editInfo.value.id || Date.now().toString(),
    name: content.name,
    tel: content.tel,
    address: content.province + content.city + content.county + content.addressDetail,
    isDefault: content.isDefault
  }
  
  if (content.isDefault) {
    addressList.value.forEach(a => a.isDefault = false)
  }
  
  if (editInfo.value.id) {
    const index = addressList.value.findIndex(a => a.id === editInfo.value.id)
    addressList.value[index] = newAddress
  } else {
    addressList.value.push(newAddress)
  }
  
  saveAddress()
  showEdit.value = false
  showToast('保存成功')
}

const onDelete = () => {
  if (editInfo.value.id) {
    addressList.value = addressList.value.filter(a => a.id !== editInfo.value.id)
    saveAddress()
  }
  showEdit.value = false
}

const onChangeDetail = (val) => {
  searchResult.value = val ? [{ name: val, address: val }] : []
}

const selectAddress = (item) => {
  if (isSelectMode.value) {
    localStorage.setItem('selectedAddress', JSON.stringify(item))
    router.back()
  }
}

onMounted(() => {
  loadAddress()
  isSelectMode.value = route.query.select === '1'
})
</script>

<style scoped>
.address-page { background: #f5f5f5; min-height: 100vh; padding-bottom: 80px; }
.header { display: flex; align-items: center; padding: 12px 15px; background: #fff; }
.back { font-size: 20px; color: #333; margin-right: 15px; }
.title { font-size: 17px; font-weight: 500; color: #333; }
.address-list { padding: 10px; }
.address-item { background: #fff; border-radius: 10px; padding: 15px; margin-bottom: 10px; }
.user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.name { font-size: 15px; font-weight: 500; color: #333; }
.phone { font-size: 14px; color: #666; }
.address-detail { font-size: 13px; color: #666; margin: 0; line-height: 1.5; }
.address-actions { display: flex; justify-content: flex-end; gap: 20px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #f5f5f5; }
.address-actions .van-icon { font-size: 18px; color: #999; }
.empty { display: flex; flex-direction: column; align-items: center; padding: 100px 0; }
.empty p { font-size: 14px; color: #999; margin: 20px 0; }
.footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 15px; background: #fff; border-top: 1px solid #eee; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.address-page { background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important; }

/* 卡片类容器统一珍珠化（属性后缀匹配，覆盖各页命名习惯） */
.address-page [class$="-card"],
.address-page [class$="-section"],
.address-page [class$="-box"],
.address-page [class$="-panel"],
.address-page [class$="-item"] {
  border-radius: var(--r-md);
}
.address-page [class$="-card"]:not([class*="__"]),
.address-page [class$="-panel"] {
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.42);
}
/* 标题与数字 */
.address-page h1, .address-page h2, .address-page h3 { letter-spacing: 0.5px; color: #0f2c3a; }
.address-page [class$="-price"], .address-page [class$="-num"], .address-page [class$="-amount"] {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}
/* 主按钮走金 */
.address-page .van-button--primary {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  border: 0 !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7);
}
/* 顶部栏 */
.address-page .header, .address-page .nav-bar, .address-page .top-bar {
  background: linear-gradient(180deg, #ffffff, #f8fbfc) !important;
  border-bottom: 1px solid var(--hairline);
}

</style>
