import { createStore } from 'vuex'
export default createStore({
  state: { cartList: [] },
  mutations: {
    ADD_CART(state, goods) {
      let item = state.cartList.find(i => i.id === goods.id)
      item ? item.num++ : state.cartList.push({ ...goods, num: 1, checked: true })
    },
    DEL_CART(state, id) {
      state.cartList = state.cartList.filter(i => i.id !== id)
    },
    CHANGE_NUM(state, { id, num }) {
      const item = state.cartList.find(i => i.id === id)
      if (item) item.num = num
    },
    CHANGE_CHECK(state, { id, checked }) {
      const item = state.cartList.find(i => i.id === id)
      if (item) item.checked = checked
    }
  },
  getters: {
    totalPrice: state => state.cartList.reduce((sum, i) => i.checked ? sum + i.price * i.num : sum, 0),
    totalNum: state => state.cartList.reduce((sum, i) => i.checked ? sum + i.num : sum, 0)
  }
})