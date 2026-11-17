<template>
  <div class="about-page">
    <div class="header">
      <van-icon name="arrow-left" class="back" @click="$router.back()" />
      <span class="title">关于本作品</span>
    </div>

    <div class="about-content">
      <div class="logo-section">
        <div class="logo">AI</div>
        <h1>向海 · 连江海味 AI 直播平台</h1>
        <p class="sub">连江县首届创新创业大赛<br>HAI+OPC 赛道 · 方向：直播电商</p>
      </div>

      <div class="intro-card">
        <p>把「主播」从人力成本变成软件成本。渔户只做两个动作：选商品、点开播，剩下的话术、讲解、答疑交给程序，24 小时不下播。</p>
      </div>

      <div class="section">
        <div class="section-title">四项可演示的 AI 能力</div>
        <div class="cap" v-for="(c, i) in capabilities" :key="c.title">
          <div class="cap-index">{{ i + 1 }}</div>
          <div class="cap-body">
            <div class="cap-title">{{ c.title }}</div>
            <div class="cap-desc">{{ c.desc }}</div>
            <div class="cap-path">入口 · {{ c.path }}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">技术实现</div>
        <div class="kv" v-for="k in stack" :key="k.k">
          <span>{{ k.k }}</span>
          <em>{{ k.v }}</em>
        </div>
      </div>

      <div class="section">
        <div class="section-title">本地运行</div>
        <div class="step" v-for="(s, i) in steps" :key="s">
          <b>{{ i + 1 }}</b>
          <span v-html="s"></span>
        </div>
        <div class="note">没配置大模型 Key 时，页面仍可正常浏览，AI 功能会给出明确的未连接提示，不会白屏。</div>
      </div>

      <div class="company-info">
        <p>AI 数字人直播 · 移动端演示版</p>
        <p>2026 年 10 月</p>`n      </div>
    </div>
  </div>
</template>

<script setup>
const capabilities = [
  {
    title: '数字人 24 小时在播',
    desc: 'AI 生成的男主播形象，配闭嘴 / 张嘴两帧，按语音节奏切换；配音走浏览器原生语音合成（中文男声），零调用成本、可离线。',
    path: '底部导航「直播」/ 首页「数字人直播」卡片'
  },
  {
    title: 'AI 现写话术',
    desc: '大模型结合商品价格、产地、目标人群实时生成「开场–痛点–卖点–促单」四段口播稿，每次开播内容都不一样，不是预录循环。',
    path: '直播间 · 自动轮播讲解'
  },
  {
    title: 'AI 现场答疑',
    desc: '弹幕提问当场回答，回答基于真实商品库；库里没有的会诚实说「这个我帮您问一下」，不编造信息。',
    path: '直播间 · 弹幕区'
  },
  {
    title: 'AI 导购',
    desc: '说需求（预算、用途、送谁），结合 30 款连江海产实时给建议，推荐结果以商品卡片推到对话里，点一下就能进详情或加购。',
    path: '底部导航「客服」'
  }
]

const stack = [
  { k: '前端', v: 'Vue 3 + Vite + Vant 4 + Vue Router' },
  { k: 'AI 服务', v: 'Node 原生 HTTP 服务（零依赖），5 个 /api 接口' },
  { k: '数字人', v: 'AI 生成形象 + 双帧口型驱动 + 原生语音合成' },
  { k: '数据层', v: '单一商品数据源（30 款连江海产）+ localStorage' },
  { k: '接口协议', v: 'OpenAI 兼容，可换 DeepSeek / 智谱 / 通义 / 硅基流动' },
  { k: '安全设计', v: 'API Key 仅存服务端，前端经 Vite 代理调用' }
]

const steps = [
  '安装依赖：<code>npm install</code>',
  '复制 <code>server/.env.example</code> 为 <code>server/.env</code>，填入大模型 API Key',
  '一键启动前后端：<code>npm run dev:all</code>',
  '打开 <code>http://localhost:5173</code>，建议在浏览器开发者工具中切换为手机视图'
]
</script>

<style scoped>
.about-page { background: #f5f5f5; min-height: 100vh; }
.header { display: flex; align-items: center; padding: 12px 15px; background: #fff; position: sticky; top: 0; z-index: 10; }
.back { font-size: 20px; color: #333; margin-right: 15px; }
.title { font-size: 17px; font-weight: 500; color: #333; }

.about-content { padding: 20px 16px 40px; }

.logo-section { text-align: center; margin-bottom: 22px; }
.logo {
  width: 72px; height: 72px; margin: 0 auto 14px; border-radius: 20px;
  background: linear-gradient(135deg, #0b7a9e, #12a0c8); color: #fff;
  font-size: 24px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 22px rgba(11, 122, 158, 0.32);
}
.logo-section h1 { font-size: 19px; color: #222; margin: 0 0 8px; }
.logo-section .sub { font-size: 12px; color: rgba(26, 18, 6, 0.78); line-height: 1.7; margin: 0; }

.intro-card {
  background: #f2f9fc; border: 1px solid #d9edf5; border-radius: 14px;
  padding: 14px 16px; margin-bottom: 20px;
}
.intro-card p { font-size: 13px; color: #555; line-height: 1.8; margin: 0; }

.section { background: #fff; border-radius: 14px; padding: 16px; margin-bottom: 14px; }
.section-title { font-size: 14px; font-weight: 500; color: #222; margin-bottom: 14px; }

.cap { display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid #eef5f9; }
.cap:first-of-type { border-top: none; padding-top: 0; }
.cap-index {
  width: 22px; height: 22px; border-radius: 7px; flex-shrink: 0;
  background: #e6f4f9; color: #0e7ea3;
  font-size: 12px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.cap-body { flex: 1; min-width: 0; }
.cap-title { font-size: 14px; font-weight: 500; color: #222; margin-bottom: 5px; }
.cap-desc { font-size: 12px; color: #777; line-height: 1.75; margin-bottom: 5px; }
.cap-path { font-size: 11px; color: #8fa6b0; line-height: 1.6; }

.kv { display: flex; gap: 12px; font-size: 13px; line-height: 1.8; padding: 5px 0; }
.kv span { color: #999; flex-shrink: 0; width: 62px; }
.kv em { color: #444; font-style: normal; flex: 1; }

.step { display: flex; gap: 10px; font-size: 13px; color: #444; line-height: 1.9; padding: 4px 0; }
.step b {
  width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
  background: #e6f4f9; color: #0e7ea3; font-size: 11px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.step :deep(code) {
  background: #eef5f9; color: #0e7ea3; padding: 1px 6px;
  border-radius: 5px; font-size: 12px;
}
.note { font-size: 12px; color: #999; line-height: 1.75; margin-top: 12px; padding-top: 12px; border-top: 1px solid #eef5f9; }

.company-info { text-align: center; margin-top: 26px; }
.company-info p { font-size: 12px; color: #aaa; margin: 5px 0; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.about-page { background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important; }

/* 卡片类容器统一珍珠化（属性后缀匹配，覆盖各页命名习惯） */
.about-page [class$="-card"],
.about-page [class$="-section"],
.about-page [class$="-box"],
.about-page [class$="-panel"],
.about-page [class$="-item"] {
  border-radius: var(--r-md);
}
.about-page [class$="-card"]:not([class*="__"]),
.about-page [class$="-panel"] {
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.42);
}
/* 标题与数字 */
.about-page h1, .about-page h2, .about-page h3 { letter-spacing: 0.5px; color: #0f2c3a; }
.about-page [class$="-price"], .about-page [class$="-num"], .about-page [class$="-amount"] {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}
/* 主按钮走金 */
.about-page .van-button--primary {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  border: 0 !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7);
}
/* 顶部栏 */
.about-page .header, .about-page .nav-bar, .about-page .top-bar {
  background: linear-gradient(180deg, #ffffff, #f8fbfc) !important;
  border-bottom: 1px solid var(--hairline);
}


/* 品牌 AI 标识：蓝渐变 → 香槟金（与全站一致） */
.about-page [class*="logo"],
.about-page [class*="badge"],
.about-page [class*="avatar"] {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  color: #1a1206 !important;
  font-weight: 800;
  box-shadow: 0 16px 34px -16px rgba(201, 169, 97, 0.6);
}
.about-page h1, .about-page h2 { letter-spacing: 0.6px; color: #0f2c3a; }

</style>
