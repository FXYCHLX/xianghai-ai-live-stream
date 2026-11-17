<template>
  <div class="live">
    <!-- 深海背景层 -->
    <div class="ocean">
      <div class="caustics"></div>
      <div class="deep-grad"></div>
      <div class="bubbles">
        <span v-for="i in 16" :key="i" class="bubble" :style="bubbleStyle(i)"></span>
      </div>
    </div>

    <!-- 顶栏 -->
    <header class="bar" :class="{ ready: started }">
      <button class="round-btn" @click="leave" aria-label="返回">
        <van-icon name="arrow-left" size="16" />
      </button>

      <div class="anchor-chip">
        <span class="anchor-dot">优</span>
        <div class="anchor-info">
          <b>阿海<i>AI</i></b>
          <small><em></em>{{ onlineCount.toLocaleString() }} 人在看</small>
        </div>
      </div>

      <button class="pill" :class="{ on: autoMode }" @click="toggleAuto">
        <span class="pill-dot" v-if="autoMode"></span>{{ autoMode ? '自动带货' : '自动' }}
      </button>
    </header>

    <!-- 主播舞台 -->
    <section class="stage" @click="saySomething">
      <div class="glow"></div>
      <div class="ripple"></div>
      <div class="ripple r2"></div>

      <div class="host-wrap">
        <img
          class="host"
          :class="{ talking: speaking }"
          src="/images/host/host.png"
          alt="AI 数字人主播"
          draggable="false"
        />
        <img
          class="host host-talk"
          :class="{ on: mouthOpen }"
          src="/images/host/host-talk.png"
          alt=""
          aria-hidden="true"
          draggable="false"
        />
        <div class="scan" v-if="speaking"></div>
      </div>

      <div class="wave" :class="{ live: speaking }">
        <span v-for="(h, i) in waveBars" :key="i" :style="{ height: h + 'px' }"></span>
      </div>

      <div class="hint" v-if="started && !speaking">轻触主播 · 让她讲一段</div>
    </section>

    <!-- 数据带 -->
    <div class="stats" v-if="started">
      <div><b>{{ onlineCount.toLocaleString() }}</b><small>在线</small></div>
      <i></i>
      <div><b>{{ likeCount.toLocaleString() }}</b><small>点赞</small></div>
      <i></i>
      <div><b>{{ GOODS.length }}</b><small>在售</small></div>
    </div>

    <!-- 字幕 -->
    <transition name="sub">
      <div class="caption" v-if="subtitle">
        <span class="caption-mark"></span>
        <p>{{ subtitle }}</p>
      </div>
    </transition>

    <!-- 弹幕 -->
    <div class="chat" ref="danmakuBox">
      <transition-group name="dm">
        <div v-for="d in danmakuList" :key="d.k" class="dm" :class="{ mine: d.mine, sys: d.sys }">
          <span class="dm-user" v-if="!d.sys">{{ d.user }}</span>
          <span class="dm-text">{{ d.text }}</span>
        </div>
      </transition-group>
    </div>

    <!-- 商品卡 -->
    <div class="product" @click="goDetail">
      <div class="p-thumb">
        <img :src="currentGoods.pic" @error="onImgError" alt="" />
        <span class="p-flag">正在讲解</span>
      </div>
      <div class="p-main">
        <div class="p-name">{{ currentGoods.name }}</div>
        <div class="p-row">
          <span class="p-origin">{{ currentGoods.origin }}</span>
          <span class="p-price"><i>¥</i>{{ currentGoods.price }}</span>
          <span class="p-old">¥{{ currentGoods.originalPrice }}</span>
        </div>
      </div>
      <div class="p-cta">抢</div>
    </div>

    <!-- 底部操作 -->
    <div class="dock">
      <input
        v-model="inputText"
        class="dock-input"
        placeholder="和主播说点什么…"
        @keyup.enter="sendDanmaku"
      />
      <button class="dock-send" @click="sendDanmaku">发送</button>
      <button class="dock-like" @click="like" aria-label="点赞">
        <van-icon name="like-o" size="19" />
      </button>
    </div>

    <!-- 入场页 -->
    <transition name="gate">
      <div class="gate" v-if="!started">
        <div class="gate-card">
          <div class="gate-tag"><i></i>LIVE</div>
          <h1>向海</h1>
          <h2>AI 数字人直播间</h2>
          <p class="gate-sub">一个人 · 一套 AI 工具链 · 24 小时不下播</p>

          <div class="gate-nums">
            <div><b>{{ GOODS.length }}</b><small>款海产</small></div>
            <div><b>6</b><small>个产地</small></div>
            <div><b>24h</b><small>不下播</small></div>
          </div>

          <button class="gate-btn" @click="start">进入直播间</button>
          <p class="gate-note">{{ healthTip }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { GOODS } from '../data/goods'
import { aiLiveScript, aiLiveReply, checkHealth } from '../api/ai'

const router = useRouter()

const started = ref(false)
const speaking = ref(false)
const autoMode = ref(false)
const onlineCount = ref(1286)
const likeCount = ref(3421)
const subtitle = ref('')
const inputText = ref('')
const danmakuList = ref([])
const danmakuBox = ref(null)
const goodsIndex = ref(0)
const healthTip = ref('正在检查 AI 服务…')

const currentGoods = computed(() => GOODS[goodsIndex.value % GOODS.length])

/* 气泡：随机位置、大小、速度 */
const bubbleStyle = (i) => {
  const seed = (i * 2654435761) % 1000 / 1000
  const seed2 = (i * 40503) % 997 / 997
  return {
    left: (4 + seed * 92).toFixed(2) + '%',
    width: (3 + seed2 * 7).toFixed(1) + 'px',
    height: (3 + seed2 * 7).toFixed(1) + 'px',
    animationDelay: (seed * 9).toFixed(2) + 's',
    animationDuration: (11 + seed2 * 10).toFixed(1) + 's'
  }
}

/* 声波：说话时按音量跳动 */
const waveBars = ref([4, 7, 3, 9, 5, 8, 4, 7, 5])
let rafId = null
let blinkTimer = null
let onlineTimer = null
let danmakuTimer = null
let dmSeq = 0
let autoRunning = false

/* ── 口型驱动 ──
   张嘴/闭嘴层是两张像素级对齐的图（只差嘴部），
   这里按「人说话」的随机节奏切换：张嘴时长略长、闭嘴略短、每次都不一样，
   比固定频率的 CSS 动画自然，也不受任何 CSS 优先级影响。 */
const mouthOpen = ref(false)
let mouthTimer = null
function startMouth() {
  if (mouthTimer) return
  const cycle = () => {
    mouthOpen.value = true
    const openMs = 130 + Math.random() * 150
    mouthTimer = setTimeout(() => {
      mouthOpen.value = false
      const closeMs = 80 + Math.random() * 130
      mouthTimer = setTimeout(cycle, closeMs)
    }, openMs)
  }
  cycle()
}
function stopMouth() {
  if (mouthTimer) { clearTimeout(mouthTimer); mouthTimer = null }
  mouthOpen.value = false
}

function startWave() {
  startMouth()
  stopWave()
  const t0 = performance.now()
  const tick = (now) => {
    const t = (now - t0) / 1000
    const base = Math.sin(t * Math.PI * 2 * 4.2)
    const jitter = Math.sin(t * 13.7) * 0.35 + Math.sin(t * 7.3) * 0.2
    const v = Math.max(0, Math.min(1, base * 0.55 + 0.42 + jitter * 0.3))
    waveBars.value = waveBars.value.map((_, i) =>
      Math.max(3, Math.round(3 + v * (9 + (i % 3) * 5) * (0.6 + Math.random() * 0.7)))
    )
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
}

function stopWave() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
  stopMouth()
  waveBars.value = [4, 7, 3, 9, 5, 8, 4, 7, 5]
}

/* 语音合成（浏览器原生，零成本） */
const zhVoice = ref(null)
const isMaleVoice = ref(false)   // 有没有真的挑到中文男声，决定 pitch 怎么补偿
function pickVoice() {
  if (!('speechSynthesis' in window)) return
  const voices = speechSynthesis.getVoices() || []
  const zh = voices.filter(v => /^zh/i.test(v.lang))

  /* 男声优先。本地 Windows 常见「Microsoft Kangkang」，
     Edge / Azure 云端音色常见 Yunxi(云希) / Yunyang(云扬) / Yunjian(云健) / Yunfeng(云枫)，
     另外兜底匹配 male / 男。 */
  const male = zh.find(v => /(Kangkang|Yunxi|Yunyang|Yunjian|Yunfeng|male|男)/i.test(v.name))

  zhVoice.value = male || zh.find(v => /zh[-_]CN/i.test(v.lang)) || zh[0] || null
  isMaleVoice.value = !!male
  window.__voiceInfo = { picked: zhVoice.value && zhVoice.value.name, male: !!male, all: zh.map(v => v.name) }
}

function speak(text) {
  return new Promise((resolve) => {
    if (!text) { resolve(); return }
    if (!('speechSynthesis' in window)) {
      speaking.value = true
      startWave()
      setTimeout(() => { speaking.value = false; stopWave(); resolve() },
        Math.min(9000, Math.max(2000, text.length * 190)))
      return
    }
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-CN'
    u.rate = 1.02
    u.pitch = isMaleVoice.value ? 0.92 : 0.70
    if (zhVoice.value) u.voice = zhVoice.value
    let done = false
    let started = false
    const finish = () => {
      if (done) return
      done = true
      speaking.value = false
      stopWave()
      resolve()
    }
    u.onstart = () => { started = true; speaking.value = true; startWave() }
    u.onend = finish
    u.onerror = finish
    /* 兜底：没接音频设备（静音/无扬声器/虚拟环境）时 onstart 不触发，
       画面会一直僵在那里，口型和声波都不出来。等一小会儿还没动静就自己进说话态。 */
    setTimeout(() => {
      if (!done && !started) { speaking.value = true; startWave() }
    }, 700)
    setTimeout(finish, Math.min(20000, Math.max(4000, text.length * 260)))
    speechSynthesis.speak(u)
  })
}

function stopSpeak() {
  if ('speechSynthesis' in window) speechSynthesis.cancel()
  speaking.value = false
  stopWave()
}

async function loadScript(goodsId) {
  subtitle.value = '正在生成话术…'
  try {
    const data = await aiLiveScript({ goodsId, audience: '想吃到新鲜海产的城里人' })
    subtitle.value = data.full || ''
    return data
  } catch (e) {
    subtitle.value = `话术接口未连通：${e.message}`
    return null
  }
}

const SEED = [
  { user: '海边老张', text: '这个鲍鱼是几头的？' },
  { user: '福州吃货', text: '海带怎么泡发啊' },
  { user: '连江本地人', text: '晓澳的蛏子确实肥' },
  { user: '阿May', text: '紫菜是头水的吗' },
  { user: '老王', text: '已下单，等着收货' },
  { user: '匿名用户', text: '能发顺丰吗' },
  { user: '小陈', text: '价格比超市便宜' },
  { user: '想吃海鲜', text: '这个怎么做才好吃' }
]

function pushDanmaku(user, text, opt = {}) {
  danmakuList.value.push({ k: ++dmSeq, user, text, ...opt })
  if (danmakuList.value.length > 30) danmakuList.value.shift()
  nextTick(() => {
    if (danmakuBox.value) danmakuBox.value.scrollTop = danmakuBox.value.scrollHeight
  })
}

function startDanmakuSeed() {
  danmakuTimer = setInterval(() => {
    const d = SEED[Math.floor(Math.random() * SEED.length)]
    pushDanmaku(d.user, d.text)
  }, 4600)
}

async function sendDanmaku() {
  const q = inputText.value.trim()
  if (!q) return
  inputText.value = ''
  pushDanmaku('我', q, { mine: true })
  try {
    const data = await aiLiveReply({ goodsId: currentGoods.value.id, question: q })
    pushDanmaku('阿海', data.reply)
    await speak(data.reply)
  } catch (e) {
    pushDanmaku('阿海', `没接上：${e.message}`)
  }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function runAutoLoop() {
  while (autoRunning) {
    const script = await loadScript(currentGoods.value.id)
    if (!autoRunning) break
    if (script?.full) await speak(script.full)
    else await sleep(1500)
    if (!autoRunning) break
    await sleep(1200)
    if (!autoRunning) break
    goodsIndex.value = (goodsIndex.value + 1) % GOODS.length
  }
}

function toggleAuto() {
  autoMode.value = !autoMode.value
  autoRunning = autoMode.value
  if (autoMode.value) {
    pushDanmaku('系统', 'AI 主播开始循环讲解全部在售商品', { sys: true })
    runAutoLoop()
  } else {
    stopSpeak()
    subtitle.value = ''
    pushDanmaku('系统', '已暂停自动带货', { sys: true })
  }
}

async function saySomething() {
  if (!started.value) return
  if (speaking.value) { stopSpeak(); return }
  const script = await loadScript(currentGoods.value.id)
  if (script?.full) { subtitle.value = script.full; await speak(script.full) }
}

function goDetail() {
  router.push({ path: '/detail', query: { id: currentGoods.value.id } })
}

function like() { likeCount.value += Math.floor(Math.random() * 5) + 1 }

function onImgError(e) { e.target.style.opacity = '0' }

function leave() {
  autoRunning = false
  stopSpeak()
  router.push('/home')
}

async function start() {
  started.value = true
  pushDanmaku('系统', '欢迎来到向海直播间，我是 AI 主播阿海', { sys: true })
  const script = await loadScript(currentGoods.value.id)
  if (script?.full) await speak(script.full)
}

onMounted(async () => {
  pickVoice()
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = pickVoice
  startDanmakuSeed()
  onlineTimer = setInterval(() => {
    onlineCount.value = Math.max(200, onlineCount.value + Math.floor(Math.random() * 21) - 8)
    likeCount.value += Math.floor(Math.random() * 3)
  }, 3000)

  const h = await checkHealth()
  healthTip.value = h.aiReady
    ? `AI 服务已就绪 · 在售 ${h.goodsCount} 款连江海产`
    : 'AI 服务未配置 Key，话术将走降级提示'

  // 演示模式：/live?demo=1 自动开播；再加 &auto=1 自动循环带货
  const q = new URLSearchParams(window.location.search)
  if (q.get('demo') === '1') {
    await start()
    if (q.get('auto') === '1') toggleAuto()
  }
})

onBeforeUnmount(() => {
  autoRunning = false
  stopSpeak()
  if (blinkTimer) clearTimeout(blinkTimer)
  if (onlineTimer) clearInterval(onlineTimer)
  if (danmakuTimer) clearInterval(danmakuTimer)
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = null
})
</script>

<style scoped>
/* ══════════ 海洋主题设计令牌 ══════════ */
.live {
  --abyss: #041e2e;
  --deep: #062a3f;
  --mid: #0b4666;
  --shallow: #1a7fa8;
  --foam: #7fd4e8;
  --coral: #c99050;
  --pearl: #eaf6fb;
  --kelp: #2a9d8f;

  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--abyss);
  color: var(--pearl);
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ══════════ 深海背景 ══════════ */
.ocean { position: absolute; inset: 0; overflow: hidden; }

.deep-grad {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 90% 50% at 50% -8%, rgba(26, 127, 168, 0.55), transparent 64%),
    radial-gradient(ellipse 60% 34% at 86% 98%, rgba(201, 169, 97, 0.12), transparent 70%),
    linear-gradient(180deg, #072a3f 0%, #051c2b 58%, #03101a 100%);
}

/* 水下光斑：两层错位缓慢移动，模拟水面折射 */
.caustics {
  position: absolute;
  inset: -20%;
  opacity: 0.4;
  background:
    radial-gradient(circle 180px at 18% 22%, rgba(127, 212, 232, 0.20), transparent 68%),
    radial-gradient(circle 220px at 78% 16%, rgba(127, 212, 232, 0.14), transparent 70%),
    radial-gradient(circle 160px at 52% 66%, rgba(42, 157, 143, 0.14), transparent 68%),
    radial-gradient(circle 200px at 88% 74%, rgba(127, 212, 232, 0.12), transparent 70%);
  filter: blur(12px);
  animation: drift 22s ease-in-out infinite alternate;
}

@keyframes drift {
  0%   { transform: translate3d(-2%, -1%, 0) scale(1); }
  100% { transform: translate3d(3%, 2%, 0) scale(1.08); }
}

/* 气泡 */
.bubbles { position: absolute; inset: 0; }
.bubble {
  position: absolute;
  bottom: -12px;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.75), rgba(127, 212, 232, 0.18) 58%, transparent 72%);
  border: 0.5px solid rgba(127, 212, 232, 0.32);
  animation: rise linear infinite;
  will-change: transform, opacity;
}
@keyframes rise {
  0%   { transform: translateY(0) scale(0.6); opacity: 0; }
  12%  { opacity: 0.85; }
  88%  { opacity: 0.6; }
  100% { transform: translateY(-108vh) scale(1.1); opacity: 0; }
}

/* ══════════ 顶栏 ══════════ */
.bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.7s cubic-bezier(.22, 1, .36, 1) 0.1s;
}
.bar.ready { opacity: 1; transform: none; }

.round-btn {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 0.5px solid rgba(234, 246, 251, 0.2);
  border-radius: 50%;
  background: rgba(234, 246, 251, 0.07);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: var(--pearl);
  cursor: pointer;
  transition: background 0.2s;
}
.round-btn:active { background: rgba(234, 246, 251, 0.16); }

.anchor-chip {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 5px 13px 5px 5px;
  border-radius: 999px;
  background: rgba(234, 246, 251, 0.07);
  border: 0.5px solid rgba(234, 246, 251, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.anchor-dot {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: 12px;
  color: #06283a;
  background: linear-gradient(135deg, var(--foam), var(--shallow));
  box-shadow: 0 0 0 2px rgba(127, 212, 232, 0.18);
}
.anchor-info { min-width: 0; }
.anchor-info b {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.anchor-info b i {
  font-style: normal;
  font-size: 9px;
  padding: 0 3px;
  border-radius: 3px;
  background: var(--coral);
  color: #fff;
  line-height: 1.5;
}
.anchor-info small {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: rgba(234, 246, 251, 0.5);
}
.anchor-info small em {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ff4d4f;
  animation: blink 1.3s ease-in-out infinite;
}

.pill {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-family: inherit;
  padding: 7px 13px;
  border-radius: 999px;
  border: 0.5px solid rgba(234, 246, 251, 0.24);
  background: rgba(234, 246, 251, 0.06);
  color: rgba(234, 246, 251, 0.82);
  cursor: pointer;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: all 0.28s;
}
.pill.on {
  background: linear-gradient(135deg, #1a90b8, #0b6690);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 18px rgba(26, 144, 184, 0.45);
}
.pill-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--foam);
  animation: blink 1s infinite;
}

/* ══════════ 主播舞台 ══════════ */
.stage {
  position: relative;
  z-index: 5;
  flex: 1;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.glow {
  position: absolute;
  width: 270px;
  height: 270px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(26, 127, 168, 0.42) 0%, rgba(26, 127, 168, 0.1) 46%, transparent 70%);
  animation: breathe 4.2s ease-in-out infinite;
}
.ripple {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  border: 1px solid rgba(127, 212, 232, 0.22);
}
.ripple.r2 {
  width: 316px;
  height: 316px;
  border-style: dashed;
  border-color: rgba(127, 212, 232, 0.13);
  animation: spin 34s linear infinite;
}
.stage:has(.host.talking) .ripple.r2 { animation-duration: 12s; }
.stage:has(.host.talking) .glow { opacity: 1; transform: scale(1.06); }

.host-wrap { position: relative; z-index: 3; height: 258px; width: 150px; }
.host {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  pointer-events: none;
  transform-origin: 50% 88%;
  filter: drop-shadow(0 16px 36px rgba(0, 0, 0, 0.55));
}

/* 说话层：与闭嘴层像素级对齐，只差嘴部。
   由 JS 切 .on（见 startMouth）——故意不用 CSS animation：
   张嘴层也带 .host class，上一版用 `.host { animation: none !important }`
   想压住闭嘴层，结果把这里的闪烁一起压掉了，嘴就不动了。 */
.host-talk { opacity: 0; }
.host-talk.on { opacity: 1; }

/* 待机：胸腔起伏 + 极轻微的重心移动，像真人站着 */
@keyframes idleBreath {
  0%   { transform: translateY(0) scale(1) rotate(0deg); }
  30%  { transform: translateY(-4px) scale(1.011) rotate(0.35deg); }
  60%  { transform: translateY(-1px) scale(1.004) rotate(-0.2deg); }
  100% { transform: translateY(0) scale(1) rotate(0deg); }
}

/* 说话：明显但不夸张的起伏 + 左右微摆，像在讲解 */
/* 身体动效挂在容器：待机呼吸 / 说话起伏 */
.host-wrap { animation: idleBreath 4.2s ease-in-out infinite; transform-origin: 50% 88%; }
.host-wrap:has(.host.talking) { animation: talkMotion 1.15s ease-in-out infinite; }

/* 两张图叠放，张嘴层在上；闭嘴层恒定显示，只有嘴部会变 */
.host { z-index: 1; }
.host-talk { z-index: 2; }
@keyframes talkMotion {
  0%   { transform: translateY(0) scale(1) rotate(0deg); }
  18%  { transform: translateY(-9px) scale(1.022) rotate(-0.9deg); }
  38%  { transform: translateY(-2px) scale(1.006) rotate(0.3deg); }
  58%  { transform: translateY(-8px) scale(1.019) rotate(0.85deg); }
  78%  { transform: translateY(-1px) scale(1.004) rotate(-0.35deg); }
  100% { transform: translateY(0) scale(1) rotate(0deg); }
}

.scan {
  position: absolute;
  left: -14%;
  right: -14%;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(127, 212, 232, 0.8), transparent);
  animation: scan 2.6s linear infinite;
}
@keyframes scan {
  0%   { transform: translateY(0); opacity: 0; }
  12%  { opacity: 0.85; }
  88%  { opacity: 0.85; }
  100% { transform: translateY(254px); opacity: 0; }
}

.wave {
  position: absolute;
  right: 18px;
  bottom: 26px;
  z-index: 4;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 38px;
  opacity: 0.4;
  transition: opacity 0.4s;
}
.wave.live { opacity: 1; }
.wave span {
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--foam), var(--shallow));
  transition: height 0.08s linear;
}

.hint {
  position: absolute;
  bottom: 8px;
  z-index: 4;
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: rgba(234, 246, 251, 0.34);
}

/* ══════════ 数据带 ══════════ */
.stats {
  position: relative;
  z-index: 7;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin: 0 14px 6px;
  padding: 9px 0;
  border-radius: 14px;
  background: rgba(234, 246, 251, 0.05);
  border: 0.5px solid rgba(234, 246, 251, 0.1);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.stats div { display: flex; flex-direction: column; align-items: center; gap: 1px; }
.stats b {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--pearl);
}
.stats small { font-size: 9.5px; letter-spacing: 0.1em; color: rgba(234, 246, 251, 0.42); }
.stats i { width: 0.5px; height: 18px; background: rgba(234, 246, 251, 0.14); }

/* ══════════ 字幕 ══════════ */
.caption {
  position: relative;
  z-index: 7;
  display: flex;
  gap: 10px;
  margin: 8px 14px 6px;
  padding: 11px 14px;
  border-radius: 14px;
  background: rgba(6, 40, 58, 0.66);
  border: 0.5px solid rgba(127, 212, 232, 0.26);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}
.caption-mark {
  flex-shrink: 0;
  width: 2px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--foam), var(--shallow));
}
.caption p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  letter-spacing: 0.01em;
  color: rgba(234, 246, 251, 0.95);
  text-wrap: pretty;
}

/* ══════════ 弹幕 ══════════ */
.chat {
  position: relative;
  z-index: 7;
  flex: 1;
  min-height: 62px;
  overflow-y: auto;
  padding: 2px 14px 6px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  scrollbar-width: none;
}
.chat::-webkit-scrollbar { display: none; }

.dm {
  align-self: flex-start;
  max-width: 88%;
  padding: 5px 11px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 13px 13px 13px 3px;
  background: rgba(234, 246, 251, 0.09);
  border: 0.5px solid rgba(234, 246, 251, 0.14);
}
.dm-user { color: var(--foam); margin-right: 6px; }
.dm-text { color: rgba(234, 246, 251, 0.94); }
.dm.mine {
  align-self: flex-end;
  border-radius: 13px 13px 3px 13px;
  background: rgba(26, 127, 168, 0.28);
  border-color: rgba(127, 212, 232, 0.34);
}
.dm.mine .dm-user { color: var(--foam); }
.dm.sys {
  align-self: center;
  padding: 0;
  background: transparent;
  border-color: transparent;
}
.dm.sys .dm-text {
  font-size: 10.5px;
  letter-spacing: 0.03em;
  color: rgba(234, 246, 251, 0.46);
}

/* ══════════ 商品卡 ══════════ */
.product {
  position: relative;
  z-index: 8;
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 6px 14px;
  padding: 9px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(234, 246, 251, 0.11), rgba(234, 246, 251, 0.05));
  border: 0.5px solid rgba(127, 212, 232, 0.24);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  cursor: pointer;
  transition: transform 0.22s cubic-bezier(.22, 1, .36, 1), border-color 0.22s;
}
.product:active { transform: scale(0.985); border-color: rgba(127, 212, 232, 0.44); }

.p-thumb { position: relative; flex-shrink: 0; }
.p-thumb img {
  display: block;
  width: 56px;
  height: 56px;
  border-radius: 13px;
  object-fit: cover;
  background: linear-gradient(135deg, #0a2b40, #1a7fa8);
}
.p-flag {
  position: absolute;
  left: -4px;
  bottom: -4px;
  padding: 2px 6px;
  font-size: 9px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  color: #fff;
  border-radius: 7px;
  background: linear-gradient(135deg, var(--gold), var(--coral));
  box-shadow: 0 3px 10px rgba(201, 169, 97, 0.42);
}
.p-main { flex: 1; min-width: 0; }
.p-name {
  font-size: 12.5px;
  line-height: 1.38;
  color: rgba(234, 246, 251, 0.97);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.p-row { display: flex; align-items: baseline; gap: 7px; margin-top: 5px; }
.p-origin {
  padding: 1px 6px;
  font-size: 9.5px;
  white-space: nowrap;
  border-radius: 5px;
  background: rgba(127, 212, 232, 0.15);
  color: #8fd8ea;
}
.p-price {
  font-size: 17px;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, var(--gold-soft), var(--coral));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.p-price i { font-size: 11px; font-style: normal; margin-right: 1px; }
.p-old { font-size: 10px; color: rgba(234, 246, 251, 0.3); text-decoration: line-through; }

.p-cta {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  font-size: 13px;
  color: #fff;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), var(--coral));
  box-shadow: 0 5px 16px rgba(201, 169, 97, 0.44);
}

/* ══════════ 底部 ══════════ */
.dock {
  position: relative;
  z-index: 9;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px calc(12px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, transparent, rgba(3, 16, 26, 0.88) 46%);
}
.dock-input {
  flex: 1;
  min-width: 0;
  height: 38px;
  padding: 0 16px;
  font-family: inherit;
  font-size: 12.5px;
  color: var(--pearl);
  border-radius: 999px;
  border: 0.5px solid rgba(234, 246, 251, 0.17);
  background: rgba(234, 246, 251, 0.08);
  outline: none;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: border-color 0.24s;
}
.dock-input::placeholder { color: rgba(234, 246, 251, 0.34); }
.dock-input:focus { border-color: rgba(127, 212, 232, 0.5); }

.dock-send {
  flex-shrink: 0;
  height: 38px;
  padding: 0 17px;
  font-family: inherit;
  font-size: 12.5px;
  color: #fff;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #1a90b8, #0b6690);
  box-shadow: 0 4px 16px rgba(26, 144, 184, 0.42);
  cursor: pointer;
  transition: transform 0.16s;
}
.dock-send:active { transform: scale(0.96); }

.dock-like {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 0.5px solid rgba(201, 169, 97, 0.36);
  background: rgba(201, 169, 97, 0.13);
  color: var(--gold-soft);
  cursor: pointer;
}

/* ══════════ 入场页 ══════════ */
.gate {
  position: absolute;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 26px;
  background: rgba(3, 16, 26, 0.92);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}
.gate-card { width: 100%; max-width: 340px; text-align: center; }

.gate-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 22px;
  padding: 4px 13px;
  font-size: 10px;
  letter-spacing: 0.2em;
  border-radius: 999px;
  border: 0.5px solid rgba(201, 169, 97, 0.52);
  color: var(--gold-soft);
}
.gate-tag i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ff5c3c;
  animation: blink 1.2s infinite;
}

.gate-card h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--pearl);
}
.gate-card h2 {
  margin: 7px 0 0;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0.16em;
  color: rgba(143, 216, 234, 0.88);
}
.gate-sub {
  margin: 14px 0 28px;
  font-size: 12px;
  line-height: 1.7;
  color: rgba(234, 246, 251, 0.48);
}

.gate-nums {
  display: flex;
  justify-content: space-around;
  margin-bottom: 28px;
  padding: 18px 0;
  border-top: 0.5px solid rgba(234, 246, 251, 0.1);
  border-bottom: 0.5px solid rgba(234, 246, 251, 0.1);
}
.gate-nums div { display: flex; flex-direction: column; gap: 5px; }
.gate-nums b {
  font-size: 20px;
  font-weight: 500;
  color: var(--foam);
  font-variant-numeric: tabular-nums;
}
.gate-nums small { font-size: 10px; letter-spacing: 0.04em; color: rgba(234, 246, 251, 0.42); }

.gate-btn {
  width: 100%;
  height: 48px;
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 0.08em;
  color: #fff;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #1a90b8, #0b6690);
  box-shadow: 0 10px 30px rgba(26, 144, 184, 0.44);
  cursor: pointer;
  transition: transform 0.2s;
}
.gate-btn:active { transform: scale(0.975); }
.gate-note {
  margin: 16px 0 0;
  font-size: 10.5px;
  line-height: 1.6;
  color: rgba(234, 246, 251, 0.3);
}

/* ══════════ 动画 ══════════ */
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.26; } }
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.75; }
  50%      { transform: scale(1.09); opacity: 1; }
}

.sub-enter-active { transition: all 0.45s cubic-bezier(.22, 1, .36, 1); }
.sub-leave-active { transition: all 0.24s ease; }
.sub-enter-from { opacity: 0; transform: translateY(10px); }
.sub-leave-to { opacity: 0; }

.dm-enter-active { transition: all 0.4s cubic-bezier(.22, 1, .36, 1); }
.dm-enter-from { opacity: 0; transform: translateY(12px) scale(0.96); }

.gate-enter-active,
.gate-leave-active { transition: opacity 0.5s ease; }
.gate-enter-from,
.gate-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .caustics, .bubble, .glow, .ripple, .scan, .host.talking, .anchor-info small em, .gate-tag i {
    animation: none !important;
  }
}

/* ══════════════════════════════════════════════════════════════════
   高端化增强层
   ──────────────────────────────────────────────────────────────────
   布局不动，只提质感：深色玻璃 + 香槟金发丝描边 + 等宽数字。
   用 .live 前缀提高特异性，覆盖上面的基础样式。
   ══════════════════════════════════════════════════════════════════ */

/* 背景：再深一档，并叠一层极淡的金色氛围光 */
.live .deep-grad {
  background:
    radial-gradient(90% 46% at 50% 6%, rgba(26, 127, 168, 0.28) 0%, transparent 62%),
    radial-gradient(60% 34% at 88% 4%, rgba(201, 169, 97, 0.13) 0%, transparent 60%),
    linear-gradient(180deg, #04141f 0%, #03101a 48%, #020c14 100%);
}

/* 顶部状态胶囊：金色细描边 */
.live .pill {
  border: 1px solid rgba(201, 169, 97, 0.22);
  background: rgba(3, 16, 26, 0.5);
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
}

/* 主播名牌：深色玻璃 + 金发丝 */
.live .anchor-chip {
  border: 1px solid rgba(201, 169, 97, 0.2);
  background: rgba(3, 16, 26, 0.46);
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  box-shadow: 0 10px 26px -16px rgba(0, 0, 0, 0.8);
}

/* 数据条：数字全部等宽并右对齐，金色做分隔 —— 电商直播间最像"仪表盘"的一块 */
.live .stats {
  border: 1px solid rgba(201, 169, 97, 0.16);
  background: linear-gradient(160deg, rgba(11, 74, 111, 0.4), rgba(3, 16, 26, 0.6));
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border-radius: var(--r-md);
  box-shadow: var(--inner-hi);
}
.live .stats b,
.live .stats strong,
.live .stats span[class*="num"] {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.2px;
}

/* 字幕卡：珍珠玻璃质感（内高光 + 大扩散阴影） */
.live .caption {
  border: 1px solid rgba(201, 169, 97, 0.18);
  background: linear-gradient(158deg, rgba(11, 74, 111, 0.46) 0%, rgba(3, 16, 26, 0.68) 100%);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  border-radius: var(--r-lg);
  box-shadow: var(--sh-card), var(--inner-hi);
  letter-spacing: 0.2px;
}
.live .caption-mark { color: var(--gold-soft); }

/* 弹幕：气泡更安静，用户名走金色 */
.live .dm {
  background: rgba(232, 238, 242, 0.07);
  border: 0.5px solid rgba(201, 169, 97, 0.1);
  border-radius: 12px 12px 12px 3px;
}
.live .dm-user { color: var(--gold-soft); font-weight: 600; letter-spacing: 0.3px; }

/* 商品卡：金发丝描边 + 珍珠高光 */
.live .product {
  border: 1px solid rgba(201, 169, 97, 0.2);
  background: linear-gradient(158deg, rgba(9, 52, 78, 0.62) 0%, rgba(3, 16, 26, 0.82) 100%);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  border-radius: var(--r-lg);
  box-shadow: var(--sh-card), var(--inner-hi);
}
.live .p-thumb img {
  border-radius: var(--r-sm);
  border: 1px solid rgba(201, 169, 97, 0.16);
}
.live .p-name { letter-spacing: 0.2px; }
.live .p-origin { color: rgba(201, 169, 97, 0.85); letter-spacing: 0.3px; }
.live .p-price {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  letter-spacing: -0.3px;
}
/* 「抢」按钮：香槟金渐变，全屏最亮的一个点 */
.live .p-cta {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%);
  color: #1a1206;
  font-weight: 700;
  letter-spacing: 0.6px;
  border: 0;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.45);
}
.live .p-flag {
  background: linear-gradient(140deg, var(--gold-soft), var(--gold));
  color: #1a1206;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* 底部输入坞：深海玻璃 + 金发丝 */
.live .dock {
  border-top: 1px solid rgba(201, 169, 97, 0.16);
  background: rgba(3, 16, 26, 0.86);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
}
.live .dock-input {
  border: 1px solid rgba(201, 169, 97, 0.18);
  background: rgba(232, 238, 242, 0.06);
  border-radius: var(--r-pill);
  letter-spacing: 0.2px;
}
.live .dock-input::placeholder { color: rgba(232, 238, 242, 0.34); }
.live .dock-send {
  background: linear-gradient(140deg, var(--gold-soft), var(--gold));
  color: #1a1206;
  font-weight: 700;
  box-shadow: 0 10px 22px -10px rgba(201, 169, 97, 0.7);
}
.live .dock-like {
  border: 1px solid rgba(201, 169, 97, 0.22);
  color: var(--gold-soft);
  background: rgba(201, 169, 97, 0.08);
}

/* 开播封面页 */
.live .gate-card { text-align: center; }
.live .gate-tag {
  border: 1px solid rgba(201, 169, 97, 0.26);
  background: rgba(201, 169, 97, 0.1);
  color: var(--gold-soft);
  letter-spacing: 1.6px;
  border-radius: var(--r-pill);
}
.live .gate-nums b,
.live .gate-nums strong {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.4px;
}
.live .gate-btn {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%);
  color: #1a1206;
  font-weight: 700;
  letter-spacing: 1.2px;
  border: 0;
  box-shadow: 0 18px 38px -14px rgba(201, 169, 97, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.45);
}
.live .gate-sub { letter-spacing: 2.6px; color: var(--gold-soft); }
.live .gate-note { color: rgba(232, 238, 242, 0.4); letter-spacing: 0.4px; }

/* 圆形按钮（返回 / 分享 / 自动） */
.live .round-btn {
  border: 1px solid rgba(201, 169, 97, 0.2);
  background: rgba(3, 16, 26, 0.5);
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
}

</style>
