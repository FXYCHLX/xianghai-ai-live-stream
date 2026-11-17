<template>
  <div class="message-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="header-title">消息中心</div>
      <div class="header-actions">
        <van-icon name="plus" class="action-icon" @click="showAddMenu" />
        <van-icon name="setting-o" class="action-icon" @click="showToast('设置')" />
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-entry">
      <div class="entry-item" @click="showToast('我的客服')">
        <div class="entry-icon" style="background: linear-gradient(135deg, #0b7a9e 0%, #12a0c8 100%);">
          <van-icon name="service-o" />
        </div>
        <span class="entry-name">我的客服</span>
      </div>
      <div class="entry-item" @click="showToast('物流助手')">
        <div class="entry-icon" style="background: linear-gradient(135deg, #7fd4e8 0%, #0b7a9e 100%);">
          <van-icon name="logistics" />
        </div>
        <span class="entry-name">物流助手</span>
      </div>
      <div class="entry-item" @click="showToast('活动通知')">
        <div class="entry-icon" style="background: linear-gradient(135deg, #12a0c8 0%, #66c2d6 100%);">
          <van-icon name="gift-o" />
        </div>
        <span class="entry-name">活动通知</span>
      </div>
      <div class="entry-item" @click="showToast('系统消息')">
        <div class="entry-icon" style="background: linear-gradient(135deg, #2a9d8f 0%, #a8dbec 100%);">
          <van-icon name="volume-o" />
        </div>
        <span class="entry-name">系统消息</span>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-box" @click="showSearch = true">
        <van-icon name="search" class="search-icon" />
        <span>搜索消息</span>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-container">
      <div class="section-header">
        <span class="section-title">最近联系</span>
        <span class="section-action" @click="showToast('全部已读')">全部已读</span>
      </div>
      
      <div class="message-list">
        <div 
          class="message-card" 
          v-for="(item, index) in messageList" 
          :key="item.id" 
          @click="goToChat(item)"
          :class="{ unread: item.unread > 0 }"
          :style="{ animationDelay: index * 0.05 + 's' }"
        >
          <div class="avatar-wrapper">
            <img :src="item.avatar" class="avatar" />
            <div class="avatar-badge" v-if="item.type === 'official'">官方</div>
          </div>
          <div class="message-body">
            <div class="message-top">
              <div class="name-row">
                <span class="shop-name">{{ item.name }}</span>
                <van-tag v-if="item.tag" :type="item.tagType" size="mini" class="shop-tag">{{ item.tag }}</van-tag>
              </div>
              <span class="time">{{ item.time }}</span>
            </div>
            <div class="message-bottom">
              <p class="last-message">
                <van-icon v-if="item.isVoice" name="volume-o" class="msg-icon" />
                <van-icon v-if="item.isImage" name="photo-o" class="msg-icon" />
                {{ item.lastMsg }}
              </p>
              <div class="unread-badge" v-if="item.unread > 0">{{ item.unread > 99 ? '99+' : item.unread }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty v-if="messageList.length === 0" description="暂无消息" />

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" active-color="#7fd4e8" inactive-color="rgba(234, 246, 251, 0.55)">
      <van-tabbar-item name="home" icon="home-o" @click="$router.push('/home')">首页</van-tabbar-item>
      <van-tabbar-item name="category" icon="apps-o" @click="$router.push('/category')">分类</van-tabbar-item>
      <van-tabbar-item name="discover" icon="fire-o" @click="$router.push('/discover')">发现</van-tabbar-item>
      <van-tabbar-item name="cart" icon="shopping-cart-o" :badge="cartBadge" @click="$router.push('/cart')">购物车</van-tabbar-item>
      <van-tabbar-item name="mine" icon="user-o" @click="$router.push('/mine')">我的</van-tabbar-item>
    </van-tabbar>

    <!-- 搜索弹窗 -->
    <van-popup v-model:show="showSearch" position="top" :style="{ height: '100%' }" class="search-popup">
      <div class="search-header">
        <van-search 
          v-model="searchVal" 
          placeholder="搜索消息" 
          shape="round" 
          autofocus 
          show-action
          @cancel="showSearch = false"
          @search="onSearch"
        />
      </div>
      <div class="search-content">
        <div class="search-history" v-if="searchHistory.length > 0">
          <div class="history-title">
            <span>最近搜索</span>
            <van-icon name="delete-o" @click="clearHistory" />
          </div>
          <div class="history-tags">
            <span v-for="tag in searchHistory" :key="tag" @click="searchVal = tag">{{ tag }}</span>
          </div>
        </div>
        <van-empty v-else description="输入关键词搜索消息" />
      </div>
    </van-popup>

    <!-- 添加菜单 -->
    <van-action-sheet v-model:show="showMenu" :actions="menuActions" @select="onMenuSelect" />
  </div>
</template>

<script setup>
import { cartBadgeText } from '../utils/cart'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const searchVal = ref('')
const showSearch = ref(false)
const showMenu = ref(false)
const activeTab = ref('mine')

// 搜索历史
const searchHistory = ref(['物流', '客服', '活动'])

// 菜单选项
const menuActions = [
  { name: '发起群聊', icon: 'chat-o' },
  { name: '添加朋友', icon: 'friends-o' },
  { name: '扫一扫', icon: 'scan' }
]

// 消息列表 - 高端数据
const messageList = ref([
  { 
    id: 1, 
    name: '向海官方店', 
    avatar: '/images/goods/1560179707-f14e90ef3623.jpg', 
    lastMsg: '亲，您的订单已发货，预计明天送达~', 
    time: '10:30', 
    unread: 2,
    tag: '商家',
    tagType: 'primary',
    key: 'food',
    isVoice: false
  },
  { 
    id: 2, 
    name: '鲜果源旗舰店', 
    avatar: '/images/goods/1610832958506-aa56368176cf.jpg', 
    lastMsg: '[图片] 新鲜水果已上架，全场包邮', 
    time: '昨天', 
    unread: 0,
    tag: '商家',
    tagType: 'primary',
    key: 'fruit',
    isImage: true
  },
  { 
    id: 3, 
    name: '活动通知', 
    avatar: '/images/goods/1556742049-0cfed4f6a45d.jpg', 
    lastMsg: '🎉 今日鲜货活动即将开始，全场5折起！', 
    time: '05-10', 
    unread: 1,
    type: 'official',
    tag: '官方',
    tagType: 'danger',
    key: 'subscribe'
  },
  { 
    id: 4, 
    name: '物流助手', 
    avatar: '/images/goods/1586528116311-ad8dd3c8310d.jpg', 
    lastMsg: '您的订单已签收，感谢您的购买~', 
    time: '05-08', 
    unread: 0,
    type: 'official',
    tag: '官方',
    tagType: 'success',
    key: 'system'
  },
  { 
    id: 5, 
    name: '美妆专柜', 
    avatar: '/images/goods/1596462502278-27bfdc403348.jpg', 
    lastMsg: '亲，SK-II神仙水现在有优惠哦~', 
    time: '05-06', 
    unread: 0,
    tag: '商家',
    tagType: 'primary',
    key: 'beauty'
  },
  { 
    id: 6, 
    name: '数码电器城', 
    avatar: '/images/goods/1550009158-9ebf69173e03.jpg', 
    lastMsg: 'iPhone 15 Pro Max 现货供应中！', 
    time: '05-05', 
    unread: 0,
    tag: '商家',
    tagType: 'primary',
    key: 'digital'
  }
])

const goToChat = (item) => {
  // 清除未读
  item.unread = 0
  router.push({ 
    path: '/chat', 
    query: { 
      shopId: item.id, 
      shopName: item.name, 
      shopAvatar: item.avatar, 
      storageKey: item.key 
    } 
  })
}

const showAddMenu = () => {
  showMenu.value = true
}

const onMenuSelect = (action) => {
  showToast(action.name)
  showMenu.value = false
}

const onSearch = () => {
  if (searchVal.value && !searchHistory.value.includes(searchVal.value)) {
    searchHistory.value.unshift(searchVal.value)
    if (searchHistory.value.length > 10) searchHistory.value.pop()
  }
  showToast(`搜索: ${searchVal.value}`)
  showSearch.value = false
}

const clearHistory = () => {
  searchHistory.value = []
}

// 购物车角标
const cartBadge = ref(cartBadgeText())
const updateCartBadge = () => { cartBadge.value = cartBadgeText() }

onMounted(updateCartBadge)
</script>

<style scoped>
.message-page {
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  min-height: 100vh;
  padding-bottom: 60px;
}

/* 顶部导航 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #0b7a9e 0%, #12a0c8 100%);
  position: sticky;
  top: 0;
  z-index: 999;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.header-actions {
  display: flex;
  gap: 20px;
}

.action-icon {
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s;
}

.action-icon:active {
  transform: scale(0.9);
}

/* 快捷入口 */
.quick-entry {
  display: flex;
  justify-content: space-around;
  padding: 20px 16px;
  background: #fff;
  margin: 12px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.entry-item:active {
  transform: scale(0.95);
}

.entry-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.entry-name {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

/* 搜索栏 */
.search-section {
  padding: 0 16px 12px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24px;
  padding: 10px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.search-icon {
  color: #999;
  font-size: 16px;
  margin-right: 8px;
}

.search-box span {
  color: #999;
  font-size: 14px;
}

/* 消息容器 */
.message-container {
  background: #fff;
  margin: 0 12px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-action {
  font-size: 13px;
  color: #0b7a9e;
  cursor: pointer;
}

/* 消息列表 */
.message-list {
  padding: 8px 0;
}

.message-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: slideIn 0.4s ease forwards;
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.message-card:active {
  background: #f8f9fa;
}

.message-card.unread {
  background: linear-gradient(90deg, rgba(11, 122, 158, 0.05) 0%, transparent 100%);
}

.avatar-wrapper {
  position: relative;
  margin-right: 12px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: linear-gradient(135deg, #0b7a9e, #66c2d6);
  color: #fff;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.shop-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.shop-tag {
  font-weight: 500;
}

.time {
  font-size: 12px;
  color: #999;
}

.message-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message {
  font-size: 13px;
  color: #666;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

.msg-icon {
  color: #999;
  font-size: 14px;
}

.unread-badge {
  background: linear-gradient(135deg, #0b7a9e, #66c2d6);
  color: #fff;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(11, 122, 158, 0.3);
}

/* 搜索弹窗 */
.search-popup {
  background: #f8f9fa;
}

.search-header {
  padding: 10px 0;
  background: #fff;
}

.search-content {
  padding: 20px;
}

.history-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.history-tags span {
  background: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;
}

.history-tags span:active {
  transform: scale(0.95);
  background: #f0f0f0;
}

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.message-page { background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important; }

/* 卡片类容器统一珍珠化（属性后缀匹配，覆盖各页命名习惯） */
.message-page [class$="-card"],
.message-page [class$="-section"],
.message-page [class$="-box"],
.message-page [class$="-panel"],
.message-page [class$="-item"] {
  border-radius: var(--r-md);
}
.message-page [class$="-card"]:not([class*="__"]),
.message-page [class$="-panel"] {
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.42);
}
/* 标题与数字 */
.message-page h1, .message-page h2, .message-page h3 { letter-spacing: 0.5px; color: #0f2c3a; }
.message-page [class$="-price"], .message-page [class$="-num"], .message-page [class$="-amount"] {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}
/* 主按钮走金 */
.message-page .van-button--primary {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  border: 0 !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7);
}
/* 顶部栏 */
.message-page .header, .message-page .nav-bar, .message-page .top-bar {
  background: linear-gradient(180deg, #ffffff, #f8fbfc) !important;
  border-bottom: 1px solid var(--hairline);
}

</style>
