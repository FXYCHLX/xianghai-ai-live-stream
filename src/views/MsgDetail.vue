<template>
  <div class="detail">
    <!-- 返回按钮 -->
    <div class="back" @click="back">← 返回</div>
    
    <div class="card">
      <img :src="img" class="avatar" />
      <h2>{{ title }}</h2>
      <p class="content">{{ content }}</p>
      <p class="time">{{ time }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const id = route.query.id

// 消息详情数据
const msgData = ref({
  1: { title: '食品旗舰店', content: '亲，您的订单已发货，请注意查收~', time: '星期一 10:00', img: '/images/msg1.jpg' },
  2: { title: '水果旗舰店', content: '今日新鲜水果到货，全场包邮！', time: '星期二 14:30', img: '/images/msg2.jpg' },
  3: { title: '订阅号消息', content: '生鲜特惠：满100减30，限时活动！', time: '星期日 09:15', img: '/images/msg3.jpg' },
  4: { title: '系统消息', content: '您的订单已签收，欢迎再次购买！', time: '星期一 16:20', img: '/images/msg4.jpg' }
})

const title = computed(() => msgData.value[id].title)
const content = computed(() => msgData.value[id].content)
const time = computed(() => msgData.value[id].time)
const img = computed(() => msgData.value[id].img)

const back = () => router.back()
</script>

<style scoped>
.detail {
  padding: 60px 15px;
  background: #f5f5f5;
  height: 100vh;
}
.back {
  position: fixed;
  top: 15px;
  left: 15px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 0 5px #ccc;
}
.card {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}
.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 10px;
}
.content {
  color: #666;
  margin: 10px 0;
  line-height: 1.6;
}
.time {
  color: #999;
  font-size: 12px;
}
</style>