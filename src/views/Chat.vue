<template>
  <div class="chat-page">
    <!-- 顶部导航 -->
    <div class="chat-header">
      <div class="header-left">
        <van-icon name="arrow-left" class="back-btn" @click="goBack" />
        <div class="shop-info">
          <div class="ai-avatar-sm">AI</div>
          <div class="shop-meta">
            <h3 class="shop-name">{{ shopName }}</h3>
            <span class="shop-status">
              <span class="status-dot" :class="{ off: aiOffline }"></span>
              {{ aiOffline ? '未连接到 AI 服务' : 'AI 在线' }}
            </span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <van-icon name="ellipsis" class="header-icon" @click="showMoreMenu" />
      </div>
    </div>

    <!-- 商家信息卡片 -->
    <div class="shop-card" v-if="showShopCard">
      <div class="shop-card-content">
        <div class="ai-avatar-lg">AI</div>
        <div class="shop-detail">
          <div class="shop-title">{{ shopName }}</div>
          <div class="shop-rating">
            <span class="rating-text">{{ aiStatusText }}</span>
          </div>
          <div class="shop-tags">
            <van-tag type="primary" size="mini">大模型驱动</van-tag>
            <van-tag type="success" size="mini">熟悉 {{ goodsCount }} 件在售商品</van-tag>
          </div>
        </div>
        <van-icon name="cross" class="close-card" @click="showShopCard = false" />
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" ref="messageListRef" @scroll="onScroll">
      <!-- 加载更多 -->
      <div class="load-more" v-if="showLoadMore" @click="loadMoreMessages">
        <van-loading v-if="loadingMore" size="14" />
        <span v-else>点击加载更多消息</span>
      </div>

      <!-- 时间分割线 -->
      <div class="time-divider" v-if="messageList.length > 0">
        <span>{{ todayDate }}</span>
      </div>

      <div 
        class="message-item" 
        v-for="(msg, index) in messageList" 
        :key="msg.id" 
        :class="{ self: msg.isSelf, other: !msg.isSelf }"
        :style="{ animationDelay: index * 0.05 + 's' }"
      >
        <!-- 系统消息 -->
        <template v-if="msg.type === 'system'">
          <div class="system-message">
            <span class="system-text">{{ msg.content }}</span>
          </div>
        </template>

        <!-- 对方消息 -->
        <template v-else-if="!msg.isSelf">
          <div class="avatar-wrapper">
            <div class="ai-avatar" @click="showShopCard = true">AI</div>
          </div>
          <div class="message-content">
            <div class="sender-name" v-if="isGroup">{{ shopName }}</div>
            <div class="message-bubble other" :class="{ 'has-image': msg.image, 'has-product': msg.product || (msg.products && msg.products.length) }">
              <!-- 图片消息 -->
              <img v-if="msg.image" :src="msg.image" class="message-image" @click="previewImage(msg.image)" />
              <!-- 商品卡片（AI 推荐，可能多件） -->
              <div v-if="msg.product" class="product-card" @click="goToProduct(msg.product.id)">
                <img :src="msg.product.pic" class="product-img" />
                <div class="product-info">
                  <div class="product-name">{{ msg.product.name }}</div>
                  <div class="product-price">¥{{ msg.product.price }}</div>
                </div>
              </div>
              <div
                v-for="p in (msg.products || [])"
                :key="p.id"
                class="product-card"
                @click="goToProduct(p.id)"
              >
                <img :src="p.pic" class="product-img" />
                <div class="product-info">
                  <div class="product-name">{{ p.name }}</div>
                  <div class="product-sub">{{ p.desc }}</div>
                  <div class="product-price">¥{{ p.price }}</div>
                </div>
              </div>
              <!-- 文字消息 -->
              <p class="message-text" v-if="msg.content">{{ msg.content }}</p>
            </div>
            <div class="message-meta">
              <span class="message-time">{{ msg.time }}</span>
              <span class="read-status" v-if="msg.isRead">已读</span>
            </div>
          </div>
        </template>

        <!-- 自己消息 -->
        <template v-else>
          <div class="message-content self">
            <div class="message-bubble self" :class="{ 'has-image': msg.image }">
              <img v-if="msg.image" :src="msg.image" class="message-image" @click="previewImage(msg.image)" />
              <p class="message-text" v-if="msg.content">{{ msg.content }}</p>
            </div>
            <div class="message-meta self">
              <span class="read-status" v-if="msg.isRead">已读</span>
              <span class="message-time">{{ msg.time }}</span>
            </div>
          </div>
          <div class="self-avatar-wrapper">
            <img :src="userAvatar" class="avatar self-avatar" />
          </div>
        </template>
      </div>

      <!-- 正在输入 -->
      <div class="typing-indicator" v-if="isTyping">
        <div class="typing-bubble">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- 快捷回复 -->
    <div class="quick-reply" v-if="showQuickReply">
      <div class="quick-title">快捷回复</div>
      <div class="quick-list">
        <span v-for="text in quickReplies" :key="text" @click="sendQuickReply(text)">{{ text }}</span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-toolbar">
        <van-icon name="photo-o" class="toolbar-icon" @click="showImagePicker" />
        <van-icon name="goods-collect-o" class="toolbar-icon" @click="showProductsPicker = true" />
        <van-icon name="smile-o" class="toolbar-icon" @click="showEmojiPicker" />
      </div>
      
      <div class="input-row">
        <div class="input-wrapper">
          <van-field 
            v-model="inputMsg" 
            placeholder="输入消息..." 
            type="textarea" 
            :rows="1" 
            autosize 
            class="input-field"
            @focus="onInputFocus"
            @blur="onInputBlur"
            @keydown.enter.prevent="sendMessage"
          />
        </div>
        <van-button 
          type="primary" 
          class="send-btn" 
          :disabled="!inputMsg.trim()"
          @click="sendMessage"
        >
          <van-icon name="guide-o" />
        </van-button>
      </div>
    </div>

    <!-- 表情选择器 -->
    <van-popup v-model:show="showEmoji" position="bottom" :style="{ height: '280px' }">
      <div class="emoji-picker">
        <div class="emoji-header">
          <span>表情</span>
          <van-icon name="delete-o" @click="showEmoji = false" />
        </div>
        <div class="emoji-list">
          <span v-for="emoji in emojis" :key="emoji" @click="insertEmoji(emoji)">{{ emoji }}</span>
        </div>
      </div>
    </van-popup>

    <!-- 更多菜单 -->
    <van-action-sheet v-model:show="showMenu" :actions="menuActions" @select="onMenuSelect" cancel-text="取消" />

    <!-- 挑商品直接问 AI -->
    <van-action-sheet
      v-model:show="showProductsPicker"
      :actions="productsPickerActions"
      title="挑一件，问问 AI 值不值得买"
      cancel-text="取消"
      @select="onPickProduct"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import { aiChat, checkHealth } from '../api/ai'
import { GOODS } from '../data/goods'

const route = useRoute()
const router = useRouter()
const messageListRef = ref(null)

// 商家信息
const shopName = ref(route.query.shopName || '向海 · AI 导购 阿海')
const shopAvatar = ref(route.query.shopAvatar || '/images/goods/1560179707-f14e90ef3623.jpg')
const storageKey = ref(`v2_${route.query.storageKey || 'default'}`)
const shopRate = ref(5)
const isOfficial = ref(true)
const isGroup = ref(false)
const showShopCard = ref(true)

// ── AI 服务状态 ──
const aiOffline = ref(false)
const aiChecking = ref(true)
const sending = ref(false)
const goodsCount = ref(GOODS.length)
const aiStatusText = computed(() => {
  if (aiChecking.value) return '正在连接 AI 服务…'
  if (aiOffline.value) return '未连接（请启动本地 AI 服务）'
  return '已接入大模型，随时问我'
})

// 用户信息
const userAvatar = ref('/images/goods/1535713875002-d1d0cf377fde.jpg')

// 消息相关
const inputMsg = ref('')
const messageList = ref([])
const isTyping = ref(false)
const showLoadMore = ref(false)
const loadingMore = ref(false)
const todayDate = ref(new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }))

// 快捷回复
const showQuickReply = ref(false)
const quickReplies = ref([
  '500 以内送女朋友的礼物',
  '有没有降噪耳机推荐',
  '宿舍用的小家电',
  '2000 左右能打游戏的笔记本'
])

// 表情
const showEmoji = ref(false)
const emojis = ref(['😀', '😂', '🤣', '😍', '🥰', '😘', '🤔', '😎', '🤗', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🤠', '🤡', '🥳', '🥴', '😵', '🤯', '🤪', '😜', '😝', '😛', '🤑', '😤', '😡', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'])

// 菜单
const showMenu = ref(false)
const menuActions = ref([
  { name: '店里都有什么' },
  { name: '怎么问我比较好用' },
  { name: '清空聊天记录', color: 'var(--brick)' }
])

const nowStr = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// AI 导购开场白
const WELCOME = [
  { id: 1, content: '你好，我是向海的 AI 导购阿海。想吃哪口海货，跟我说。', isSelf: false, isRead: true },
  { id: 2, content: `店里有 ${GOODS.length} 件在售商品。直接说需求就行，比如「500 以内送女朋友的礼物」。`, isSelf: false, isRead: true }
]

// 加载消息
const loadMessages = () => {
  const stored = localStorage.getItem(`chat_${storageKey.value}`)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length) {
        messageList.value = parsed
        return
      }
    } catch { /* 本地数据损坏时回落到开场白 */ }
  }
  messageList.value = WELCOME.map(m => ({ ...m, time: nowStr() }))
  saveMessages()
}

const saveMessages = () => {
  localStorage.setItem(`chat_${storageKey.value}`, JSON.stringify(messageList.value))
}

/** 汇总用户行为，让推荐更贴合个人情况 */
const collectUserProfile = () => {
  let viewed = [], cart = [], keywords = []
  try { viewed = JSON.parse(localStorage.getItem('footprint') || '[]').slice(0, 5).map(i => i.name) } catch { /* ignore */ }
  try { cart = JSON.parse(localStorage.getItem('cartList') || '[]').slice(0, 5).map(i => i.name) } catch { /* ignore */ }
  try { keywords = JSON.parse(localStorage.getItem('searchHistory') || '[]').slice(0, 5) } catch { /* ignore */ }
  return { viewed, cartCount: cart.length, keywords }
}

/** 发送消息 → 调用大模型 → 渲染回复与推荐商品 */
const sendMessage = async () => {
  const content = inputMsg.value.trim()
  if (!content || sending.value) return

  const userMsg = { id: Date.now(), content, time: nowStr(), isSelf: true, isRead: false }
  messageList.value.push(userMsg)
  inputMsg.value = ''
  saveMessages()
  scrollToBottom()

  isTyping.value = true
  sending.value = true
  try {
    const history = messageList.value.slice(-10, -1)
    const res = await aiChat({
      messages: history,
      userMessage: content,
      userProfile: collectUserProfile()
    })
    userMsg.isRead = true
    messageList.value.push({
      id: Date.now() + 1,
      content: res.reply,
      products: res.products || [],
      time: nowStr(),
      isSelf: false,
      isRead: true
    })
    aiOffline.value = false
  } catch (e) {
    userMsg.isRead = true
    messageList.value.push({
      id: Date.now() + 1,
      content: `连不上 AI 服务了：${e.message}`,
      time: nowStr(),
      isSelf: false,
      isRead: true
    })
    aiOffline.value = true
  } finally {
    isTyping.value = false
    sending.value = false
    saveMessages()
    scrollToBottom()
  }
}

const sendQuickReply = (text) => {
  inputMsg.value = text
  sendMessage()
  showQuickReply.value = false
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

const onScroll = () => {
  // 可以在这里实现上拉加载更多
}

const loadMoreMessages = () => {
  loadingMore.value = true
  setTimeout(() => {
    loadingMore.value = false
    showLoadMore.value = false
  }, 1000)
}

// 工具栏
const showImagePicker = () => {
  router.push('/scan')
}

const showEmojiPicker = () => {
  showEmoji.value = true
}

const insertEmoji = (emoji) => {
  inputMsg.value += emoji
}

// 挑一件在售商品，直接丢给 AI 问值不值得买
const showProductsPicker = ref(false)
const productsPickerActions = computed(() =>
  GOODS.slice()
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 8)
    .map(g => ({ name: g.name, subname: `¥${g.price}` }))
)
const onPickProduct = (action) => {
  showProductsPicker.value = false
  inputMsg.value = `帮我看看「${action.name}」值不值得买`
  sendMessage()
}

const onInputFocus = () => {
  showQuickReply.value = false
  scrollToBottom()
}

const onInputBlur = () => {
  // 可以在这里显示快捷回复
}

// 菜单
const showMoreMenu = () => {
  showMenu.value = true
}

const MENU_PROMPTS = {
  '店里都有什么': '店里都有什么',
  '怎么问我比较好用': '我该怎么提问，才能拿到好的推荐？'
}

const onMenuSelect = (action) => {
  showMenu.value = false
  if (action.name === '清空聊天记录') {
    messageList.value = WELCOME.map(m => ({ ...m, time: nowStr() }))
    saveMessages()
    showToast('已清空')
    return
  }
  const prompt = MENU_PROMPTS[action.name]
  if (prompt) {
    inputMsg.value = prompt
    sendMessage()
  }
}

// 图片预览
const previewImage = (url) => {
  showImagePreview([url])
}

// 跳转商品
const goToProduct = (id) => {
  router.push({ path: '/detail', query: { id } })
}

const goBack = () => router.back()

watch(messageList, scrollToBottom, { deep: true })

onMounted(async () => {
  loadMessages()
  scrollToBottom()
  try {
    const h = await checkHealth()
    aiChecking.value = false
    aiOffline.value = !h.aiReady
    if (h.goodsCount) goodsCount.value = h.goodsCount
  } catch {
    aiChecking.value = false
    aiOffline.value = true
  }

  // 从详情页「问这件」跳过来时，进入即自动提问
  const pending = sessionStorage.getItem('ai:autoAsk')
  if (pending) {
    sessionStorage.removeItem('ai:autoAsk')
    inputMsg.value = pending
    await nextTick()
    sendMessage()
  }
})
</script>

<style scoped>
.chat-page {
  background: linear-gradient(180deg, #f2f8fb 0%, #ffffff 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #0b7a9e 0%, #12a0c8 100%);
  position: sticky;
  top: 0;
  z-index: 999;
  box-shadow: 0 4px 20px rgba(11, 122, 158, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  font-size: 22px;
  color: #fff;
  cursor: pointer;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.shop-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.shop-meta {
  display: flex;
  flex-direction: column;
}

.shop-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.shop-status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #2A9D8F;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.header-right {
  display: flex;
  gap: 20px;
}

.header-icon {
  font-size: 22px;
  color: #fff;
  cursor: pointer;
}

/* 商家卡片 */
.shop-card {
  background: #fff;
  margin: 12px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.shop-card-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
  position: relative;
}

.shop-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.shop-detail {
  flex: 1;
}

.shop-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.shop-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.rating-text {
  font-size: 12px;
  color: var(--price);
}

.shop-tags {
  display: flex;
  gap: 6px;
}

.close-card {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 16px;
  color: #999;
  cursor: pointer;
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.load-more {
  text-align: center;
  padding: 10px;
  color: #999;
  font-size: 12px;
  cursor: pointer;
}

.time-divider {
  text-align: center;
  margin: 8px 0;
}

.time-divider span {
  font-size: 12px;
  color: #999;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 12px;
  border-radius: 12px;
}

.message-item {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  animation: fadeInUp 0.3s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.self {
  flex-direction: row-reverse;
}

/* 系统消息 */
.system-message {
  display: flex;
  justify-content: center;
  margin: 8px 0;
}

.system-text {
  font-size: 12px;
  color: #999;
  background: rgba(0, 0, 0, 0.05);
  padding: 6px 16px;
  border-radius: 12px;
}

/* 头像 */
.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: linear-gradient(135deg, #0b7a9e, #66c2d6);
  color: #fff;
  font-size: 8px;
  padding: 2px 5px;
  border-radius: 6px;
  font-weight: 500;
}

.self-avatar-wrapper {
  flex-shrink: 0;
}

.self-avatar {
  border: 2px solid #0b7a9e;
}

/* 消息内容 */
.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-content.self {
  align-items: flex-end;
}

.sender-name {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  margin-left: 4px;
}

/* 消息气泡 */
.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  word-break: break-word;
}

.message-bubble.other {
  background: #fff;
  color: #24333d;          /* 白底必须给深色字，否则会继承到全局的浅色文字变成白字白底 */
  border: 1px solid #f0f0f0;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.message-bubble.self {
  background: linear-gradient(135deg, #0b7a9e 0%, #12a0c8 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 16px rgba(11, 122, 158, 0.3);
}

.message-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
}

/* 图片消息 */
.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 8px;
}

.message-bubble.has-image {
  padding: 8px;
}

.message-bubble.has-image .message-text {
  padding: 0 8px 4px;
}

/* 商品卡片 */
.product-card {
  display: flex;
  gap: 10px;
  background: #f2f8fb;
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:active {
  transform: scale(0.98);
}

.product-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 15px;
  color: #0b7a9e;
  font-weight: 600;
}

/* 消息元信息 */
.message-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  margin-left: 4px;
}

.message-meta.self {
  margin-left: 0;
  margin-right: 4px;
  justify-content: flex-end;
}

.message-time {
  font-size: 11px;
  color: #999;
}

.message-bubble.self .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.read-status {
  font-size: 10px;
  color: #999;
}

/* 正在输入 */
.typing-indicator {
  display: flex;
  justify-content: flex-start;
  margin-left: 54px;
}

.typing-bubble {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  padding: 12px 16px;
  display: flex;
  gap: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.typing-bubble span {
  width: 8px;
  height: 8px;
  background: #ccc;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-bubble span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-bubble span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

/* 快捷回复 */
.quick-reply {
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 12px 16px;
}

.quick-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-list span {
  background: #eef5f9;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-list span:active {
  background: #0b7a9e;
  color: #fff;
}

/* 输入区域 */
.input-area {
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 8px 12px;
}

.input-toolbar {
  display: flex;
  gap: 20px;
  padding: 8px 4px;
  margin-bottom: 4px;
}

.toolbar-icon {
  font-size: 24px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.toolbar-icon:active {
  color: #0b7a9e;
}

.toolbar-icon.active {
  color: #0b7a9e;
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.input-wrapper {
  flex: 1;
  background: #eef5f9;
  border-radius: 20px;
  padding: 2px 4px;
}

.input-field {
  background: transparent;
}

.input-field :deep(.van-field__control) {
  padding: 8px 12px;
  font-size: 15px;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0b7a9e 0%, #12a0c8 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(11, 122, 158, 0.3);
}

.send-btn:disabled {
  background: #ccc;
  box-shadow: none;
}

/* 表情选择器 */
.emoji-picker {
  background: #f2f8fb;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.emoji-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.emoji-header span {
  font-size: 15px;
  font-weight: 500;
}

.emoji-list {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  overflow-y: auto;
}

.emoji-list span {
  font-size: 28px;
  cursor: pointer;
  transition: transform 0.2s;
}

.emoji-list span:active {
  transform: scale(1.2);
}

/* ── AI 助手头像 ── */
.ai-avatar-sm {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: #0b7a9e; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}
.ai-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, #0b7a9e, #12a0c8);
  color: #fff; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(11, 122, 158, 0.35);
}
.ai-avatar-lg {
  width: 60px; height: 60px; border-radius: 16px;
  background: linear-gradient(135deg, #0b7a9e, #12a0c8);
  color: #fff; font-size: 18px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.status-dot.off { background: #f87171; animation: none; }

/* ── AI 推荐的商品卡片补充样式 ── */
.message-bubble.has-product { padding: 10px; }
.product-card + .product-card { margin-top: 8px; }
.product-sub {
  font-size: 11px; color: #999; margin-bottom: 4px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.product-info { min-width: 0; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.chat-page .chat-header {
  background: linear-gradient(150deg, #0b4a6f 0%, #06283a 58%, #03101a 100%) !important;
  border-bottom: 1px solid var(--hairline);
  box-shadow: 0 12px 28px -20px rgba(2, 12, 20, 0.75);
}
.chat-page .shop-name { font-weight: 700; letter-spacing: 0.6px; }
.chat-page .message-bubble.other {
  border: 1px solid var(--hairline-soft) !important;
  box-shadow: 0 12px 26px -20px rgba(2, 12, 20, 0.45) !important;
}
.chat-page .message-bubble.self {
  box-shadow: 0 12px 26px -14px rgba(11, 122, 158, 0.5) !important;
}
.chat-page .ai-avatar,
.chat-page .ai-avatar-sm,
.chat-page .ai-avatar-lg {
  background: linear-gradient(140deg, var(--gold-soft), var(--gold)) !important;
  color: #1a1206 !important;
  font-weight: 800;
}
.chat-page .shop-card {
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%) !important;
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 18px 36px -22px rgba(2, 12, 20, 0.5) !important;
}
.chat-page .chat-input,
.chat-page .input-bar {
  background: rgba(247, 249, 250, 0.96) !important;
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  border-top: 1px solid var(--hairline) !important;
}

</style>
