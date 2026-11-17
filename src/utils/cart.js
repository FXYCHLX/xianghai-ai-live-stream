/**
 * 购物车统一读写工具
 *
 * 原先 9 个页面各自复制了一份 localStorage 读写 + 角标计算逻辑，
 * 改一处漏一处。现在统一从这里取，页面只负责渲染。
 *
 * 存储字段：{ id, name, price, pic, quantity, selected, spec }
 */
const KEY = 'cartList'
const EVENT = 'cart:change'

export const getCart = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export const saveCart = (list) => {
  localStorage.setItem(KEY, JSON.stringify(list))
  // storage 事件只在跨标签页时触发，同页面靠自定义事件同步
  window.dispatchEvent(new CustomEvent(EVENT))
}

/** 加入购物车；已存在则累加数量 */
export const addToCart = (goods, num = 1, spec = '默认规格') => {
  const list = getCart()
  const hit = list.find(i => i.id === goods.id)
  if (hit) {
    hit.quantity = (hit.quantity || 1) + num
  } else {
    list.push({
      id: goods.id,
      name: goods.name,
      price: goods.price,
      pic: goods.pic,
      quantity: num,
      selected: true,
      spec
    })
  }
  saveCart(list)
  return list
}

export const removeFromCart = (id) => {
  const list = getCart().filter(i => i.id !== Number(id))
  saveCart(list)
  return list
}

/** 购物车总件数 */
export const cartCount = () => getCart().reduce((s, i) => s + (i.quantity || 1), 0)

/** 角标文案：0 件返回空字符串，超过 99 显示 99+ */
export const cartBadgeText = () => {
  const n = cartCount()
  if (!n) return ''
  return n > 99 ? '99+' : String(n)
}

/** 订阅购物车变化，返回取消订阅函数 */
export const onCartChange = (fn) => {
  window.addEventListener(EVENT, fn)
  window.addEventListener('storage', fn)
  return () => {
    window.removeEventListener(EVENT, fn)
    window.removeEventListener('storage', fn)
  }
}

/** 用户浏览足迹（首页 AI 推荐会用到） */
const FOOTPRINT_KEY = 'footprint'

export const getFootprint = () => {
  try {
    const v = JSON.parse(localStorage.getItem(FOOTPRINT_KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export const pushFootprint = (goods) => {
  let list = getFootprint().filter(f => f.id !== goods.id)
  list.unshift({
    id: goods.id,
    name: goods.name,
    price: goods.price,
    pic: goods.pic,
    time: new Date().toLocaleString()
  })
  list = list.slice(0, 50)
  localStorage.setItem(FOOTPRINT_KEY, JSON.stringify(list))
  return list
}
