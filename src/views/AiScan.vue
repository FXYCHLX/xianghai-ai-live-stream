<template>
  <div class="scan-page">
    <div class="header">
      <van-icon name="arrow-left" class="back" @click="$router.back()" />
      <span class="title">AI 以图搜物</span>
    </div>

    <div class="hero">
      <div class="hero-badge">AI</div>
      <p class="hero-title">拍张照，帮你找同款</p>
      <p class="hero-sub">上传一张商品图片，AI 先认出它是什么，再从在售商品里挑出最接近的几件</p>
    </div>

    <input ref="fileRef" type="file" accept="image/*" hidden @change="onFile" />
    <div class="upload-zone" :class="{ filled: !!preview }" @click="fileRef.click()">
      <template v-if="!preview">
        <van-icon name="photograph" class="up-icon" />
        <div class="up-title">点击上传图片</div>
        <div class="up-sub">支持 JPG / PNG，建议主体清晰、居中</div>
      </template>
      <img v-else :src="preview" class="preview" />
    </div>

    <div class="actions">
      <van-button
        type="primary" block round
        :loading="loading"
        :loading-text="'AI 识别中…'"
        :disabled="!preview"
        @click="run"
      >
        {{ loading ? 'AI 识别中…' : '开始识别' }}
      </van-button>
      <van-button plain block round v-if="preview" class="again-btn" @click="reset">
        重新选择
      </van-button>
    </div>

    <div class="error-box" v-if="error">{{ error }}</div>

    <div class="result" v-if="result">
      <div class="result-card">
        <div class="result-head">
          <span class="dot"></span>
          <span>AI 识别结果</span>
        </div>
        <div class="labels" v-if="result.labels.length">
          <span v-for="l in result.labels" :key="l" class="label">{{ l }}</span>
        </div>
        <p class="advice" v-if="result.advice">{{ result.advice }}</p>
      </div>

      <div class="match-head">匹配到 {{ result.products.length }} 件商品</div>
      <div class="match-list">
        <div
          class="match-item"
          v-for="p in result.products"
          :key="p.id"
          @click="$router.push({ path: '/detail', query: { id: p.id } })"
        >
          <img :src="p.pic" class="mi-img" />
          <div class="mi-info">
            <div class="mi-name">{{ p.name }}</div>
            <div class="mi-desc">{{ p.desc }}</div>
            <div class="mi-price">¥{{ p.price }}</div>
          </div>
          <van-icon name="arrow" class="mi-arrow" />
        </div>
      </div>
    </div>

    <div class="tips" v-if="!result">
      <div class="tips-title">可以试试这些</div>
      <div class="tip-item" v-for="t in tips" :key="t">{{ t }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
import { aiVision } from '../api/ai'

const fileRef = ref(null)
const preview = ref('')
const loading = ref(false)
const error = ref('')
const result = ref(null)

const tips = [
  '拍一包零食，看看店里有没有同款',
  '拍桌上的数码产品，找相似款比价',
  '拍一份水果生鲜，看看价格'
]

/** 压缩到最长边 1024，控制上传体积，也能加快识别 */
const compress = (file) => new Promise((resolve, reject) => {
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.onload = () => {
    const max = 1024
    let { width: w, height: h } = img
    if (w >= h && w > max) { h = Math.round(h * max / w); w = max }
    else if (h > w && h > max) { w = Math.round(w * max / h); h = max }
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    c.getContext('2d').drawImage(img, 0, 0, w, h)
    URL.revokeObjectURL(url)
    resolve(c.toDataURL('image/jpeg', 0.85))
  }
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片读取失败')) }
  img.src = url
})

const onFile = async (e) => {
  const f = e.target.files && e.target.files[0]
  if (!f) return
  if (!f.type.startsWith('image/')) { showToast('请选择图片文件'); return }
  try {
    preview.value = await compress(f)
    result.value = null
    error.value = ''
  } catch (err) {
    showToast(err.message)
  }
  e.target.value = ''
}

const run = async () => {
  if (!preview.value || loading.value) return
  loading.value = true
  error.value = ''
  try {
    result.value = await aiVision(preview.value)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const reset = () => {
  preview.value = ''
  result.value = null
  error.value = ''
}
</script>

<style scoped>
.scan-page { background: #f5f5f5; min-height: 100vh; padding-bottom: 40px; }
.header { display: flex; align-items: center; padding: 12px 15px; background: #fff; position: sticky; top: 0; z-index: 10; }
.back { font-size: 20px; color: #333; margin-right: 15px; cursor: pointer; }
.title { font-size: 17px; font-weight: 500; color: #333; }

.hero { text-align: center; padding: 26px 20px 18px; }
.hero-badge {
  width: 56px; height: 56px; margin: 0 auto 14px; border-radius: 18px;
  background: linear-gradient(135deg, #0b7a9e, #12a0c8); color: #fff;
  font-size: 18px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 22px rgba(11, 122, 158, 0.32);
}
.hero-title { font-size: 18px; font-weight: 600; color: #222; margin: 0 0 8px; }
.hero-sub { font-size: 13px; color: #888; line-height: 1.6; margin: 0; }

.upload-zone {
  margin: 0 16px; height: 210px; border-radius: 16px;
  background: #fff; border: 1.5px dashed #d5d5d5;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; cursor: pointer; overflow: hidden; transition: border-color .2s;
}
.upload-zone:active { border-color: #0b7a9e; }
.upload-zone.filled { border-style: solid; border-color: #0b7a9e; }
.up-icon { font-size: 40px; color: #c0c4cc; }
.up-title { font-size: 15px; color: #555; font-weight: 500; }
.up-sub { font-size: 12px; color: #aaa; }
.preview { width: 100%; height: 100%; object-fit: contain; }

.actions { padding: 16px; }
.again-btn { margin-top: 10px; }

.error-box {
  margin: 0 16px 12px; padding: 12px 14px; border-radius: 10px;
  background: #fff2f0; border: 1px solid #ffccc7;
  color: var(--brick); font-size: 13px; line-height: 1.6;
}

.result { padding: 0 16px; }
.result-card { background: #fff; border-radius: 14px; padding: 16px; margin-bottom: 14px; }
.result-head { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: #333; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: #0b7a9e; }
.labels { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.label { background: #e6f4f9; color: #0e7ea3; font-size: 12px; padding: 4px 12px; border-radius: 14px; }
.advice { font-size: 13px; color: #555; line-height: 1.7; margin: 12px 0 0; }

.match-head { font-size: 14px; font-weight: 500; color: #333; margin: 0 0 10px 2px; }
.match-list { display: flex; flex-direction: column; gap: 10px; }
.match-item {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border-radius: 12px; padding: 12px; cursor: pointer;
}
.match-item:active { background: #fafafa; }
.mi-img { width: 66px; height: 66px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
.mi-info { flex: 1; min-width: 0; }
.mi-name { font-size: 14px; color: #222; line-height: 1.4; margin-bottom: 4px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.mi-desc { font-size: 12px; color: #999; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mi-price { font-size: 16px; color: var(--price); font-weight: 700; }
.mi-arrow { color: #ccc; font-size: 15px; }

.tips { margin: 20px 16px 0; background: #fff; border-radius: 14px; padding: 16px; }
.tips-title { font-size: 13px; color: #888; margin-bottom: 10px; }
.tip-item { font-size: 13px; color: #555; line-height: 2; padding-left: 14px; position: relative; }
.tip-item::before { content: ''; position: absolute; left: 0; top: 12px; width: 5px; height: 5px; border-radius: 50%; background: #0b7a9e; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.scan-page { background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important; }

/* 卡片类容器统一珍珠化（属性后缀匹配，覆盖各页命名习惯） */
.scan-page [class$="-card"],
.scan-page [class$="-section"],
.scan-page [class$="-box"],
.scan-page [class$="-panel"],
.scan-page [class$="-item"] {
  border-radius: var(--r-md);
}
.scan-page [class$="-card"]:not([class*="__"]),
.scan-page [class$="-panel"] {
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.42);
}
/* 标题与数字 */
.scan-page h1, .scan-page h2, .scan-page h3 { letter-spacing: 0.5px; color: #0f2c3a; }
.scan-page [class$="-price"], .scan-page [class$="-num"], .scan-page [class$="-amount"] {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}
/* 主按钮走金 */
.scan-page .van-button--primary {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  border: 0 !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7);
}
/* 顶部栏 */
.scan-page .header, .scan-page .nav-bar, .scan-page .top-bar {
  background: linear-gradient(180deg, #ffffff, #f8fbfc) !important;
  border-bottom: 1px solid var(--hairline);
}

</style>
