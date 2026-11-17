/**
 * AI 服务层（零依赖，Node 原生 http）
 *
 * 职责：
 *  1. 把「商品库」注入到大模型提示词中，让模型具备导购能力
 *  2. 统一对接任意 OpenAI 兼容接口（DeepSeek / 智谱 / 通义 / 硅基流动 ...）
 *  3. API Key 只存在于服务端，前端拿不到，也不会暴露在浏览器里
 *
 * 启动：node server/index.js   （或 npm run server）
 * 配置：复制 server/.env.example 为 server/.env 并填写
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GOODS, getGoodsById, buildCatalogForLLM } from '../src/data/goods.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/* ────────────── 配置 ────────────── */
function loadEnv() {
  const f = path.join(__dirname, '.env')
  if (!fs.existsSync(f)) return
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  }
}
loadEnv()

const CFG = {
  baseUrl: (process.env.AI_BASE_URL || 'https://api.deepseek.com/v1').replace(/\/+$/, ''),
  apiKey: process.env.AI_API_KEY || '',
  model: process.env.AI_MODEL || 'deepseek-chat',
  // 视觉模型：留空则不启用「以图搜物」，其余三个 AI 功能不受影响。
  // 默认继承主配置的 baseUrl / apiKey，所以同一家服务商只需再填一行 AI_VISION_MODEL。
  visionBaseUrl: (process.env.AI_VISION_BASE_URL || process.env.AI_BASE_URL || '').replace(/\/+$/, ''),
  visionApiKey: process.env.AI_VISION_API_KEY || process.env.AI_API_KEY || '',
  visionModel: process.env.AI_VISION_MODEL || '',
  port: Number(process.env.PORT || 3001)
}

/** 视觉能力是否可用：模型名和对应的 key 都得有 */
const visionReady = () => !!CFG.visionModel && !!CFG.visionApiKey

/* ────────────── 大模型调用 ────────────── */
async function callLLM(messages, { model, json = false, temperature = 0.7, maxTokens = 1200, baseUrl, apiKey } = {}) {
  const useKey = apiKey || CFG.apiKey
  const useBase = (baseUrl || CFG.baseUrl).replace(/\/+$/, '')
  if (!useKey) throw new Error('NO_API_KEY')

  const body = {
    model: model || CFG.model,
    messages,
    temperature,
    max_tokens: maxTokens
  }
  if (json) body.response_format = { type: 'json_object' }

  const res = await fetch(`${useBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${useKey}`
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000)
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`LLM_${res.status}: ${txt.slice(0, 300)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

/**
 * 剥掉模型偶发的「参数回显」外壳。
 *
 * 开启了 response_format=json_object 时，个别模型（实测 deepseek-chat 约 1/3 概率）
 * 会把参数本身也当成内容回显，返回 {"type":"json_object","content":{真正的数据}}，
 * 导致上层取 data.labels / data.productIds 全部拿到 undefined，识别结果整个丢失。
 *
 * 只在「除壳字段外的键全是无意义元信息」时才下钻，避免误伤正常数据。
 */
const SHELL_META = ['type', 'json_object', 'format', 'response_format', 'json']
function unwrapShell(o, depth = 0) {
  if (depth > 3 || !o || typeof o !== 'object' || Array.isArray(o)) return o
  for (const k of ['content', 'data', 'result', 'output', 'json']) {
    const v = o[k]
    if (!v || typeof v !== 'object' || Array.isArray(v)) continue
    const rest = Object.keys(o).filter((x) => x !== k)
    if (rest.every((x) => SHELL_META.includes(x))) return unwrapShell(v, depth + 1)
  }
  return o
}

/** 模型偶尔会给 JSON 套一层 ```json 代码块，这里做容错解析 */
function parseJSON(text) {
  if (!text) return null
  let s = String(text).trim()
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) s = fence[1].trim()
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start >= 0 && end > start) s = s.slice(start, end + 1)
  try { return unwrapShell(JSON.parse(s)) } catch { return null }
}

/** 模型返回的 id 逐一校验，防止编造不存在的商品 */
function sanitizeIds(ids, limit = 6) {
  if (!Array.isArray(ids)) return []
  const seen = new Set()
  const out = []
  for (const raw of ids) {
    const id = Number(String(raw).match(/\d+/)?.[0])
    if (!id || seen.has(id)) continue
    if (!GOODS.some(g => g.id === id)) continue
    seen.add(id)
    out.push(id)
    if (out.length >= limit) break
  }
  return out
}

/* ────────────── 提示词 ────────────── */
const CATALOG = buildCatalogForLLM()

const PERSONA = `你是「向海」商城的 AI 导购助手，名字叫阿海。
商城主营福建连江的海洋渔获——连江是"海上福州"核心承载区、中国鲍鱼之乡、官坞海带原产地。
你的职责是帮用户挑到合适的海产。语气亲切、简洁、说人话，像一个懂行的朋友。

【可售商品库】
${CATALOG}

【硬性规则】
1. 只能推荐商品库里真实存在的商品，绝对不能编造商品名、价格或 ID。
2. 推荐的每个商品必须用它的数字 ID 表示，放在 productIds 数组里。
3. 用户预算不够时，要诚实说明并推荐价位更合适的替代品。
4. 涉及产地、时令、吃法时，优先点出连江本地节点（黄岐半岛/官坞/晓澳/定海湾/马鼻/坑园），这是我们的差异化。
5. 用户问与购物无关的问题（如写代码、闲聊），礼貌挡回去，把话题拉回购物。
6. 一次推荐 2-4 件商品最合适，太多会让人挑花眼。

【输出格式】只输出 JSON，不要任何其它内容：
{"reply":"给用户看的自然语言回复","productIds":[商品ID数字,...]}`

/* ────────────── 业务处理 ────────────── */

/** AI 导购对话 */
async function handleChat({ messages = [], userMessage = '', userProfile = {} }) {
  const ctx = []
  if (userProfile.cartCount) ctx.push(`购物车里已有 ${userProfile.cartCount} 件商品`)
  if (userProfile.viewed?.length) ctx.push(`最近看过：${userProfile.viewed.slice(0, 5).join('、')}`)
  if (userProfile.keywords?.length) ctx.push(`历史搜索：${userProfile.keywords.slice(0, 5).join('、')}`)

  const sys = ctx.length ? `${PERSONA}\n\n【用户当前状态】\n${ctx.join('\n')}` : PERSONA

  const history = messages.slice(-8).map(m => ({
    role: m.isSelf ? 'user' : 'assistant',
    content: String(m.content || '').slice(0, 800)
  })).filter(m => m.content)

  const raw = await callLLM(
    [{ role: 'system', content: sys }, ...history, { role: 'user', content: String(userMessage).slice(0, 1000) }],
    { json: true, temperature: 0.8 }
  )
  const data = parseJSON(raw)
  if (!data) return { reply: raw || '嗯…我这边卡了一下，你再说一次？', products: [] }

  const ids = sanitizeIds(data.productIds)
  return {
    reply: String(data.reply || '').trim() || '这几款你看看有没有中意的~',
    products: ids.map(getGoodsById)
  }
}

/** 以图搜物 */
async function handleVision({ image }) {
  if (!visionReady()) throw new Error('NO_VISION_MODEL')
  if (!image?.startsWith('data:image')) throw new Error('BAD_IMAGE')

  const sys = `你是商品识别助手。看图片，判断里面是什么商品，然后在商品库里找最接近的。

【可售商品库】
${CATALOG}

只输出 JSON：
{"labels":["识别出的物品名",...],"productIds":[商品ID,...],"advice":"一句话说明相似度和选购建议"}`

  const raw = await callLLM([
    { role: 'system', content: sys },
    { role: 'user', content: [
      { type: 'text', text: '这张图里是什么？在我的商城里能找到类似的吗？' },
      { type: 'image_url', image_url: { url: image } }
    ] }
  ], {
    model: CFG.visionModel,
    baseUrl: CFG.visionBaseUrl || CFG.baseUrl,
    apiKey: CFG.visionApiKey,
    json: true,
    temperature: 0.3
  })

  const data = parseJSON(raw) || {}
  return {
    labels: Array.isArray(data.labels) ? data.labels.slice(0, 5) : [],
    advice: String(data.advice || '').trim(),
    products: sanitizeIds(data.productIds).map(getGoodsById)
  }
}

/** 个性化推荐（首页「猜你喜欢」） */
async function handleRecommend({ viewed = [], cart = [], favorites = [], keywords = [] }) {
  const behavior = []
  if (viewed.length) behavior.push(`浏览过：${viewed.join('、')}`)
  if (cart.length) behavior.push(`加购过：${cart.join('、')}`)
  if (favorites.length) behavior.push(`收藏过：${favorites.join('、')}`)
  if (keywords.length) behavior.push(`搜索过：${keywords.join('、')}`)

  // 无行为数据时，退化为全站热销，不浪费 token
  if (!behavior.length) {
    return {
      title: '大家都在买',
      reason: '你还没逛过什么，先看看全站销量最高的几件~',
      products: [...GOODS].sort((a, b) => b.sales - a.sales).slice(0, 6)
    }
  }

  const sys = `你是推荐算法。根据用户的浏览/加购/收藏行为，从商品库中挑出 6 件他可能感兴趣的。

【可售商品库】
${CATALOG}

要求：不要推荐他已经买过或已加购的同款；覆盖尽可能多的不同品类。
只输出 JSON：
{"title":"推荐位标题(8字内)","reason":"一句话说明为什么推荐给他","productIds":[6个商品ID]}`

  const raw = await callLLM([
    { role: 'system', content: sys },
    { role: 'user', content: `用户行为：\n${behavior.join('\n')}` }
  ], { json: true, temperature: 0.6 })

  const data = parseJSON(raw) || {}
  const ids = sanitizeIds(data.productIds, 6)
  return {
    title: String(data.title || '猜你喜欢').slice(0, 12),
    reason: String(data.reason || '').trim(),
    products: (ids.length ? ids : [...GOODS].sort((a, b) => b.sales - a.sales).slice(0, 6).map(g => g.id))
      .map(getGoodsById)
  }
}

/** 评价摘要 */
async function handleReviewSummary({ goodsId, comments = [] }) {
  const goods = getGoodsById(goodsId)
  if (!comments.length) throw new Error('NO_COMMENTS')

  const sys = `你是评价分析助手。阅读商品评价，输出客观摘要。不要编造评价里没提到的内容。
只输出 JSON：{"summary":"2-3句话总结","pros":["优点1","优点2"],"cons":["缺点1"],"suitable":"一句话说明适合谁买"}`

  const raw = await callLLM([
    { role: 'system', content: sys },
    { role: 'user', content: `商品：${goods.name}（¥${goods.price}）\n评价：\n${comments.slice(0, 30).map((c, i) => `${i + 1}. ${String(c).slice(0, 200)}`).join('\n')}` }
  ], { json: true, temperature: 0.4 })

  const data = parseJSON(raw) || {}
  return {
    summary: String(data.summary || '').trim(),
    pros: Array.isArray(data.pros) ? data.pros.slice(0, 5) : [],
    cons: Array.isArray(data.cons) ? data.cons.slice(0, 5) : [],
    suitable: String(data.suitable || '').trim()
  }
}

/** 商品对比 */
async function handleCompare({ ids = [], concern = '' }) {
  const list = ids.map(getGoodsById).filter(Boolean)
  if (list.length < 2) throw new Error('NEED_TWO_GOODS')

  const sys = `你是选购顾问。对比下面几件商品，给出明确的购买建议。必须基于给定的参数，不要编造参数。
只输出 JSON：
{"verdict":"一句话结论：更推荐哪件、为什么","dimensions":[{"name":"对比维度","detail":"各家表现"}],"pick":商品ID,"reason":"推荐理由"}`

  const raw = await callLLM([
    { role: 'system', content: sys },
    { role: 'user', content: `对比这些商品：\n${list.map(g => `[${g.id}] ${g.name} ¥${g.price} 卖点:${g.desc} 品类:${g.catName} 评分:${g.rating}`).join('\n')}\n${concern ? `用户最关心：${concern}` : ''}` }
  ], { json: true, temperature: 0.5 })

  const data = parseJSON(raw) || {}
  return {
    verdict: String(data.verdict || '').trim(),
    dimensions: Array.isArray(data.dimensions) ? data.dimensions.slice(0, 6) : [],
    pick: sanitizeIds([data.pick], 1)[0] || null,
    reason: String(data.reason || '').trim()
  }
}

/* ────────────── 直播带货 ────────────── */

/**
 * 生成一段带货话术（开场 / 痛点 / 卖点 / 促单）
 * 这是「24 小时不下播」的本钱：稿子不是人写的，是模型按商品现生成的。
 */
async function handleLiveScript({ goodsId, style = '热情但不浮夸', audience = '想吃新鲜海产的城里人' }) {
  const goods = getGoodsById(goodsId)

  const sys = `你是福建连江海产直播间的主播，正在镜头前实时讲解一件商品。
你的风格：${style}，口语化、短句，像跟老朋友聊天，不喊"家人们""宝宝们"这类套话。

【本场商品】
${goods.name}｜现价 ¥${goods.price}（原价 ¥${goods.originalPrice}）｜分类：${goods.catName}
卖点：${goods.desc}
产地：${goods.origin || '连江'}
标签：${(goods.keywords || []).join('、')}

【写作要求】
1. 四段结构：开场抓注意 → 戳痛点 → 讲卖点与产地 → 促单
2. 每段 30-60 字，全文不超过 220 字，要能一口气念完
3. 必须落到连江的具体产地和这件商品的具体优势，不要空喊"好吃""划算"
4. 面向人群：${audience}
5. 禁止使用"绝对""保证""第一""最便宜"等广告法风险词

只输出 JSON：
{"opening":"开场","pain":"痛点","selling":"卖点","closing":"促单"}`

  const raw = await callLLM([
    { role: 'system', content: sys },
    { role: 'user', content: `请为「${goods.name}」写一段直播带货话术。` }
  ], { json: true, temperature: 0.9 })

  const d = parseJSON(raw) || {}
  const parts = ['opening', 'pain', 'selling', 'closing'].map(k => String(d[k] || '').trim())
  const full = parts.filter(Boolean).join('')
  if (!full) return { goodsId: goods.id, goodsName: goods.name, opening: '', pain: '', selling: '', closing: '', full: raw || '' }

  return {
    goodsId: goods.id,
    goodsName: goods.name,
    price: goods.price,
    origin: goods.origin || '连江',
    opening: parts[0],
    pain: parts[1],
    selling: parts[2],
    closing: parts[3],
    full,
    charCount: full.length
  }
}

/** 直播间弹幕提问 → 主播口吻现场回应 */
async function handleLiveReply({ goodsId, question = '' }) {
  const goods = getGoodsById(goodsId)
  const q = String(question).trim().slice(0, 200)
  if (!q) throw new Error('EMPTY_QUESTION')

  const sys = `你是福建连江海产直播间的主播，正在直播。有观众在弹幕里提问，你要用直播口吻现场回应。

【当前讲解的商品】
${goods.name}｜¥${goods.price}｜${goods.desc}｜产地：${goods.origin || '连江'}｜分类：${goods.catName}

【规则】
1. 60 字以内，口语化，像现场说话，不要书面语
2. 价格、产地、吃法、发货相关的问题，基于上面这件商品的信息回答
3. 不知道的就诚实说"这个我帮您问一下"，绝不编造
4. 禁止"绝对""保证"等广告法风险词

只输出 JSON：{"reply":"主播的回应"}`

  const raw = await callLLM([
    { role: 'system', content: sys },
    { role: 'user', content: `观众问：${q}` }
  ], { json: true, temperature: 0.8 })

  const d = parseJSON(raw) || {}
  return {
    goodsId: goods.id,
    question: q,
    reply: String(d.reply || '').trim() || '这个我帮您问一下哈~'
  }
}

/* ────────────── HTTP 服务 ────────────── */
const ROUTES = {
  '/api/health': async () => ({
    ok: true,
    aiReady: !!CFG.apiKey,
    visionReady: visionReady(),
    model: CFG.model,
    visionModel: CFG.visionModel || null,
    visionProvider: visionReady() ? (CFG.visionBaseUrl || CFG.baseUrl) : null,
    goodsCount: GOODS.length
  }),
  '/api/chat': handleChat,
  '/api/vision': handleVision,
  '/api/recommend': handleRecommend,
  '/api/review-summary': handleReviewSummary,
  '/api/compare': handleCompare,
  '/api/live-script': handleLiveScript,
  '/api/live-reply': handleLiveReply
}

const readBody = (req) => new Promise((resolve) => {
  let buf = ''
  req.on('data', c => {
    buf += c
    if (buf.length > 12e6) req.destroy()   // 防超大请求
  })
  req.on('end', () => {
    try { resolve(JSON.parse(buf || '{}')) } catch { resolve({}) }
  })
})

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return }

  const url = new URL(req.url, 'http://localhost')
  const handler = ROUTES[url.pathname]
  if (!handler) {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ error: 'NOT_FOUND', path: url.pathname }))
    return
  }

  try {
    const payload = req.method === 'POST' ? await readBody(req) : {}
    const data = await handler(payload)
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(data))
  } catch (e) {
    const msg = String(e.message || e)
    const friendly = {
      NO_API_KEY: '还没有配置大模型 API Key，请编辑 server/.env 填写 AI_API_KEY',
      NO_VISION_MODEL: '还没有配置视觉模型，请在 server/.env 填写 AI_VISION_MODEL',
      BAD_IMAGE: '图片格式不对',
      NO_COMMENTS: '这条商品还没有评价',
      NEED_TWO_GOODS: '至少需要选择两件商品才能对比',
      EMPTY_QUESTION: '弹幕内容不能为空'
    }[msg]
    const code = friendly ? 200 : 500
    if (!friendly) console.error('[AI ERROR]', msg)
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ error: msg, message: friendly || msg }))
  }
})

server.listen(CFG.port, () => {
  console.log(`\n  AI 服务已启动  http://localhost:${CFG.port}`)
  console.log(`  商品库：${GOODS.length} 件`)
  console.log(`  对话模型：${CFG.model}${CFG.apiKey ? '' : '   ⚠ 未配置 API Key'}`)
  console.log(`  视觉模型：${visionReady() ? `${CFG.visionModel}  @ ${CFG.visionBaseUrl || CFG.baseUrl}` : '未配置（以图搜物不可用）'}\n`)
})
