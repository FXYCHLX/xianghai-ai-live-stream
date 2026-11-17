<template>
  <div class="footprint-page">
    <div class="header">
      <van-icon name="arrow-left" class="back" @click="$router.back()" />
      <span class="title">我的足迹</span>
      <span class="edit-btn" @click="clearAll">清空</span>
    </div>
    
    <div class="footprint-list" v-if="footprintList.length > 0">
      <div class="date-group" v-for="group in groupedList" :key="group.date">
        <div class="date-title">{{ group.date }}</div>
        <div class="goods-list">
          <div class="goods-item" v-for="item in group.items" :key="item.id" @click="goDetail(item)">
            <img :src="item.pic" class="goods-img" />
            <div class="goods-info">
              <p class="goods-name">{{ item.name }}</p>
              <p class="goods-price">¥{{ item.price }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="empty" v-else>
      <van-icon name="clock-o" size="60" color="#ddd" />
      <p>暂无浏览记录</p>
      <van-button round plain type="danger" @click="$router.push('/home')">去逛逛</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const footprintList = ref([])

const loadFootprint = () => {
  footprintList.value = JSON.parse(localStorage.getItem('footprint') || '[]')
}

const groupedList = computed(() => {
  const groups = {}
  footprintList.value.forEach(item => {
    const date = item.time?.split(' ')[0] || '今天'
    if (!groups[date]) groups[date] = []
    groups[date].push(item)
  })
  return Object.keys(groups).map(date => ({ date, items: groups[date] }))
})

const clearAll = () => {
  if (footprintList.value.length === 0) return
  showConfirmDialog({ title: '提示', message: '确定清空所有浏览记录？' }).then(() => {
    localStorage.removeItem('footprint')
    footprintList.value = []
    showToast('已清空')
  })
}

const goDetail = (item) => router.push({ path: '/detail', query: { id: item.id } })

onMounted(loadFootprint)
</script>

<style scoped>
.footprint-page { background: #f5f5f5; min-height: 100vh; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: #fff; }
.back { font-size: 20px; color: #333; }
.title { font-size: 17px; font-weight: 500; color: #333; }
.edit-btn { font-size: 14px; color: #0b7a9e; }
.date-group { margin-bottom: 10px; }
.date-title { padding: 10px 15px; font-size: 13px; color: #999; background: #f5f5f5; }
.goods-list { background: #fff; }
.goods-item { display: flex; padding: 12px 15px; border-bottom: 1px solid #f5f5f5; }
.goods-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; margin-right: 12px; }
.goods-info { flex: 1; }
.goods-name { font-size: 14px; color: #333; line-height: 1.4; margin: 0 0 8px; }
.goods-price { color: var(--price); font-size: 16px; font-weight: 700; margin: 0; }
.empty { display: flex; flex-direction: column; align-items: center; padding: 100px 0; }
.empty p { font-size: 14px; color: #999; margin: 20px 0; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.footprint-page { background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important; }

/* 卡片类容器统一珍珠化（属性后缀匹配，覆盖各页命名习惯） */
.footprint-page [class$="-card"],
.footprint-page [class$="-section"],
.footprint-page [class$="-box"],
.footprint-page [class$="-panel"],
.footprint-page [class$="-item"] {
  border-radius: var(--r-md);
}
.footprint-page [class$="-card"]:not([class*="__"]),
.footprint-page [class$="-panel"] {
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.42);
}
/* 标题与数字 */
.footprint-page h1, .footprint-page h2, .footprint-page h3 { letter-spacing: 0.5px; color: #0f2c3a; }
.footprint-page [class$="-price"], .footprint-page [class$="-num"], .footprint-page [class$="-amount"] {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}
/* 主按钮走金 */
.footprint-page .van-button--primary {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  border: 0 !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7);
}
/* 顶部栏 */
.footprint-page .header, .footprint-page .nav-bar, .footprint-page .top-bar {
  background: linear-gradient(180deg, #ffffff, #f8fbfc) !important;
  border-bottom: 1px solid var(--hairline);
}

</style>
