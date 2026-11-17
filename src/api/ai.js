/**
 * AI 能力统一入口
 * 所有请求都打到本地 AI 服务（见 server/index.js），Key 不会出现在浏览器里。
 */
const BASE = '/api'

async function post(path, payload = {}, timeout = 70000) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeout)
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `请求失败 (${res.status})`)
  if (data.error && data.message) throw new Error(data.message)
  return data
}

/** 服务健康检查：判断是否已配置 Key、是否支持识图 */
export async function checkHealth() {
  try {
    const res = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) return { ok: false }
    return await res.json()
  } catch {
    return { ok: false }
  }
}

/** AI 导购对话 */
export const aiChat = (payload) => post('/chat', payload)

/** 以图搜物 */
export const aiVision = (image) => post('/vision', { image }, 90000)

/** 个性化推荐 */
export const aiRecommend = (payload) => post('/recommend', payload)

/** 评价摘要 */
export const aiReviewSummary = (payload) => post('/review-summary', payload)

/** 商品对比 */
export const aiCompare = (payload) => post('/compare', payload)

/** 直播间：生成一段带货话术（开场/痛点/卖点/促单） */
export const aiLiveScript = (payload) => post('/live-script', payload)

/** 直播间：观众弹幕提问 → 主播现场回应 */
export const aiLiveReply = (payload) => post('/live-reply', payload)
