import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 全局注册Vant（必须加，轮播才正常）
import Vant from 'vant'
import 'vant/lib/index.css'

// 全局样式：reset + Vant 主题变量 + 底部导航统一。
// 注意顺序必须在 vant/lib/index.css 之后，否则覆盖不了 Vant 默认样式。
import './style.css'

const app = createApp(App)
app.use(router)
app.use(store)
app.use(Vant)
app.mount('#app')