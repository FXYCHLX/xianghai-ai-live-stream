/**
 * 全局商品数据源（单一事实来源）
 * 原先 Home.vue / Category.vue / Detail.vue 各维护一份副本，导致改一处不同步。
 * 现统一到此处，其他页面一律 import 引用。
 *
 * 本版数据：连江海产专区（"海上福州"核心区 · 世界渔都）
 *
 * 字段说明：
 *  id            商品唯一 ID
 *  name          商品名称
 *  desc          卖点短描述
 *  price         现价（字符串，保留两位）
 *  originalPrice 原价
 *  pic           主图
 *  tags          角标标签
 *  catId         所属分类
 *  sales         累计销量
 *  rating        评分
 *  origin        产地（连江本地节点，供直播间话术使用）
 *  keywords      检索关键词（供 AI 导购 / 以图搜物匹配使用）
 */

export const CATEGORY_NAMES = {
  1: '热门推荐',
  2: '鲜活海产',
  3: '干货海味',
  4: '预制即食',
  5: '海味礼盒'
}

const RAW = [
  // ── 鲜活海产 catId 2 ──
  { id: 1, name: '连江鲍鱼 鲜活 9头 一斤装', desc: '黄岐半岛养殖 肉质弹嫩 现捞顺丰冷链', price: '88.00', originalPrice: '128.00', pic: '/images/seafood/abalone.webp', tags: ['码头直发', '冷链'], catId: 2, sales: 6420, rating: 4.9, origin: '连江黄岐半岛', keywords: ['鲍鱼', '连江鲍鱼', '鲜活', '海鲜', '送礼', '九头鲍'] },
  { id: 2, name: '连江缢蛏 晓澳直发 3斤装', desc: '晓澳滩涂现挖 吐沙干净 肉肥汁甜', price: '49.90', originalPrice: '69.90', pic: '/images/seafood/razorclam.webp', tags: ['码头直发', '地标'], catId: 2, sales: 8830, rating: 4.9, origin: '连江晓澳', keywords: ['缢蛏', '蛏子', '连江蛏', '晓澳', '海鲜', '小海鲜'] },
  { id: 3, name: '连江花蛤 鲜活吐沙 2斤装', desc: '滩涂花蛤 已吐沙开袋即炒', price: '29.90', originalPrice: '39.90', pic: '/images/seafood/clam.webp', tags: ['码头直发'], catId: 2, sales: 12400, rating: 4.8, origin: '连江晓澳', keywords: ['花蛤', '蛤蜊', '海鲜', '小海鲜', '炒蛤'] },
  { id: 4, name: '连江生蚝 现开牡蛎 12只', desc: '定海湾生蚝 现开现发 生食级', price: '58.00', originalPrice: '88.00', pic: '/images/seafood/oyster.webp', tags: ['冷链'], catId: 2, sales: 5210, rating: 4.8, origin: '连江定海湾', keywords: ['生蚝', '牡蛎', '海蛎', '生蚝刺身', '海鲜'] },
  { id: 5, name: '连江皮皮虾 鲜活虾蛄 一斤装', desc: '带膏皮皮虾 现捕直达 只只活跳', price: '68.00', originalPrice: '98.00', pic: '/images/seafood/mantis.webp', tags: ['冷链'], catId: 2, sales: 3410, rating: 4.7, origin: '连江黄岐半岛', keywords: ['皮皮虾', '虾蛄', '濑尿虾', '海鲜', '带膏'] },
  { id: 6, name: '连江梭子蟹 鲜活海蟹 3只装', desc: '母蟹带膏 公蟹带黄 现捞冰鲜', price: '118.00', originalPrice: '168.00', pic: '/images/seafood/crab.webp', tags: ['冷链'], catId: 2, sales: 2980, rating: 4.8, origin: '连江安海', keywords: ['梭子蟹', '海蟹', '螃蟹', '海鲜', '带膏'] },
  { id: 7, name: '连江大黄鱼 鲜活 一条装 约1斤', desc: '网箱养殖 金鳞完整 蒜瓣肉', price: '45.00', originalPrice: '68.00', pic: '/images/seafood/croaker.webp', tags: ['码头直发'], catId: 2, sales: 9120, rating: 4.9, origin: '连江坑园', keywords: ['大黄鱼', '黄花鱼', '石首鱼', '海鲜', '清蒸鱼'] },
  { id: 8, name: '连江石斑鱼 鲜活 约1.2斤', desc: '深海网箱 肉质紧实 清蒸首选', price: '78.00', originalPrice: '108.00', pic: '/images/seafood/grouper.webp', tags: ['码头直发'], catId: 2, sales: 2140, rating: 4.8, origin: '连江坑园', keywords: ['石斑鱼', '海鱼', '清蒸', '海鲜'] },
  { id: 9, name: '连江淡菜 贻贝 鲜活 2斤装', desc: '野生淡菜 肉厚肥美 煮汤极鲜', price: '26.90', originalPrice: '36.90', pic: '/images/seafood/clam.webp', tags: [], catId: 2, sales: 6720, rating: 4.7, origin: '连江马鼻', keywords: ['淡菜', '贻贝', '青口', '海鲜', '煮汤'] },
  { id: 10, name: '连江海白虾 鲜活 一斤装', desc: '本地海虾 壳薄肉甜 白灼最鲜', price: '52.00', originalPrice: '72.00', pic: '/images/seafood/shrimp.webp', tags: ['冷链'], catId: 2, sales: 7850, rating: 4.8, origin: '连江黄岐半岛', keywords: ['海白虾', '海虾', '白灼虾', '海鲜'] },

  // ── 干货海味 catId 3 ──
  { id: 11, name: '连江官坞海带 干海带 500g', desc: '官坞海域头水海带 厚实出胶 泡发率高', price: '19.90', originalPrice: '29.90', pic: '/images/seafood/kelp.webp', tags: ['产地直供', '地标'], catId: 3, sales: 15800, rating: 4.9, origin: '连江官坞', keywords: ['海带', '官坞海带', '连江海带', '干货', '煲汤'] },
  { id: 12, name: '连江头水紫菜 免洗 250g', desc: '头茬采收 叶片薄嫩 冲汤即化', price: '42.00', originalPrice: '58.00', pic: '/images/seafood/laver.webp', tags: ['产地直供'], catId: 3, sales: 9640, rating: 4.8, origin: '连江官坞', keywords: ['紫菜', '头水紫菜', '海苔', '干货', '蛋花汤'] },
  { id: 13, name: '连江丁香鱼干 500g', desc: '本地小银鱼 晒足阳光 汤鲜味足', price: '45.00', originalPrice: '62.00', pic: '/images/seafood/anchovy.webp', tags: ['产地直供', '地标'], catId: 3, sales: 7120, rating: 4.9, origin: '连江晓澳', keywords: ['丁香鱼', '小银鱼', '鱼干', '干货', '连江特产'] },
  { id: 14, name: '连江虾皮 淡干无盐 250g', desc: '本地毛虾淡干 钙含量高 婴儿辅食可用', price: '32.00', originalPrice: '45.00', pic: '/images/seafood/shrimp-skin.webp', tags: ['产地直供'], catId: 3, sales: 11200, rating: 4.8, origin: '连江安海', keywords: ['虾皮', '虾米', '干货', '补钙', '辅食'] },
  { id: 15, name: '连江干贝 瑶柱 250g', desc: '大粒干贝 鲜味浓郁 煲汤提鲜神器', price: '128.00', originalPrice: '178.00', pic: '/images/seafood/scallop.webp', tags: ['产地直供'], catId: 3, sales: 3860, rating: 4.9, origin: '连江黄岐半岛', keywords: ['干贝', '瑶柱', '干货', '煲汤', '提鲜'] },
  { id: 16, name: '连江鱿鱼干 淡晒 500g', desc: '淡晒无添加 肉质厚实 烧烤炒菜两用', price: '58.00', originalPrice: '78.00', pic: '/images/seafood/squid.webp', tags: [], catId: 3, sales: 4480, rating: 4.7, origin: '连江安海', keywords: ['鱿鱼干', '干货', '烧烤', '鱿鱼'] },
  { id: 17, name: '连江墨鱼干 淡晒 500g', desc: '本地墨鱼晒制 厚肉无沙 炖汤浓白', price: '72.00', originalPrice: '98.00', pic: '/images/seafood/cuttlefish.webp', tags: [], catId: 3, sales: 2960, rating: 4.7, origin: '连江安海', keywords: ['墨鱼干', '乌贼', '干货', '炖汤'] },
  { id: 18, name: '连江海蛎干 生晒蚝豉 250g', desc: '鲜蚝生晒 无添加 煲粥煮面一绝', price: '68.00', originalPrice: '92.00', pic: '/images/seafood/oyster.webp', tags: ['产地直供'], catId: 3, sales: 3240, rating: 4.8, origin: '连江定海湾', keywords: ['海蛎干', '蚝豉', '牡蛎干', '干货', '煲粥'] },

  // ── 预制即食 catId 4 ──
  { id: 19, name: '福州鱼丸 连江手打 500g', desc: '手打鳗鱼丸 皮薄馅足 一口爆汁', price: '38.00', originalPrice: '52.00', pic: '/images/seafood/fishball.webp', tags: ['古法手作', '热销'], catId: 4, sales: 18600, rating: 4.9, origin: '连江黄岐半岛', keywords: ['鱼丸', '福州鱼丸', '手打鱼丸', '火锅', '连江特产'] },
  { id: 20, name: '连江鱼面 手工日晒 500g', desc: '鲜鱼打浆制面 久煮不糊 汤面炒面皆宜', price: '28.00', originalPrice: '39.00', pic: '/images/seafood/fishball.webp', tags: [], catId: 4, sales: 6240, rating: 4.7, origin: '连江马鼻', keywords: ['鱼面', '鱼面线', '连江特产', '手工面'] },
  { id: 21, name: '连江虾油 鱼露 500ml', desc: '古法酿造 闽菜灵魂 蘸拌提鲜', price: '22.00', originalPrice: '32.00', pic: '/images/seafood/sauce.webp', tags: ['古法手作'], catId: 4, sales: 8840, rating: 4.8, origin: '连江黄岐半岛', keywords: ['虾油', '鱼露', '闽菜', '调料', '蘸料'] },
  { id: 22, name: '即食海苔 连江紫菜 40g×5包', desc: '低油烘烤 酥脆不腥 追剧零食', price: '26.90', originalPrice: '36.90', pic: '/images/seafood/laver.webp', tags: ['新品'], catId: 4, sales: 13200, rating: 4.8, origin: '连江官坞', keywords: ['海苔', '即食海苔', '零食', '紫菜', '追剧'] },
  { id: 23, name: '香酥小黄鱼 即食 250g', desc: '连江本地黄鱼 骨酥肉嫩 开袋即吃', price: '35.90', originalPrice: '48.00', pic: '/images/seafood/croaker.webp', tags: ['古法手作'], catId: 4, sales: 9760, rating: 4.7, origin: '连江坑园', keywords: ['小黄鱼', '即食', '香酥鱼', '零食', '下酒菜'] },
  { id: 24, name: '醉泥螺 连江风味 300g', desc: '老坛腌制 脆嫩爽口 佐粥下饭', price: '29.90', originalPrice: '42.00', pic: '/images/seafood/clam.webp', tags: [], catId: 4, sales: 4120, rating: 4.6, origin: '连江晓澳', keywords: ['泥螺', '醉泥螺', '下饭', '腌制品', '连江特产'] },

  // ── 海味礼盒 catId 5 ──
  { id: 25, name: '连江海味大礼包 8样装', desc: '海带·紫菜·丁香鱼·虾皮 一次尝遍连江', price: '168.00', originalPrice: '238.00', pic: '/images/seafood/giftbox.webp', tags: ['伴手礼', '送礼'], catId: 5, sales: 5240, rating: 4.9, origin: '连江官坞', keywords: ['礼盒', '大礼包', '送礼', '连江特产', '伴手礼'] },
  { id: 26, name: '连江鲍鱼礼盒 6只装 含冰袋', desc: '黄岐半岛鲍鱼 礼盒装 顺丰冷链到门', price: '298.00', originalPrice: '398.00', pic: '/images/seafood/giftbox.webp', tags: ['送礼', '冷链'], catId: 5, sales: 1860, rating: 4.9, origin: '连江黄岐半岛', keywords: ['鲍鱼礼盒', '送礼', '高端礼品', '海鲜礼盒'] },
  { id: 27, name: '连江官坞海带礼盒 3斤装', desc: '头水海带礼盒 送长辈送同事都体面', price: '128.00', originalPrice: '178.00', pic: '/images/seafood/giftbox.webp', tags: ['地标'], catId: 5, sales: 2380, rating: 4.8, origin: '连江官坞', keywords: ['海带礼盒', '送礼', '官坞海带', '健康礼'] },
  { id: 28, name: '连江干货四宝礼盒', desc: '干贝·虾皮·丁香鱼·海蛎干 干货四件套', price: '228.00', originalPrice: '318.00', pic: '/images/seafood/giftbox.webp', tags: ['送礼'], catId: 5, sales: 1420, rating: 4.8, origin: '连江晓澳', keywords: ['干货礼盒', '送礼', '四宝', '连江特产'] },
  { id: 29, name: '连江年货海味礼盒 12样', desc: '过年囤货 12 样海味 一盒扛起年夜饭', price: '368.00', originalPrice: '498.00', pic: '/images/seafood/giftbox.webp', tags: ['送礼', '热销'], catId: 5, sales: 3120, rating: 4.9, origin: '连江海鲜批发市场', keywords: ['年货', '礼盒', '囤货', '过年', '海鲜大礼包'] },
  { id: 30, name: '连江鲍鱼+干贝 尊享礼盒', desc: '鲍鱼 4 只 + 大粒干贝 高端商务馈赠', price: '498.00', originalPrice: '688.00', pic: '/images/seafood/giftbox.webp', tags: ['送礼', '高端'], catId: 5, sales: 860, rating: 4.9, origin: '连江黄岐半岛', keywords: ['高端礼盒', '商务送礼', '鲍鱼', '干贝', '尊享'] }
]

export const GOODS = RAW.map(g => ({
  ...g,
  catName: CATEGORY_NAMES[g.catId] || '其他'
}))

export const BANNERS = [
  '/images/fish/banner-1.svg',
  '/images/fish/banner-2.svg',
  '/images/fish/banner-3.svg'
]

export const SECKILL_GOODS = [
  { id: 11, name: '官坞海带', price: '19.90', seckillPrice: '9.90', pic: '/images/seafood/kelp.webp' },
  { id: 12, name: '头水紫菜', price: '42.00', seckillPrice: '25.00', pic: '/images/seafood/laver.webp' },
  { id: 19, name: '福州鱼丸', price: '38.00', seckillPrice: '22.00', pic: '/images/seafood/fishball.webp' },
  { id: 3, name: '连江花蛤', price: '29.90', seckillPrice: '18.90', pic: '/images/seafood/clam.webp' },
  { id: 14, name: '淡干虾皮', price: '32.00', seckillPrice: '19.90', pic: '/images/seafood/shrimp-skin.webp' }
]

/** 按 ID 取商品 */
export const getGoodsById = (id) => GOODS.find(g => g.id === Number(id)) || GOODS[0]

/** 按分类取商品（catId=1「热门推荐」为全站销量 Top8，不单独维护一份数据） */
export const getGoodsByCat = (catId) => {
  const id = Number(catId)
  if (id === 1) return [...GOODS].sort((a, b) => b.sales - a.sales).slice(0, 8)
  return GOODS.filter(g => g.catId === id)
}

/** 关键词检索（名称 + 描述 + 关键词，按命中数排序） */
export const searchGoods = (kw, limit = 20) => {
  const q = String(kw || '').trim().toLowerCase()
  if (!q) return []
  return GOODS
    .map(g => {
      const hay = [g.name, g.desc, g.catName, ...(g.keywords || [])].join(' ').toLowerCase()
      let score = 0
      if (g.name.toLowerCase().includes(q)) score += 10
      for (const k of (g.keywords || [])) if (k.toLowerCase().includes(q) || q.includes(k.toLowerCase())) score += 6
      if (hay.includes(q)) score += 3
      return { g, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.g)
}

/**
 * 生成给大模型看的商品目录文本。
 * 只保留检索必要字段，控制 token 消耗。
 */
export const buildCatalogForLLM = () => GOODS.map(g =>
  `[${g.id}] ${g.name} | ¥${g.price} | ${g.catName} | 卖点:${g.desc} | 产地:${g.origin || '连江'} | 标签:${(g.keywords || []).join('/')}`
).join('\n')

/** 分类列表（与 Category.vue 的左侧导航一致） */
export const CATEGORIES = [
  { id: 1, name: '热门推荐', catId: 1 },
  { id: 2, name: '鲜活海产', catId: 2 },
  { id: 3, name: '干货海味', catId: 3 },
  { id: 4, name: '预制即食', catId: 4 },
  { id: 5, name: '海味礼盒', catId: 5 }
]
