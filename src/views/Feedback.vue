<template>
  <div class="feedback-page">
    <div class="header">
      <van-icon name="arrow-left" class="back" @click="$router.back()" />
      <span class="title">意见反馈</span>
    </div>
    
    <div class="feedback-form">
      <div class="form-item">
        <p class="label">反馈类型</p>
        <div class="type-list">
          <span 
            v-for="type in feedbackTypes" 
            :key="type"
            :class="{ active: selectedType === type }"
            @click="selectedType = type"
          >{{ type }}</span>
        </div>
      </div>
      
      <div class="form-item">
        <p class="label">反馈内容</p>
        <van-field
          v-model="feedbackContent"
          rows="5"
          autosize
          type="textarea"
          placeholder="请详细描述您遇到的问题或建议，我们会认真听取..."
          show-word-limit
          maxlength="500"
        />
      </div>
      
      <div class="form-item">
        <p class="label">上传图片（选填）</p>
        <van-uploader v-model="fileList" multiple :max-count="6" />
      </div>
      
      <div class="form-item">
        <p class="label">联系方式（选填）</p>
        <van-field v-model="contact" placeholder="手机号/邮箱，方便我们联系您" />
      </div>
    </div>
    
    <div class="footer">
      <van-button type="danger" round block @click="submitFeedback">提交反馈</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()
const feedbackTypes = ['功能建议', '商品投诉', '物流问题', '客服服务', '其他问题']
const selectedType = ref('功能建议')
const feedbackContent = ref('')
const fileList = ref([])
const contact = ref('')

const submitFeedback = () => {
  if (!feedbackContent.value.trim()) {
    showToast('请输入反馈内容')
    return
  }
  
  // 模拟提交
  showSuccessToast('提交成功，感谢您的反馈！')
  setTimeout(() => router.back(), 1500)
}
</script>

<style scoped>
.feedback-page { background: #f5f5f5; min-height: 100vh; padding-bottom: 80px; }
.header { display: flex; align-items: center; padding: 12px 15px; background: #fff; }
.back { font-size: 20px; color: #333; margin-right: 15px; }
.title { font-size: 17px; font-weight: 500; color: #333; }
.feedback-form { padding: 15px; }
.form-item { background: #fff; border-radius: 10px; padding: 15px; margin-bottom: 15px; }
.label { font-size: 14px; color: #333; margin: 0 0 12px; font-weight: 500; }
.type-list { display: flex; flex-wrap: wrap; gap: 10px; }
.type-list span { padding: 6px 15px; background: #f5f5f5; border-radius: 15px; font-size: 13px; color: #666; }
.type-list span.active { background: #0b7a9e; color: #fff; }
.footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 15px; background: #fff; border-top: 1px solid #eee; }

/* ══════════════════════════════════════════════════════════════════
   高端化增强层（深海墨蓝 × 珍珠白 × 香槟金）
   与首页/直播间同一套语言：珍珠卡片 + 金发丝描边 + 等宽数字 + 大圆角
   ══════════════════════════════════════════════════════════════════ */

.feedback-page { background: linear-gradient(180deg, #f8fbfc 0%, #eef5f9 100%) !important; }

/* 卡片类容器统一珍珠化（属性后缀匹配，覆盖各页命名习惯） */
.feedback-page [class$="-card"],
.feedback-page [class$="-section"],
.feedback-page [class$="-box"],
.feedback-page [class$="-panel"],
.feedback-page [class$="-item"] {
  border-radius: var(--r-md);
}
.feedback-page [class$="-card"]:not([class*="__"]),
.feedback-page [class$="-panel"] {
  background: linear-gradient(176deg, #ffffff 0%, var(--pearl) 100%);
  border: 1px solid var(--hairline-soft);
  box-shadow: 0 14px 30px -22px rgba(2, 12, 20, 0.42);
}
/* 标题与数字 */
.feedback-page h1, .feedback-page h2, .feedback-page h3 { letter-spacing: 0.5px; color: #0f2c3a; }
.feedback-page [class$="-price"], .feedback-page [class$="-num"], .feedback-page [class$="-amount"] {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}
/* 主按钮走金 */
.feedback-page .van-button--primary {
  background: linear-gradient(140deg, var(--gold-soft) 0%, var(--gold) 58%, var(--gold-deep) 100%) !important;
  border: 0 !important;
  color: #1a1206 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  box-shadow: 0 12px 26px -12px rgba(201, 169, 97, 0.7);
}
/* 顶部栏 */
.feedback-page .header, .feedback-page .nav-bar, .feedback-page .top-bar {
  background: linear-gradient(180deg, #ffffff, #f8fbfc) !important;
  border-bottom: 1px solid var(--hairline);
}

</style>
