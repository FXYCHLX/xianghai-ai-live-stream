<template>
  <div class="favorites-page">
    <div class="header">
      <van-icon name="arrow-left" class="back" @click="$router.back()" />
      <span class="title">我的收藏</span>
      <span class="edit-btn" @click="isEdit = !isEdit">{{ isEdit ? '完成' : '管理' }}</span>
    </div>
    
    <div class="fav-list" v-if="favList.length > 0">
      <div class="fav-item" v-for="item in favList" :key="item.id">
        <van-checkbox v-if="isEdit" v-model="item.selected" class="item-check" />
        <img :src="item.pic" class="item-img" @click="goDetail(item)" />
        <div class="item-info" @click="goDetail(item)">
          <p class="item-name">{{ item.name }}</p>
          <p class="item-price">¥{{ item.price }}</p>
        </div>
      </div>
    </div>
    
    <div class="empty" v-else>
      <van-icon name="star-o" size="60" color="#ddd" />
      <p>暂无收藏商品</p>
      <van-button round plain type="danger" @click="$router.push('/home')">去逛逛</van-button>
    </div>
    
    <div class="footer-bar" v-if="isEdit && favList.length > 0">
      <van-checkbox v-model="isAllSelected">全选</van-checkbox>
      <van-button type="danger" round size="small" @click="deleteSelected">删除</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const isEdit = ref(false)
const favList = ref([])

const loadFavorites = () => {
  favList.value = JSON.parse(localStorage.getItem('favorites') || '[]')
}

const isAllSelected = computed({
  get: () => favList.value.length > 0 && favList.value.every(i => i.selected),
  set: (val) => favList.value.forEach(i => i.selected = val)
})

const deleteSelected = () => {
  const selected = favList.value.filter(i => i.selected)
  if (selected.length === 0) { showToast('请选择要删除的商品'); return }
  showConfirmDialog({ title: '提示', message: `确定删除选中的${selected.length}件商品？` }).then(() => {
    favList.value = favList.value.filter(i => !i.selected)
    localStorage.setItem('favorites', JSON.stringify(favList.value))
    showToast('删除成功')
    if (favList.value.length === 0) isEdit.value = false
  })
}

const goDetail = (item) => router.push({ path: '/detail', query: { id: item.id } })

onMounted(loadFavorites)
</script>

<style scoped>
.favorites-page { background: #f5f5f5; min-height: 100vh; padding-bottom: 60px; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: #fff; }
.back { font-size: 20px; color: #333; }
.title { font-size: 17px; font-weight: 500; color: #333; }
.edit-btn { font-size: 14px; color: #666; }
.fav-list { padding: 10px; }
.fav-item { display: flex; align-items: center; background: #fff; border-radius: 10px; padding: 12px; margin-bottom: 10px; }
.item-check { margin-right: 10px; }
.item-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; margin-right: 12px; }
.item-info { flex: 1; }
.item-name { font-size: 14px; color: #333; line-height: 1.4; margin: 0 0 8px; }
.item-price { color: var(--price); font-size: 16px; font-weight: 700; margin: 0; }
.empty { display: flex; flex-direction: column; align-items: center; padding: 100px 0; }
.empty p { font-size: 14px; color: #999; margin: 20px 0; }
.footer-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; background: #fff; border-top: 1px solid #eee; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.favorites-page { background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important; }

/* 卡片类容器统一珍珠化（属性后缀匹配，覆盖各页命名习惯） */
.favorites-page [class$="-card"],
.favorites-page [class$="-section"],
.favorites-page [class$="-box"],
.favorites-page [class$="-panel"],
.favorites-page [class$="-item"] {
  border-radius: var(--r-md);
}
.favorites-page [class$="-card"]:not([class*="__"]),
.favorites-page [class$="-panel"] {
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.42);
}
/* 标题与数字 */
.favorites-page h1, .favorites-page h2, .favorites-page h3 { letter-spacing: 0.5px; color: #0f2c3a; }
.favorites-page [class$="-price"], .favorites-page [class$="-num"], .favorites-page [class$="-amount"] {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}
/* 主按钮走金 */
.favorites-page .van-button--primary {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  border: 0 !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7);
}
/* 顶部栏 */
.favorites-page .header, .favorites-page .nav-bar, .favorites-page .top-bar {
  background: linear-gradient(180deg, #ffffff, #f8fbfc) !important;
  border-bottom: 1px solid var(--hairline);
}

</style>
